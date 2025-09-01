import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/patterns/Toast'
import QueryProvider from '@/components/providers/QueryProvider'
import ErrorBoundary from '@/components/ErrorBoundary'

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
  // Prefer Next's standard x-nonce (used by internals); fallback to legacy header
  const hdrs = await headers()
  const nonce = hdrs.get('x-nonce') || hdrs.get('x-csp-nonce') || undefined
  return (
    <html lang="en" suppressHydrationWarning className={isDark ? 'dark' : undefined}>
      <head>
        <meta name="color-scheme" content="light dark" />
        {/* Apply persisted theme before hydration to avoid FOUC */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `!function(){try{
  var cookieThemeMatch = document.cookie.match(/(?:^|; )theme=([^;]+)/);
  var cookieTheme = cookieThemeMatch ? decodeURIComponent(cookieThemeMatch[1]) : null;
  var lsTheme = localStorage.getItem('theme');
  // Prefer cookie (server-rendered truth) to avoid SSR/CSR mismatch
  var theme = cookieTheme || lsTheme || 'light';
  if (theme !== lsTheme) localStorage.setItem('theme', theme);
  document.cookie = 'theme=' + theme + '; path=/; max-age=31536000';
  if (theme === 'dark') { document.documentElement.classList.add('dark'); }
  else { document.documentElement.classList.remove('dark'); }
}catch(e){}}();`,
          }}
        />
      </head>
      <body className={`${inter.className} h-screen overflow-hidden antialiased text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950`}>
        <ErrorBoundary>
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
