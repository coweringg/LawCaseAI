import { Paddle } from '@paddle/paddle-js';

declare global {
  interface Window {
    Paddle?: Paddle;
  }
}

let isInitializing = false;

export async function getPaddleInstance(): Promise<Paddle | undefined> {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    return undefined;
  }

  if (typeof window === 'undefined') {
    return undefined;
  }

  let retries = 0;
  while (!window.Paddle && retries < 20) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    retries++;
  }

  const paddleAPI = window.Paddle;
  if (paddleAPI) {
    if (!paddleAPI.Initialized && !isInitializing) {
      isInitializing = true;
      try {
        if (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox') {
          paddleAPI.Environment.set('sandbox');
        }
        paddleAPI.Initialize({
          token
        });
      } catch (error) {
        console.error('Paddle initialization failed', error);
      } finally {
        isInitializing = false;
      }
    }
    return paddleAPI;
  }

  return undefined;
}
