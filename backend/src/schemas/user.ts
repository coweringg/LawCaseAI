import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  email: z.string()
    .email('Please provide a valid email address')
    .transform(v => v.toLowerCase().trim())
    .optional(),
  lawFirm: z.string()
    .trim()
    .max(200, 'Law firm name cannot exceed 200 characters')
    .optional()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
})

export const updateNotificationsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  caseUpdates: z.boolean().optional(),
  aiResponses: z.boolean().optional(),
  marketingEmails: z.boolean().optional()
})

export const addPaymentMethodSchema = z.object({
  brand: z.string().trim().min(1, 'Card brand is required'),
  last4: z.string()
    .trim()
    .min(4, 'Must be exactly 4 digits')
    .max(4, 'Must be exactly 4 digits')
    .regex(/^\d{4}$/, 'Must be numeric'),
  expiryMonth: z.number()
    .int()
    .min(1, 'Expiry month must be between 1 and 12')
    .max(12, 'Expiry month must be between 1 and 12'),
  expiryYear: z.number()
    .int()
    .min(2024, 'Invalid expiry year')
    .max(2050, 'Invalid expiry year')
})

export const supportRequestSchema = z.object({
  type: z.enum(['system_error', 'feature_uplink'], {
    message: 'Invalid request type'
  }),
  subject: z.string()
    .trim()
    .min(1, 'Subject is required')
    .max(200, 'Subject cannot exceed 200 characters'),
  description: z.string()
    .trim()
    .min(1, 'Description is required')
    .max(5000, 'Description cannot exceed 5000 characters')
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateNotificationsInput = z.infer<typeof updateNotificationsSchema>
export type AddPaymentMethodInput = z.infer<typeof addPaymentMethodSchema>
export type SupportRequestInput = z.infer<typeof supportRequestSchema>
