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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.paddle.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://sandbox-cdn.paddle.com https://cdn.paddle.com; img-src 'self' data: https: https://sandbox-cdn.paddle.com https://cdn.paddle.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:5000 http://127.0.0.1:5000 https://lawcaseai-api.onrender.com https://api.paddle.com https://sandbox-api.paddle.com https://sandbox-cdn.paddle.com https://cdn.paddle.com; frame-src 'self' https://checkout.paddle.com https://sandbox-checkout.paddle.com https://sandbox-buy.paddle.com https://buy.paddle.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
          }
        ]
      }
    ]
  },
};

module.exports = nextConfig;
