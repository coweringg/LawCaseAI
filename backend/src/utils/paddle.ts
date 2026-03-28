import { Paddle, Environment } from '@paddle/paddle-node-sdk'
import config from '../config'

let paddleInstance: Paddle | null = null

export const getPaddleInstance = (): Paddle => {
  if (paddleInstance) return paddleInstance

  if (!config.paddle.apiKey) {
    throw new Error('PADDLE_API_KEY (or SANDBOX mapping) is not defined in the environment variables')
  }

  console.log(`--- PADDLE INITIALIZATION --- Env: ${config.paddle.environment}. API Key starts with: ${config.paddle.apiKey.substring(0, 15)}...`);

  paddleInstance = new Paddle(config.paddle.apiKey, {
    environment: config.paddle.environment === 'sandbox' ? Environment.sandbox : Environment.production
  })

  return paddleInstance
}

export const getWebhookSecret = (): string => {
  if (!config.paddle.webhookSecret) {
    throw new Error('PADDLE_WEBHOOK_SECRET is not defined in the environment variables')
  }
  return config.paddle.webhookSecret
}
