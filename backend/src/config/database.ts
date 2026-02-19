import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

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
    
    console.log(`✅ MongoDB connected: ${mongoUri}`)
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
    })

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect()
    console.log('✅ MongoDB disconnected')
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error)
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
    console.log('✅ Test database cleared')
  } catch (error) {
    console.error('❌ Error clearing test database:', error)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 SIGINT received. Shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🔄 SIGTERM received. Shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})
