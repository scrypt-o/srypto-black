'use client'

import { useEffect } from 'react'

export default function ThemeBootstrapper() {
  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|; )theme=([^;]+)/)
      const cookieTheme = match ? decodeURIComponent(match[1] || '') : null
      const lsTheme = localStorage.getItem('theme')
      const theme = (cookieTheme || lsTheme || 'light').toString()
      if (theme !== lsTheme) localStorage.setItem('theme', theme)
      document.cookie = `theme=${theme}; path=/; max-age=31536000`
      if (theme === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch {}
  }, [])
  return null
}
