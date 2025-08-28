# ListView and DetailView Standards

## Overview
This document defines the standard patterns for list and detail views in the Scrypto medical application. These are the BASE implementations - not "enhanced" versions.

## ListView Component

### Purpose
Display medical records in a clean, scannable list format with:
- Letter badges for visual identification
- Severity/status indicators  
- Bulk operations support
- Search and filtering
- Export capabilities

### Visual Structure
```
┌─────────────────────────────────────────────┐
│ [🔍 Search...]                    [Filter ⚙] │
│ [Select] [Add new]                          │
├─────────────────────────────────────────────┤
│ □ [P] Peanuts      [severe]    Aug 27, 2025 ✏️│
│ □ [S] Shellfish    [moderate]  Aug 26, 2025 ✏️│
│ □ [D] Dust Mites   [mild]      Aug 26, 2025 ✏️│
└─────────────────────────────────────────────┘
```

### Component Interface
```typescript
interface ListItem {
  id: string
  title: string
  letter?: string        // First letter for badge
  severity?: 'critical' | 'severe' | 'moderate' | 'mild' | 'normal'
  thirdColumn?: string | Date
  data?: Record<string, any>
}

interface ListViewProps<T extends ListItem> {
  items: T[]
  loading?: boolean
  onItemClick?: (item: T) => void
  onEditClick?: (item: T) => void
  onDelete?: (ids: string[]) => void
  onExport?: (ids: string[]) => void
  onSearch?: (query: string) => void
  onFilter?: () => void
  onAdd?: () => void
  searchPlaceholder?: string
  pageTitle?: string
  thirdColumnLabel?: string
}
```

### Key Features

#### 1. Letter Badges
- Auto-generated from first letter of title
- Color-coded (cycles through 5 colors)
- 40x40px squares with rounded corners

#### 2. Severity Indicators
- Pills with text inside
- Color mapping:
  - `critical`: Red background, white text
  - `severe`: Orange background, white text
  - `moderate`: Yellow background, white text
  - `mild`: Blue background, white text
  - `normal`: Gray background, white text

#### 3. Select Mode
- Triggered by "Select" button
- Shows checkboxes on left
- Enables bulk actions (Delete, Export)
- "Select all" functionality

#### 4. Export Options
- CSV format (default)
- PDF format
- Only exports selected items

### Interactions
- Click row → Navigate to detail view (view mode)
- Click pencil → Navigate to detail view (edit mode)
- Select mode → Checkbox interaction only
- Search → Real-time filtering via URL params

## DetailView Component

### Purpose
Display and edit individual medical records with:
- View/Edit mode switching
- Form validation
- Section-based layout
- Responsive field types

### Visual Structure
```
┌─────────────────────────────────────────────┐
│ Page Title                         [✏️] [←] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Record Title                        │   │
│  ├─────────────────────────────────────┤   │
│  │ Section 1                           │   │
│  │ [Field 1] [Field 2]                 │   │
│  │ [Field 3 - Full Width]              │   │
│  │                                     │   │
│  │ Section 2                           │   │
│  │ [Field 4] [Field 5]                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Edit Mode: [Save] [Cancel]                │
└─────────────────────────────────────────────┘
```

### Component Interface
```typescript
interface DetailField {
  id: string
  label: string
  value: string | number | boolean | Date | null
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'boolean'
  options?: { label: string; value: string }[]
  required?: boolean
  readonly?: boolean
  placeholder?: string
}

interface DetailSection {
  title?: string
  fields: DetailField[]
}

interface DetailViewProps {
  title: string
  pageTitle: string
  sections: DetailSection[]
  mode?: 'view' | 'edit'
  onSave?: (data: Record<string, any>) => void | Promise<void>
  onCancel?: () => void
  onBack?: () => void
  onEdit?: () => void
  loading?: boolean
  error?: string
}
```

### Field Types

#### View Mode
- All fields display as plain text
- Dates formatted as locale strings
- Booleans show as "Yes/No"
- Select options show labels

#### Edit Mode
- `text`: Standard input field
- `textarea`: Multi-line text (3 rows default)
- `select`: Dropdown with options
- `date`: Date picker
- `number`: Numeric input
- `boolean`: Checkbox

### Mode Switching
- View Mode: Shows pencil icon for editing
- Edit Mode: Shows Save/Cancel buttons
- Automatic mode switch after successful save
- Form data reset on cancel

## SSR Integration Pattern

### Page Structure (Server Component)
```typescript
// app/patient/[module]/[entity]/page.tsx
export default async function EntityListPage({ searchParams }) {
  await requireUser()
  const supabase = await getServerClient()
  
  // Parse and validate search params with Zod
  const params = Schema.parse(searchParams)
  
  // Fetch data server-side
  const { data, error, count } = await supabase
    .from('view_name')
    .select('*', { count: 'exact' })
    
  // Pass to client component
  return (
    <ClientListPageChrome sidebarItems={navItems} headerTitle="Title">
      <EntityListView
        initialData={data || []}
        total={count || 0}
        initialState={params}
      />
    </ClientListPageChrome>
  )
}
```

### Client Component Pattern
```typescript
// components/features/[module]/[entity]/EntityListView.tsx
'use client'

export default function EntityListView({ initialData, total, initialState }) {
  const [items, setItems] = useState(mapToListItems(initialData))
  
  // Handle client-side interactions
  const handleDelete = async (ids) => {
    const supabase = getBrowserClient()
    // Soft delete logic
  }
  
  // Handle navigation via router
  const router = useRouter()
  const handleItemClick = (item) => {
    router.push(`/patient/module/entity/${item.id}`)
  }
  
  return <ListView {...props} />
}
```

## Naming Conventions

### Components
- `ListView` - Base list view component (NOT EnhancedListView)
- `DetailView` - Base detail view component
- `EntityListView` - Feature-specific list implementation
- `EntityDetailView` - Feature-specific detail implementation

### Props
- `initialData` - Server-provided data
- `initialState` - Server-provided filters/params
- `onItemClick` - Row click handler
- `onEditClick` - Edit button handler
- `onDelete` - Bulk delete handler
- `onExport` - Export handler

### Routes
- `/patient/[module]` - Module home (tile grid)
- `/patient/[module]/[entity]` - Entity list
- `/patient/[module]/[entity]/new` - Create new
- `/patient/[module]/[entity]/[id]` - View detail
- `/patient/[module]/[entity]/[id]?mode=edit` - Edit detail

## Best Practices

### Performance
1. Server-side data fetching for initial load
2. Client-side updates without full refresh
3. Optimistic UI updates with rollback

### Accessibility
1. Keyboard navigation support
2. ARIA labels for screen readers
3. Focus management on mode changes

### Security
1. Server-side authentication checks
2. Soft deletes only (is_active=false)
3. User-scoped queries via views

### UX Patterns
1. Click row for view, pencil for edit
2. Bulk operations require explicit select mode
3. Confirmation for destructive actions
4. Clear visual feedback for all states

## Migration from Old Patterns

### Old Pattern (Client-heavy)
- TanStack Query for data fetching
- Complex caching logic
- Multiple round trips

### New Pattern (SSR-first)
- Server Components for initial data
- Client Components for interactions
- Single source of truth (server)
- Simpler state management

## Testing Checklist

### ListView
- [ ] Letter badges display correctly
- [ ] Severity colors match spec
- [ ] Select mode enables/disables properly
- [ ] Bulk delete requires confirmation
- [ ] Export generates valid CSV/PDF
- [ ] Search updates URL params
- [ ] Clicking row navigates to detail
- [ ] Clicking pencil opens edit mode

### DetailView
- [ ] View mode displays all fields
- [ ] Edit mode shows appropriate inputs
- [ ] Required fields are validated
- [ ] Save persists changes
- [ ] Cancel reverts changes
- [ ] Mode switching works smoothly
- [ ] Error states display correctly
- [ ] Loading states show appropriately

## Implementation Status

### Completed
- ✅ ListView base component
- ✅ DetailView base component
- ✅ AllergiesListView implementation
- ✅ Letter badges and severity pills
- ✅ Select mode and bulk operations
- ✅ Export functionality

### In Progress
- 🔄 DetailView integration with allergies
- 🔄 Other medical history modules

### Pending
- ⏳ Medications module
- ⏳ Prescriptions module
- ⏳ Personal Info module
- ⏳ Lab Results module
- ⏳ Appointments module
- ⏳ Communications module