**Summary**  
A reusable, **props-based DetailViewLayout** for create/edit/view pages. It wraps your form with a consistent header, error summary, responsive content area, and a **sticky action bar** (Save/Cancel/Delete) that submits a target form by `formId`. It's modern (glass/elevated/flat styles), dark-mode ready, accessible, with smooth CSS transitions, and optimized for mobile (big buttons, sticky actions).

**Rationale for pattern**

- **Predictable save flow** in medical contexts: one way to handle `loading`, `errors[]`, and form submission.
    
- **AI-friendly**: simple, explicit props; no magic state inside the layout.
    
- **Mobile first**: sticky actions ensure Save/Cancel are always reachable.
    
- **A11y & UX**: visible focus, screen-reader friendly error region, keyboard-navigable buttons.
    

---

## Details

### When to use

- Any page that shows a **single record** in a form or read-only view: create patient allergy, edit profile, view prescription, etc.
    

### Contract (important)

- You own the form (React Hook Form, Zod, etc.).
    
- Layout gets a **`formId`** and provides **Save/Cancel buttons** that submit or call your handlers.
    
- Use **`loading`** to disable buttons and show progress.
    
- Provide **`errors: { field, message }[]`** for an error summary (API or global form errors).
    

### Props (canonical)

```ts
type ErrorItem = { field: string; message: string }
type Breadcrumb = { label: string; href: string }

type Section = {
  id: string
  title?: string
  description?: string
  content: React.ReactNode
}

type DetailViewLayoutProps = {
  // Header
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]

  // Mode & target form
  mode: 'create' | 'edit' | 'view'
  formId: string  // must match <form id="...">

  // State
  loading?: boolean
  errors?: ErrorItem[]

  // Content
  sections?: Section[]      // optional helper
  children?: React.ReactNode // alternative to sections

  // Actions
  stickyActions?: boolean          // default true
  primaryActionLabel?: string      // default depends on mode
  secondaryActionLabel?: string    // default 'Cancel'
  showDelete?: boolean
  deleteLabel?: string             // default 'Delete'

  // Handlers
  onBack?: () => void
  onCancel?: () => void
  onDelete?: () => void
  onSaveClick?: () => void         // optional override; otherwise submits formId

  // Visuals
  style?: 'flat' | 'elevated' | 'glass' // default 'flat'
  transitions?: 'none' | 'smooth'       // default 'smooth'
}
```

### Save-flow guardrails (how to use it)

- Use **TanStack Query `mutate` with callbacks** (not `mutateAsync`).
    
- Clear previous errors before save, set `loading` via your mutation state.
    
- On success: navigate; on error: push `{ field:'api', message: err }` into `errors`.
    

---

## Code (drop-in, props-based)

```tsx
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
  transitions?: 'none' | 'smooth'
}

/** ---------- Styles ---------- */
const shellStyles = {
  flat: 'border rounded-xl bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.02)] dark:bg-gray-900 dark:border-white/10',
  elevated: 'border rounded-xl bg-white shadow-md dark:bg-gray-900 dark:border-white/10',
  glass: 'border rounded-xl bg-white/80 backdrop-blur shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:bg-gray-900/60 dark:border-white/10',
} as const

const actionBarBase =
  'flex items-center justify-end gap-2 border-t bg-white/80 p-3 backdrop-blur dark:bg-gray-900/70 dark:border-white/10'

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
    transitions = 'smooth',
  } = props

  // CSS class for transitions
  const transitionClass = transitions === 'smooth' 
    ? 'transition-all duration-200 ease-out hover:-translate-y-0.5'
    : ''
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

      {/* Header */}
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white
                         hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                         dark:bg-gray-900 dark:border-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
            {subtitle && <p className="mt-1 text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        {/* Header actions (optional spot for future) */}
      </header>

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
        className={clsx('overflow-hidden', shellStyles[style], transitionClass)}
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
            stickyActions ? 'sticky bottom-0' : '',
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
            disabled={loading || mode === 'view'}
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
```

---

### Example usage (safe save flow)

```tsx
// page.tsx (Create Allergy)
'use client'
import DetailViewLayout from '@/components/layouts/DetailViewLayout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCreateAllergy } from '@/hooks/useAllergies' // your TanStack mutation
import { useState } from 'react'
import { allergyFormSchema, type AllergyForm } from '@/schemas/allergy'

export default function NewAllergyPage() {
  const router = useRouter()
  const create = useCreateAllergy()
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<AllergyForm>({ resolver: zodResolver(allergyFormSchema), mode: 'onChange' })
  const { handleSubmit, register } = form

  const onSubmit = (raw: AllergyForm) => {
    setApiError(null)
    // normalize empties → undefined, etc.
    const payload = {
      ...raw,
      reaction: raw.reaction || undefined,
      notes: raw.notes || undefined,
    }
    create.mutate(payload, {
      onSuccess: () => router.push('/patient/medhist/allergies'),
      onError: (e) => setApiError(e instanceof Error ? e.message : 'Failed to save'),
    })
  }

  const sections = [
    {
      id: 'main',
      title: 'Allergy Details',
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Allergen</span>
            <input {...register('allergen')} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Severity</span>
            <select {...register('severity')} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10">
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Reaction</span>
            <input {...register('reaction')} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Notes</span>
            <textarea {...register('notes')} rows={3} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
        </div>
      ),
    },
  ]

  return (
    <>
      <DetailViewLayout
        title="Add New Allergy"
        subtitle="Capture a new allergy record"
        mode="create"
        formId="new-allergy-form"
        loading={create.isPending}
        errors={apiError ? [{ field: 'api', message: apiError }] : undefined}
        sections={sections}
        stickyActions
        onBack={() => router.push('/patient/medhist/allergies')}
        onCancel={() => {
          if (confirm('Discard changes?')) router.push('/patient/medhist/allergies')
        }}
        style="glass"       // 'flat' | 'elevated' | 'glass'
        transitions="smooth" // 'none' | 'smooth'
      />

      {/* Your form (must match formId) */}
      <form id="new-allergy-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
    </>
  )
}
```

**Notes**

- The Save button submits by `formId` (no prop drilling into the form).
    
- Keep `stickyActions` on for mobile; it anchors actions to the bottom.
    
- Pass `errors` for API/global problems. Field-level errors still show near inputs (handled by your form).
    
- Want inline form instead of sections? Omit `sections` and pass your form as `children` inside the layout.