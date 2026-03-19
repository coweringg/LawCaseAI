import { Response } from 'express'
import Notification from '../models/Notification'
import { IApiResponse, IAuthRequest } from '../types'
import logger from '../utils/logger'

const controllerLogger = logger.child({ module: 'notification-controller' })

export const getNotifications = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const unreadOnly = req.query.unread === 'true'
    const limit = parseInt(req.query.limit as string) || 20
    const skip = parseInt(req.query.skip as string) || 0

    const query: any = { userId }
    if (unreadOnly) {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    const totalCount = await Notification.countDocuments({ userId })
    const unreadCount = await Notification.countDocuments({ userId, isRead: false })

    res.status(200).json({
      success: true,
      data: {
        notifications,
        totalCount,
        unreadCount
      }
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'getNotifications error')
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' } as IApiResponse)
  }
}

export const markAsRead = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true }
    )

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' } as IApiResponse)
      return
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'markAsRead error')
    res.status(500).json({ success: false, message: 'Failed to update notification' } as IApiResponse)
  }
}

export const markAllAsRead = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    )

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'markAllAsRead error')
    res.status(500).json({ success: false, message: 'Failed to update notifications' } as IApiResponse)
  }
}

export const deleteNotification = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const notification = await Notification.findOneAndDelete({ _id: id, userId })

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' } as IApiResponse)
      return
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'deleteNotification error')
    res.status(500).json({ success: false, message: 'Failed to delete notification' } as IApiResponse)
  }
}

export const deleteAllNotifications = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    await Notification.deleteMany({ userId })

    res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully'
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'deleteAllNotifications error')
    res.status(500).json({ success: false, message: 'Failed to clear notifications' } as IApiResponse)
  }
}
