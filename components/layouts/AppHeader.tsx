'use client'

import * as React from 'react'
import * as Icons from 'lucide-react'
import clsx from 'clsx'
import { usePathname, useRouter } from 'next/navigation'

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
  mobileSidebarOpen?: boolean
  
  // User
  showUserMenu?: boolean
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
  mobileSidebarOpen = false,
  showUserMenu = false,
  user,
  onUserMenuClick,
  notifications = 0,
  onNotificationClick,
  style = 'flat',
  // motion prop removed
  accent = 'blue'
}: AppHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/patient'
  const isPharmacy = pathname.startsWith('/pharmacy')
  const isPharmacyHome = pathname === '/pharmacy'
  const isTopLevel = isHome || isPharmacyHome
  
  // Style mappings - gray header for pharmacy, blue for patient
  const headerBg = isPharmacy
    ? 'bg-gray-900 text-white'
    : (accent === 'emerald' || accent === 'healthcare')
    ? 'bg-healthcare-primary text-white'
    : 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white dark:from-blue-600 dark:to-indigo-500'
  
  // Simple div with CSS transitions for animations
  
  return (
    <header
      className={clsx(
        'h-14 md:h-16 w-full flex items-center flex-shrink-0 overflow-hidden px-4 md:px-6',
        headerBg
      )}
    >
      {/* LEFT: Either Back (nested) or Mobile menu (top-level) */}
      <div className="flex items-center gap-2">
        {!isTopLevel ? (
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10"
            aria-label="Back"
          >
            <Icons.ArrowLeft className="h-5 w-5 text-white" />
            <span className="hidden sm:inline text-sm text-white">Back</span>
          </button>
        ) : (
          showMobileMenu && (
            <button
              onClick={onMobileMenuClick}
              className={clsx(
                'md:hidden p-2 rounded-lg transition-colors',
                mobileSidebarOpen ? 'bg-white/15 ring-1 ring-white/20' : 'hover:bg-white/10'
              )}
              aria-label={mobileSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-pressed={mobileSidebarOpen}
            >
              {mobileSidebarOpen ? (
                <Icons.X className="h-5 w-5 text-white" />
              ) : (
                <Icons.Menu className="h-5 w-5 text-white" />
              )}
            </button>
          )
        )}
      </div>

      {/* MIDDLE: Title (in-flow, truncates, no overlap) */}
      <div className="flex-1 min-w-0 flex items-center justify-center">
        {title && (
          <h1 className="text-base md:text-lg font-semibold text-white truncate text-center">
            {title}
          </h1>
        )}
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notifications */}
        {onNotificationClick && (
          <button
            onClick={onNotificationClick}
            className="relative p-2 rounded-lg hover:bg-white/10"
            aria-label="Notifications"
          >
            <Icons.Bell className="h-5 w-5 text-white" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>
        )}

        {/* User Menu */}
        {showUserMenu && user && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={clsx(
                'flex items-center gap-2 p-2 rounded-lg',
                'hover:bg-white/10',
                'max-w-[200px]' // Prevent expansion
              )}
            >
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="" 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Icons.User className="h-4 w-4 text-white" />
                )}
              </div>
              <span className={clsx(
                'hidden md:block text-sm font-medium text-white',
                'truncate min-w-0' // Text safety
              )}>
                {user.name || user.email}
              </span>
              <Icons.ChevronDown className="h-4 w-4 flex-shrink-0 text-white" />
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
                  onClick={() => {
                    setUserMenuOpen(false)
                    if (isPharmacy) {
                      router.push('/patient')
                    } else {
                      router.push('/pharmacy')
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  {isPharmacy ? 'Switch to Patient View' : 'Switch to Pharmacy View'}
                </button>
                <button
                  onClick={() => onUserMenuClick?.('profile')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => onUserMenuClick?.('logout')}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back button moved to absolute end of right section */}
        {/* Back moved to left when nested; nothing on right */}
      </div>
    </header>
  )
}
