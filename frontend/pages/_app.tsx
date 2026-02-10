import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0d1117',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(13, 25, 41, 0.1), 0 4px 6px -2px rgba(13, 25, 41, 0.05)',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#16a34a',
              secondary: '#ffffff',
            },
            style: {
              background: '#f0fdf4',
              color: '#052e16',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
            style: {
              background: '#fef2f2',
              color: '#450a0a',
              border: '1px solid #fecaca',
            },
          },
          loading: {
            style: {
              background: '#f0f4f8',
              color: '#0d1929',
              border: '1px solid #c7d2e4',
            },
          },
        }}
        containerStyle={{
          top: '20px',
          right: '20px',
        }}
      />
    </AuthProvider>
  )
}
