import { ObjectId } from 'mongodb'

interface INotification {
  _id?: ObjectId
  recipientType: 'patient' | 'doctor'
  recipientId: ObjectId
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled'
  message: string
  channel: 'sms' | 'email'
  status: 'sent' | 'failed'
  createdAt?: Date
}

export default class Notification {
  _id?: ObjectId
  recipientType: 'patient' | 'doctor'
  recipientId: ObjectId
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled'
  message: string
  channel: 'sms' | 'email'
  status: 'sent' | 'failed'
  createdAt?: Date

  constructor(notification: INotification) {
    const date = new Date()
    this._id = notification._id
    this.recipientType = notification.recipientType
    this.recipientId = notification.recipientId
    this.type = notification.type
    this.message = notification.message
    this.channel = notification.channel
    this.status = notification.status || 'sent'
    this.createdAt = notification.createdAt || date
  }
}