import { Response } from 'express'
import { Event } from '../models'
import { IApiResponse, IAuthRequest, EventType, EventPriority } from '../types'
import logger from '../utils/logger'

const controllerLogger = logger.child({ module: 'event-controller' })

// Escape special regex characters to prevent ReDoS
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const getEvents = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id
        const { start, end, caseId, search } = req.query

        const query: Record<string, unknown> = { userId }
        if (caseId) query.caseId = caseId

        // If searching, we search globally (ignoring date bounds)
        if (search && typeof search === 'string' && search.trim().length > 0) {
            query.title = { $regex: escapeRegex(search.trim()), $options: 'i' }
        } else if (start && end) {
            query.start = { $gte: new Date(start as string), $lte: new Date(end as string) }
        }

        const events = await Event.find(query).sort({ start: 1 }).lean()

        // Mark past events as closed in the response (without mutating DB on every GET)
        const now = new Date()
        const eventsWithStatus = events.map(event => ({
            ...event,
            status: (event.status === 'active' && new Date(event.start as Date) < now)
                ? 'closed'
                : event.status
        }))

        res.status(200).json({
            success: true,
            data: eventsWithStatus
        } as IApiResponse)
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'getEvents error')
        res.status(500).json({ success: false, message: 'Failed to fetch events' } as IApiResponse)
    }
}

export const createEvent = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        // Whitelist allowed fields to prevent NoSQL injection
        const { title, description, start, end, type, priority, caseId, location, isAllDay, status } = req.body

        // Validate required fields
        if (!title || !start) {
            res.status(400).json({ success: false, message: 'Title and start date are required' } as IApiResponse)
            return
        }

        const eventDate = new Date(start)
        if (eventDate < new Date()) {
            res.status(400).json({
                success: false,
                message: 'Legal events and deadlines cannot be scheduled in the past.'
            } as IApiResponse)
            return
        }

        // Build safe event data from whitelisted fields
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

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        } as IApiResponse)
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'createEvent error')
        res.status(500).json({ success: false, message: 'Failed to create event' } as IApiResponse)
    }
}

export const updateEvent = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const userId = req.user?._id

        // Whitelist allowed fields to prevent NoSQL injection
        const { title, description, start, end, type, priority, caseId, location, isAllDay, status } = req.body

        const allowedUpdates: Record<string, unknown> = {}
        if (title !== undefined) allowedUpdates.title = title
        if (description !== undefined) allowedUpdates.description = description
        if (start !== undefined) {
            const eventDate = new Date(start)
            // Allow updates even if past, as long as it's an existing valid date
            allowedUpdates.start = eventDate
        }
        if (end !== undefined) allowedUpdates.end = new Date(end)
        if (type !== undefined && Object.values(EventType).includes(type)) allowedUpdates.type = type
        if (priority !== undefined && Object.values(EventPriority).includes(priority)) allowedUpdates.priority = priority
        if (caseId !== undefined) {
            if (caseId === '') {
                allowedUpdates.caseId = undefined
            } else {
                allowedUpdates.caseId = caseId
            }
        }
        if (location !== undefined) allowedUpdates.location = location
        if (isAllDay !== undefined) allowedUpdates.isAllDay = Boolean(isAllDay)
        if (status !== undefined) allowedUpdates.status = status

        if (Object.keys(allowedUpdates).length === 0) {
            res.status(400).json({ success: false, message: 'No valid fields to update' } as IApiResponse)
            return
        }

        const updatedEvent = await Event.findOneAndUpdate(
            { _id: id, userId },
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        )

        if (!updatedEvent) {
            res.status(404).json({ success: false, message: 'Event not found' } as IApiResponse)
            return
        }

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        } as IApiResponse)
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'updateEvent error')
        res.status(500).json({ success: false, message: 'Failed to update event' } as IApiResponse)
    }
}

export const deleteEvent = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const userId = req.user?._id

        const deletedEvent = await Event.findOneAndDelete({ _id: id, userId })

        if (!deletedEvent) {
            res.status(404).json({ success: false, message: 'Event not found' } as IApiResponse)
            return
        }

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        } as IApiResponse)
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'deleteEvent error')
        res.status(500).json({ success: false, message: 'Failed to delete event' } as IApiResponse)
    }
}
