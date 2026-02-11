import AWS from 'aws-sdk'
import multer from 'multer'
import { Request } from 'express'
import { config } from '@/config'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/types'

// Configure AWS S3 (Cloudflare R2 compatible)
const s3 = new AWS.S3({
  accessKeyId: config.r2.accessKeyId,
  secretAccessKey: config.r2.secretAccessKey,
  endpoint: config.r2.endpoint,
  region: 'auto',
  signatureVersion: 'v4'
})

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`))
    }
  }
})

export const uploadSingle = upload.single('file')

export const uploadToR2 = async (file: Express.Multer.File, key: string): Promise<string> => {
  const params = {
    Bucket: config.r2.bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentLength: file.size
  }

  try {
    await s3.upload(params).promise()
    return `${config.r2.publicUrl}/${key}`
  } catch (error) {
    throw new Error(`Failed to upload file to R2: ${error}`)
  }
}

export const deleteFromR2 = async (key: string): Promise<void> => {
  const params = {
    Bucket: config.r2.bucketName,
    Key: key
  }

  try {
    await s3.deleteObject(params).promise()
  } catch (error) {
    throw new Error(`Failed to delete file from R2: ${error}`)
  }
}

export const generateFileKey = (userId: string, caseId: string, originalName: string): string => {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  const baseName = originalName.split('.').slice(0, -1).join('.')
  return `files/${userId}/${caseId}/${timestamp}-${baseName}.${extension}`
}

export const getFileInfo = (file: Express.Multer.File) => {
  return {
    name: file.originalname,
    size: file.size,
    type: file.mimetype,
    buffer: file.buffer
  }
}
