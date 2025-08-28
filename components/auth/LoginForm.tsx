'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LoginFormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const dataRaw: unknown = await response.json()
      if (!response.ok) {
        const msg = (typeof dataRaw === 'object' && dataRaw && typeof (dataRaw as any).error === 'string')
          ? (dataRaw as any).error
          : 'Login failed'
        setErrors({ general: msg })
        return
      }

      // Redirect to home page
      window.location.href = '/'

    } catch {
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <>
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Image
          src="/logo.png"
          alt="Scrypto Logo"
          width={80}
          height={80}
          priority
          className="rounded-lg"
          style={{ width: 'auto', height: '80px' }}
        />
      </div>

      {/* Social Login Buttons (Placeholder) */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
            <path d="M17.5645 12.4234C17.5488 10.5132 18.3166 9.16291 19.8771 8.16169C18.9801 6.85244 17.5957 6.12683 15.7838 6.02344C14.0645 5.92005 12.1934 7.00244 11.5605 7.00244C10.8848 7.00244 9.20117 6.06291 7.88477 6.06291C5.33789 6.10244 2.625 8.10488 2.625 12.1855C2.625 13.4541 2.84766 14.7642 3.29297 16.1152C3.89062 17.9062 6.11719 22.0371 8.44336 21.9746C9.60938 21.9434 10.4297 21.1152 11.9473 21.1152C13.418 21.1152 14.1777 21.9746 15.5059 21.9746C17.8535 21.9336 19.8555 18.1777 20.4141 16.3867C17.3789 14.9531 17.5645 12.5059 17.5645 12.4234ZM14.8438 4.42969C16.1016 2.91407 16.0078 1.5 15.9766 1C14.8125 1.0625 13.4492 1.76953 12.6504 2.67188C11.7637 3.64062 11.2969 4.82812 11.3906 6.01562C12.6387 6.10156 13.8164 5.63281 14.8438 4.42969Z" fill="black"/>
          </svg>
          Continue with Apple
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Continue with Facebook
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="email@example.com"
            required
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
              errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Continue'}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 text-center space-y-2">
        <div>
          <Link 
            href="/reset-password" 
            className="text-emerald-600 hover:text-emerald-500 text-sm font-medium"
          >
            Forgot your password?
          </Link>
        </div>
        <div>
          <Link 
            href="/signup" 
            className="text-emerald-600 hover:text-emerald-500 text-sm font-medium"
          >
            Don&apos;t have an account? Sign up here
          </Link>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By signing up, you are creating a Scrypto account, and you agree to Scrypto&apos;s{' '}
          <span className="text-emerald-600 hover:text-emerald-500 cursor-pointer">Terms</span> and{' '}
          <span className="text-emerald-600 hover:text-emerald-500 cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </>
  )
}
