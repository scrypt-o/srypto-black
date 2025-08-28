import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/patterns/Toast'

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
  return (
    <html lang="en" suppressHydrationWarning className={isDark ? 'dark' : undefined}>
      <head>
        <meta name="color-scheme" content="light dark" />
        {/* Apply persisted theme before hydration to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');document.cookie='theme=dark; path=/; max-age=31536000';}else{document.documentElement.classList.remove('dark');if(!t){localStorage.setItem('theme','light');document.cookie='theme=light; path=/; max-age=31536000';}}}catch(e){}}();`,
          }}
        />
      </head>
      <body className={`${inter.className} h-screen overflow-hidden antialiased text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
