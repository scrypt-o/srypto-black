'use client'

import * as React from 'react'
import clsx from 'clsx'
import { ArrowLeft, Save, X, Trash2 } from 'lucide-react'

/** ---------- Types ---------- */
export type ErrorItem = { field: string; message: string }
export type Breadcrumb = { label: string; href: string }
export type Section = { id: string; title?: string; description?: string; content: React.ReactNode }

export type DetailViewLayoutProps = {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]

  mode: 'create' | 'edit' | 'view'
  formId: string

  loading?: boolean
  errors?: ErrorItem[]

  sections?: Section[]
  children?: React.ReactNode

  stickyActions?: boolean
  primaryActionLabel?: string
  secondaryActionLabel?: string
  showDelete?: boolean
  deleteLabel?: string

  onBack?: () => void
  onCancel?: () => void
  onDelete?: () => void
  onSaveClick?: () => void

  style?: 'flat' | 'elevated' | 'glass'
  // motion prop removed - using CSS transitions
}

/** ---------- Styles ---------- */
const shellStyles = {
  flat: 'border rounded-xl bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.02)] dark:bg-gray-900 dark:border-white/10',
  elevated: 'border rounded-xl bg-white shadow-md dark:bg-gray-900 dark:border-white/10',
  glass: 'border rounded-xl bg-white/80 backdrop-blur shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:bg-gray-900/60 dark:border-white/10',
} as const

const actionBarBase =
  'flex items-center justify-end gap-2 border-t bg-white/80 p-3 backdrop-blur dark:bg-gray-900/70 dark:border-white/10 z-20'

/** ---------- Component ---------- */
export default function DetailViewLayout(props: DetailViewLayoutProps) {
  const {
    title, subtitle, breadcrumbs,
    mode, formId,
    loading = false, errors = [],
    sections, children,
    stickyActions = true,
    primaryActionLabel,
    secondaryActionLabel = 'Cancel',
    showDelete = false,
    deleteLabel = 'Delete',
    onBack, onCancel, onDelete, onSaveClick,
    style = 'flat',
    // motion prop removed
  } = props

  // Simple div with CSS transitions for hover effects
  const primaryLabel =
    primaryActionLabel ?? (mode === 'create' ? 'Create' : mode === 'edit' ? 'Save Changes' : 'Save')

  const submitForm = () => {
    if (onSaveClick) return onSaveClick()
    // Submit the external form by id
    const form = document.getElementById(formId) as HTMLFormElement | null
    if (form) form.requestSubmit()
  }

  return (
    <section className="w-full">
      {/* Breadcrumbs */}
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          <ol className="flex flex-wrap items-center gap-2">
            {breadcrumbs.map((b, i) => (
              <li key={`${b.href}-${i}`} className="inline-flex items-center">
                <a href={b.href} className="hover:underline">{b.label}</a>
                {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {/* Title and actions - simplified layout */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && <p className="mt-1 text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {mode === 'view' && (
            <>
              {showDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-rose-900/20 dark:border-rose-800/60 dark:text-rose-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onSaveClick}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white/90 px-3 py-1.5 text-sm font-medium text-blue-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 dark:text-blue-200"
              >
                Edit
              </button>
            </>
          )}
          {mode !== 'view' && (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitForm}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error summary */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800
                     dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          <ul className="list-disc pl-5">
            {errors.map((e, i) => (
              <li key={`${e.field}-${i}`}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Shell + Content */}
      <div
        className={clsx(
          'overflow-hidden transition-transform duration-150 hover:-translate-y-px',
          shellStyles[style]
        )}
      >
        <div className="grid gap-6 p-6">
          {/* Sections helper OR custom children */}
          {sections
            ? sections.map((s) => (
                <section key={s.id} className="space-y-2">
                  {s.title && <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.title}</h2>}
                  {s.description && <p className="text-sm text-gray-500 dark:text-gray-400">{s.description}</p>}
                  <div>{s.content}</div>
                </section>
              ))
            : children}
        </div>

        {/* Action bar */}
        <div
          className={clsx(
            actionBarBase,
            stickyActions ? 'sticky bottom-16 md:bottom-0' : '',
          )}
        >
          {showDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={loading}
              className="mr-auto inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium
                         text-rose-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500
                         disabled:opacity-60 dark:bg-rose-900/20 dark:border-rose-800/60 dark:text-rose-200"
            >
              <Trash2 className="h-4 w-4" />
              {deleteLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium
                       text-gray-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-60 dark:bg-gray-900 dark:border-white/10 dark:text-gray-200"
          >
            <X className="h-4 w-4" />
            {secondaryActionLabel}
          </button>

          <button
            type="button"
            onClick={submitForm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving…' : primaryLabel}
          </button>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div
            aria-live="polite"
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-black/40"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        )}
      </div>
    </section>
  )
}
