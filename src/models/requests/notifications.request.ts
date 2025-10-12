import core from 'express-serve-static-core'

export interface CreateNotificationBody {
  recipientType: 'patient' | 'doctor'
  recipientId: string
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled'
  message: string
  channel: 'sms' | 'email'
}

export interface FindNotificationParams extends core.ParamsDictionary {
  notification_id: string
}

export interface FindNotificationsByRecipientParams extends core.ParamsDictionary {
  recipient_id: string
}