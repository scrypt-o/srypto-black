'use client'

import * as React from 'react'
import { Sun, Moon } from 'lucide-react'
import clsx from 'clsx'

export type ThemeToggleProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const [isDark, setIsDark] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // Check stored theme preference on mount (default to light theme)
  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme')
    
    // Only use dark mode if explicitly stored as 'dark'
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
      document.cookie = 'theme=dark; path=/; max-age=31536000'
    } else {
      // Default to light theme (ignore system preference)
      setIsDark(false)
      document.documentElement.classList.remove('dark')
      // Set light theme as default if no preference stored
      if (!stored) {
        localStorage.setItem('theme', 'light')
      }
      document.cookie = 'theme=light; path=/; max-age=31536000'
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      document.cookie = 'theme=dark; path=/; max-age=31536000'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      document.cookie = 'theme=light; path=/; max-age=31536000'
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 dark:border-white/10 dark:bg-gray-900 dark:text-gray-400',
          size === 'sm' && 'h-8 w-8',
          size === 'md' && 'h-10 w-10', 
          size === 'lg' && 'h-12 w-12',
          className
        )}
        disabled
      >
        <Sun className={clsx(
          size === 'sm' && 'h-4 w-4',
          size === 'md' && 'h-5 w-5',
          size === 'lg' && 'h-6 w-6'
        )} />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5',
        size === 'sm' && 'h-8 w-8',
        size === 'md' && 'h-10 w-10',
        size === 'lg' && 'h-12 w-12',
        className
      )}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className={clsx(
          size === 'sm' && 'h-4 w-4',
          size === 'md' && 'h-5 w-5', 
          size === 'lg' && 'h-6 w-6'
        )} />
      ) : (
        <Moon className={clsx(
          size === 'sm' && 'h-4 w-4',
          size === 'md' && 'h-5 w-5',
          size === 'lg' && 'h-6 w-6'
        )} />
      )}
    </button>
  )
}
