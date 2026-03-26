import mongoose, { Schema, Document } from 'mongoose'

export interface IKnowledgeRequest extends Document {
    userId: mongoose.Types.ObjectId
    organizationId?: mongoose.Types.ObjectId
    description: string
    category: 'jurisprudence' | 'contracts' | 'regulations' | 'templates' | 'doctrine' | 'other'
    status: 'pending' | 'resolved'
    createdAt: Date
}

const KnowledgeRequestSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    description: { type: String, required: true },
    category: { 
        type: String, 
        required: true, 
        enum: ['jurisprudence', 'contracts', 'regulations', 'templates', 'doctrine', 'other'] 
    },
    status: { type: String, default: 'pending', enum: ['pending', 'resolved'] }
}, {
    timestamps: true
})

export default mongoose.model<IKnowledgeRequest>('KnowledgeRequest', KnowledgeRequestSchema)
