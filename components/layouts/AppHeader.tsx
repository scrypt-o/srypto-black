'use client'

import * as React from 'react'
import * as Icons from 'lucide-react'
import clsx from 'clsx'

export type AppHeaderProps = {
  // Content
  title?: string
  subtitle?: string
  showSearch?: boolean
  searchValue?: string
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  
  // Mobile
  showMobileMenu?: boolean
  onMobileMenuClick?: () => void
  
  // User
  user?: { email: string; name?: string; avatar?: string }
  onUserMenuClick?: (action: string) => void
  
  // Notifications
  notifications?: number
  onNotificationClick?: () => void
  
  // Styling (matches sidebar)
  style?: 'flat' | 'elevated' | 'glass'
  // motion prop removed - using CSS transitions
  accent?: 'blue' | 'emerald' | 'healthcare'
}

export default function AppHeader({
  title,
  subtitle,
  showSearch = false,
  searchValue = '',
  onSearch,
  searchPlaceholder = 'Search...',
  showMobileMenu = true,
  onMobileMenuClick,
  user,
  onUserMenuClick,
  notifications = 0,
  onNotificationClick,
  style = 'flat',
  // motion prop removed
  accent = 'blue'
}: AppHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  
  // Style mappings
  const styles = {
    flat: 'bg-white dark:bg-gray-900',
    elevated: 'bg-white dark:bg-gray-900 shadow-md',
    glass: 'bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg'
  }
  
  // Simple div with CSS transitions for animations
  
  return (
    <header 
      className={clsx(
        // FIXED HEIGHT - IMMUTABLE
        'h-14 md:h-16',
        
        // WIDTH - CONTAINED
        'w-full',
        
        // FLEX - WITH SAFETY
        'flex items-center gap-4',
        'flex-shrink-0', // Never shrinks
        
        // OVERFLOW - NOTHING ESCAPES
        'overflow-hidden',
        
        // SPACING
        'px-4 md:px-6',
        
        // POSITION
        'relative',
        
        // THEME
        styles[style],
        
        // BORDER
        'border-b border-gray-200 dark:border-white/10'
      )}
    >
      {/* LEFT SECTION - Constrained */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu - Fixed Size */}
        {showMobileMenu && (
          <button
            onClick={onMobileMenuClick}
            className={clsx(
              'md:hidden',
              'p-2 rounded-lg',
              'hover:bg-gray-100 dark:hover:bg-white/10',
              'flex-shrink-0' // Never shrinks
            )}
            aria-label="Menu"
          >
            <Icons.Menu className="h-5 w-5" />
          </button>
        )}
        
        {/* Title Group - Can shrink */}
        <div className="min-w-0">
          {title && (
            <h1 className={clsx(
              'text-lg md:text-xl font-semibold',
              'text-gray-900 dark:text-white',
              'truncate' // Text overflow protection
            )}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={clsx(
              'text-sm text-gray-500 dark:text-gray-400',
              'truncate' // Text overflow protection
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* CENTER SECTION - Search (Desktop) */}
      {showSearch && (
        <div className={clsx(
          'hidden md:flex',
          'flex-1 max-w-xl', // Constrained max width
          'min-w-0' // Can shrink
        )}>
          <div className="relative w-full">
            <Icons.Search className={clsx(
              'absolute left-3 top-1/2 -translate-y-1/2',
              'h-4 w-4 text-gray-400'
            )} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder={searchPlaceholder}
              className={clsx(
                'w-full pl-10 pr-4 py-2',
                'rounded-lg border',
                'border-gray-200 dark:border-white/10',
                'bg-gray-50 dark:bg-white/5',
                'focus:outline-none focus:ring-2',
                accent === 'emerald' 
                  ? 'focus:ring-emerald-500'
                  : 'focus:ring-blue-500'
              )}
            />
          </div>
        </div>
      )}
      
      {/* RIGHT SECTION - Actions */}
      <div className={clsx(
        'flex items-center gap-2',
        'flex-shrink-0' // Never shrinks
      )}>
        {/* Search Mobile */}
        {showSearch && (
          <button
            className={clsx(
              'md:hidden p-2 rounded-lg',
              'hover:bg-gray-100 dark:hover:bg-white/10'
            )}
            aria-label="Search"
          >
            <Icons.Search className="h-5 w-5" />
          </button>
        )}
        
        {/* Notifications - Fixed Size */}
        {onNotificationClick && (
          <button
            onClick={onNotificationClick}
            className={clsx(
              'relative p-2 rounded-lg',
              'hover:bg-gray-100 dark:hover:bg-white/10'
            )}
            aria-label="Notifications"
          >
            <Icons.Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className={clsx(
                'absolute -top-1 -right-1',
                'h-5 w-5 rounded-full',
                'bg-red-500 text-white',
                'text-xs flex items-center justify-center',
                'font-semibold'
              )}>
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>
        )}
        
        {/* User Menu - Fixed Size */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={clsx(
                'flex items-center gap-2 p-2 rounded-lg',
                'hover:bg-gray-100 dark:hover:bg-white/10',
                'max-w-[200px]' // Prevent expansion
              )}
            >
              <div className={clsx(
                'h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10',
                'flex items-center justify-center flex-shrink-0'
              )}>
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="" 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Icons.User className="h-4 w-4" />
                )}
              </div>
              <span className={clsx(
                'hidden md:block text-sm font-medium',
                'truncate min-w-0' // Text safety
              )}>
                {user.name || user.email}
              </span>
              <Icons.ChevronDown className="h-4 w-4 flex-shrink-0" />
            </button>
            
            {/* Dropdown - Position controlled */}
            {userMenuOpen && (
              <div
                className={clsx(
                  'absolute right-0 top-full mt-2',
                  'w-56 rounded-lg',
                  'bg-white dark:bg-gray-900',
                  'border border-gray-200 dark:border-white/10',
                  'shadow-lg',
                  'py-1',
                  'z-50', // Above content
                  'opacity-100 transform transition-all duration-150 ease-out'
                )}
              >
                <button
                  onClick={() => onUserMenuClick?.('profile')}
                  className={clsx(
                    'w-full px-4 py-2 text-left text-sm',
                    'hover:bg-gray-100 dark:hover:bg-white/10'
                  )}
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => onUserMenuClick?.('logout')}
                  className={clsx(
                    'w-full px-4 py-2 text-left text-sm',
                    'text-red-600 dark:text-red-400',
                    'hover:bg-red-50 dark:hover:bg-red-900/20'
                  )}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
