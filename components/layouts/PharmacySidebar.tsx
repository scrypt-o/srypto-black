'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase-browser'
import ThemeToggle from '@/components/patterns/ThemeToggle'

/** -------- Types -------- */
export type NavItem = {
  id: string
  label: string
  icon?: keyof typeof Icons | string
  href?: string
  type?: 'link' | 'group'
  children?: NavItem[]
  badge?: string | number
}

export type PharmacySidebarProps = {
  title?: string
  items: NavItem[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
  style?: 'flat' | 'elevated' | 'glass'
  accent?: 'pharmacy' | 'blue' | 'emerald' | 'healthcare'
}

/** -------- Helpers -------- */
function IconByName({ name, className }: { name?: string; className?: string }) {
  if (!name) return null
  const Ico = (Icons as any)[name]
  return Ico ? <Ico className={className} aria-hidden /> : null
}

const shell = {
  flat: 'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10',
  elevated: 'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 shadow-lg',
  glass: 'bg-white/85 dark:bg-gray-900/70 backdrop-blur border-r border-gray-200/70 dark:border-white/10 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.25)]',
} as const

export default function PharmacySidebar({
  title = 'Pharmacy Portal',
  items,
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
  isOpen = false,
  onClose,
  style = 'flat',
  accent = 'pharmacy',
}: PharmacySidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([])

  // Auto-expand active group
  React.useEffect(() => {
    items.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some((child) => child.href && pathname.startsWith(child.href))
        if (isActive && !expandedGroups.includes(item.id)) {
          setExpandedGroups((prev) => [...prev, item.id])
        }
      }
    })
  }, [pathname, items])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    )
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sidebarClasses = clsx(
    'h-full flex flex-col transition-all duration-300 ease-in-out relative',
    shell[style],
    isCollapsed ? 'w-16' : 'w-64',
    isMobile && !isOpen && 'hidden'
  )

  const accentColors = {
    // Gentle pharmacy red (not too saturated), with a soft outline
    pharmacy: 'text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-900/20 border border-rose-200/80 dark:border-rose-800/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    healthcare: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20',
  } as const

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(sidebarClasses, isMobile && 'fixed z-50')}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center ring-1 ring-rose-300 dark:ring-rose-800/50">
                <Icons.Building2 className="w-5 h-5 text-rose-700 dark:text-rose-300" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {title}
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 text-rose-700/80 dark:text-rose-300/80 hover:text-rose-700 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 ring-1 ring-transparent hover:ring-rose-200/70 dark:hover:ring-rose-800/40"
          >
            <Icons.ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {items.map((item) => {
              if (item.children) {
                const isExpanded = expandedGroups.includes(item.id)
                const hasActiveChild = item.children.some(
                  (child) => child.href && pathname === child.href
                )

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => !isCollapsed && toggleGroup(item.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                        hasActiveChild && accentColors[accent]
                      )}
                    >
                      <IconByName name={item.icon} className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <Icons.ChevronDown
                            className={clsx(
                              'w-4 h-4 transition-transform',
                              isExpanded ? 'rotate-180' : 'rotate-0'
                            )}
                          />
                        </>
                      )}
                    </button>

                    {/* Children */}
                    {!isCollapsed && isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.href || '#'}
                            className={clsx(
                              'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                              pathname === child.href
                                ? accentColors[accent]
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            )}
                            onClick={isMobile ? onClose : undefined}
                          >
                            <IconByName name={child.icon} className="w-4 h-4 flex-shrink-0" />
                            <span>{child.label}</span>
                            {child.badge && (
                              <span className="ml-auto bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs px-2 py-0.5 rounded-full ring-1 ring-rose-200/70 dark:ring-rose-800/50">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // Single link
              return (
                <Link
                  key={item.id}
                  href={item.href || '#'}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    pathname === item.href
                      ? accentColors[accent]
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  onClick={isMobile ? onClose : undefined}
                >
                  <IconByName name={item.icon} className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs px-2 py-0.5 rounded-full ring-1 ring-rose-200/70 dark:ring-rose-800/50">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-white/10 p-4 space-y-2">
          {/* Switch to Patient */}
          <Link
            href="/patient"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            onClick={isMobile ? onClose : undefined}
          >
            <Icons.UserCircle2 className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Switch to Patient App</span>}
          </Link>
          {/* Theme Toggle */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Icons.Palette className="w-4 h-4 flex-shrink-0 text-gray-500" />
            {!isCollapsed && (
              <div className="flex-1">
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Icons.LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>
    </>
  )
}
