import { ObjectId } from 'mongodb'

interface IAppointmentHistory {
  action: 'created' | 'updated' | 'cancelled'
  by: 'system' | 'doctor' | 'patient'
  timestamp: Date
  details?: string
}

interface IAppointment {
  _id?: ObjectId
  patientId: ObjectId
  doctorId?: ObjectId
  serviceId: ObjectId
  appointmentDate: Date
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  isEmergency: boolean
  note?: string
  history: IAppointmentHistory[]
  createdAt?: Date
  updatedAt?: Date
}

export default class Appointment {
  _id?: ObjectId
  patientId: ObjectId
  doctorId?: ObjectId
  serviceId: ObjectId
  appointmentDate: Date
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  isEmergency: boolean
  note?: string
  history: IAppointmentHistory[]
  createdAt?: Date
  updatedAt?: Date

  constructor(appointment: IAppointment) {
    const date = new Date()
    this._id = appointment._id
    this.patientId = appointment.patientId
    this.doctorId = appointment.doctorId
    this.serviceId = appointment.serviceId
    this.appointmentDate = appointment.appointmentDate
    this.status = appointment.status || 'pending'
    this.isEmergency = appointment.isEmergency || false
    this.note = appointment.note
    this.history = appointment.history || []
    this.createdAt = appointment.createdAt || date
    this.updatedAt = appointment.updatedAt || date
  }
}

export type { IAppointmentHistory }