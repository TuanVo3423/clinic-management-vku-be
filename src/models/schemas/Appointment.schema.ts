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
  serviceIds: ObjectId[]
  bedId?: ObjectId
  appointmentDate: Date
  appointmentStartTime: string
  appointmentEndTime: string
  status: AppointmentStatus
  isEmergency: boolean
  price?: number
  isCharged?: boolean
  isCheckout?: boolean
  note?: string
  history: IAppointmentHistory[]
  // Blockchain fields
  blockchainHash?: string // SHA256 hash của appointment data
  blockchainTxHash?: string // Transaction hash khi lưu lên blockchain
  blockchainVerified?: boolean // Flag kiểm tra đã verify hay chưa
  isPendingSavingToBlockchain?: boolean // Flag tạm thời để đánh dấu đang chờ lưu lên blockchain
  createdAt?: Date
  updatedAt?: Date
}

export default class Appointment {
  _id?: ObjectId
  patientId: ObjectId
  doctorId?: ObjectId
  serviceIds: ObjectId[]
  bedId?: ObjectId
  appointmentDate: Date
  appointmentStartTime: string
  appointmentEndTime: string
  status: AppointmentStatus
  isEmergency: boolean
  price?: number
  isCharged?: boolean
  isCheckout?: boolean
  note?: string
  history: IAppointmentHistory[]
  // Blockchain fields
  blockchainHash?: string
  blockchainTxHash?: string
  blockchainVerified?: boolean
  isPendingSavingToBlockchain?: boolean // Flag tạm thời để đánh dấu đang chờ lưu lên blockchain
  createdAt?: Date
  updatedAt?: Date

  constructor(appointment: IAppointment) {
    const date = new Date()
    this._id = appointment._id
    this.patientId = appointment.patientId
    this.doctorId = appointment.doctorId
    this.serviceIds = appointment.serviceIds
    this.price = appointment.price
    this.isCharged = appointment.isCharged
    this.isCheckout = appointment.isCheckout || false
    this.bedId = appointment.bedId
    this.appointmentDate = appointment.appointmentDate
    this.appointmentStartTime = appointment.appointmentStartTime
    this.appointmentEndTime = appointment.appointmentEndTime
    this.status = appointment.status || AppointmentStatus.Pending
    this.isEmergency = appointment.isEmergency || false
    this.note = appointment.note
    this.history = appointment.history || []
    // Blockchain fields
    this.blockchainHash = appointment.blockchainHash
    this.blockchainTxHash = appointment.blockchainTxHash
    this.blockchainVerified = appointment.blockchainVerified || false
    this.isPendingSavingToBlockchain = appointment.isPendingSavingToBlockchain || true
    this.createdAt = appointment.createdAt || date
    this.updatedAt = appointment.updatedAt || date
  }
}

export type { IAppointmentHistory }
