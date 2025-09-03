/** @type {import('next').NextConfig} */
const nextConfig = {
  // Properly disable the Next.js dev indicator (bottom left icon)
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right'
  },
  
  // TypeScript check behavior during builds
  // By default, fail the build on TS errors. Set IGNORE_TS_ERRORS=true to bypass locally.
  typescript: {
    ignoreBuildErrors: process.env.IGNORE_TS_ERRORS === 'true'
  },

  // ESLint behavior during builds
  // By default, run ESLint and fail on errors. Set IGNORE_ESLINT=true to bypass locally.
  eslint: {
    ignoreDuringBuilds: process.env.IGNORE_ESLINT === 'true'
  },
  
  // Image configuration for Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**'
      }
    ]
  },
  
  // Headers for service workers only (security headers are set in middleware.ts to avoid touching _next/static)
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
