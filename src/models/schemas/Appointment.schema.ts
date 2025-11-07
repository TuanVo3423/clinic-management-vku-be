import { ObjectId } from 'mongodb'
import { AppointmentStatus } from '~/constants/enums'

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
  bedId?: ObjectId
  appointmentDate: Date
  appointmentStartTime: string
  appointmentEndTime: string
  status: AppointmentStatus
  isEmergency: boolean
  price?: number
  isCharged?: boolean
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
  bedId?: ObjectId
  appointmentDate: Date
  appointmentStartTime: string
  appointmentEndTime: string
  status: AppointmentStatus
  isEmergency: boolean
  price?: number
  isCharged?: boolean
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
    this.price = appointment.price
    this.isCharged = appointment.isCharged
    this.bedId = appointment.bedId
    this.appointmentDate = appointment.appointmentDate
    this.appointmentStartTime = appointment.appointmentStartTime
    this.appointmentEndTime = appointment.appointmentEndTime
    this.status = appointment.status || AppointmentStatus.Pending
    this.isEmergency = appointment.isEmergency || false
    this.note = appointment.note
    this.history = appointment.history || []
    this.createdAt = appointment.createdAt || date
    this.updatedAt = appointment.updatedAt || date
  }
}

export type { IAppointmentHistory }
