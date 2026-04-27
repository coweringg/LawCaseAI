import mongoose, { Schema } from 'mongoose'
import { IEvent, EventType, EventPriority, EventStatus } from '../types'

const eventSchema = new Schema<IEvent>({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [200, 'Event title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    start: {
        type: Date,
        required: [true, 'Start date is required']
    },
    end: {
        type: Date
    },
    type: {
        type: String,
        enum: Object.values(EventType),
        default: EventType.OTHER
    },
    priority: {
        type: String,
        enum: Object.values(EventPriority),
        default: EventPriority.MEDIUM
    },
    caseId: {
        type: Schema.Types.ObjectId,
        ref: 'Case'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    location: {
        type: String,
        trim: true
    },
    isAllDay: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: Object.values(EventStatus),
        default: EventStatus.ACTIVE
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
})

eventSchema.index({ userId: 1 })
eventSchema.index({ userId: 1, start: 1 })
eventSchema.index({ userId: 1, status: 1, start: 1 })
eventSchema.index({ caseId: 1 })

const EventModel = mongoose.model<IEvent>('Event', eventSchema)

export default EventModel
