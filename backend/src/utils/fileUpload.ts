import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer'
import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import config from '../config'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types'

// Configure AWS S3 (Cloudflare R2 compatible)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.r2.endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
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

/**
 * High-level function to save a file to either R2 or Local Storage
 */
export const saveFileToStorage = async (file: Express.Multer.File, key: string): Promise<string> => {
  // Check if R2 is properly configured
  const isR2Configured = 
    config.r2.accessKeyId && 
    config.r2.accessKeyId !== 'your-r2-access-key' &&
    config.r2.secretAccessKey && 
    config.r2.secretAccessKey !== 'your-r2-secret-key'

  if (isR2Configured) {
    try {
      return await uploadToR2(file, key)
    } catch (error) {
      console.error('R2 Upload failed, falling back to local:', error)
      // Fallback to local if R2 fails
    }
  }

  // Local Storage Fallback
  try {
    const uploadDir = path.join(process.cwd(), 'uploads')
    const userDir = path.dirname(path.join(uploadDir, key))
    
    // Ensure directories exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, key)
    fs.writeFileSync(filePath, file.buffer)
    
    // Return relative URL for static serving
    return `/uploads/${key}`
  } catch (localError) {
    throw new Error(`Failed to save file locally: ${localError}`)
  }
}

export const uploadToR2 = async (file: Express.Multer.File, key: string): Promise<string> => {
  const params = {
    Bucket: config.r2.bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentLength: file.size
  }

  try {
    await s3Client.send(new PutObjectCommand(params))
    return `${config.r2.publicUrl}/${key}`
  } catch (error) {
    throw new Error(`Failed to upload file to R2: ${error}`)
  }
}

/**
 * High-level function to delete a file from either R2 or Local Storage
 */
export const deleteFromStorage = async (key: string): Promise<void> => {
  // Check if R2 is properly configured
  const isR2Configured = 
    config.r2.accessKeyId && 
    config.r2.accessKeyId !== 'your-r2-access-key' &&
    config.r2.secretAccessKey && 
    config.r2.secretAccessKey !== 'your-r2-secret-key'

  if (isR2Configured) {
    try {
      await deleteFromR2(key)
      return
    } catch (error) {
      console.error('R2 Delete failed, checking local:', error)
    }
  }

  // Local Storage Deletion
  try {
    const uploadDir = path.join(process.cwd(), 'uploads')
    const filePath = path.join(uploadDir, key)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (localError) {
    throw new Error(`Failed to delete file locally: ${localError}`)
  }
}

export const deleteFromR2 = async (key: string): Promise<void> => {
  const params = {
    Bucket: config.r2.bucketName,
    Key: key
  }

  try {
    await s3Client.send(new DeleteObjectCommand(params))
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
