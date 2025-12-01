import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CreateAppointmentBody, UpdateAppointmentBody } from '~/models/requests/appointments.request'
import Appointment, { IAppointmentHistory } from '~/models/schemas/Appointment.schema'
import { AppointmentStatus, parseStatus } from '~/constants/enums'
import { APPOINTMENTS_MESSAGES } from '~/constants/message'
import { blockchainService } from './blockchain.services'
import crypto from 'crypto'
import Notification, { INotification } from '~/models/schemas/Notification.schema'

class AppointmentsServices {
  async createAppointment(payload: CreateAppointmentBody) {
    // Lấy thông tin các services để tính tổng price
    const serviceObjectIds = payload.serviceIds.map((id) => new ObjectId(id))
    const services = await databaseServices.services
      .find({
        _id: { $in: serviceObjectIds }
      })
      .toArray()

    // Tính tổng price từ các services
    const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0)

    const appointmentData = {
      ...payload,
      patientId: new ObjectId(payload.patientId),
      doctorId: payload.doctorId ? new ObjectId(payload.doctorId) : undefined,
      serviceIds: serviceObjectIds,
      bedId: payload.bedId ? new ObjectId(payload.bedId) : undefined,
      appointmentDate: new Date(payload.appointmentDate),
      appointmentStartTime: payload.appointmentStartTime,
      appointmentEndTime: payload.appointmentEndTime,
      price: totalPrice,
      history: [
        {
          action: 'created' as const,
          by: payload.createdBy || 'system',
          timestamp: new Date(),
          details: 'Appointment created'
        }
      ]
    }

    // 1. Lưu vào MongoDB trước
    const appointment = await databaseServices.appointments.insertOne(new Appointment(appointmentData as any))

    // 2. Lưu hash lên blockchain (asynchronous - không block user)
    const appointmentId = appointment.insertedId.toString()
    const dataForHash = {
      _id: appointmentId,
      patientId: payload.patientId,
      doctorId: payload.doctorId,
      serviceIds: payload.serviceIds,
      bedId: payload.bedId,
      isEmergency: payload.isEmergency || false,
      appointmentStartTime: payload.appointmentStartTime,
      appointmentEndTime: payload.appointmentEndTime,
      price: totalPrice,
      isCheckout: payload.isCheckout || false,
      note: payload.note,
      status: parseStatus(appointmentData.status ?? '') || AppointmentStatus.Pending,
      history: appointmentData.history,
    }

    console.log("data lúc tạo nè", dataForHash);
    // Lưu hash lên blockchain (không đợi để không làm chậm response)
    blockchainService
      .storeAppointmentHash(appointmentId, dataForHash)
      .then((txHash) => {
        if (txHash) {
          // Tạo hash của data
          const dataHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(dataForHash, Object.keys(dataForHash).sort()))
            .digest('hex')

          // Cập nhật blockchain info vào MongoDB
          databaseServices.appointments.updateOne(
            { _id: appointment.insertedId },
            {
              $set: {
                blockchainHash: '0x' + dataHash,
                blockchainTxHash: txHash,
                blockchainVerified: true,
                isPendingSavingToBlockchain: false
              }
            }
          )
          console.log(`✅ Appointment ${appointmentId} hash stored on blockchain`)
        }
      })
      .catch((error) => {
        console.error(`❌ Failed to store appointment ${appointmentId} on blockchain:`, error)
      })

    // Tạo thông báo sau khi tạo lịch hẹn
    const notificationData = {
      appointmentId: appointment.insertedId,
      isRead: false,
      recipientType: 'patient' as const,
      recipientId: new ObjectId(payload.patientId),
      type: 'appointment_created' as const,
      message: `Có lịch hẹn được đặt từ ${payload.appointmentStartTime} đến ${payload.appointmentEndTime}`,
      channel: 'sms' as const,
      createdAt : new Date()
    }

    await databaseServices.notifications.insertOne(notificationData as any)

    return appointment
  }

  async getAppointments() {
    const appointments = await databaseServices.appointments
      .aggregate([
        {
          $lookup: {
            from: process.env.DB_PATIENTS_COLLECTION,
            localField: 'patientId',
            foreignField: '_id',
            as: 'patient'
          }
        },
        {
          $lookup: {
            from: process.env.DB_DOCTORS_COLLECTION,
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $lookup: {
            from: process.env.DB_SERVICES_COLLECTION,
            localField: 'serviceIds',
            foreignField: '_id',
            as: 'services'
          }
        },
        {
          $lookup: {
            from: process.env.DB_BEDS_COLLECTION,
            localField: 'bedId',
            foreignField: '_id',
            as: 'bed'
          }
        }
      ])
      .toArray()
    console.log('appointments123', appointments)
    return appointments
  }

  async getAppointment(_id: string) {
    const appointments = await databaseServices.appointments
      .aggregate([
        { $match: { _id: new ObjectId(_id) } },
        {
          $lookup: {
            from: process.env.DB_PATIENTS_COLLECTION,
            localField: 'patientId',
            foreignField: '_id',
            as: 'patient'
          }
        },
        {
          $lookup: {
            from: process.env.DB_DOCTORS_COLLECTION,
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $lookup: {
            from: process.env.DB_SERVICES_COLLECTION,
            localField: 'serviceIds',
            foreignField: '_id',
            as: 'services'
          }
        },
        {
          $lookup: {
            from: process.env.DB_BEDS_COLLECTION,
            localField: 'bedId',
            foreignField: '_id',
            as: 'bed'
          }
        }
      ])
      .toArray()
    return appointments[0]
  }

  async getAppointmentsByPatient(patientId: string) {
    const appointments = await databaseServices.appointments
      .aggregate([
        { $match: { patientId: new ObjectId(patientId) } },
        {
          $lookup: {
            from: process.env.DB_DOCTORS_COLLECTION,
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $lookup: {
            from: process.env.DB_SERVICES_COLLECTION,
            localField: 'serviceIds',
            foreignField: '_id',
            as: 'services'
          }
        },
        {
          $lookup: {
            from: process.env.DB_BEDS_COLLECTION,
            localField: 'bedId',
            foreignField: '_id',
            as: 'bed'
          }
        },
        { $sort: { appointmentDate: -1 } }
      ])
      .toArray()
    return appointments
  }

  async getAppointmentsByDoctor(doctorId: string) {
    const appointments = await databaseServices.appointments
      .aggregate([
        { $match: { doctorId: new ObjectId(doctorId) } },
        {
          $lookup: {
            from: process.env.DB_PATIENTS_COLLECTION,
            localField: 'patientId',
            foreignField: '_id',
            as: 'patient'
          }
        },
        {
          $lookup: {
            from: process.env.DB_SERVICES_COLLECTION,
            localField: 'serviceIds',
            foreignField: '_id',
            as: 'services'
          }
        },
        {
          $lookup: {
            from: process.env.DB_BEDS_COLLECTION,
            localField: 'bedId',
            foreignField: '_id',
            as: 'bed'
          }
        },
        { $sort: { appointmentDate: 1 } }
      ])
      .toArray()
    return appointments
  }

  async updateAppointment(
    _id: string,
    payload: UpdateAppointmentBody,
    updatedBy: 'system' | 'doctor' | 'patient'
  ) {
    const updateData: any = { ...payload }

    if (payload.doctorId) {
      updateData.doctorId = new ObjectId(payload.doctorId)
    }
    if (payload.serviceIds) {
      updateData.serviceIds = payload.serviceIds.map((id) => new ObjectId(id))

      // Tính lại tổng price khi serviceIds thay đổi
      const services = await databaseServices.services
        .find({
          _id: { $in: updateData.serviceIds }
        })
        .toArray()
      updateData.price = services.reduce((sum, service) => sum + (service.price || 0), 0)
    }
    if (payload.appointmentDate) {
      updateData.appointmentDate = new Date(payload.appointmentDate)
    }
    if (payload.appointmentStartTime) {
      updateData.appointmentStartTime = payload.appointmentStartTime
    }
    if (payload.appointmentEndTime) {
      updateData.appointmentEndTime = payload.appointmentEndTime
    }
    if (payload.bedId) {
      updateData.bedId = new ObjectId(payload.bedId)
    }
    if (payload.patientId) {
      updateData.patientId = new ObjectId(payload.patientId)
    }
    if (payload.isCheckout == true) {
      updateData.isCheckout = true
      updateData.status = AppointmentStatus.Completed
    }

    updateData.updatedAt = new Date()

    // Thêm lịch sử thay đổi
    const historyEntry: IAppointmentHistory = {
      action: 'updated',
      by: updatedBy,
      timestamp: new Date(),
      details: `Appointment updated by ${updatedBy}`
    }

    updateData.isPendingSavingToBlockchain = true

    // 1. Cập nhật MongoDB trước
    const appointment = await databaseServices.appointments.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: updateData,
        $push: { history: historyEntry }
      }
    )
    

    // 2. Cập nhật hash lên blockchain (asynchronous)
    const updatedAppointment = await this.getAppointment(_id)
    if (updatedAppointment) {
      const dataForHash = {
        _id: _id,
        patientId: updatedAppointment.patientId?.toString(),
        doctorId: updatedAppointment.doctorId?.toString(),
        serviceIds: updatedAppointment.serviceIds?.map((id: any) => id.toString()),
        appointmentStartTime: updatedAppointment.appointmentStartTime,
        appointmentEndTime: updatedAppointment.appointmentEndTime,
        price: updatedAppointment.price,
        status: updatedAppointment.status,
        isCheckout: updatedAppointment.isCheckout,
        note: updatedAppointment.note,
        history: updatedAppointment.history,
        bedId: updatedAppointment.bedId?.toString(),
        isEmergency: updatedAppointment.isEmergency || false
      }

      // Cập nhật hash lên blockchain (không đợi)
      blockchainService
        .updateAppointmentHash(_id, dataForHash)
        .then((txHash) => {
          if (txHash) {
            const dataHash = crypto
              .createHash('sha256')
              .update(JSON.stringify(dataForHash, Object.keys(dataForHash).sort()))
              .digest('hex')

            databaseServices.appointments.updateOne(
              { _id: new ObjectId(_id) },
              {
                $set: {
                  blockchainHash: '0x' + dataHash,
                  blockchainTxHash: txHash,
                  blockchainVerified: true,
                  isPendingSavingToBlockchain: false
                }
              }
            )
            console.log(`✅ Appointment ${_id} hash updated on blockchain`)
          }
        })
        .catch((error) => {
          console.error(`❌ Failed to update appointment ${_id} on blockchain:`, error)
        })
    }

    // Gửi thông báo cập nhật
    const appointmentData = await this.getAppointment(_id)
    if (appointmentData) {
      let message = `Lịch hẹn của bệnh nhân ${appointmentData.patient[0].fullName ?? ""} đã được cập nhật`
      if (appointmentData.appointmentStartTime && appointmentData.appointmentEndTime) {
        message += ` - Thời gian: ${appointmentData.appointmentStartTime} đến ${appointmentData.appointmentEndTime}`
      }
        message += ` vào ngày ${new Date().toLocaleDateString('vi-VN')}`

      const notificationData: INotification = {
        appointmentId: appointmentData._id,
        isRead: false,
        recipientType: 'patient' as const,
        recipientId: appointmentData.patientId,
        status: 'sent' as const,
        type: 'appointment_updated' as const,
        message,
        channel: 'sms' as const
      };
      const newNoti = new Notification(notificationData);
      await databaseServices.notifications.insertOne(newNoti as any)
    }

    return appointment
  }

  async cancelAppointment(_id: string, cancelledBy: 'system' | 'doctor' | 'patient' = 'system') {
    const historyEntry: IAppointmentHistory = {
      action: 'cancelled',
      by: cancelledBy,
      timestamp: new Date(),
      details: `Appointment cancelled by ${cancelledBy}`
    }

    const appointment = await databaseServices.appointments.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          status: AppointmentStatus.Cancelled,
          updatedAt: new Date()
        },
        $push: { history: historyEntry }
      }
    )

    // Gửi thông báo hủy
    const appointmentData = await this.getAppointment(_id)
    if (appointmentData) {
      let message = 'Lịch hẹn của bạn đã bị hủy'
      if (appointmentData.appointmentDate) {
        message += ` vào ngày ${new Date().toLocaleDateString('vi-VN')}`
      }
      if (appointmentData.appointmentStartTime && appointmentData.appointmentEndTime) {
        message += ` từ ${appointmentData.appointmentStartTime} đến ${appointmentData.appointmentEndTime}`
      }

      const notificationData = {
        appointmentId: appointmentData._id,
        isRead: false,
        recipientType: 'patient' as const,
        recipientId: appointmentData.patientId,
        type: 'appointment_cancelled' as const,
        message,
        channel: 'sms' as const
      }
      await databaseServices.notifications.insertOne(notificationData as any)
    }

    return appointment
  }

  async deleteAppointment(_id: string) {
    const appointment = await databaseServices.appointments.deleteOne({ _id: new ObjectId(_id) })
    return appointment
  }

  async getAppointmentsByDate(date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const appointments = await databaseServices.appointments
      .aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: startOfDay,
              $lte: endOfDay
            }
          }
        },
        {
          $lookup: {
            from: process.env.DB_PATIENTS_COLLECTION,
            localField: 'patientId',
            foreignField: '_id',
            as: 'patient'
          }
        },
        {
          $lookup: {
            from: process.env.DB_DOCTORS_COLLECTION,
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $lookup: {
            from: process.env.DB_SERVICES_COLLECTION,
            localField: 'serviceIds',
            foreignField: '_id',
            as: 'services'
          }
        },
        {
          $sort: {
            appointmentStartTime: 1
          }
        }
      ])
      .toArray()

    return appointments
  }

  async getEmergencyAppointments() {
    const appointments = await databaseServices.appointments
      .aggregate([
        { $match: { isEmergency: true } },
        {
          $lookup: {
            from: process.env.DB_PATIENTS_COLLECTION,
            localField: 'patientId',
            foreignField: '_id',
            as: 'patient'
          }
        },
        {
          $lookup: {
            from: process.env.DB_DOCTORS_COLLECTION,
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $lookup: {
            from: process.env.DB_SERVICES_COLLECTION,
            localField: 'serviceIds',
            foreignField: '_id',
            as: 'services'
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()
    return appointments
  }

  async checkTimeConflict(
    doctorId: string,
    appointmentDate: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ) {
    const startOfDay = new Date(appointmentDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(appointmentDate)
    endOfDay.setHours(23, 59, 59, 999)

    const query: any = {
      doctorId: new ObjectId(doctorId),
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $ne: 'cancelled' }
    }

    if (excludeAppointmentId) {
      query._id = { $ne: new ObjectId(excludeAppointmentId) }
    }

    const existingAppointments = await databaseServices.appointments.find(query).toArray()

    for (const appointment of existingAppointments) {
      const existingStart = appointment.appointmentStartTime
      const existingEnd = appointment.appointmentEndTime

      if (this.isTimeOverlap(startTime, endTime, existingStart, existingEnd)) {
        return {
          hasConflict: true,
          conflictingAppointment: appointment
        }
      }
    }

    return { hasConflict: false }
  }

  async checkBedConflict(
    bedId: string,
    appointmentDate: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ) {
    const startOfDay = new Date(appointmentDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(appointmentDate)
    endOfDay.setHours(23, 59, 59, 999)

    const query: any = {
      bedId: new ObjectId(bedId),
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $ne: 'cancelled' }
    }

    if (excludeAppointmentId) {
      query._id = { $ne: new ObjectId(excludeAppointmentId) }
    }

    const existingAppointments = await databaseServices.appointments.find(query).toArray()

    for (const appointment of existingAppointments) {
      const existingStart = appointment.appointmentStartTime
      const existingEnd = appointment.appointmentEndTime

      if (this.isTimeOverlap(startTime, endTime, existingStart, existingEnd)) {
        return {
          hasConflict: true,
          conflictingAppointment: appointment
        }
      }
    }

    return { hasConflict: false }
  }

  private isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const [start1Hour, start1Min] = start1.split(':').map(Number)
    const [end1Hour, end1Min] = end1.split(':').map(Number)
    const [start2Hour, start2Min] = start2.split(':').map(Number)
    const [end2Hour, end2Min] = end2.split(':').map(Number)

    const start1Minutes = start1Hour * 60 + start1Min
    const end1Minutes = end1Hour * 60 + end1Min
    const start2Minutes = start2Hour * 60 + start2Min
    const end2Minutes = end2Hour * 60 + end2Min

    return start1Minutes < end2Minutes && end1Minutes > start2Minutes
  }

  async getAppointmentsByTimeRange(startDateTime: Date, endDateTime: Date, doctorId?: string, patientId?: string) {
    const matchQuery: any = {}

    // Thêm filter theo doctor nếu có
    if (doctorId) {
      matchQuery.doctorId = new ObjectId(doctorId)
    }

    // Thêm filter theo patient nếu có
    if (patientId) {
      matchQuery.patientId = new ObjectId(patientId)
    }

    const appointments = await databaseServices.appointments
      .aggregate([
        { $match: matchQuery },
        {
          // Tạo field appointmentStart và appointmentEnd bằng cách kết hợp date + time
          $addFields: {
            // Bước 1: Thay thế 'h' thành ':' trong time string
            cleanedStartTime: {
              $replaceAll: {
                input: '$appointmentStartTime',
                find: 'h',
                replacement: ':'
              }
            },
            cleanedEndTime: {
              $replaceAll: {
                input: '$appointmentEndTime',
                find: 'h',
                replacement: ':'
              }
            }
          }
        },
        {
          $addFields: {
            // Chuẩn hóa startTime: thêm :00 nếu chỉ có HH:MM
            normalizedStartTime: {
              $cond: {
                if: {
                  // Kiểm tra nếu cleanedStartTime có chứa dấu '-' (nghĩa là có date)
                  $regexMatch: {
                    input: '$cleanedStartTime',
                    regex: '^\\d{4}-\\d{2}-\\d{2}'
                  }
                },
                then: '$cleanedStartTime', // Nếu là full datetime, giữ nguyên
                else: {
                  // Nếu là time only, kiểm tra xem có seconds chưa
                  $cond: {
                    if: {
                      $regexMatch: {
                        input: '$cleanedStartTime',
                        regex: '^\\d{1,2}:\\d{2}:\\d{2}$'
                      }
                    },
                    then: '$cleanedStartTime', // Đã có seconds (HH:MM:SS)
                    else: { $concat: ['$cleanedStartTime', ':00'] } // Thêm :00 (HH:MM -> HH:MM:00)
                  }
                }
              }
            },
            normalizedEndTime: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$cleanedEndTime',
                    regex: '^\\d{4}-\\d{2}-\\d{2}'
                  }
                },
                then: '$cleanedEndTime',
                else: {
                  $cond: {
                    if: {
                      $regexMatch: {
                        input: '$cleanedEndTime',
                        regex: '^\\d{1,2}:\\d{2}:\\d{2}$'
                      }
                    },
                    then: '$cleanedEndTime',
                    else: { $concat: ['$cleanedEndTime', ':00'] }
                  }
                }
              }
            }
          }
        },
        {
          $addFields: {
            appointmentStart: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$normalizedStartTime',
                    regex: '^\\d{4}-\\d{2}-\\d{2}'
                  }
                },
                then: {
                  // Full datetime, parse trực tiếp
                  $dateFromString: {
                    dateString: '$normalizedStartTime',
                    format: '%Y-%m-%d %H:%M:%S'
                  }
                },
                else: {
                  // Time only, concat với date
                  $dateFromString: {
                    dateString: {
                      $concat: [
                        { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
                        ' ',
                        '$normalizedStartTime'
                      ]
                    },
                    format: '%Y-%m-%d %H:%M:%S'
                  }
                }
              }
            },
            appointmentEnd: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$normalizedEndTime',
                    regex: '^\\d{4}-\\d{2}-\\d{2}'
                  }
                },
                then: {
                  $dateFromString: {
                    dateString: '$normalizedEndTime',
                    format: '%Y-%m-%d %H:%M:%S'
                  }
                },
                else: {
                  $dateFromString: {
                    dateString: {
                      $concat: [
                        { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
                        ' ',
                        '$normalizedEndTime'
                      ]
                    },
                    format: '%Y-%m-%d %H:%M:%S'
                  }
                }
              }
            }
          }
        },
        {
          // Filter theo khoảng thời gian: appointment phải giao với time range
          // (appointmentStart <= endDateTime) AND (appointmentEnd >= startDateTime)
          $match: {
            appointmentStart: { $lte: endDateTime },
            appointmentEnd: { $gte: startDateTime }
          }
        },
        {
          $lookup: {
            from: process.env.DB_PATIENTS_COLLECTION,
            localField: 'patientId',
            foreignField: '_id',
            as: 'patient'
          }
        },
        {
          $lookup: {
            from: process.env.DB_DOCTORS_COLLECTION,
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $lookup: {
            from: process.env.DB_SERVICES_COLLECTION,
            localField: 'serviceIds',
            foreignField: '_id',
            as: 'services'
          }
        },
        {
          $sort: {
            appointmentStart: 1
          }
        }
      ])
      .toArray()

    return appointments
  }

  // Lấy appointments theo status
  async getAppointmentsByStatus(status: AppointmentStatus) {
    const appointments = await databaseServices.appointments
      .aggregate([
        { $match: { status: status } },
        {
          $lookup: {
            from: process.env.DB_PATIENTS_COLLECTION,
            localField: 'patientId',
            foreignField: '_id',
            as: 'patient'
          }
        },
        {
          $lookup: {
            from: process.env.DB_DOCTORS_COLLECTION,
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $lookup: {
            from: process.env.DB_SERVICES_COLLECTION,
            localField: 'serviceIds',
            foreignField: '_id',
            as: 'services'
          }
        },
        {
          $lookup: {
            from: process.env.DB_BEDS_COLLECTION,
            localField: 'bedId',
            foreignField: '_id',
            as: 'bed'
          }
        },
        { $sort: { appointmentDate: -1 } }
      ])
      .toArray()
    return appointments
  }

  // Tiện ích để lấy lịch hẹn trong các khoảng thời gian phổ biến
  async getUpcomingAppointments(doctorId?: string, patientId?: string, days: number = 7) {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    return this.getAppointmentsByTimeRange(now, futureDate, doctorId, patientId)
  }

  async getAppointmentsThisWeek(doctorId?: string, patientId?: string) {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return this.getAppointmentsByTimeRange(startOfWeek, endOfWeek, doctorId, patientId)
  }

  async getAppointmentsThisMonth(doctorId?: string, patientId?: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    return this.getAppointmentsByTimeRange(startOfMonth, endOfMonth, doctorId, patientId)
  }

  /**
   * Verify tính toàn vẹn của appointment với blockchain
   * @param _id Appointment ID
   * @returns Kết quả verify
   */
  async verifyAppointmentIntegrity(_id: string) {
    try {
      // Lấy appointment từ MongoDB
      const appointment = await this.getAppointment(_id)

      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found',
          isValid: false
        }
      }

      // Tạo data để hash (giống lúc store)
      const dataForHash = {
        _id: _id,
        patientId: appointment.patientId?.toString(),
        doctorId: appointment.doctorId?.toString(),
        serviceIds: appointment.serviceIds?.map((id: any) => id.toString()),
        bedId: appointment.bedId?.toString(),
        isEmergency: appointment.isEmergency,
        appointmentStartTime: appointment.appointmentStartTime,
        appointmentEndTime: appointment.appointmentEndTime,
        price: appointment.price,
        status: appointment.status,
        isCheckout: appointment.isCheckout,
        note: appointment.note,
        history: appointment.history
      }

      console.log("data lúc verify nè", dataForHash);

      // Verify với blockchain
      const verifyResult = await blockchainService.verifyAppointmentIntegrity(_id, dataForHash)

      return {
        success: true,
        appointmentId: _id,
        isPendingSavingToBlockchain: appointment.isPendingSavingToBlockchain,
        ...verifyResult,
        blockchainInfo: {
          blockchainHash: appointment.blockchainHash,
          blockchainTxHash: appointment.blockchainTxHash,
          blockchainVerified: appointment.blockchainVerified
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        isValid: false
      }
    }
  }

  /**
   * Lấy lịch sử thay đổi từ blockchain
   * @param _id Appointment ID
   * @returns Lịch sử hash changes
   */
  async getBlockchainHistory(_id: string) {
    try {
      const history = await blockchainService.getAppointmentHistory(_id)
      return {
        success: true,
        appointmentId: _id,
        history,
        message: `Found ${history.length} change(s) on blockchain`
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        history: []
      }
    }
  }
}

const appointmentsServices = new AppointmentsServices()
export default appointmentsServices
