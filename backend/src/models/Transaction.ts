import mongoose, { Schema, Document, Types } from 'mongoose'
import { UserPlan } from '../types'

export interface ITransaction extends Document {
    userId: Types.ObjectId
    amount: number
    plan: UserPlan
    status: 'succeeded' | 'pending' | 'failed'
    paymentMethod: string
    invoiceUrl?: string
    stripePaymentIntentId?: string
    stripeCustomerId?: string
    date: Date
}

const transactionSchema = new Schema<ITransaction>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    plan: {
        type: String,
        enum: Object.values(UserPlan),
        required: true
    },
    status: {
        type: String,
        enum: ['succeeded', 'pending', 'failed'],
        default: 'succeeded'
    },
    paymentMethod: {
        type: String,
        default: 'N/A'
    },
    invoiceUrl: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

transactionSchema.index({ userId: 1, date: -1 })

export default mongoose.model<ITransaction>('Transaction', transactionSchema)
