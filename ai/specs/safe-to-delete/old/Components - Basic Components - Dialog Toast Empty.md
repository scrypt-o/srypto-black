
# 1) Dialog / Confirm Pattern

**Summary**  
A small, accessible modal used for confirmations (delete/restore) and short decisions. Keyboard- and screen-reader friendly, with a “danger” variant and backdrop click/ESC to cancel.

**Rationale for pattern**  
Consistent destructive flows reduce errors. One API keeps copy/paste predictable for AIs and humans.

**Details**

- Focus: auto-focuses the Confirm button, ESC/backdrop → `onCancel`.
    
- A11y: `role="dialog"`, `aria-modal="true"`, labelled by title.
    
- Variants: `default | danger`.
    
- Keeps no internal state beyond focus; you control `open`.
    

**Code**

```tsx
// components/patterns/ConfirmDialog.tsx
'use client'

import * as React from 'react'
import { m, AnimatePresence } from 'framer-motion'
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
    <AnimatePresence>
      {open && (
        <m.div
          aria-hidden={!open}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !busy && onCancel()}
          />
          {/* Dialog */}
          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            ref={ref}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={clsx(
              'relative w-[92vw] max-w-md rounded-2xl border p-5',
              'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10',
              'shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]'
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
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
```

**Example usage**

```tsx
const [open, setOpen] = useState(false)
<ConfirmDialog
  open={open}
  title="Delete allergy?"
  message="This will move the record to the recycle bin."
  variant="danger"
  onCancel={() => setOpen(false)}
  onConfirm={() => deleteMutation.mutate(id, { onSuccess: () => setOpen(false) })}
/>
```

---

# 2) Toast / Inline Feedback Pattern

**Summary**  
A context + hook that lets you show success/error/info toasts from anywhere. Modern motion, dark-mode ready, dismissible, and auto-hides.

**Rationale for pattern**  
Centralizing feedback prevents ad-hoc alerts. A tiny API is easy for AIs to call after mutations.

**Details**

- Provider renders a stack in the corner.
    
- `useToast().push({ type, title?, message, duration? })` returns the id.
    
- Types: `success | error | info`.
    
- ESC or click X to dismiss.
    

**Code**

```tsx
// components/patterns/Toast.tsx
'use client'

import * as React from 'react'
import { m, AnimatePresence } from 'framer-motion'
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
          <AnimatePresence>
            {items.map((t) => (
              <m.li
                key={t.id}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className={clsx(
                  'pointer-events-auto overflow-hidden rounded-xl border p-3 shadow-lg',
                  'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10'
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
                    className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
```

**Example usage**

```tsx
// app/layout.tsx
import { ToastProvider } from '@/components/patterns/Toast'
<body><ToastProvider>{children}</ToastProvider></body>

// in a component after a mutation:
const { push } = useToast()
create.mutate(payload, {
  onSuccess: () => push({ type: 'success', title: 'Saved', message: 'Allergy created.' }),
  onError: (e) => push({ type: 'error', title: 'Error', message: e.message ?? 'Failed to save.' }),
})
```

---

# 3) Empty / Error / Loading States Pattern

**Summary**  
Three tiny components to standardize “nothing here,” “something went wrong,” and “still loading” UIs across ListView/DetailView.

**Rationale for pattern**  
Clarity and consistency reduce support load; it also simplifies ListView/DetailView props.

**Details**

- `EmptyState`: icon, title, description, optional CTA.
    
- `ErrorState`: message, optional retry.
    
- `SkeletonTable`: lightweight rows/cols shimmer for lists.
    

**Code**

```tsx
// components/patterns/States.tsx
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
```

**Example usage**

```tsx
// In ListView when no data:
<EmptyState
  description="Start by adding your first allergy."
  actionLabel="Add allergy"
  onAction={() => router.push('/patient/medhist/allergies/new')}
/>

// Error:
<ErrorState message={error.message} onRetry={() => refetch()} />

// Loading:
<SkeletonTable rows={8} cols={4} />
```

---

## Install (if you haven’t already)

```bash
npm i framer-motion lucide-react clsx
```

Want me to wire these into your existing `ListViewLayout`/`DetailViewLayout` examples so they show up automatically (e.g., `errorState`/`emptyState` defaults + toast on mutation success/failure)?