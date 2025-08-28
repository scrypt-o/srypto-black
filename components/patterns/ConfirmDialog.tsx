'use client'

import * as React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import clsx from 'clsx'

export type ConfirmDialogProps = {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const btn = ref.current?.querySelector<HTMLButtonElement>('[data-autofocus]')
    btn?.focus()
    return () => prev?.focus()
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  return (
    <>
      {open && (
        <div
          aria-hidden={!open}
          className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !busy && onCancel()}
          />
          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            ref={ref}
            className={clsx(
              'relative w-[92vw] max-w-md rounded-2xl border p-5',
              'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10',
              'shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]',
              'animate-scaleIn'
            )}
          >
            <button
              aria-label="Close"
              onClick={() => !busy && onCancel()}
              className="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              {variant === 'danger' && (
                <div className="mt-0.5 rounded-lg bg-rose-100 p-2 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              <div>
                <h2 id="confirm-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
                {message && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{message}</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 dark:text-gray-200"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                data-autofocus
                disabled={busy}
                onClick={onConfirm}
                className={clsx(
                  'rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2',
                  variant === 'danger'
                    ? 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                )}
              >
                {busy ? 'Working…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}