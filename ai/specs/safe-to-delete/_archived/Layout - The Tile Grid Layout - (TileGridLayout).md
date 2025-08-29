**Summary**  
A reusable, **props-based TileGridLayout** for all dashboards/navigation pages. It renders tiles in a responsive 2-3-4 grid (mobile/tablet/desktop), supports keyboard and screen readers, touch-friendly sizing, quick actions, and built-in **style options** (flat/elevated/glass), **variants** (default/highlighted/subtle/warning), optional **CSS transitions**, and **dark mode** classes.

**Rationale for pattern**

- **Consistency & speed:** One simple API everywhere; easy to copy/paste and extend.
    
- **AI-friendly:** Obvious prop names, minimal magic, stable structure.
    
- **Usability & a11y:** Big tap targets, ARIA roles, keyboard activation, visible focus.
    
- **Modern look:** Optional depth, glass, and smooth transitions without sacrificing performance.
    

---

## Details

### When to use

- Home dashboards, section/group landing pages, and any tile-based navigation.
    

### Layout behavior

- Grid: **2 columns (mobile)** → **3 (tablet)** → **4 (desktop)**.
    
- Tiles are large, tappable cards (≥44px targets), accessible by keyboard (Enter/Space).
    

### Key props (high-level)

- `tiles`: Array of `{ id, title, description?, icon?, href, badge?, disabled?, variant? }`.
    
- `title`, `subtitle?`, `description?`, `breadcrumbs?`, `quickActions?`.
    
- **Styling switches:**
    
    - `style`: `'flat' | 'elevated' | 'glass'` (default `'flat'`).
        
    - `transitions`: `'none' | 'smooth'` (default `'smooth'`).
        
- **Behavior:** `onTileClick?(href, tile)`, `onQuickAction?(action)`, `loading?` overlay.
    

### Visual options (what they do)

- **style = 'flat'** → clean cards, soft borders, minimal shadow.
    
- **style = 'elevated'** → subtle hover lift + deeper shadow.
    
- **style = 'glass'** → translucent backdrop blur (light “glassmorphism”); paired `dark:` tokens included.
    
- **variant (per tile)**
    
    - `default` (neutral)
        
    - `highlighted` (accent background)
        
    - `subtle` (low-contrast surface)
        
    - `warning` (attention tone)
        

### Accessibility & interactions

- Container uses `role="grid"` with `aria-label={title}`.
    
- Each tile is a focusable `gridcell` with keyboard activation and `aria-disabled` when needed.
    
- Quick actions are standard buttons with focus rings.
    
- Optional loading overlay announces visually (pair with live region if needed).
    

---

## Code (drop-in, props-based)

```tsx
'use client'

import * as React from 'react'
import * as Icons from 'lucide-react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

/** ---------- Types ---------- */
export type TileVariant = 'default' | 'highlighted' | 'subtle' | 'warning'
export type Tile = {
  id: string
  title: string
  description?: string
  icon?: string          // Lucide icon name, e.g., "User"
  href: string
  badge?: string | number
  disabled?: boolean
  variant?: TileVariant
}

export type Breadcrumb = { label: string; href: string }
export type QuickAction = { id: string; label: string; action: string }

export type TileGridLayoutProps = {
  title: string
  subtitle?: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  tiles: Tile[]
  quickActions?: QuickAction[]
  loading?: boolean
  style?: 'flat' | 'elevated' | 'glass'         // visual style (default 'flat')
  transitions?: 'none' | 'smooth'               // CSS transitions (default 'smooth')
  onTileClick?: (href: string, tile: Tile) => void
  onQuickAction?: (action: string) => void
}

/** ---------- Helpers ---------- */
function LucideIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null
  const Icon = (Icons as any)[name]
  return Icon ? <Icon className={className} aria-hidden="true" /> : null
}

const variantClasses: Record<TileVariant, { wrapper: string; iconWrap: string; text: string; badgeWrap: string; badgeText: string }> = {
  default: {
    wrapper: 'bg-white border-gray-200 dark:bg-gray-900/60 dark:border-white/10',
    iconWrap: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-gray-900 dark:text-gray-100',
    badgeWrap: 'bg-blue-50 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-200',
  },
  highlighted: {
    wrapper: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/60',
    iconWrap: 'bg-white/70 dark:bg-white/10',
    text: 'text-blue-900 dark:text-blue-200',
    badgeWrap: 'bg-blue-100 dark:bg-blue-900/40',
    badgeText: 'text-blue-700 dark:text-blue-100',
  },
  subtle: {
    wrapper: 'bg-gray-50 border-gray-100 dark:bg-gray-900/40 dark:border-white/5',
    iconWrap: 'bg-white dark:bg-white/5',
    text: 'text-gray-800 dark:text-gray-200',
    badgeWrap: 'bg-gray-100 dark:bg-gray-800/60',
    badgeText: 'text-gray-700 dark:text-gray-200',
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/60',
    iconWrap: 'bg-white/70 dark:bg-white/10',
    text: 'text-amber-900 dark:text-amber-200',
    badgeWrap: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-800 dark:text-amber-100',
  },
}

const styleBase = {
  flat: 'border shadow-[0_1px_0_0_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.10)]',
  elevated: 'border shadow-md hover:shadow-lg',
  glass: 'border bg-white/80 backdrop-blur dark:bg-gray-900/60 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.25)]',
}

/** ---------- Component ---------- */
export default function TileGridLayout(props: TileGridLayoutProps) {
  const {
    title, subtitle, description, breadcrumbs,
    tiles, quickActions, loading,
    style = 'flat',
    transitions = 'smooth',
    onTileClick, onQuickAction,
  } = props

  const router = useRouter()
  const activate = (tile: Tile) => {
    if (tile.disabled) return
    if (onTileClick) return onTileClick(tile.href, tile)
    router.push(tile.href)
  }

  // CSS class for transitions
  const transitionClass = transitions === 'smooth' 
    ? 'transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95'
    : ''

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
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && <p className="mt-1 text-gray-600 dark:text-gray-400">{subtitle}</p>}
          {description && <p className="mt-2 text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
        {quickActions?.length ? (
          <div className="flex flex-wrap gap-2">
            {quickActions.map((qa) => (
              <button
                key={qa.id}
                data-testid={`quick-action-${qa.id}`}
                type="button"
                onClick={() => onQuickAction?.(qa.action)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
              >
                {qa.label}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {/* Grid */}
      <div
        data-testid="tile-grid"
        role="grid"
        aria-label={title}
        className={clsx(
          'grid gap-6',
          'grid-cols-2',     // mobile
          'md:grid-cols-3',  // tablet
          'lg:grid-cols-4'   // desktop
        )}
      >
        {tiles.map((tile) => {
          const variant = tile.variant ?? 'default'
          const v = variantClasses[variant]
          const disabled = !!tile.disabled

          return (
            <div
              key={tile.id}
              role="gridcell"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled || undefined}
              onClick={() => activate(tile)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (disabled) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  activate(tile)
                }
              }}
              className={clsx(
                'rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-blue-500/70',
                'min-h-[92px]',
                v.wrapper,
                styleBase[style],
                transitionClass,
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  'relative flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-black/5',
                  v.iconWrap
                )}>
                  <LucideIcon name={tile.icon} className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className={clsx('font-semibold', v.text)}>{tile.title}</h3>
                  {tile.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tile.description}</p>
                  )}
                </div>
              </div>
              {tile.badge != null && (
                <span className={clsx(
                  'mt-3 inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1',
                  v.badgeWrap, v.badgeText, 'ring-inset ring-black/5 dark:ring-white/10'
                )}>
                  {tile.badge}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-black/40"
        >
          <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 h-10 w-10" />
        </div>
      )}
    </section>
  )
}

/** ---------- Example usage ---------- */
// import TileGridLayout, { Tile } from '@/components/layouts/TileGridLayout'
/*
const tiles: Tile[] = [
  { id: 'persinfo', title: 'Personal Info', description: 'Update your details', icon: 'User', href: '/patient/persinfo' },
  { id: 'presc',    title: 'Prescriptions', description: 'Manage scripts', icon: 'FileText', href: '/patient/presc', badge: '3' },
  { id: 'medhist',  title: 'Medical History', description: 'Your records', icon: 'Heart', href: '/patient/medhist' },
  { id: 'meds',     title: 'Medications', description: 'Track meds', icon: 'Pill', href: '/patient/medications' },
]

<TileGridLayout
  title="Patient Portal"
  subtitle="Welcome to your health dashboard"
  tiles={tiles}
  quickActions={[
    { id: 'update-profile', label: 'Update Profile', action: 'update-profile' },
    { id: 'support', label: 'Support', action: 'support' },
  ]}
  style="glass"      // 'flat' | 'elevated' | 'glass'
  transitions="smooth"    // 'none' | 'smooth'
  onQuickAction={(action) => {
    if (action === 'update-profile') router.push('/patient/persinfo')
    if (action === 'support') router.push('/support')
  }}
  onTileClick={(href) => router.push(href)}
/>
*/
```

**Notes**

- Install: `npm i lucide-react clsx`.
    
- Dark mode is automatic with Tailwind’s `dark:` classes.
    
- Keep tile IDs stable for analytics and testing.