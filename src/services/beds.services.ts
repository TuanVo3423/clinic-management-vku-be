import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CreateBedBody, UpdateBedBody } from '~/models/requests/beds.request'
import Bed from '~/models/schemas/Bed.schema'
import { AppointmentStatus } from '~/constants/enums'

class BedsServices {
  async createBed(payload: CreateBedBody) {
    // Check if bed number already exists
    const existingBed = await databaseServices.beds.findOne({ bedNumber: payload.bedNumber })
    if (existingBed) {
      throw new Error('Bed number already exists')
    }

    const bed = await databaseServices.beds.insertOne(new Bed(payload as any))
    return bed
  }

  async getBeds() {
    const beds = await databaseServices.beds.find().sort({ bedNumber: 1 }).toArray()
    return beds
  }

  async getAvailableBeds(appointmentDate: Date, appointmentStartTime: string, appointmentEndTime: string) {
    // Get all beds
    const allBeds = await databaseServices.beds.find({ isAvailable: true }).sort({ bedNumber: 1 }).toArray()

    // Get all appointments for the given date
    const appointments = await databaseServices.appointments
      .find({
        appointmentDate: appointmentDate,
        status: { $in: [AppointmentStatus.Pending, AppointmentStatus.Confirmed] },
        bedId: { $exists: true }
      })
      .toArray()

    // Filter out beds that have conflicting appointments
    const availableBeds = allBeds.filter((bed) => {
      const hasConflict = appointments.some((appointment) => {
        if (!appointment.bedId || appointment.bedId.toString() !== bed._id?.toString()) {
          return false
        }

        // Check time overlap
        return this.checkTimeOverlap(
          appointmentStartTime,
          appointmentEndTime,
          appointment.appointmentStartTime,
          appointment.appointmentEndTime
        )
      })

      return !hasConflict
    })

    return availableBeds
  }

  async getBed(_id: string) {
    const bed = await databaseServices.beds.findOne({ _id: new ObjectId(_id) })
    return bed
  }

  async updateBed(_id: string, payload: UpdateBedBody) {
    const updateData: any = { ...payload, updatedAt: new Date() }

    const bed = await databaseServices.beds.updateOne({ _id: new ObjectId(_id) }, { $set: updateData })

    return bed
  }

  async deleteBed(_id: string) {
    // Check if bed has any active appointments
    const activeAppointments = await databaseServices.appointments.findOne({
      bedId: new ObjectId(_id),
      status: { $in: [AppointmentStatus.Pending, AppointmentStatus.Confirmed] }
    })

    if (activeAppointments) {
      throw new Error('Cannot delete bed with active appointments')
    }

    const bed = await databaseServices.beds.deleteOne({ _id: new ObjectId(_id) })
    return bed
  }

  async checkBedAvailability(bedId: string, appointmentDate: Date, startTime: string, endTime: string) {
    const bed = await this.getBed(bedId)
    if (!bed) {
      return { available: false, reason: 'Bed not found' }
    }

    if (!bed.isAvailable) {
      return { available: false, reason: 'Bed is not available' }
    }

    // Check for conflicting appointments
    const conflictingAppointment = await databaseServices.appointments.findOne({
      bedId: new ObjectId(bedId),
      appointmentDate: appointmentDate,
      status: { $in: [AppointmentStatus.Pending, AppointmentStatus.Confirmed] },
      $or: [
        {
          $and: [{ appointmentStartTime: { $lte: startTime } }, { appointmentEndTime: { $gt: startTime } }]
        },
        {
          $and: [{ appointmentStartTime: { $lt: endTime } }, { appointmentEndTime: { $gte: endTime } }]
        },
        {
          $and: [{ appointmentStartTime: { $gte: startTime } }, { appointmentEndTime: { $lte: endTime } }]
        }
      ]
    })

    if (conflictingAppointment) {
      return {
        available: false,
        reason: 'Bed is already booked for this time slot',
        conflictingAppointment
      }
    }

    return { available: true }
  }

  private checkTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    // Convert time strings to comparable format (assuming HH:MM format)
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const start1Minutes = toMinutes(start1)
    const end1Minutes = toMinutes(end1)
    const start2Minutes = toMinutes(start2)
    const end2Minutes = toMinutes(end2)

    // Check if there's any overlap
    return (
      (start1Minutes >= start2Minutes && start1Minutes < end2Minutes) ||
      (end1Minutes > start2Minutes && end1Minutes <= end2Minutes) ||
      (start1Minutes <= start2Minutes && end1Minutes >= end2Minutes)
    )
  }

  async getBedAppointments(bedId: string) {
    const appointments = await databaseServices.appointments
      .aggregate([
        { $match: { bedId: new ObjectId(bedId) } },
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
        { $sort: { appointmentDate: -1 } }
      ])
      .toArray()
    return appointments
  }
}

const bedsServices = new BedsServices()
export default bedsServices
