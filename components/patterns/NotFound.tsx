'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface NotFoundProps {
  title?: string
  message?: string
  backUrl?: string
  backLabel?: string
}

export default function NotFound({
  title = 'Record Not Found',
  message = 'The requested record could not be found or may have been deleted.',
  backUrl,
  backLabel = 'Go Back'
}: NotFoundProps) {
  const router = useRouter()
  
  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </button>
      </div>
    </div>
  )
}