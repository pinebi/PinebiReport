/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor
  output: 'export',
  
  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for better compatibility
  trailingSlash: true,
  
  // Basic performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Disable unnecessary features
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Base path için environment variable desteği
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
}

module.exports = nextConfig

