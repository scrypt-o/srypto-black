'use client'

import * as React from 'react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

// Types
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
  accent?: 'blue' | 'emerald'
}

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
  
  
  // Tab renderer
  const renderTab = (tab: BottomTab, index: number) => {
    const active = isActive(tab)
    const colors = accentColors[accent]
    
    const TabContent = (
      <div
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
              active && 'scale-110 transition-transform duration-200'
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
          <div
            className={clsx(
              'absolute top-0 left-1/2 -translate-x-1/2',
              'h-0.5 w-8',
              accent === 'emerald' ? 'bg-emerald-600' : 'bg-blue-600',
              'rounded-full'
            )}
          />
        )}
      </div>
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