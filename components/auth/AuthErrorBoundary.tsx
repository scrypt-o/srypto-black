'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError } from '@/lib/api-error'

interface AuthErrorBoundaryProps {
  error: Error | ApiError | null | undefined
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that handles authentication errors consistently
 * Shows appropriate messages and redirects when needed
 */
export default function AuthErrorBoundary({ 
  error, 
  children, 
  fallback 
}: AuthErrorBoundaryProps) {
  const router = useRouter()

  useEffect(() => {
    if (!error) return

    // Handle authentication errors
    if (error instanceof ApiError && error.isAuthError()) {
      // Show message for 2 seconds then redirect
      const timer = setTimeout(() => {
        router.push('/login')
      }, 2000)

      return () => clearTimeout(timer)
    }
    
    // For non-auth errors, no cleanup needed
    return undefined
  }, [error, router])

  // If there's an auth error, show a special message
  if (error instanceof ApiError && error.isAuthError()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Session Expired
          </h3>
          <p className="text-yellow-700 mb-4">
            {error.getUserMessage()}
          </p>
          <p className="text-sm text-yellow-600">
            Redirecting to login page...
          </p>
        </div>
      </div>
    )
  }

  // If there's a permission error, show that
  if (error instanceof ApiError && error.isPermissionError()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Access Denied
          </h3>
          <p className="text-red-700">
            {error.getUserMessage()}
          </p>
        </div>
      </div>
    )
  }

  // For other errors, show the fallback or render children
  if (error && fallback) {
    return <>{fallback}</>
  }

  return <>{children}</>
}