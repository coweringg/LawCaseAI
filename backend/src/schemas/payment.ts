import { z } from 'zod'
import { mongoIdSchema } from './common'

export const checkoutSchema = z.object({
  planId: z.enum(['basic', 'professional', 'elite', 'enterprise'], {
    message: 'Invalid plan'
  }),
  interval: z.enum(['monthly', 'annual'], {
    message: 'Billing interval must be monthly or annual'
  }).optional(),
  seats: z.number().int().min(1).optional()
})

export const memberIdParamsSchema = z.object({
  memberId: mongoIdSchema
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
