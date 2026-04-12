import mongoose, { Schema } from 'mongoose'
import { INotification, NotificationType, NotificationPriority } from '../types'

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    default: NotificationType.SYSTEM
  },
  priority: {
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, isRead: 1 })
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

const Notification = mongoose.model<INotification>('Notification', notificationSchema)

export default Notification
