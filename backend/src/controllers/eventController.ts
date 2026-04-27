import { Response } from 'express'
import { Event } from '../models'
import { IApiResponse, IAuthRequest, EventType, EventPriority, NotificationType, NotificationPriority } from '../types'
import { createNotification } from '../utils/notification'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const getEvents = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    const { start, end, caseId, search } = req.query

    const query: Record<string, unknown> = { userId }
    if (caseId) query.caseId = caseId

    if (search && typeof search === 'string' && search.trim().length > 0) {
        query.title = { $regex: escapeRegex(search.trim()), $options: 'i' }
    } else if (start && end) {
        query.start = { $gte: new Date(start as string), $lte: new Date(end as string) }
    }

    const events = await Event.find(query).sort({ start: 1 }).lean()
    const now = new Date()
    const eventsWithStatus = events.map(event => {
        if (event.status !== 'active') return event;

        const eventStart = new Date(event.start as Date);
        const hasTime = (event as any).metadata?.hasTime ?? !(event as any).isAllDay;
        let shouldClose = false;

        if (hasTime) {
            shouldClose = eventStart < now;
        } else {
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const eventDayStart = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
            shouldClose = todayStart > eventDayStart;
        }

        return {
            ...event,
            status: shouldClose ? 'closed' : event.status
        };
    })

    res.status(200).json({
        success: true,
        data: eventsWithStatus
    } as IApiResponse)
})

export const createEvent = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const { title, description, start, end, type, priority, caseId, location, isAllDay, status } = req.body

    if (!title || !start) {
        throw new AppError('Title and start date are required', 400)
    }

    const eventDate = new Date(start)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (eventDate < today) {
        throw new AppError('Legal events and deadlines cannot be scheduled in a previous date.', 400)
    }

    const safeEventData: Record<string, unknown> = {
        title,
        start: eventDate,
        userId
    }
    if (description !== undefined) safeEventData.description = description
    if (end !== undefined) safeEventData.end = new Date(end)
    if (type && Object.values(EventType).includes(type)) safeEventData.type = type
    if (priority && Object.values(EventPriority).includes(priority)) safeEventData.priority = priority
    if (caseId && caseId !== '') safeEventData.caseId = caseId
    if (location !== undefined) safeEventData.location = location
    if (isAllDay !== undefined) safeEventData.isAllDay = Boolean(isAllDay)
    if (status !== undefined) safeEventData.status = status

    const event = await Event.create(safeEventData)

    createNotification({
        userId,
        title: 'New Calendar Event',
        message: `Event "${event.title}" has been scheduled for ${eventDate.toLocaleDateString()}.`,
        type: NotificationType.CALENDAR_EVENT,
        priority: event.priority === 'critical' || event.priority === 'high' ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
        link: '/calendar',
        metadata: { eventId: event._id, caseId: event.caseId }
    }).catch(() => {});

    res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
    } as IApiResponse)
})

export const updateEvent = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    const { title, description, start, end, type, priority, caseId, location, isAllDay, status } = req.body

    const allowedUpdates: Record<string, unknown> = {}
    if (title !== undefined) allowedUpdates.title = title
    if (description !== undefined) allowedUpdates.description = description
    if (start !== undefined) allowedUpdates.start = new Date(start)
    if (end !== undefined) allowedUpdates.end = new Date(end)
    if (type !== undefined && Object.values(EventType).includes(type)) allowedUpdates.type = type
    if (priority !== undefined && Object.values(EventPriority).includes(priority)) allowedUpdates.priority = priority
    if (caseId !== undefined) allowedUpdates.caseId = caseId === '' ? undefined : caseId
    if (location !== undefined) allowedUpdates.location = location
    if (isAllDay !== undefined) allowedUpdates.isAllDay = Boolean(isAllDay)
    if (status !== undefined) allowedUpdates.status = status

    if (Object.keys(allowedUpdates).length === 0) {
        throw new AppError('No valid fields to update', 400)
    }

    const updatedEvent = await Event.findOneAndUpdate(
        { _id: id, userId },
        { $set: allowedUpdates },
        { new: true, runValidators: true }
    )

    if (!updatedEvent) {
        throw new AppError('Event not found', 404)
    }

    res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
    } as IApiResponse)
})

export const deleteEvent = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    const deletedEvent = await Event.findOneAndDelete({ _id: id, userId })

    if (!deletedEvent) {
        throw new AppError('Event not found', 404)
    }

    res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
    } as IApiResponse)
})
