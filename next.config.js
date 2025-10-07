/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Disable unnecessary features for dev
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Minimal experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // PWA Headers
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ]
  },
}

module.exports = nextConfig
