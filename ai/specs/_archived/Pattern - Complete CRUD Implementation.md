# Complete CRUD Implementation Pattern v2 - Scrypto Medical Portal

**Date**: 2025-12-28  
**Version**: 2.0
**Status**: Updated with Controlled ListViewLayout Pattern  
**Source**: Based on allergies implementation debugging, specification alignment, and controlled state management fix
**Purpose**: Single source of truth for end-to-end CRUD implementation in Scrypto with proper state management

---

## Overview

This pattern provides a complete template for implementing CRUD operations in the Scrypto medical portal, incorporating lessons learned from the allergies implementation debugging process and aligned with all project specifications.

## Key Principles

- **Domain-Driven**: Uses medical domain (conditions) instead of generic examples
- **Spec-Aligned**: Follows exact folder structure and naming conventions
- **Debugged**: Incorporates fixes for cache invalidation, API response issues, and infinite loop prevention
- **Medical-Focused**: Appropriate field types and validation for healthcare context
- **Controlled State**: Uses controlled components to prevent useEffect loops and enable proper state management

## Implementation Template

### 1. Database (DDL)
```sql
-- Table: patient__medhist__[item] (following domain__group__item pattern)
CREATE TABLE patient__medhist__conditions (
  condition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  condition_name TEXT NOT NULL,
  condition_type TEXT CHECK (condition_type IN ('chronic', 'acute', 'hereditary', 'other')),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  diagnosis_date DATE,
  status TEXT CHECK (status IN ('active', 'resolved', 'managed')) DEFAULT 'active',
  notes TEXT,
  treatment_plan TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- View: v_patient__medhist__[item] (user-filtered reads)
CREATE VIEW v_patient__medhist__conditions AS 
SELECT * FROM patient__medhist__conditions 
WHERE user_id = auth.uid() AND is_active = true;

-- RLS Policy (user isolation)
ALTER TABLE patient__medhist__conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_conditions ON patient__medhist__conditions 
  FOR ALL USING (user_id = auth.uid());
```

### 2. Zod Schemas (/schemas/[item].ts)
```typescript
import { z } from 'zod'

// Enums matching database constraints
export const ConditionTypeEnum = z.enum(['chronic', 'acute', 'hereditary', 'other'])
export const SeverityEnum = z.enum(['mild', 'moderate', 'severe'])
export const StatusEnum = z.enum(['active', 'resolved', 'managed'])

// Complete database row
export const ConditionRowSchema = z.object({
  condition_id: z.string().uuid(),
  user_id: z.string().uuid(),
  condition_name: z.string(),
  condition_type: z.string().nullable(),
  severity: z.string().nullable(),
  diagnosis_date: z.string().nullable(),
  status: z.string().nullable(),
  notes: z.string().nullable(),
  treatment_plan: z.string().nullable(),
  is_active: z.boolean().nullable().default(true),
  created_at: z.string(),
  updated_at: z.string(),
})

// Create input (exclude auto-generated fields)
export const ConditionCreateInputSchema = z.object({
  condition_name: z.string().min(1).max(200),
  condition_type: ConditionTypeEnum,
  severity: SeverityEnum,
  diagnosis_date: z.string().optional(),
  status: StatusEnum.default('active'),
  notes: z.string().optional(),
  treatment_plan: z.string().optional(),
})

// Update input (partial)
export const ConditionUpdateInputSchema = z.object({
  condition_name: z.string().min(1).max(200).optional(),
  condition_type: ConditionTypeEnum.optional(),
  severity: SeverityEnum.optional(),
  diagnosis_date: z.string().optional(),
  status: StatusEnum.optional(),
  notes: z.string().optional(),
  treatment_plan: z.string().optional(),
})

// List query/response
export const ConditionListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  condition_type: ConditionTypeEnum.optional(),
  severity: SeverityEnum.optional(),
  status: StatusEnum.optional(),
})

export const ConditionListResponseSchema = z.object({
  data: z.array(ConditionRowSchema),  // CRITICAL: Use 'data' not 'items'
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Type exports
export type ConditionRow = z.infer<typeof ConditionRowSchema>
export type ConditionCreateInput = z.infer<typeof ConditionCreateInputSchema>
export type ConditionUpdateInput = z.infer<typeof ConditionUpdateInputSchema>
export type ConditionListQuery = z.infer<typeof ConditionListQuerySchema>
export type ConditionListResponse = z.infer<typeof ConditionListResponseSchema>
```

### 3. API Routes
**Path**: `/app/api/patient/medhist/[item]/route.ts`

Key patterns:
- Always check authentication first
- Use views for reads, tables for writes
- Validate with Zod schemas
- Return 422 on Zod validation errors with `{ error, details }`; 400 only for malformed JSON
- Use `data` property in responses
- Implement soft delete with `is_active = false`
- Trim text fields server-side before validation; convert empty strings to `undefined` for optional columns

### 4. Hooks (/hooks/usePatient[Item].ts)
```typescript
export const ConditionKeys = {
  all: ['conditions'] as const,
  list: (params?: any) => ['conditions', 'list', params] as const,
  detail: (id: string) => ['conditions', 'detail', id] as const,
}

// CRITICAL: Use prefix matching for cache invalidation
onSuccess: () => {
  invalidateQueries(['conditions'])  // Matches all condition keys
}

// Also invalidate the specific detail record on update/delete
onSuccess: (updated) => {
  if (updated?.condition_id) {
    invalidateQueries(['conditions', 'detail', updated.condition_id])
  }
}
```

### 5. Pages with Controlled State
**List Page**: `/app/patient/medhist/[item]/page.tsx`
```typescript
// Use controlled ListViewLayout pattern
export default function ConditionsListPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sort, setSort] = useState<{ id: string; dir: 'asc' | 'desc' } | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const { data, isLoading, error } = useConditionsList({
    filters,
    sort,
    // ... other query params
  })
  
  return (
    <ListPageLayout
      listProps={{
        title: "Medical Conditions",
        data: data?.data || [],
        columns: columns,
        getRowId: (row) => row.condition_id,
        // Controlled state props
        filters: filters,
        onFilterChange: setFilters,
        sort: sort,
        onSortChange: setSort,
        selectedIds: selectedIds,
        onSelectionChange: setSelectedIds,
        // Other props...
      }}
    />
  )
}
```

- **Create**: `/app/patient/medhist/[item]/new/page.tsx` using DetailPageLayout  
- **Edit**: `/app/patient/medhist/[item]/[id]/page.tsx` using DetailPageLayout

### 6. State Management with Zustand (Recommended)
```typescript
// lib/stores/listStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ListState {
  filters: Record<string, any>
  sort: { id: string; dir: 'asc' | 'desc' } | null
  selectedIds: string[]
  setFilters: (filters: Record<string, any>) => void
  setSort: (sort: { id: string; dir: 'asc' | 'desc' } | null) => void
  setSelectedIds: (ids: string[]) => void
}

export const createListStore = (name: string) =>
  create<ListState>()(
    persist(
      (set) => ({
        filters: {},
        sort: null,
        selectedIds: [],
        setFilters: (filters) => set({ filters }),
        setSort: (sort) => set({ sort }),
        setSelectedIds: (selectedIds) => set({ selectedIds }),
      }),
      { name: `${name}-list-store` }
    )
  )
```

UI rules:
- Derive select options from Zod enums (never hard-code lists)
- Normalize empty strings to `undefined` on submit for optional fields
- Use Next.js router (`router.push`, `router.refresh`) — do not use `window.location.href`

## Critical Gotchas (v2 Updates)

### Infinite Loop Prevention (NEW)
```typescript
// ❌ WRONG - Causes infinite loops (old pattern)
const [localFilters, setLocalFilters] = useState(activeFilters)
useEffect(() => {
  setLocalFilters(activeFilters)  // Infinite loop when activeFilters is undefined!
}, [activeFilters])

// ✅ CORRECT - Controlled pattern (new)
<ListViewLayout
  filters={filters}
  onFilterChange={setFilters}
  sort={sort}
  onSortChange={setSort}
/>
```

### Cache Invalidation
```typescript
// ✅ CORRECT - Prefix matching
invalidateQueries(['conditions'])

// ❌ WRONG - Exact matching (causes DELETE UI bugs)
invalidateQueries(ConditionKeys.all())  // ['conditions'] doesn't match ['conditions', 'list', {...}]
```

### API Response Format
```typescript
// ✅ CORRECT - REST standard
{ data: [...], total: 0, page: 1, pageSize: 20 }

// ❌ WRONG - Spec mismatch
{ items: [...], total: 0, page: 1, pageSize: 20 }
```

### Authentication
```typescript
// ✅ ALWAYS check auth first in API routes
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Implementation Checklist (v2)

1. **Database**: Table + View + RLS policy
2. **Schemas**: Row + Create + Update + List schemas with enums
3. **API**: List/Create + Detail/Update/Delete routes with sorting support
4. **Hooks**: 5 hooks with prefix cache invalidation
5. **Pages**: List + Create + Edit using controlled layouts
6. **State Store**: Zustand store for filters/sort/selection (recommended)
7. **Test**: All CRUD operations with proper cache refresh

**Key v2 Changes**:
- ListViewLayout now uses controlled pattern (no internal state sync)
- Filters/sort/selection managed via props, not internal useEffect
- Zustand recommended for state management
- Eliminates infinite loop issues from v1

**Estimated Time**: 2-3 hours for complete implementation following this pattern.

---

**Note**: This pattern incorporates critical debugging lessons from the allergies implementation, ensuring cache invalidation works correctly, API responses use proper format, and prevents infinite loops through controlled state management.
### Validation Semantics
```typescript
// ✅ CORRECT
return NextResponse.json({ error: 'Invalid input data', details: zodError }, { status: 422 })

// ❌ WRONG
return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
```
