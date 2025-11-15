import databaseServices from '~/services/database.services'
import socketService from '~/services/socket.services'

export async function watchNotifications() {
  try {
    const collection = databaseServices.notifications

    console.log('👂 Đang lắng nghe thay đổi trên collection "notifications"...')

    const changeStream = collection.watch()

    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        const newNotification = change.fullDocument
        console.log('🔔 Notification mới được thêm:', newNotification)

        if (newNotification) {
          // Chuyển ObjectId thành string để gửi qua socket
          const notificationData = {
            _id: newNotification._id?.toString(),
            recipientType: newNotification.recipientType,
            recipientId: newNotification.recipientId.toString(),
            type: newNotification.type,
            message: newNotification.message,
            channel: newNotification.channel,
            status: newNotification.status,
            createdAt: newNotification.createdAt,
            appointmentId: newNotification.appointmentId.toString(),
            isRead: newNotification.isRead
          }

          console.log("notificationData123", notificationData)

          // Gửi notification đến user cụ thể qua socket
          const userId = newNotification.recipientId.toString()
          socketService.emitToAll('new-notification', notificationData)

          console.log(`✅ Đã gửi notification đến ${newNotification.recipientType} ${userId}`)
        }
      }

      // Có thể thêm xử lý cho các event khác
      if (change.operationType === 'update') {
        console.log('📝 Notification được cập nhật:', change.documentKey)
      }

      if (change.operationType === 'delete') {
        console.log('🗑️ Notification được xóa:', change.documentKey)
      }
    })

    changeStream.on('error', (error) => {
      console.error('❌ Lỗi trong notification watcher:', error)
    })
  } catch (error) {
    console.error('❌ Lỗi khởi tạo notification watcher:', error)
  }
}
