import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CreateAppointmentBody, UpdateAppointmentBody } from '~/models/requests/appointments.request'
import Appointment, { IAppointmentHistory } from '~/models/schemas/Appointment.schema'

class AppointmentsServices {
  async createAppointment(payload: CreateAppointmentBody) {
    const appointmentData = {
      ...payload,
      patientId: new ObjectId(payload.patientId),
      doctorId: payload.doctorId ? new ObjectId(payload.doctorId) : undefined,
      serviceId: new ObjectId(payload.serviceId),
      appointmentDate: new Date(payload.appointmentDate),
      history: [{
        action: 'created' as const,
        by: 'system' as const,
        timestamp: new Date(),
        details: 'Appointment created'
      }]
    }

    const appointment = await databaseServices.appointments.insertOne(
      new Appointment(appointmentData as any)
    )

    // Tạo thông báo sau khi tạo lịch hẹn
    const notificationData = {
      recipientType: 'patient' as const,
      recipientId: new ObjectId(payload.patientId),
      type: 'appointment_created' as const,
      message: `Lịch hẹn của bạn đã được tạo thành công cho ngày ${new Date(payload.appointmentDate).toLocaleDateString('vi-VN')}`,
      channel: 'sms' as const
    }

    await databaseServices.notifications.insertOne(notificationData as any)

    return appointment
  }

  async getAppointments() {
    const appointments = await databaseServices.appointments.aggregate([
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
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      }
    ]).toArray()
    return appointments
  }

  async getAppointment(_id: string) {
    const appointments = await databaseServices.appointments.aggregate([
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
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      }
    ]).toArray()
    return appointments[0]
  }

  async getAppointmentsByPatient(patientId: string) {
    const appointments = await databaseServices.appointments.aggregate([
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
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $sort: { appointmentDate: -1 } }
    ]).toArray()
    return appointments
  }

  async getAppointmentsByDoctor(doctorId: string) {
    const appointments = await databaseServices.appointments.aggregate([
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
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $sort: { appointmentDate: 1 } }
    ]).toArray()
    return appointments
  }

  async updateAppointment(_id: string, payload: UpdateAppointmentBody, updatedBy: 'system' | 'doctor' | 'patient' = 'system') {
    const updateData: any = { ...payload }
    
    if (payload.doctorId) {
      updateData.doctorId = new ObjectId(payload.doctorId)
    }
    if (payload.serviceId) {
      updateData.serviceId = new ObjectId(payload.serviceId)
    }
    if (payload.appointmentDate) {
      updateData.appointmentDate = new Date(payload.appointmentDate)
    }
    
    updateData.updatedAt = new Date()

    // Thêm lịch sử thay đổi
    const historyEntry: IAppointmentHistory = {
      action: 'updated',
      by: updatedBy,
      timestamp: new Date(),
      details: `Appointment updated by ${updatedBy}`
    }

    const appointment = await databaseServices.appointments.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: updateData,
        $push: { history: historyEntry }
      }
    )

    // Gửi thông báo cập nhật
    const appointmentData = await this.getAppointment(_id)
    if (appointmentData) {
      const notificationData = {
        recipientType: 'patient' as const,
        recipientId: appointmentData.patientId,
        type: 'appointment_updated' as const,
        message: `Lịch hẹn của bạn đã được cập nhật`,
        channel: 'sms' as const
      }
      await databaseServices.notifications.insertOne(notificationData as any)
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
          status: 'cancelled',
          updatedAt: new Date()
        },
        $push: { history: historyEntry }
      }
    )

    // Gửi thông báo hủy
    const appointmentData = await this.getAppointment(_id)
    if (appointmentData) {
      const notificationData = {
        recipientType: 'patient' as const,
        recipientId: appointmentData.patientId,
        type: 'appointment_cancelled' as const,
        message: `Lịch hẹn của bạn đã bị hủy`,
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

    const appointments = await databaseServices.appointments.find({
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).toArray()
    
    return appointments
  }

  async getEmergencyAppointments() {
    const appointments = await databaseServices.appointments.aggregate([
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
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray()
    return appointments
  }
}

const appointmentsServices = new AppointmentsServices()
export default appointmentsServices