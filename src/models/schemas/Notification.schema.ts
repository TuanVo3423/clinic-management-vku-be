import { ObjectId } from 'mongodb'

export interface INotification {
  _id?: ObjectId
  recipientType: 'patient' | 'doctor'
  recipientId: ObjectId
  appointmentId: ObjectId
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled'
  message: string
  channel: 'sms' | 'email'
  status: 'sent' | 'failed'
  isRead?: boolean
  createdAt?: Date
}

export default class Notification {
  _id?: ObjectId
  recipientType: 'patient' | 'doctor'
  recipientId: ObjectId
  appointmentId: ObjectId
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled'
  message: string
  channel: 'sms' | 'email'
  status: 'sent' | 'failed'
  isRead: boolean
  createdAt?: Date

  constructor(notification: INotification) {
    const date = new Date()
    this._id = notification._id
    this.recipientType = notification.recipientType
    this.recipientId = notification.recipientId
    this.appointmentId = notification.appointmentId
    this.type = notification.type
    this.message = notification.message
    this.channel = notification.channel
    this.status = notification.status || 'sent'
    this.isRead = notification.isRead || false
    this.createdAt = notification.createdAt || date
  }
}
