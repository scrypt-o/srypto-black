
```tsx
// app/patient/medhist/allergies/[allergy_id]/page.tsx
'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import DetailViewLayout from '@/components/layouts/DetailViewLayout'
import ConfirmDialog from '@/components/patterns/ConfirmDialog'
import { useToast } from '@/components/patterns/Toast'
import { useAllergyById, useUpdateAllergy, useDeleteAllergy } from '@/hooks/useAllergies'

type Severity = 'mild' | 'moderate' | 'severe'

export default function AllergyDetailPage() {
  const router = useRouter()
  const params = useParams<{ allergy_id: string }>()
  const allergyId = params.allergy_id

  const { push } = useToast()
  const { data, isLoading, error, refetch } = useAllergyById(allergyId)
  const update = useUpdateAllergy()
  const del = useDeleteAllergy()

  const [apiError, setApiError] = React.useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const isDeleted = !!data?.deleted_at

  // Save handler (submits via DetailViewLayout -> formId)
  const onSubmit = async (formData: FormData) => {
    setApiError(null)
    const payload = {
      allergy_id: allergyId,
      allergen: (formData.get('allergen') as string) || undefined,
      severity: (formData.get('severity') as Severity) || undefined,
      reaction: ((formData.get('reaction') as string) || '').trim() || null,
      notes: ((formData.get('notes') as string) || '').trim() || null,
    }
    update.mutate(payload, {
      onSuccess: () => {
        push({ type: 'success', title: 'Saved', message: 'Changes have been updated.' })
        refetch()
      },
      onError: (e) => setApiError(e instanceof Error ? e.message : 'Failed to save'),
    })
  }

  // Soft-restore (clear deleted_at)
  const onRestore = () => {
    if (!data) return
    update.mutate(
      { allergy_id: allergyId, deleted_at: null },
      {
        onSuccess: () => {
          push({ type: 'success', title: 'Restored', message: 'Record has been restored.' })
          refetch()
        },
        onError: (e) => push({ type: 'error', title: 'Restore failed', message: e instanceof Error ? e.message : 'Unknown error' }),
      }
    )
  }

  // Delete (soft delete via API DELETE)
  const onConfirmDelete = () => {
    del.mutate(allergyId, {
      onSuccess: () => {
        setConfirmDelete(false)
        push({ type: 'success', title: 'Deleted', message: 'Record moved to recycle bin.' })
        router.push('/patient/medhist/allergies')
      },
      onError: (e) => {
        setConfirmDelete(false)
        push({ type: 'error', title: 'Delete failed', message: e instanceof Error ? e.message : 'Unknown error' })
      },
    })
  }

  const errors =
    apiError || error
      ? [{ field: 'api', message: (apiError ?? (error as Error)?.message) as string }]
      : undefined

  return (
    <>
      <DetailViewLayout
        title="Edit Allergy"
        subtitle={data?.allergen ? `Editing: ${data.allergen}` : undefined}
        mode="edit"
        formId="edit-allergy-form"
        loading={update.isPending}   // keep overlay for saves; let fetch show fields once loaded
        errors={errors}
        stickyActions
        showDelete
        deleteLabel="Delete"
        onDelete={() => setConfirmDelete(true)}
        onBack={() => router.push('/patient/medhist/allergies')}
        onCancel={() => {
          if (confirm('Discard changes and go back?')) router.push('/patient/medhist/allergies')
        }}
        style="glass"
        motion="subtle"
      >
        {/* Inline banner for soft-deleted records */}
        {isDeleted && (
          <div className="mx-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-100">
            This record is deleted. You can restore it to make changes or use it in the app.
            <button
              type="button"
              onClick={onRestore}
              className="ml-3 inline-flex rounded-md bg-amber-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Restore
            </button>
          </div>
        )}

        {/* The form content */}
        <form
          id="edit-allergy-form"
          action={(fd: FormData) => onSubmit(fd)}
          className="grid gap-4 p-6 sm:grid-cols-2"
        >
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Allergen</span>
            <input
              name="allergen"
              defaultValue={data?.allergen ?? ''}
              className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Severity</span>
            <select
              name="severity"
              defaultValue={data?.severity ?? 'mild'}
              className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Reaction</span>
            <input
              name="reaction"
              defaultValue={data?.reaction ?? ''}
              className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10"
              placeholder="e.g., hives, nausea"
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Notes</span>
            <textarea
              name="notes"
              defaultValue={data?.notes ?? ''}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10"
              placeholder="Optional details…"
            />
          </label>
        </form>
      </DetailViewLayout>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this allergy?"
        message="This moves the record to the recycle bin."
        variant="danger"
        busy={del.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={onConfirmDelete}
        confirmLabel="Delete"
      />
    </>
  )
}
```

### Why this matches the standard

- **Props-based layout** with `formId`, `loading`, `errors[]`, sticky action bar.
    
- **TanStack** mutations use `.mutate(..., { onSuccess, onError })` (no `mutateAsync`).
    
- **Soft delete/restore** pattern (`deleted_at` check, restore via update).
    
- **Consistent keys** (`allergen`, `severity`, `reaction`, `notes`) across DB/API/Zod/hooks/page.
    
- **Toasts + confirm dialog** for clear feedback and safe destructive actions.
    

Want the **new page** (`/patient/medhist/allergies/new`) in the same style, or a **read-only view mode** variant with a compact info layout?