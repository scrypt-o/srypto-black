'use client'

import * as React from 'react'
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react'
import clsx from 'clsx'

export type ToastType = 'success' | 'error' | 'info'
export type ToastItem = {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number // ms
}

type ToastCtxType = {
  push: (t: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
}

const ToastCtx = React.createContext<ToastCtxType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([])

  const dismiss = React.useCallback((id: string) => {
    setItems((s) => s.filter((t) => t.id !== id))
  }, [])

  const push = React.useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()
    const item: ToastItem = { id, duration: 3500, ...t }
    setItems((s) => [item, ...s])
    if (item.duration && item.duration > 0) {
      setTimeout(() => dismiss(id), item.duration)
    }
    return id
  }, [dismiss])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setItems([])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[120] flex items-end justify-end p-4 sm:p-6">
        <ul className="flex w-full max-w-sm flex-col gap-2">
          {items.map((t) => (
            <li
              key={t.id}
              className={clsx(
                'pointer-events-auto overflow-hidden rounded-xl border p-3 shadow-lg',
                'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10',
                'transform transition-all duration-300 ease-out'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                  {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
                  {t.type === 'info' && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                </div>
                <div className="flex-1">
                  {t.title && <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.title}</div>}
                  <div className="text-sm text-gray-700 dark:text-gray-300">{t.message}</div>
                </div>
                <button
                  aria-label="Dismiss"
                  onClick={() => dismiss(t.id)}
                  className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}