'use client'

import * as React from 'react'
import { FolderOpen, AlertCircle, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

export function EmptyState({
  icon = <FolderOpen className="h-6 w-6" />,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  className,
}: {
  icon?: React.ReactNode
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div className={clsx('mx-auto max-w-md rounded-2xl border p-6 text-center', 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10', className)}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
  className,
}: {
  message?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={clsx('mx-auto max-w-md rounded-2xl border p-4', 'bg-rose-50/70 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/60', className)}>
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-5 w-5 text-rose-600 dark:text-rose-300" />
        <div className="flex-1">
          <div className="text-sm text-rose-800 dark:text-rose-200">{message}</div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-xs font-medium text-rose-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-900 dark:border-rose-800/60 dark:text-rose-200"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({
  rows = 6,
  cols = 4,
  className,
}: {
  rows?: number
  cols?: number
  className?: string
}) {
  return (
    <div className={clsx('overflow-hidden rounded-xl border', 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10', className)}>
      <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className={clsx(
              'grid gap-4 p-3',
              `grid-cols-${Math.min(Math.max(cols, 1), 6)}`, // simple cap 1..6
              r % 2 ? 'bg-gray-50/70 dark:bg-gray-900/60' : ''
            )}
          >
            {Array.from({ length: cols }).map((__, c) => (
              <div key={c} className="h-4 rounded bg-gray-200 dark:bg-white/10" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}