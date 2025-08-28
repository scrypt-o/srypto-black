/**
 * Custom error class that preserves HTTP status codes
 * This allows the UI to handle different error types appropriately
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401
  }

  /**
   * Check if this is a permission error
   */
  isPermissionError(): boolean {
    return this.status === 403
  }

  /**
   * Get user-friendly error message based on status
   */
  getUserMessage(): string {
    switch (this.status) {
      case 401:
        return 'Your session has expired. Please log in again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 422:
        return 'Please check your input and try again.'
      case 500:
        return 'A server error occurred. Please try again later.'
      case 503:
        return 'The service is temporarily unavailable. Please try again later.'
      default:
        return this.message || 'An unexpected error occurred.'
    }
  }

  /**
   * Create ApiError from fetch response
   */
  static async fromResponse(response: Response): Promise<ApiError> {
    let message = `Request failed with status ${response.status}`
    let code: string | undefined

    try {
      const errorData = await response.json()
      message = errorData.error || errorData.message || message
      code = errorData.code
    } catch {
      // If response isn't JSON, use status text
      message = response.statusText || message
    }

    return new ApiError(message, response.status, code)
  }
}

/**
 * Handle API errors consistently across the app
 */
export function handleApiError(error: unknown, router?: any): {
  message: string
  shouldRedirect: boolean
  redirectPath?: string
} {
  // If it's our custom ApiError
  if (error instanceof ApiError) {
    if (error.isAuthError()) {
      // For auth errors, we should redirect to login
      if (router) {
        setTimeout(() => {
          router.push('/login')
        }, 2000) // Give user time to read the message
      }
      return {
        message: error.getUserMessage(),
        shouldRedirect: true,
        redirectPath: '/login'
      }
    }

    return {
      message: error.getUserMessage(),
      shouldRedirect: false
    }
  }

  // For other errors
  if (error instanceof Error) {
    return {
      message: error.message,
      shouldRedirect: false
    }
  }

  return {
    message: 'An unexpected error occurred',
    shouldRedirect: false
  }
}