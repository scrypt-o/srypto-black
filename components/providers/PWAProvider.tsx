'use client'

import { useEffect } from 'react'

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Simple service worker registration for MVP
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('PWA Service Worker registered')
        })
        .catch((error) => {
          console.log('PWA Service Worker registration failed:', error)
        })
    }
  }, [])

  return <>{children}</>
}