import { Response } from 'express'
import Notification from '../models/Notification'
import { IApiResponse, IAuthRequest } from '../types'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const getNotifications = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    const unreadOnly = req.query.unread === 'true'
    const limit = parseInt(req.query.limit as string) || 20
    const skip = parseInt(req.query.skip as string) || 0

    const query: any = { userId }
    if (unreadOnly) query.isRead = false

    const [notifications, totalCount, unreadCount] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip).lean(),
        Notification.countDocuments({ userId }),
        Notification.countDocuments({ userId, isRead: false })
    ])

    res.status(200).json({
        success: true,
        data: { notifications, totalCount, unreadCount }
    } as IApiResponse)
})

export const markAsRead = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    const notification = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { $set: { isRead: true } },
        { new: true }
    )

    if (!notification) throw new AppError('Notification not found', 404)

    res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
    } as IApiResponse)
})

export const markAllAsRead = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } })

    res.status(200).json({ success: true, message: 'All notifications marked as read' })
})

export const deleteNotification = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    const notification = await Notification.findOneAndDelete({ _id: id, userId })
    if (!notification) throw new AppError('Notification not found', 404)

    res.status(200).json({ success: true, message: 'Notification deleted successfully' })
})

export const deleteAllNotifications = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    await Notification.deleteMany({ userId })
    res.status(200).json({ success: true, message: 'All notifications cleared successfully' })
})
