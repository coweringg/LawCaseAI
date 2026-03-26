import mongoose, { Schema, Document } from 'mongoose'

export interface IKnowledgeDocument extends Document {
    name: string
    category: 'jurisprudence' | 'contracts' | 'regulations' | 'templates' | 'doctrine' | 'other'
    assignedTo: 'all' | string
    fileUrl: string
    fileKey: string
    fileSize: number
    fileType: string
    uploadDate: Date
    accessCount: number
    uploadedBy: mongoose.Types.ObjectId
    extractedText?: string
}

const KnowledgeDocumentSchema: Schema = new Schema({
    name: { type: String, required: true },
    category: { 
        type: String, 
        required: true, 
        enum: ['jurisprudence', 'contracts', 'regulations', 'templates', 'doctrine', 'other'] 
    },
    assignedTo: { type: String, default: 'all' },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    accessCount: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    extractedText: { type: String }
}, {
    timestamps: true
})

KnowledgeDocumentSchema.index({ name: 'text', category: 'text', extractedText: 'text' })

export default mongoose.model<IKnowledgeDocument>('KnowledgeDocument', KnowledgeDocumentSchema)
