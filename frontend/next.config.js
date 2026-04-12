/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.paddle.com",
      !isProd && "'unsafe-eval'"
    ].filter(Boolean).join(' ');

    const connectSrc = [
      "'self'",
      "https://lawcaseai-api.onrender.com",
      "https://api.paddle.com",
      "https://sandbox-api.paddle.com",
      "https://sandbox-cdn.paddle.com",
      "https://cdn.paddle.com",
      !isProd && "http://localhost:5000",
      !isProd && "http://127.0.0.1:5000"
    ].filter(Boolean).join(' ');

    const cspHeader = `
      default-src 'self';
      script-src ${scriptSrc};
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://sandbox-cdn.paddle.com https://cdn.paddle.com;
      img-src 'self' data: https: https://sandbox-cdn.paddle.com https://cdn.paddle.com;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src ${connectSrc};
      frame-src 'self' https://checkout.paddle.com https://sandbox-checkout.paddle.com https://sandbox-buy.paddle.com https://buy.paddle.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          }
        ]
      }
    ]
  },
};

module.exports = nextConfig;
