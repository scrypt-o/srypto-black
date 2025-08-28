**Summary**  
A reusable, **props-based ListViewLayout** for modern, accessible data lists and tables. It provides a searchable, sortable, optionally paginated table with a clean toolbar (title, description, search box, "Add" button), responsive design, dark-mode styling, CSS transitions, and consistent error/loading/empty states.

**Rationale for pattern**

- **Clarity for humans & AIs:** explicit props; no hidden magic.
    
- **Consistency:** one list/table layout used everywhere reduces bugs and design drift.
    
- **Medical-grade UX:** visible focus, keyboard navigation, readable density, clear error/empty/loading states.
    
- **Modern feel:** subtle depth, CSS hover transitions, and polished dark mode—without sacrificing performance.
    

---

## Details

### When to use

- Any index/list page showing many records with search and (optionally) sort/edit/delete.
    

### Layout behavior

- Sticky header on desktop, compact on mobile, zebra rows for scanability, hover highlight, keyboard focus rings.
    
- **Search:** controlled via `searchValue` + `onSearch`.
    
- **Sorting:** click column headers marked `sortable: true` (client-side by default).
    
- **Pagination:** optional; pass `pagination` props for server-side, otherwise omit.
    

### Canonical props

- `title`, `description?`
    
- `data: Row[]`, `columns: Column<Row>[]`, `getRowId: (row)=>string`
    
- `loading?`, `errors?: { field: string; message: string }[]`
    
- `searchValue?`, `onSearch?`, `searchPlaceholder?`
    
- `onAdd?`, `onRowClick?`, `onEdit?`, `onDelete?`
    
- `pagination?`: `{ page: number; pageSize: number; total: number; onPageChange: (page:number)=>void }`
    
- `clientSort?` (default `true`), `style?: 'flat' | 'elevated' | 'glass'` (default `'flat'`) - CSS hover effects built-in
    
- `selectable?` + `onSelectionChange?(ids: string[])`
    
- `emptyState?`, `errorState?` (to override defaults)
    

### Column shape

```ts
type Column<Row> = {
  id: string
  header: string | React.ReactNode
  accessor?: (row: Row) => React.ReactNode | string | number
  // Optional helpers for client sorting
  sortable?: boolean
  sortField?: keyof Row
  sortKey?: (row: Row) => string | number
  width?: number | string
  align?: 'left' | 'center' | 'right'
  cell?: (row: Row) => React.ReactNode  // takes precedence over accessor
}
```

---

## Code (drop-in, props-based)

```tsx
'use client'

import * as React from 'react'
import clsx from 'clsx'
import { Plus, Search, Edit3, Trash2 } from 'lucide-react'

/** ---------- Types ---------- */
export type ErrorItem = { field: string; message: string }

export type Column<Row> = {
  id: string
  header: string | React.ReactNode
  accessor?: (row: Row) => React.ReactNode | string | number
  sortable?: boolean
  sortField?: keyof Row
  sortKey?: (row: Row) => string | number
  width?: number | string
  align?: 'left' | 'center' | 'right'
  cell?: (row: Row) => React.ReactNode
}

export type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export type ListViewLayoutProps<Row> = {
  title: string
  description?: string
  data: Row[]
  columns: Column<Row>[]
  getRowId: (row: Row) => string

  loading?: boolean
  errors?: ErrorItem[]

  searchValue?: string
  onSearch?: (value: string) => void
  searchPlaceholder?: string

  onAdd?: () => void
  onRowClick?: (row: Row) => void
  onEdit?: (row: Row) => void
  onDelete?: (row: Row) => void

  pagination?: PaginationProps
  clientSort?: boolean
  selectable?: boolean
  onSelectionChange?: (ids: string[]) => void

  style?: 'flat' | 'elevated' | 'glass'

  emptyState?: React.ReactNode
  errorState?: React.ReactNode
}

/** ---------- Styles ---------- */
const styleBase = {
  flat: 'border rounded-xl bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.02)] dark:bg-gray-900 dark:border-white/10',
  elevated: 'border rounded-xl bg-white shadow-md dark:bg-gray-900 dark:border-white/10',
  glass: 'border rounded-xl bg-white/80 backdrop-blur shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:bg-gray-900/60 dark:border-white/10',
} as const

const thBase =
  'px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 select-none'
const tdBase = 'px-4 py-3 text-sm text-gray-900 dark:text-gray-100'
const zebra = 'odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-900/60'

/** ---------- Component ---------- */
export default function ListViewLayout<Row>(props: ListViewLayoutProps<Row>) {
  const {
    title, description,
    data, columns, getRowId,
    loading, errors,
    searchValue, onSearch, searchPlaceholder,
    onAdd, onRowClick, onEdit, onDelete,
    pagination, clientSort = true,
    selectable = false, onSelectionChange,
    style = 'flat',
    emptyState, errorState,
  } = props

  const [sort, setSort] = React.useState<{ id: string; dir: 'asc' | 'desc' } | null>(null)
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})

  // Selection handling
  const selectedIds = React.useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected])
  React.useEffect(() => {
    if (onSelectionChange) onSelectionChange(selectedIds)
  }, [selectedIds, onSelectionChange])

  // Client-side sorting (optional)
  const sortedData = React.useMemo(() => {
    if (!clientSort || !sort) return data
    const col = columns.find((c) => c.id === sort.id)
    if (!col || !(col.sortable || col.sortField || col.sortKey)) return data
    const dir = sort.dir === 'asc' ? 1 : -1
    const keyFn =
      col.sortKey ||
      (col.sortField
        ? (row: Row) => (row as any)[col.sortField as string]
        : col.accessor
          ? (row: Row) => col.accessor!(row)
          : (row: Row) => (row as any)[col.id])

    // shallow copy to avoid mutating props.data
    return [...data].sort((a, b) => {
      const av = keyFn(a)
      const bv = keyFn(b)
      const as = (typeof av === 'string' ? av : String(av ?? '')).toLowerCase()
      const bs = (typeof bv === 'string' ? bv : String(bv ?? '')).toLowerCase()
      if (as < bs) return -1 * dir
      if (as > bs) return 1 * dir
      return 0
    })
  }, [clientSort, sort, columns, data])

  const rows = sortedData

  return (
    <section className="w-full">
      {/* Header / Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
          {description && <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          {typeof onSearch === 'function' && (
            <label className="relative inline-flex items-center">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchValue ?? ''}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={searchPlaceholder || 'Search...'}
                className="w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
              />
            </label>
          )}

          {/* Add */}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium
                         hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                         dark:bg-gray-900 dark:border-white/10"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors?.length ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          <ul className="list-disc pl-5">
            {errors.map((e, i) => (
              <li key={`${e.field}-${i}`}>{e.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Table wrapper */}
      <div
        className={clsx(
          'overflow-hidden transition-transform duration-150 hover:-translate-y-px',
          styleBase[style]
        )}
      >
        <div className="relative overflow-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur dark:bg-gray-900/80">
              <tr>
                {selectable && (
                  <th className={clsx(thBase, 'w-10')}>
                    <input
                      aria-label="Select all"
                      type="checkbox"
                      className="h-4 w-4 accent-blue-600"
                      checked={rows.length > 0 && rows.every((r) => selected[getRowId(r)])}
                      onChange={(e) => {
                        const next: Record<string, boolean> = {}
                        if (e.target.checked) {
                          rows.forEach((r) => (next[getRowId(r)] = true))
                        }
                        setSelected(next)
                      }}
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const isSorted = sort?.id === col.id
                  const dir = isSorted ? sort!.dir : undefined
                  const align =
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  return (
                    <th
                      key={col.id}
                      scope="col"
                      className={clsx(thBase, align)}
                      style={col.width ? { width: col.width } : undefined}
                    >
                      <button
                        type="button"
                        className={clsx(
                          'inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide',
                          col.sortable ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400',
                          col.sortable && 'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500/60 rounded'
                        )}
                        onClick={() => {
                          if (!col.sortable) return
                          setSort((prev) =>
                            prev && prev.id === col.id
                              ? { id: col.id, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                              : { id: col.id, dir: 'asc' }
                          )
                        }}
                      >
                        {col.header}
                        {col.sortable && (
                          <span aria-hidden className="ml-0.5">
                            {isSorted ? (dir === 'asc' ? '▲' : '▼') : '↕'}
                          </span>
                        )}
                      </button>
                    </th>
                  )
                })}
                {(onEdit || onDelete) && <th className={clsx(thBase, 'text-right')}>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0) + (selectable ? 1 : 0)}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {emptyState ?? 'No records to display.'}
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const id = getRowId(row)
                  return (
                    <tr
                      key={id}
                      className={clsx(
                        zebra,
                        'transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-900/10',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className={clsx(tdBase, 'w-10')}>
                          <input
                            aria-label={`Select row ${id}`}
                            type="checkbox"
                            className="h-4 w-4 accent-blue-600"
                            checked={!!selected[id]}
                            onChange={(e) => {
                              e.stopPropagation()
                              setSelected((prev) => ({ ...prev, [id]: e.target.checked }))
                            }}
                          />
                        </td>
                      )}
                      {columns.map((col) => {
                        const content =
                          col.cell?.(row) ??
                          (col.accessor ? col.accessor(row) : (row as any)[col.id])
                        const align =
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        return (
                          <td key={`${id}-${col.id}`} className={clsx(tdBase, align)} style={col.width ? { width: col.width } : undefined}>
                            {content as React.ReactNode}
                          </td>
                        )
                      })}
                      {(onEdit || onDelete) && (
                        <td className={clsx(tdBase, 'text-right')}>
                          <div className="flex justify-end gap-2">
                            {onEdit && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEdit(row)
                                }}
                                className="rounded-md border border-gray-200 bg-white p-1.5 text-gray-700 hover:shadow-sm
                                           focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                                           dark:bg-gray-900 dark:border-white/10 dark:text-gray-200"
                                aria-label="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(row)
                                }}
                                className="rounded-md border border-gray-200 bg-white p-1.5 text-gray-700 hover:shadow-sm
                                           focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors
                                           dark:bg-gray-900 dark:border-white/10 dark:text-gray-200"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Loading */}
        {loading && (
          <div
            aria-live="polite"
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-black/40"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        )}
      </div>

      {/* Error override (e.g., API down) */}
      {!loading && errorState ? <div className="mt-3">{errorState}</div> : null}

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            Page <span className="font-medium">{pagination.page}</span> of{' '}
            <span className="font-medium">{Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
              onClick={() =>
                pagination.onPageChange(
                  Math.min(Math.ceil(pagination.total / pagination.pageSize), pagination.page + 1)
                )
              }
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

/** ---------- Example usage ---------- */
/*
type Allergy = {
  allergy_id: string
  allergen: string
  severity: 'mild' | 'moderate' | 'severe'
  reaction: string
  created_at: string
}

const columns: Column<Allergy>[] = [
  { id: 'allergen', header: 'Allergen', sortable: true, sortField: 'allergen' },
  { id: 'severity', header: 'Severity', sortable: true, sortField: 'severity',
    accessor: (r) => r.severity.toUpperCase()
  },
  { id: 'reaction', header: 'Reaction', accessor: (r) => r.reaction },
  { id: 'created_at', header: 'Created', sortable: true, sortKey: (r) => new Date(r.created_at).getTime(),
    accessor: (r) => new Date(r.created_at).toLocaleDateString()
  },
]

<ListViewLayout<Allergy>
  title="Allergies"
  description="Manage your known allergies."
  data={allergies}
  columns={columns}
  getRowId={(r) => r.allergy_id}
  loading={isLoading}
  errors={apiError ? [{ field: 'api', message: apiError }] : undefined}
  searchValue={search}
  onSearch={setSearch}
  onAdd={() => router.push('/patient/medhist/allergies/new')}
  onRowClick={(row) => router.push(`/patient/medhist/allergies/${row.allergy_id}`)}
  onEdit={(row) => router.push(`/patient/medhist/allergies/${row.allergy_id}`)}
  onDelete={(row) => deleteMutation.mutate(row.allergy_id)}
  clientSort // true by default
  selectable
  onSelectionChange={(ids) => setSelectedIds(ids)}
  style="glass"   // 'flat' | 'elevated' | 'glass'
/>
*/
```

**Notes**

- Install: `npm i clsx lucide-react` - CSS transitions provide smooth hover effects without external dependencies.
    
- Keep column IDs stable; use `sortField`/`sortKey` for reliable client sorting.
    
- For **server pagination/sorting**, pass `pagination` and set `clientSort={false}`; handle sort/search in your API and update `data` accordingly.