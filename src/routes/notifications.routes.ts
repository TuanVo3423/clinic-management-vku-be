import { Router } from 'express'
import {
  createNotificationController,
  deleteNotificationController,
  getNotificationController,
  getNotificationsController,
  getNotificationsByRecipientController,
  getFailedNotificationsController,
  markNotificationAsFailedController,
  retryNotificationController
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

export default notificationsRouter