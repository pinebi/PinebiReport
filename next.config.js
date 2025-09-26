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
}

module.exports = nextConfig
