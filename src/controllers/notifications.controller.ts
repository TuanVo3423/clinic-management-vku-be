import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateNotificationBody,
  FindNotificationParams,
  FindNotificationsByRecipientParams
} from '~/models/requests/notifications.request'
import notificationsServices from '~/services/notifications.services'

const NOTIFICATIONS_MESSAGES = {
  CREATE_NOTIFICATION_SUCCESS: 'Create notification successfully',
  GET_NOTIFICATIONS_SUCCESS: 'Get notifications successfully',
  GET_NOTIFICATION_SUCCESS: 'Get notification successfully',
  DELETE_NOTIFICATION_SUCCESS: 'Delete notification successfully',
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  MARK_FAILED_SUCCESS: 'Mark notification as failed successfully',
  RETRY_NOTIFICATION_SUCCESS: 'Retry notification successfully',
  GET_FAILED_NOTIFICATIONS_SUCCESS: 'Get failed notifications successfully',
  MARK_READ_SUCCESS: 'Mark notification as read successfully',
  GET_NOTIFICATIONS_BY_READ_STATUS_SUCCESS: 'Get notifications by read status successfully',
  GET_UNREAD_COUNT_SUCCESS: 'Get unread notifications count successfully'
}

export const createNotificationController = async (
  req: Request<ParamsDictionary, any, CreateNotificationBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const notification = await notificationsServices.createNotification(req.body)
    return res.status(201).json({
      message: NOTIFICATIONS_MESSAGES.CREATE_NOTIFICATION_SUCCESS,
      notification_id: notification.insertedId
    })
  } catch (error) {
    next(error)
  }
}

export const getNotificationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationsServices.getNotifications()
    return res.json({ message: NOTIFICATIONS_MESSAGES.GET_NOTIFICATIONS_SUCCESS, notifications })
  } catch (error) {
    next(error)
  }
}

export const getNotificationController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationsServices.getNotification(req.params.notification_id)
    if (!notification) {
      return res.status(404).json({ message: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND })
    }
    return res.json({ message: NOTIFICATIONS_MESSAGES.GET_NOTIFICATION_SUCCESS, notification })
  } catch (error) {
    next(error)
  }
}

export const getNotificationsByRecipientController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const { recipient_type } = req.query

    if (!recipient_type || (recipient_type !== 'patient' && recipient_type !== 'doctor')) {
      return res
        .status(400)
        .json({ message: 'recipient_type query parameter is required and must be either "patient" or "doctor"' })
    }

    const notifications = await notificationsServices.getNotificationsByRecipient(
      req.params.recipient_id,
      recipient_type as 'patient' | 'doctor'
    )
    return res.json({ message: NOTIFICATIONS_MESSAGES.GET_NOTIFICATIONS_SUCCESS, notifications })
  } catch (error) {
    next(error)
  }
}

export const getFailedNotificationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationsServices.getFailedNotifications()
    return res.json({ message: NOTIFICATIONS_MESSAGES.GET_FAILED_NOTIFICATIONS_SUCCESS, notifications })
  } catch (error) {
    next(error)
  }
}

export const markNotificationAsFailedController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const existingNotification = await notificationsServices.getNotification(req.params.notification_id)
    if (!existingNotification) {
      return res.status(404).json({ message: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND })
    }

    const notification = await notificationsServices.markNotificationAsFailed(req.params.notification_id)
    return res.json({ message: NOTIFICATIONS_MESSAGES.MARK_FAILED_SUCCESS, notification })
  } catch (error) {
    next(error)
  }
}

export const markNotificationAsReadController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const existingNotification = await notificationsServices.getNotification(req.params.notification_id)
    if (!existingNotification) {
      return res.status(404).json({ message: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND })
    }

    const notification = await notificationsServices.markNotificationAsRead(req.params.notification_id)
    return res.json({ message: NOTIFICATIONS_MESSAGES.MARK_READ_SUCCESS, notification })
  } catch (error) {
    next(error)
  }
}

export const retryNotificationController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const existingNotification = await notificationsServices.getNotification(req.params.notification_id)
    if (!existingNotification) {
      return res.status(404).json({ message: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND })
    }

    const notification = await notificationsServices.retryFailedNotification(req.params.notification_id)
    return res.json({ message: NOTIFICATIONS_MESSAGES.RETRY_NOTIFICATION_SUCCESS, notification })
  } catch (error) {
    next(error)
  }
}

export const deleteNotificationController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationsServices.deleteNotification(req.params.notification_id)
    if (notification.deletedCount === 0) {
      return res.status(404).json({ message: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND })
    }
    return res.json({ message: NOTIFICATIONS_MESSAGES.DELETE_NOTIFICATION_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const getNotificationsByReadStatusController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const { isRead } = req.params
    const readStatus = isRead === 'true' ? true : isRead === 'false' ? false : null

    if (readStatus === null) {
      return res.status(400).json({ message: 'isRead parameter must be "true" or "false"' })
    }

    const notifications = await notificationsServices.getNotificationsByReadStatus(readStatus)
    return res.json({
      message: NOTIFICATIONS_MESSAGES.GET_NOTIFICATIONS_BY_READ_STATUS_SUCCESS,
      notifications
    })
  } catch (error) {
    next(error)
  }
}

export const getUnreadNotificationsCountController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notificationsServices.getUnreadNotificationsCount()
    return res.json({
      message: NOTIFICATIONS_MESSAGES.GET_UNREAD_COUNT_SUCCESS,
      count
    })
  } catch (error) {
    next(error)
  }
}
