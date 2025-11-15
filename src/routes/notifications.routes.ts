import { Router } from 'express'
import {
  createNotificationController,
  deleteNotificationController,
  getNotificationController,
  getNotificationsController,
  getNotificationsByRecipientController,
  getFailedNotificationsController,
  markNotificationAsFailedController,
  retryNotificationController,
  markNotificationAsReadController,
  getNotificationsByReadStatusController,
  getUnreadNotificationsCountController
} from '~/controllers/notifications.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const notificationsRouter = Router()

// Tạo thông báo mới
notificationsRouter.post('/', wrapRequestHandler(createNotificationController))

// Lấy danh sách tất cả thông báo
notificationsRouter.get('/', wrapRequestHandler(getNotificationsController))

// Lấy thông báo thất bại
notificationsRouter.get('/failed', wrapRequestHandler(getFailedNotificationsController))

// Lấy thông báo theo người nhận
notificationsRouter.get('/recipient/:recipient_id', wrapRequestHandler(getNotificationsByRecipientController))

// Lấy thông báo theo ID
notificationsRouter.get('/:notification_id', wrapRequestHandler(getNotificationController))

// Đánh dấu thông báo thất bại
notificationsRouter.patch('/:notification_id/failed', wrapRequestHandler(markNotificationAsFailedController))

// Thử lại gửi thông báo thất bại
notificationsRouter.patch('/:notification_id/retry', wrapRequestHandler(retryNotificationController))

// Xóa thông báo
notificationsRouter.delete('/:notification_id', wrapRequestHandler(deleteNotificationController))

// Đánh dấu thông báo đã đọc
notificationsRouter.patch('/:notification_id/read', wrapRequestHandler(markNotificationAsReadController))

// lấy ra thông báo theo trạng thái đã đọc hay chưa
notificationsRouter.get('/status/:isRead', wrapRequestHandler(getNotificationsByReadStatusController))

// lấy ra số lương thông báo chưa đọc
notificationsRouter.get('/count/unread', wrapRequestHandler(getUnreadNotificationsCountController))

export default notificationsRouter
