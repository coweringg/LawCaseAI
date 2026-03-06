import { initializePaddle, Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | undefined;

export async function getPaddleInstance() {
  if (paddleInstance) {
    return paddleInstance;
  }

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    console.warn('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is missing. Paddle billing forms will not load.');
    return undefined;
  }

  try {
    paddleInstance = await initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
      token: token,
      eventCallback: function(data) {
      }
    });

    return paddleInstance;
  } catch (error) {
    console.error('Paddle initialization failed', error);
    return undefined;
  }
}
