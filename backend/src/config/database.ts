import mongoose from 'mongoose'
import dotenv from 'dotenv'
import logger from '../utils/logger'

dotenv.config()

const dbLogger = logger.child({ module: 'database' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lawcaseai'
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lawcaseai_test'

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.NODE_ENV === 'test' ? MONGODB_TEST_URI : MONGODB_URI
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    await mongoose.connect(mongoUri, options)
    
    dbLogger.info({ uri: mongoUri.replace(/\/\/.*@/, '//<credentials>@') }, '✅ MongoDB connected')
    
    mongoose.connection.on('error', (error) => {
      dbLogger.error({ err: error }, '❌ MongoDB connection error')
    })

    mongoose.connection.on('disconnected', () => {
      dbLogger.warn('⚠️ MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      dbLogger.info('✅ MongoDB reconnected')
    })

  } catch (error) {
    dbLogger.fatal({ err: error }, '❌ Failed to connect to MongoDB')
    process.exit(1)
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect()
    dbLogger.info('✅ MongoDB disconnected')
  } catch (error) {
    dbLogger.error({ err: error }, '❌ Error disconnecting from MongoDB')
  }
}

export const clearDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearDatabase can only be used in test environment')
  }
  
  try {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      const collection = collections[key]
      await collection.deleteMany({})
    }
    dbLogger.info('✅ Test database cleared')
  } catch (error) {
    dbLogger.error({ err: error }, '❌ Error clearing test database')
  }
}
