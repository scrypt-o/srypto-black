# SSR-First Architecture for Scrypto

## Core Philosophy
**Server Components by default, Client Components for interactions**

This is a fundamental shift from our previous client-heavy approach. We now leverage Next.js 15's server components to fetch data at the server, reducing client-side complexity and improving initial load times.

## Key Changes from Previous Approach

### Before (Client-Heavy)
- TanStack Query for all data fetching
- Complex caching strategies
- Multiple API round trips
- Heavy client-side state management
- Lots of loading states

### After (SSR-First)
- Server Components fetch data
- Pass data as props to Client Components
- Client Components handle interactions only
- Simpler state management
- Faster initial loads

## Architecture Patterns

### 1. Page Structure (Server Component)
```typescript
// app/patient/[module]/[entity]/page.tsx
import { requireUser, getServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function Page({ params, searchParams }) {
  // Auth check
  await requireUser()
  
  // Get Supabase client
  const supabase = await getServerClient()
  
  // Await Next.js 15 async params
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  // Parse with Zod
  const validated = Schema.parse(resolvedSearchParams)
  
  // Fetch data server-side
  const { data, error } = await supabase
    .from('view_name')
    .select('*')
    
  // Pass to layout + client component
  return (
    <ListPageLayout sidebarItems={navItems} headerTitle="Title">
      <EntityListView
        initialData={data || []}
        initialState={validated}
      />
    </ListPageLayout>
  )
}
```

### 2. Client Component Pattern
```typescript
// components/features/[module]/EntityListView.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase-browser'

export default function EntityListView({ initialData, initialState }) {
  // Local state for UI
  const [items, setItems] = useState(initialData)
  const router = useRouter()
  
  // Client-side operations
  const handleDelete = async (ids: string[]) => {
    const supabase = getBrowserClient()
    // Perform operation
    // Update local state
    setItems(prev => prev.filter(item => !ids.includes(item.id)))
  }
  
  // Navigation
  const handleSearch = (query: string) => {
    // Update URL params - triggers server refetch
    router.push(`?search=${query}`)
  }
  
  return <ListView items={items} onDelete={handleDelete} ... />
}
```

### 3. Layout Components (Client)
```typescript
// components/layouts/ListPageLayout.tsx (server) + ListPageLayoutClient.tsx (client)
'use client'

export default function ListPageLayoutClient({ children, sidebarItems, headerTitle }) {
  // Layout state (sidebar collapse, mobile menu, etc)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div>
      <Sidebar items={sidebarItems} />
      <Header title={headerTitle} />
      <main>{children}</main>
      <MobileFooter />
    </div>
  )
}
```

## Data Flow

### Read Operations
1. User navigates to page
2. Server Component fetches data
3. Data passed as props to Client Component
4. Client Component renders with data
5. User interactions update URL params
6. Navigation triggers server refetch

### Write Operations
1. User triggers action (edit, delete, create)
2. Client Component calls Supabase
3. Optimistic update in local state
4. On success: Keep local state
5. On error: Rollback and show error

## Authentication Pattern

### Server-Side (Pages)
```typescript
// Always at the top of page components
await requireUser()
```

### Client-Side (API Calls)
```typescript
const supabase = getBrowserClient()
// Already has user context from cookies
```

### Middleware Protection
```typescript
// middleware.ts
const PUBLIC_PATHS = ['/login', '/signup', '/reset-password']
// All other paths require auth
```

## State Management

### URL as State
- Search queries
- Filters
- Pagination
- Sort options

### Local Component State
- UI toggles (select mode, modals)
- Optimistic updates
- Form data
- Temporary selections

### No Global State Needed
- Server provides initial data
- URL params drive refetches
- Local state for interactions

## API Routes

### Minimal API Surface
Only create API routes for:
- Complex operations (multi-table updates)
- File uploads
- External service integrations
- Webhook handlers

### Direct Supabase Calls
For simple CRUD:
- Use `getBrowserClient()` in Client Components
- Direct table/view access
- RLS handles permissions

## Component Hierarchy

```
app/
  patient/
    [module]/
      page.tsx (Server - Module home with tiles)
      [entity]/
        page.tsx (Server - List view)
        new/
          page.tsx (Server - Create form)
        [id]/
          page.tsx (Server - Detail view)

components/
  layouts/
    ClientListPageChrome.tsx (Client - Layout wrapper)
    ClientDetailPageChrome.tsx (Client - Layout wrapper)
    ListView.tsx (Client - Base list component)
    DetailView.tsx (Client - Base detail component)
    TileGridLayout.tsx (Client - Tile grid component)
    
  features/
    patient/
      [module]/
        EntityListView.tsx (Client - List implementation)
        EntityDetailView.tsx (Client - Detail implementation)
        EntityCreateView.tsx (Client - Create implementation)
```

## Benefits of This Approach

### Performance
- Faster initial page loads
- Server-side data fetching
- Reduced JavaScript bundle
- Better SEO potential

### Simplicity
- Less client-side state
- No cache invalidation complexity
- Straightforward data flow
- Easier debugging

### Security
- Auth checks on server
- Data fetching behind auth wall
- No API key exposure
- RLS enforcement

### Developer Experience
- Clear separation of concerns
- Predictable patterns
- Less boilerplate
- Type safety throughout

## Migration Checklist

### From Client Component to SSR
- [x] Move data fetching to page component
- [x] Convert to async Server Component
- [x] Pass data as props
- [x] Remove TanStack Query hooks
- [x] Update navigation to use router
- [x] Handle loading/error states

### Component Updates
- [x] Remove `use client` from pages
- [x] Add `use client` to interactive components
- [x] Update imports (getBrowserClient vs getServerClient)
- [x] Handle Next.js 15 async params
- [x] Remove unused query utilities

## Common Patterns

### Search Implementation
```typescript
// Server: Parse search param
const search = searchParams.search || ''
query = query.or(`field.ilike.%${search}%`)

// Client: Update URL
const handleSearch = (value: string) => {
  const params = new URLSearchParams(window.location.search)
  if (value) params.set('search', value)
  else params.delete('search')
  router.push(`?${params}`)
}
```

### Filter Implementation
```typescript
// Server: Apply filters
if (params.severity) {
  query = query.eq('severity', params.severity)
}

// Client: Toggle filters
const toggleFilter = (key: string, value: string) => {
  const params = new URLSearchParams(window.location.search)
  if (params.get(key) === value) {
    params.delete(key)
  } else {
    params.set(key, value)
  }
  router.push(`?${params}`)
}
```

### Pagination
```typescript
// Server: Calculate range
const from = (page - 1) * pageSize
const to = from + pageSize - 1
query = query.range(from, to)

// Client: Page change
const changePage = (newPage: number) => {
  const params = new URLSearchParams(window.location.search)
  params.set('page', newPage.toString())
  router.push(`?${params}`)
}
```

## Error Handling

### Server Components
```typescript
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  return <Component data={data} />
} catch (error) {
  // Next.js error boundary catches this
  throw new Error('Failed to load data')
}
```

### Client Components
```typescript
const [error, setError] = useState<string | null>(null)

const handleAction = async () => {
  try {
    const { error } = await supabase.from('table').update()
    if (error) throw error
  } catch (err) {
    setError('Operation failed')
    // Rollback optimistic update
  }
}
```

## Testing Strategy

### Server Components
- Mock `requireUser` and `getServerClient`
- Test data transformation logic
- Verify prop passing

### Client Components  
- Mock initial props
- Test user interactions
- Verify state updates
- Check navigation calls

### Integration
- Test full flow with Playwright
- Verify SSR content
- Test client interactions
- Check error states

## Next Steps

1. Complete DetailView integration
2. Migrate remaining modules to SSR
3. Remove unused TanStack Query code
4. Update all specs to reflect new patterns
5. Create component generator scripts
