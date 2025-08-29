# BottomBar Component Specification

## Summary
A **bulletproof** bottom navigation bar that NEVER breaks layout containment. Fixed height, mobile-optimized, with intelligent tab navigation. Prevents the layout disasters you experienced with proper containment.

## Critical Layout Rules
```css
/* ABSOLUTE CONTAINMENT - NO EXCEPTIONS */
- Height: FIXED 64px mobile, 56px desktop (NEVER changes)
- Position: Static in layout flow (parent controls position)
- Width: 100% of parent (NEVER exceeds)
- Overflow: Hidden (NOTHING escapes)
- Bottom: Always at viewport bottom (parent ensures this)
- Safe-area: Respects iOS safe areas
```

## Component Contract

### Props
```typescript
export type BottomTab = {
  id: string
  label: string
  icon: keyof typeof Icons | string
  href?: string
  badge?: string | number
  onClick?: () => void
}

export type BottomBarProps = {
  // Tabs
  tabs: BottomTab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  
  // Display
  showLabels?: boolean        // Show text labels
  maxTabs?: number            // Max visible tabs (3-5)
  
  // Actions
  centerAction?: {            // Optional FAB-style center button
    icon: string
    label: string
    onClick: () => void
  }
  
  // Styling (matches sidebar/header)
  style?: 'flat' | 'elevated' | 'glass'
  motion?: 'none' | 'subtle'
  accent?: 'blue' | 'emerald'
}
```

## Layout Architecture

### Container Structure
```tsx
<footer className={clsx(
  // FIXED HEIGHT - IMMUTABLE
  'h-16 md:h-14',
  
  // SAFE AREA PADDING (iOS)
  'pb-safe',
  
  // WIDTH - FULL CONTAINMENT
  'w-full',
  
  // FLEX CONTAINER WITH SAFETY
  'flex items-center justify-around',
  'flex-shrink-0', // NEVER shrinks
  
  // OVERFLOW PROTECTION
  'overflow-hidden',
  
  // POSITION
  'relative',
  
  // Z-INDEX (for shadow)
  'z-10',
  
  // STYLES
  styles[style],
  
  // BORDER
  'border-t border-gray-200 dark:border-white/10'
)}>
  {/* Tabs constrained within */}
</footer>
```

### Critical CSS Classes
```typescript
// Container styles
const styles = {
  flat: 'bg-white dark:bg-gray-900',
  elevated: 'bg-white dark:bg-gray-900 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]',
  glass: 'bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg'
}

// Tab safety
const tabSafety = clsx(
  'flex-1',           // Equal width
  'max-w-[120px]',    // Never too wide
  'min-w-0',          // Can shrink
  'overflow-hidden'   // Text truncates
)

// Touch target safety (44px minimum)
const touchTarget = 'min-h-[44px] min-w-[44px]'
```

## Component Implementation

```tsx
'use client'

import * as React from 'react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { m } from 'framer-motion'

// Icon helper
function IconByName({ name, className }: { name: string; className?: string }) {
  const Icon = (Icons as any)[name]
  return Icon ? <Icon className={className} /> : null
}

export default function BottomBar({
  tabs,
  activeTab,
  onTabChange,
  showLabels = true,
  maxTabs = 5,
  centerAction,
  style = 'flat',
  motion = 'subtle',
  accent = 'blue'
}: BottomBarProps) {
  const pathname = usePathname()
  
  // Limit tabs to maxTabs
  const visibleTabs = tabs.slice(0, maxTabs)
  const hasCenter = !!centerAction && visibleTabs.length <= 4
  
  // Determine active state
  const isActive = (tab: BottomTab) => {
    if (activeTab) return tab.id === activeTab
    if (tab.href) return pathname === tab.href || pathname.startsWith(tab.href + '/')
    return false
  }
  
  // Style mappings
  const styles = {
    flat: 'bg-white dark:bg-gray-900',
    elevated: 'bg-white dark:bg-gray-900 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]',
    glass: 'bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg'
  }
  
  const accentColors = {
    blue: {
      active: 'text-blue-600 dark:text-blue-400',
      inactive: 'text-gray-600 dark:text-gray-400'
    },
    emerald: {
      active: 'text-emerald-600 dark:text-emerald-400',
      inactive: 'text-gray-600 dark:text-gray-400'
    }
  }
  
  const MotionDiv = motion === 'subtle' ? m.div : 'div'
  
  // Tab renderer
  const renderTab = (tab: BottomTab, index: number) => {
    const active = isActive(tab)
    const colors = accentColors[accent]
    
    const TabContent = (
      <MotionDiv
        whileTap={motion === 'subtle' ? { scale: 0.95 } : undefined}
        className={clsx(
          // FLEX CONTAINER
          'flex flex-col items-center justify-center',
          'relative',
          
          // SIZE CONSTRAINTS
          'h-full w-full',
          'min-h-[44px]', // Touch target minimum
          'px-2',
          
          // SELECTION STATE
          active ? colors.active : colors.inactive,
          
          // HOVER/FOCUS
          'hover:bg-gray-50 dark:hover:bg-white/5',
          'focus:outline-none focus:ring-2 focus:ring-inset',
          accent === 'emerald' 
            ? 'focus:ring-emerald-500' 
            : 'focus:ring-blue-500',
          
          // TRANSITION
          'transition-colors duration-200'
        )}
      >
        {/* Icon Container - Fixed Size */}
        <div className="relative flex-shrink-0">
          <IconByName 
            name={tab.icon} 
            className={clsx(
              'h-6 w-6',
              active && motion === 'subtle' && 'scale-110'
            )}
          />
          
          {/* Badge - Absolute Position */}
          {tab.badge && (
            <span className={clsx(
              'absolute -top-2 -right-2',
              'min-w-[18px] h-[18px] rounded-full',
              'bg-red-500 text-white',
              'text-[10px] font-bold',
              'flex items-center justify-center px-1'
            )}>
              {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
            </span>
          )}
        </div>
        
        {/* Label - Can be hidden */}
        {showLabels && (
          <span className={clsx(
            'mt-1 text-[10px] md:text-xs',
            'font-medium',
            'truncate max-w-full', // Text safety
            'leading-none'
          )}>
            {tab.label}
          </span>
        )}
        
        {/* Active Indicator - Absolute */}
        {active && (
          <MotionDiv
            layoutId="bottombar-indicator"
            className={clsx(
              'absolute top-0 left-1/2 -translate-x-1/2',
              'h-0.5 w-8',
              accent === 'emerald' ? 'bg-emerald-600' : 'bg-blue-600',
              'rounded-full'
            )}
          />
        )}
      </MotionDiv>
    )
    
    // Wrap in Link or button
    if (tab.href) {
      return (
        <Link
          key={tab.id}
          href={tab.href}
          className={clsx(
            // FLEX CHILD SAFETY
            'flex-1',
            'max-w-[120px]', // Never too wide
            'min-w-0',        // Can shrink
            'overflow-hidden' // Nothing escapes
          )}
        >
          {TabContent}
        </Link>
      )
    }
    
    return (
      <button
        key={tab.id}
        onClick={() => {
          tab.onClick?.()
          onTabChange?.(tab.id)
        }}
        className={clsx(
          // FLEX CHILD SAFETY
          'flex-1',
          'max-w-[120px]', // Never too wide
          'min-w-0',        // Can shrink
          'overflow-hidden' // Nothing escapes
        )}
      >
        {TabContent}
      </button>
    )
  }
  
  return (
    <footer 
      className={clsx(
        // FIXED HEIGHT - NEVER CHANGES
        'h-16 md:h-14',
        
        // SAFE AREA (iOS bottom bar)
        'pb-safe',
        
        // WIDTH - CONTAINED
        'w-full',
        
        // FLEX WITH SAFETY
        'flex items-stretch',
        'flex-shrink-0', // NEVER shrinks
        
        // OVERFLOW - NOTHING ESCAPES
        'overflow-hidden',
        
        // POSITION
        'relative',
        
        // Z-INDEX
        'z-10',
        
        // THEME
        styles[style],
        
        // BORDER
        'border-t border-gray-200 dark:border-white/10'
      )}
    >
      {/* Render tabs */}
      {visibleTabs.map((tab, index) => {
        // Skip middle tab if center action exists
        if (hasCenter && index === Math.floor(visibleTabs.length / 2)) {
          return (
            <React.Fragment key={tab.id}>
              {renderTab(tab, index)}
              
              {/* Center FAB */}
              <div className="relative w-16">
                <button
                  onClick={centerAction.onClick}
                  className={clsx(
                    'absolute bottom-2 left-1/2 -translate-x-1/2',
                    'h-14 w-14 rounded-full',
                    'flex items-center justify-center',
                    'shadow-lg',
                    accent === 'emerald'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700',
                    'text-white',
                    'transition-all duration-200',
                    'hover:scale-110',
                    'focus:outline-none focus:ring-4',
                    accent === 'emerald'
                      ? 'focus:ring-emerald-600/20'
                      : 'focus:ring-blue-600/20'
                  )}
                  aria-label={centerAction.label}
                >
                  <IconByName name={centerAction.icon} className="h-6 w-6" />
                </button>
              </div>
            </React.Fragment>
          )
        }
        
        return renderTab(tab, index)
      })}
    </footer>
  )
}
```

## Safety Guarantees

1. **Height Immutable**: 64px mobile / 56px desktop, never changes
2. **No Overflow**: All content contained within fixed bounds
3. **Touch Targets**: Minimum 44px for accessibility
4. **Text Safety**: All labels truncate, never wrap
5. **Badge Positioning**: Absolute, doesn't affect layout
6. **Safe Area**: Respects iOS bottom safe area
7. **Tab Width**: Constrained max-width prevents expansion

## Integration Example

```tsx
// In AppShell - Bottom bar at bottom
<div className="h-screen flex flex-col overflow-hidden">
  <AppHeader {...headerProps} />
  <main className="flex-1 min-h-0 overflow-y-auto">
    {children}
  </main>
  <BottomBar 
    tabs={[
      { id: 'home', label: 'Home', icon: 'Home', href: '/patient' },
      { id: 'meds', label: 'Meds', icon: 'Pill', href: '/patient/medications' },
      { id: 'history', label: 'History', icon: 'Clock', href: '/patient/medhist' },
      { id: 'profile', label: 'Profile', icon: 'User', href: '/patient/persinfo' }
    ]}
    style="elevated"
    motion="subtle"
    accent="emerald"
  />
</div>
```

## Mobile-Specific Considerations

```css
/* iOS Safe Areas */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* Android gesture navigation */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .h-16 {
    height: calc(4rem + env(safe-area-inset-bottom, 0));
  }
}
```

## Testing Checklist

- [ ] Height stays fixed when tabs change
- [ ] Long labels truncate properly
- [ ] Badges don't affect tab layout
- [ ] Center FAB doesn't push tabs
- [ ] Touch targets are 44px minimum
- [ ] Safe area padding works on iOS
- [ ] Tab widths stay equal
- [ ] No horizontal scroll appears
- [ ] Active indicator animates smoothly