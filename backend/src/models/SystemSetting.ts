import mongoose, { Schema, Document } from 'mongoose'

export interface ISystemSetting extends Document {
  key: string
  value: any
  updatedBy?: mongoose.Types.ObjectId
  description?: string
  lastUpdated: Date
}

const systemSettingSchema = new Schema<ISystemSetting>({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model<ISystemSetting>('SystemSetting', systemSettingSchema)
