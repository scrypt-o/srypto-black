# Navigation Fix Pattern - V2 Spec

**Status:** CRITICAL FIX  
**Created:** 2025-08-26  
**Issue:** router.push() not working in current implementation  

---

## The Problem

Navigation is completely broken:
- `router.push()` calls fail silently
- No errors in console
- Likely due to Next.js 15 changes or router context issues

---

## V2 Navigation Pattern

### Use Next.js Link Component (Most Reliable)

Instead of:
```typescript
// BROKEN
onRowClick={(row) => router.push(`/patient/medhist/allergies/${row.allergy_id}`)}
```

Use:
```typescript
// WORKING - Wrap row in Link
import Link from 'next/link'

// In the table row rendering:
<Link href={`/patient/medhist/allergies-v2/${row.allergy_id}`} className="contents">
  <tr className="...">
    {/* row content */}
  </tr>
</Link>
```

### For Buttons That Navigate

Instead of:
```typescript
// POTENTIALLY BROKEN
<button onClick={() => router.push('/path')}>Navigate</button>
```

Use:
```typescript
// WORKING - Link styled as button
<Link 
  href="/path" 
  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2"
>
  Navigate
</Link>
```

### For Programmatic Navigation (After Actions)

```typescript
'use client'
import { useRouter } from 'next/navigation'

export default function Component() {
  const router = useRouter()
  
  const handleSuccess = () => {
    // Try these patterns in order:
    
    // 1. Window.location (Always works but full page refresh)
    window.location.href = '/patient/medhist/allergies-v2'
    
    // 2. Router.push with error handling
    try {
      router.push('/patient/medhist/allergies-v2')
    } catch (error) {
      console.error('Navigation failed:', error)
      window.location.href = '/patient/medhist/allergies-v2'
    }
    
    // 3. Router.replace (prevents back button)
    router.replace('/patient/medhist/allergies-v2')
  }
}
```

---

## Updated ListViewLayout Navigation Pattern

### Option 1: Modify ListViewLayout to Accept Link Component
```typescript
export type ListViewLayoutProps<Row> = {
  // ... existing props
  renderRowWrapper?: (props: { href: string; children: React.ReactNode }) => React.ReactNode
}

// In ListViewLayout:
const RowWrapper = renderRowWrapper || (({ children }) => <>{children}</>)

// In table body:
<RowWrapper href={`/patient/medhist/allergies-v2/${getRowId(row)}`}>
  <tr>...</tr>
</RowWrapper>

// Usage:
<ListViewLayout
  renderRowWrapper={({ href, children }) => (
    <Link href={href} className="contents">
      {children}
    </Link>
  )}
/>
```

### Option 2: Handle Click with Error Recovery
```typescript
const handleRowClick = (row: Row) => {
  const url = `/patient/medhist/allergies-v2/${row.allergy_id}`
  
  // Try Next.js router first
  try {
    router.push(url)
  } catch {
    // Fallback to window.location
    window.location.href = url
  }
}
```

---

## Button Navigation Updates

### Add Button
```typescript
// Instead of:
{onAdd && (
  <button onClick={onAdd}>Add</button>
)}

// Use:
{addHref && (
  <Link href={addHref} className="button-styles">
    <Plus className="h-4 w-4" />
    Add
  </Link>
)}
```

### Edit/Delete Buttons
```typescript
// Instead of router.push in onClick
{editHref && (
  <Link 
    href={editHref(row)} 
    className="button-styles"
    onClick={(e) => e.stopPropagation()}
  >
    <Edit3 className="h-4 w-4" />
  </Link>
)}
```

---

## Testing Navigation

```typescript
// Debug helper component
export function NavigationDebugger() {
  const router = useRouter()
  
  const testNavigation = async (path: string) => {
    console.log('Testing navigation to:', path)
    
    // Test 1: router.push
    try {
      await router.push(path)
      console.log('✓ router.push worked')
    } catch (error) {
      console.error('✗ router.push failed:', error)
    }
    
    // Test 2: router.replace
    try {
      router.replace(path)
      console.log('✓ router.replace worked')
    } catch (error) {
      console.error('✗ router.replace failed:', error)
    }
    
    // Test 3: window.location
    console.log('✓ window.location always works (but full refresh)')
  }
  
  return (
    <button onClick={() => testNavigation('/test')}>
      Test Navigation
    </button>
  )
}
```

---

## Immediate Fix for Allergies Pages

### 1. Update List Page Navigation
```typescript
// app/patient/medhist/allergies-v2/page.tsx
import Link from 'next/link'

// Replace onAdd prop with Link
<Link 
  href="/patient/medhist/allergies-v2/new"
  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
>
  <Plus className="h-4 w-4" />
  Add
</Link>

// For row clicks, wrap entire row
{rows.map((row) => (
  <Link 
    key={row.allergy_id}
    href={`/patient/medhist/allergies-v2/${row.allergy_id}`}
    className="contents"
  >
    <tr className="...">
      {/* row content */}
    </tr>
  </Link>
))}
```

### 2. Update Form Success Handlers
```typescript
// Use window.location for guaranteed navigation after mutations
onSuccess: () => {
  toastCtx.push({ type: 'success', message: 'Created successfully' })
  // Guaranteed to work
  window.location.href = '/patient/medhist/allergies-v2'
}
```

---

## Why Link Component Works Better

1. **Pre-rendering**: Next.js optimizes Link components
2. **Prefetching**: Automatic prefetch on hover
3. **No JS Required**: Works even if JS fails
4. **SEO Friendly**: Crawlable by search engines
5. **Accessibility**: Better keyboard navigation

---

## Migration Priority

1. **First**: Fix navigation in v2 pages using Link components
2. **Second**: Test all navigation paths work
3. **Third**: Add error recovery for programmatic navigation
4. **Fourth**: Update all pages to consistent pattern

---

**USE THIS PATTERN IN ALL V2 PAGES FOR RELIABLE NAVIGATION**