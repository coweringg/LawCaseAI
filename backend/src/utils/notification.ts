import { Types } from 'mongoose'
import Notification from '../models/Notification'
import { NotificationPriority, NotificationType } from '../types'
import logger from './logger'

const notificationLogger = logger.child({ module: 'notification-utils' })

export const createNotification = async (params: {
  userId: Types.ObjectId | string
  title: string
  message: string
  type?: NotificationType
  priority?: NotificationPriority
  link?: string
  metadata?: any
}) => {
  try {
    const notification = await Notification.create({
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || NotificationType.SYSTEM,
      priority: params.priority || NotificationPriority.MEDIUM,
      link: params.link,
      metadata: params.metadata
    })
    return notification
  } catch (error) {
    notificationLogger.error({ err: error, params }, 'Failed to create notification')
    return null
  }
}
