# Composed Layouts Pattern

## Summary
Composed layouts combine AppShell, navigation, headers, and core layouts into single-use components for pages. This eliminates boilerplate and ensures consistent page structure.

## Components

### ListPageLayout
Combines AppShell + PatientSidebar + AppHeader + ListViewLayout for list pages.

**Props:**
- All navigation props (sidebarItems, bottomTabs, etc.)
- All header props (title, subtitle, search, user, etc.)
- `listProps`: Complete ListViewLayout configuration
- Options to show/hide components

### DetailPageLayout
Combines AppShell + PatientSidebar + AppHeader + DetailViewLayout for form pages.

**Props:**
- Navigation and header props
- `detailProps`: Complete DetailViewLayout configuration
- Options to show/hide components

### TilePageLayout
Combines AppShell + PatientSidebar + AppHeader + TileGridLayout for dashboard pages.

**Props:**
- Navigation and header props
- `tileConfig`: TileGridLayout configuration
- Event handlers (onTileClick, onQuickAction)
- Options to show/hide components

## Usage Pattern

```tsx
// In a page component
import ListPageLayout from '@/components/layouts/ListPageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function AllergiesPage() {
  return (
    <ListPageLayout
      sidebarItems={patientNavItems}
      title="Allergies"
      subtitle="Manage your allergy records"
      listProps={{
        title: "My Allergies",
        data: allergies,
        columns: allergyColumns,
        // ... rest of ListViewLayout props
      }}
    />
  )
}
```

## Benefits
- Single import per page
- Consistent layout structure
- Mobile sidebar handling built-in
- All components pre-wired
- Type-safe props

## Server Component vs Client Component Guidelines

### Correct Implementation Patterns

**Server Component for Static Content:**
```tsx
// CORRECT: Server component for static tile pages
export default async function PatientHomePage() {
  const user = await requireUser()
  const config = getStaticTileConfig()
  
  return (
    <TilePageLayoutServer
      config={config}
      user={user}
    />
  )
}
```

**Client Boundary Only Where Needed:**
```tsx
// CORRECT: Client wrapper only for interactive features
'use client'
function TileInteractionWrapper({ children, onTileClick }) {
  const router = useRouter()
  
  const handleClick = (href: string) => {
    router.push(href) // CORRECT: Use Next.js router
  }
  
  return (
    <div onClick={() => handleClick(href)}>
      {children}
    </div>
  )
}
```

### Anti-Patterns to Avoid

**Unnecessary Client Directive:**
```tsx
// WRONG: Entire page marked as client component unnecessarily
'use client'
export default function StaticPage() {
  return (
    <TilePageLayout
      staticConfig={config} // No interactivity needed
    />
  )
}
```

**Navigation Anti-Patterns:**
```tsx
// WRONG: Bypassing Next.js router
onClick={() => window.location.href = '/route'} // Causes full page reload
onClick={() => window.location.assign('/route')} // Loses application state
onClick={() => location.href = '/route'} // Browser navigation instead of SPA

// CORRECT: Next.js router navigation
const router = useRouter()
onClick={() => router.push('/route')} // Client-side navigation
```

**Layout Composition Anti-Patterns:**
```tsx
// WRONG: Excessive nesting and duplicate state management
'use client'
function PageWithRedundantState() {
  const [sidebarState, setSidebarState] = useState()
  const [mobileState, setMobileState] = useState() 
  const [themeState, setThemeState] = useState()
  
  return (
    <Layout1 sidebarState={sidebarState}>
      <Layout2 mobileState={mobileState}>
        <Layout3 themeState={themeState}>
          <ActualContent />
        </Layout3>
      </Layout2>
    </Layout1>
  )
}
```

**Animation Anti-Patterns:**
```tsx
// WRONG: Excessive animation instances
{items.map(item => (
  <motion.div
    key={item.id}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring' }}
  >
    {item.content}
  </motion.div>
))} // Creates N animation instances

// CORRECT: CSS transitions
{items.map(item => (
  <div
    key={item.id}
    className="transition-transform hover:-translate-y-1 active:scale-95"
  >
    {item.content}
  </div>
))}
```

## Performance Guidelines

### When to Use Client Components
- Form interactions requiring useForm hooks
- Router navigation requiring useRouter
- Browser API access (localStorage, geolocation)
- Real-time features requiring WebSocket connections
- Complex interactive state management

### When to Use Server Components  
- Static content rendering
- Initial data fetching
- Authentication verification
- Configuration loading
- SEO content (though not applicable for authenticated apps)

### Navigation Standards
- All internal route changes must use Next.js router.push()
- Preserve application state across navigation
- Handle loading states at router boundary level
- Never use window.location methods for internal navigation

### State Management Standards
- Centralize shared state in context providers
- Avoid duplicate state across layout components
- Use server components to reduce client-side state needs
- Implement proper error boundaries for client components