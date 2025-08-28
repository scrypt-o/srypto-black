 **ListView page** with  (ListViewLayout + TanStack hooks + Toast + ConfirmDialog + Empty/Error states). 

```tsx
// app/patient/medhist/allergies/page.tsx
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

// Patterns & hooks (from your repo)
import ListViewLayout, { type Column } from '@/components/layouts/ListViewLayout'
import ConfirmDialog from '@/components/patterns/ConfirmDialog'
import { EmptyState, ErrorState, SkeletonTable } from '@/components/patterns/States'
import { useToast } from '@/components/patterns/Toast'
import { useAllergiesList, useDeleteAllergy } from '@/hooks/useAllergies'

// (Optional) types from Zod schema
// import type { Allergy } from '@/schemas/allergy'

type Allergy = {
  allergy_id: string
  allergen: string
  severity: 'mild' | 'moderate' | 'severe'
  reaction?: string | null
  created_at: string
}

export default function AllergiesListPage() {
  const router = useRouter()
  const { push } = useToast()

  // Search & pagination state (server-driven)
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(1)
  const pageSize = 20

  const { data, isLoading, error, refetch } = useAllergiesList({ page, pageSize, search })
  const items: Allergy[] = data?.items ?? []
  const total = data?.total ?? 0

  // Delete flow (confirm + toast)
  const del = useDeleteAllergy()
  const [pendingDelete, setPendingDelete] = React.useState<{ id: string; name?: string } | null>(null)

  const onConfirmDelete = () => {
    if (!pendingDelete) return
    del.mutate(pendingDelete.id, {
      onSuccess: () => {
        setPendingDelete(null)
        push({ type: 'success', title: 'Deleted', message: 'Allergy removed.' })
        // Refetch current page (your hook will invalidate onSuccess too)
        refetch()
      },
      onError: (e) => {
        push({ type: 'error', title: 'Delete failed', message: e instanceof Error ? e.message : 'Unknown error' })
      },
    })
  }

  // Table columns
  const columns: Column<Allergy>[] = [
    { id: 'allergen', header: 'Allergen', sortable: true, sortField: 'allergen' },
    {
      id: 'severity',
      header: 'Severity',
      sortable: true,
      sortField: 'severity',
      accessor: (r) => r.severity.toUpperCase(),
      width: 120,
      align: 'center',
    },
    { id: 'reaction', header: 'Reaction', accessor: (r) => r.reaction ?? '—' },
    {
      id: 'created_at',
      header: 'Created',
      sortable: true,
      sortKey: (r) => new Date(r.created_at).getTime(),
      accessor: (r) => new Date(r.created_at).toLocaleDateString(),
      width: 140,
      align: 'right',
    },
  ]

  return (
    <>
      <ListViewLayout<Allergy>
        title="Allergies"
        description="Manage your known allergies."
        data={items}
        columns={columns}
        getRowId={(r) => r.allergy_id}
        loading={isLoading}
        errors={error ? [{ field: 'api', message: (error as Error).message }] : undefined}
        searchValue={search}
        onSearch={(v) => {
          setSearch(v)
          setPage(1) // reset to first page on new search
        }}
        onAdd={() => router.push('/patient/medhist/allergies/new')}
        onRowClick={(row) => router.push(`/patient/medhist/allergies/${row.allergy_id}`)}
        onEdit={(row) => router.push(`/patient/medhist/allergies/${row.allergy_id}`)}
        onDelete={(row) => setPendingDelete({ id: row.allergy_id, name: row.allergen })}
        // Server pagination controls
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: (p) => setPage(p),
        }}
        // Looks & feel
        style="glass"   // 'flat' | 'elevated' | 'glass'
        motion="subtle" // 'none' | 'subtle'
        // Standard states (optional overrides)
        emptyState={
          <EmptyState
            description="Start by adding your first allergy."
            actionLabel="Add allergy"
            onAction={() => router.push('/patient/medhist/allergies/new')}
          />
        }
        errorState={<ErrorState message={(error as Error)?.message ?? 'Failed to load.'} onRetry={() => refetch()} />}
      />

      {/* Optional: big-page loading skeleton (if you want instead of ListView's own) */}
      {isLoading && items.length === 0 && <div className="mt-4"><SkeletonTable rows={8} cols={4} /></div>}

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete allergy${pendingDelete?.name ? `: ${pendingDelete.name}` : ''}?`}
        message="This moves the record to the recycle bin."
        variant="danger"
        busy={del.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={onConfirmDelete}
        confirmLabel="Delete"
      />
    </>
  )
}
```

**What you get**

- Search with controlled input, server-driven pagination, and stable columns.
    
- Polished visuals (`style="glass"`, `motion="subtle"`), dark-mode ready.
    
- Safe delete flow with confirm dialog + toasts.
    
- Consistent empty/error/loading states.
    

Want me to show the **detail page** this links to (view/edit), or a **server-side pagination API** example that pairs with this list?