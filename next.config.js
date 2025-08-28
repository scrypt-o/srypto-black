/** @type {import('next').NextConfig} */
const nextConfig = {
  // Properly disable the Next.js dev indicator (bottom left icon)
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right'
  },
  
  // TypeScript strict mode - fail build on any TypeScript errors
  typescript: {
    ignoreBuildErrors: false
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
