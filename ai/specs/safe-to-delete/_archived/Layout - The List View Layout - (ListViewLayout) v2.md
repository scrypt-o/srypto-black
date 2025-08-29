**Summary**  
A reusable, **controlled ListViewLayout** for modern, accessible data lists and tables. It provides a searchable, sortable, optionally paginated table with a clean toolbar (title, description, search box, filters, "Add" button), responsive design, dark-mode styling, CSS transitions, and consistent error/loading/empty states. **Version 2** introduces controlled state management to prevent infinite loops and enable proper state persistence.

**Rationale for pattern**

- **Controlled state management:** Eliminates infinite loops from useEffect syncing
- **Clarity for humans & AIs:** explicit props; no hidden state synchronization issues
- **Consistency:** one list/table layout used everywhere reduces bugs and design drift
- **Medical-grade UX:** visible focus, keyboard navigation, readable density, clear error/empty/loading states
- **Modern feel:** subtle depth, CSS hover transitions, and polished dark mode—without sacrificing performance

---

## Key Changes in v2

### Controlled Pattern
The component now supports both controlled and uncontrolled modes:
- **Controlled**: Parent manages state via props
- **Uncontrolled**: Component uses internal state as fallback
- **No more useEffect syncing** that caused infinite loops

### New Controlled Props
- `filters?: Record<string, any>` - External filter state
- `onFilterChange?: (filters: Record<string, any>) => void` - Filter change handler
- `sort?: { id: string; dir: 'asc' | 'desc' } | null` - External sort state
- `onSortChange?: (sort: { id: string; dir: 'asc' | 'desc' } | null) => void` - Sort change handler
- `selectedIds?: string[]` - Controlled selection
- `onSelectionChange?: (ids: string[]) => void` - Selection change handler

---

## Details

### When to use

- Any index/list page showing many records with search, filters, and sort/edit/delete
- Medical data lists requiring filtering by severity, status, type
- Pages that need state persistence across navigation

### Layout behavior

- Sticky header on desktop, compact on mobile, zebra rows for scanability, hover highlight, keyboard focus rings
- **Search:** controlled via `searchValue` + `onSearch`
- **Filters:** controlled via `filters` + `onFilterChange` OR internal state
- **Sorting:** controlled via `sort` + `onSortChange` OR internal state
- **Pagination:** server-driven via `pagination` props
- **Selection:** controlled via `selectedIds` + `onSelectionChange` OR internal state

### Canonical props

```typescript
type ListViewLayoutProps<Row> = {
  // Core data
  title: string
  description?: string
  data: Row[]
  columns: Column<Row>[]
  getRowId: (row: Row) => string
  
  // State indicators
  loading?: boolean
  errors?: ErrorItem[]
  
  // Search (always controlled)
  searchValue?: string
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  
  // Filters (controlled or internal)
  filters?: Record<string, any>
  onFilterChange?: (filters: Record<string, any>) => void
  filterFields?: FilterField[]  // Auto-generated if not provided
  
  // Sorting (controlled or internal)
  sort?: { id: string; dir: 'asc' | 'desc' } | null
  onSortChange?: (sort: { id: string; dir: 'asc' | 'desc' } | null) => void
  clientSort?: boolean  // Default true
  
  // Selection (controlled or internal)
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  
  // Actions
  onAdd?: () => void
  onRowClick?: (row: Row) => void
  onEdit?: (row: Row) => void
  onDelete?: (row: Row) => void
  
  // Pagination (server-side)
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  
  // Styling
  style?: 'flat' | 'elevated' | 'glass'
  emptyState?: React.ReactNode
  errorState?: React.ReactNode
}
```

### Column shape

```typescript
type Column<Row> = {
  id: string
  header: string | React.ReactNode
  accessor?: (row: Row) => React.ReactNode | string | number
  sortable?: boolean
  sortField?: keyof Row
  sortKey?: (row: Row) => string | number
  width?: number | string
  align?: 'left' | 'center' | 'right'
  cell?: (row: Row) => React.ReactNode  // takes precedence over accessor
}
```

### Filter Field shape

```typescript
type FilterField = {
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number'
  placeholder?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
}
```

---

## Usage Patterns

### Fully Controlled (Recommended with Zustand)

```tsx
// Using Zustand store for state management
import { useListStore } from '@/lib/state/listStore'

export default function AllergiesListPage() {
  const router = useRouter()
  const store = useListStore('allergies')
  const { data, isLoading, error } = useAllergiesList({
    page: store.page,
    pageSize: store.pageSize,
    search: store.search,
    filters: store.filters,
    sort: store.sort,
  })

  return (
    <ListViewLayout<Allergy>
      title="Allergies"
      description="Manage your known allergies and reactions."
      data={data?.data || []}
      columns={columns}
      getRowId={(r) => r.allergy_id}
      loading={isLoading}
      errors={error ? [{ field: 'api', message: error.message }] : undefined}
      // Controlled search
      searchValue={store.search}
      onSearch={store.setSearch}
      // Controlled filters
      filters={store.filters}
      onFilterChange={store.setFilters}
      // Controlled sort
      sort={store.sort}
      onSortChange={store.setSort}
      // Controlled selection
      selectedIds={store.selectedIds}
      onSelectionChange={store.setSelectedIds}
      // Pagination
      pagination={{
        page: store.page,
        pageSize: store.pageSize,
        total: data?.total || 0,
        onPageChange: store.setPage,
      }}
      // Actions
      onAdd={() => router.push('/patient/medhist/allergies/new')}
      onRowClick={(row) => router.push(`/patient/medhist/allergies/${row.allergy_id}`)}
      onEdit={(row) => router.push(`/patient/medhist/allergies/${row.allergy_id}`)}
      onDelete={(row) => handleDelete(row.allergy_id)}
      // Styling
      style="glass"
    />
  )
}
```

### Partially Controlled (Migration Path)

```tsx
// Controlling only filters, letting component handle sort internally
export default function AllergiesListPage() {
  const [filters, setFilters] = useState<Record<string, any>>({})
  const { data, isLoading } = useAllergiesList({ filters })

  return (
    <ListViewLayout
      data={data?.data || []}
      columns={columns}
      getRowId={(r) => r.allergy_id}
      // Controlled filters only
      filters={filters}
      onFilterChange={setFilters}
      // Sort handled internally by component
      clientSort={true}
      // Other props...
    />
  )
}
```

### Uncontrolled (Simple Use Case)

```tsx
// Component handles all state internally
export default function SimpleListPage() {
  const { data, isLoading } = useDataList()

  return (
    <ListViewLayout
      title="Simple List"
      data={data || []}
      columns={columns}
      getRowId={(r) => r.id}
      loading={isLoading}
      // No state props - component handles everything
      clientSort={true}
    />
  )
}
```

---

## Auto-Generated Filters

When `filterFields` is not provided, the component auto-generates appropriate filters based on data:

- **severity** field → Severity filter (Mild/Moderate/Severe/Life Threatening)
- **allergen_type** field → Type filter (Food/Medication/Environmental/Other)
- **status** field → Status filter (Active/Resolved/Inactive)
- **created_at** field → Date range filter
- Sortable columns → Sort By and Sort Direction filters

---

## Migration Guide from v1

### Before (v1 - caused infinite loops):
```tsx
// DON'T: This pattern caused infinite loops
const [localFilters, setLocalFilters] = useState(activeFilters)
useEffect(() => {
  setLocalFilters(activeFilters)  // Infinite loop!
}, [activeFilters])
```

### After (v2 - controlled pattern):
```tsx
// DO: Use controlled props
<ListViewLayout
  filters={filters}
  onFilterChange={setFilters}
  sort={sort}
  onSortChange={setSort}
/>
```

---

## Integration with Zustand

For proper state management, integrate with Zustand store:

```typescript
// lib/state/listStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ListState {
  page: number
  pageSize: number
  search: string
  filters: Record<string, any>
  sort: { id: string; dir: 'asc' | 'desc' } | null
  selectedIds: string[]
  
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setFilters: (filters: Record<string, any>) => void
  setSort: (sort: { id: string; dir: 'asc' | 'desc' } | null) => void
  setSelectedIds: (ids: string[]) => void
  reset: () => void
}

export const createListStore = (name: string) => {
  return create<ListState>()(
    persist(
      (set) => ({
        page: 1,
        pageSize: 20,
        search: '',
        filters: {},
        sort: null,
        selectedIds: [],
        
        setPage: (page) => set({ page }),
        setSearch: (search) => set({ search, page: 1 }),
        setFilters: (filters) => set({ filters, page: 1 }),
        setSort: (sort) => set({ sort }),
        setSelectedIds: (selectedIds) => set({ selectedIds }),
        reset: () => set({
          page: 1,
          search: '',
          filters: {},
          sort: null,
          selectedIds: [],
        }),
      }),
      {
        name: `list-store-${name}`,
      }
    )
  )
}

// Create specific stores
export const useAllergiesListStore = createListStore('allergies')
export const useConditionsListStore = createListStore('conditions')
```

---

## Best Practices

1. **Always prefer controlled mode** for complex lists with filters
2. **Use Zustand** for state management to avoid prop drilling
3. **Persist state** in sessionStorage for navigation consistency
4. **Sync with URL** for deep linking support
5. **Debounce search** at the parent level, not in the component
6. **Auto-generate filters** for medical data (severity, type, status)

---

## Notes

- Install: `npm i clsx lucide-react`
- Component includes SearchBar, FilterPanel, and AppliedFilters sub-components
- CSS transitions provide smooth hover effects
- For server pagination/sorting, pass `pagination` and set `clientSort={false}`
- Keep column IDs stable; use `sortField`/`sortKey` for reliable sorting