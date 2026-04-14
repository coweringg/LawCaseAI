import { z } from 'zod'
import { mongoIdSchema } from './common'

export const createEventSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Event title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  start: z.string()
    .min(1, 'Start date is required')
    .datetime({ message: 'Start date must be a valid ISO 8601 date' }),
  end: z.string()
    .datetime({ message: 'End date must be a valid ISO 8601 date' })
    .optional(),
  type: z.enum(['deadline', 'hearing', 'meeting', 'review', 'consultation', 'other'])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical'])
    .optional(),
  caseId: z.union([mongoIdSchema, z.literal(''), z.null()])
    .optional()
    .transform(v => v || undefined),
  location: z.string()
    .trim()
    .max(300, 'Location cannot exceed 300 characters')
    .optional(),
  isAllDay: z.boolean()
    .optional()
})

export const updateEventSchema = z.object({
  title: z.string()
    .trim()
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z.string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  start: z.string()
    .datetime({ message: 'Start date must be a valid ISO 8601 date' })
    .optional(),
  end: z.string()
    .datetime({ message: 'End date must be a valid ISO 8601 date' })
    .optional(),
  type: z.enum(['deadline', 'hearing', 'meeting', 'review', 'consultation', 'other'])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical'])
    .optional(),
  status: z.enum(['active', 'closed'])
    .optional(),
  caseId: z.union([mongoIdSchema, z.literal(''), z.null()])
    .optional()
    .transform(v => v || undefined),
  location: z.string()
    .trim()
    .max(300, 'Location cannot exceed 300 characters')
    .optional(),
  isAllDay: z.boolean()
    .optional()
})

export const eventParamsSchema = z.object({
  id: mongoIdSchema
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
