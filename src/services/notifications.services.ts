import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CreateNotificationBody } from '~/models/requests/notifications.request'
import Notification from '~/models/schemas/Notification.schema'

class NotificationsServices {
  async createNotification(payload: CreateNotificationBody) {
    const notificationData = {
      ...payload,
      recipientId: new ObjectId(payload.recipientId),
      appointmentId: new ObjectId(payload.appointmentId)
    }

    const notification = await databaseServices.notifications.insertOne(new Notification(notificationData as any))
    return notification
  }

  async getNotifications() {
    const notifications = await databaseServices.notifications.find({}).sort({ createdAt: -1 }).toArray()
    return notifications
  }

  async getNotification(_id: string) {
    const notification = await databaseServices.notifications.findOne({ _id: new ObjectId(_id) })
    return notification
  }

  async getNotificationsByRecipient(recipientId: string, recipientType: 'patient' | 'doctor') {
    const notifications = await databaseServices.notifications
      .find({
        recipientId: new ObjectId(recipientId),
        recipientType
      })
      .sort({ createdAt: -1 })
      .toArray()
    return notifications
  }

  async markNotificationAsFailed(_id: string) {
    const notification = await databaseServices.notifications.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: { status: 'failed' }
      }
    )
    return notification
  }

  async markNotificationAsRead(_id: string) {
    const notification = await databaseServices.notifications.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: { isRead: true }
      }
    )
    return notification
  }

  async deleteNotification(_id: string) {
    const notification = await databaseServices.notifications.deleteOne({ _id: new ObjectId(_id) })
    return notification
  }

  async getFailedNotifications() {
    const notifications = await databaseServices.notifications.find({ status: 'failed' }).toArray()
    return notifications
  }

  async retryFailedNotification(_id: string) {
    const notification = await databaseServices.notifications.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: { status: 'sent' }
      }
    )
    return notification
  }

  async getNotificationsByReadStatus(isRead: boolean) {
    const notifications = await databaseServices.notifications
      .find({
        isRead
      })
      .sort({ createdAt: -1 })
      .toArray()
    return notifications
  }

  async getUnreadNotificationsCount() {
    const count = await databaseServices.notifications.countDocuments({
      isRead: false
    })
    return count
  }
}

const notificationsServices = new NotificationsServices()
export default notificationsServices
