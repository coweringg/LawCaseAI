import { Response } from 'express'
import { Event } from '../models'
import { IApiResponse, IAuthRequest } from '../types'

export const getEvents = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id
        const { start, end, caseId } = req.query

        const query: any = { userId }
        if (caseId) query.caseId = caseId
        if (start && end) {
            query.start = { $gte: new Date(start as string), $lte: new Date(end as string) }
        }

        const events = await Event.find(query).sort({ start: 1 }).lean()

        res.status(200).json({
            success: true,
            data: events
        } as IApiResponse)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}

export const createEvent = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const eventData = { ...req.body };
        if (eventData.caseId === '') {
            delete eventData.caseId;
        }

        const eventDate = new Date(eventData.start);
        if (eventDate < new Date()) {
            res.status(400).json({
                success: false,
                message: 'Legal events and deadlines cannot be scheduled in the past.'
            } as IApiResponse);
            return;
        }

        const event = await Event.create({
            ...eventData,
            userId
        })

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        } as IApiResponse)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create event'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}

export const updateEvent = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const userId = req.user?._id

        const eventData = { ...req.body };
        if (eventData.caseId === '') {
            delete eventData.caseId;
        }

        const eventDate = new Date(eventData.start);
        if (eventDate < new Date()) {
            res.status(400).json({
                success: false,
                message: 'Legal events and deadlines cannot be scheduled in the past.'
            } as IApiResponse);
            return;
        }

        const updatedEvent = await Event.findOneAndUpdate(
            { _id: id, userId },
            { $set: eventData },
            { new: true }
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to update event'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete event'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}
