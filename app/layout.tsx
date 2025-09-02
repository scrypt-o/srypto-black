import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/patterns/Toast'
import QueryProvider from '@/components/providers/QueryProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import ThemeBootstrapper from '@/components/patterns/ThemeBootstrapper'

export const metadata: Metadata = {
  title: 'Scrypto Medical Portal',
  description: 'Medical portal application',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value
  const isDark = themeCookie === 'dark'
  // Read single canonical per-request nonce header (forwarded by middleware)
  const hdrs = await headers()
  // Sanitize nonce: only use non-empty strings; otherwise omit the attribute
  const rawNonce = hdrs.get('x-nonce') || undefined
  const nonce = typeof rawNonce === 'string' && rawNonce.trim().length > 0 ? rawNonce : undefined
  return (
    <html lang="en" suppressHydrationWarning className={isDark ? 'dark' : undefined}>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.className} h-screen overflow-hidden antialiased text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950`}>
        <ErrorBoundary>
          <QueryProvider>
            <ToastProvider>
              <ThemeBootstrapper />
              {children}
            </ToastProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
