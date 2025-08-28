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

export type PatientSidebarProps = {
  title?: string
  items: NavItem[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
  style?: 'flat' | 'elevated' | 'glass'
  accent?: 'blue' | 'emerald' | 'healthcare'
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

export default function PatientSidebar({
  title = 'Patient Portal',
  items,
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
  isOpen = false,
  onClose,
  style = 'flat',
  accent = 'blue',
}: PatientSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Get current user
  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
    })
  }, [])

  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const toggleGroup = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Close drawer on route change (mobile)
  React.useEffect(() => {
    if (isMobile && isOpen && onClose) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === '/' || href === '/patient') return pathname === href
    return pathname.startsWith(href)
  }

  const accentBg = accent === 'emerald' 
    ? 'bg-healthcare-primary' 
    : accent === 'healthcare' 
      ? 'bg-healthcare-primary' 
      : 'bg-blue-600'
  const activeCls = `${accentBg} text-white`
  const activeIcon = `text-white`
  const hoverCls = 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10'
  const iconMuted = 'text-gray-600 dark:text-gray-400'


  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  /** ------- Renderers ------- */
  const LinkRow = (item: NavItem) => {
    const active = isActive(item.href)
    return (
      <Link
        key={item.id}
        href={item.href!}
        aria-current={active ? 'page' : undefined}
        className={clsx(
          'group w-full inline-flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
          active ? activeCls : hoverCls,
          isCollapsed ? 'justify-center' : 'justify-start'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <IconByName name={String(item.icon)} className={clsx('h-5 w-5', active ? activeIcon : iconMuted)} />
        {!isCollapsed && (
          <span className="text-sm font-medium truncate">{item.label}</span>
        )}
        {item.badge != null && !isCollapsed && (
          <span className="ml-auto inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  /** store expanded in a ref for inner functions */
  const expandedState = React.useMemo(() => expanded, [expanded])

  function GroupHeader({ item }: { item: NavItem }) {
    const active = isActive(item.href)
    const isOpen = expandedState.has(item.id)
    const Chevron = isOpen ? Icons.ChevronDown : Icons.ChevronRight
    return (
      <button
        type="button"
        onClick={(e) => {
          // click on chevron toggles; clicking the rest navigates if href
          const isChevron = (e.target as HTMLElement).closest('.chevron')
          if (isChevron) {
            toggleGroup(item.id)
          } else if (item.href) {
            router.push(item.href)
          } else {
            toggleGroup(item.id)
          }
        }}
        aria-expanded={isOpen}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
          active ? activeCls : hoverCls,
          isCollapsed ? 'justify-center' : 'justify-start'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <IconByName name={String(item.icon)} className={clsx('h-5 w-5', active ? activeIcon : iconMuted)} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-medium text-left truncate">{item.label}</span>
            <span className="chevron rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10">
              <Chevron className={clsx('h-4 w-4', active ? 'text-white' : 'text-gray-400 dark:text-gray-500')} />
            </span>
          </>
        )}
      </button>
    )
  }

  function GroupChildren({ children }: { children: NavItem[] }) {
    return (
      <div className={clsx(isCollapsed ? 'hidden' : 'ml-6 space-y-1')}>
        {children.map((child) =>
          child.type === 'group' ? (
            <div key={child.id}>
              <GroupHeader item={child} />
              {expandedState.has(child.id) && (
                <div className="mt-1 animate-slideDown">
                  <GroupChildren children={child.children ?? []} />
                </div>
              )}
            </div>
          ) : (
            <Link
              key={child.id}
              href={child.href!}
              aria-current={isActive(child.href) ? 'page' : undefined}
              className={clsx(
                'w-full inline-flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive(child.href) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/10'
              )}
            >
              <IconByName name={String(child.icon)} className={clsx('h-4 w-4', isActive(child.href) ? 'text-blue-700 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400')} />
              <span className="text-sm truncate">{child.label}</span>
            </Link>
          )
        )}
      </div>
    )
  }

  /** -------- Render -------- */
  // Mobile sheet
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-[100] md:hidden animate-fadeIn">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <aside className={clsx('absolute inset-y-0 left-0 w-80 p-0 animate-slideInLeft', shell[style])}>
                {/* Header */}
                <div className={clsx('flex items-center justify-between p-4', 
                  accent === 'emerald' || accent === 'healthcare' 
                    ? 'bg-healthcare-primary text-white' 
                    : 'bg-blue-600 text-white'
                )}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Icons.Heart className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{title}</div>
                      {!isLoading && user?.email && <div className="text-xs opacity-80 truncate">{user.email}</div>}
                    </div>
                  </div>
                  <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close menu">
                    <Icons.X className="h-5 w-5" />
                  </button>
                </div>

                {/* Nav */}
                <div className="max-h-[calc(100vh-56px-56px)] overflow-y-auto p-4">
                  <nav aria-label="Patient navigation" className="space-y-1">
                    {items.map((item) =>
                      (item.type ?? 'link') === 'group' ? (
                        <div key={item.id} className="space-y-1">
                          <GroupHeader item={item} />
                          {expandedState.has(item.id) && (
                            <div className="animate-slideDown">
                              <GroupChildren children={item.children ?? []} />
                            </div>
                          )}
                        </div>
                      ) : (
                        LinkRow(item)
                      )
                    )}
                  </nav>
                </div>

                {/* Footer */}
                <div className="border-t p-4 space-y-2">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Theme</span>
                    <ThemeToggle size="sm" />
                  </div>
                  
                  {/* Logout */}
                  <button
                    onClick={signOut}
                    className="w-full inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-white/10"
                  >
                    <Icons.LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
            </aside>
          </div>
        )}
      </>
    )
  }

  // Desktop rail
  return (
    <aside className={clsx('hidden h-screen md:flex flex-col transition-all duration-300', shell[style], isCollapsed ? 'w-16' : 'w-64')}>
      {/* Header */}
      <div className={clsx('flex items-center gap-3 p-4', 
        accent === 'emerald' || accent === 'healthcare' 
          ? 'bg-healthcare-primary text-white' 
          : 'bg-blue-600 text-white'
      )}>
        <button onClick={onToggleCollapse} className="rounded-lg p-2 hover:bg-white/10" aria-label="Toggle sidebar">
          <Icons.Menu className="h-5 w-5" />
        </button>
        {!isCollapsed && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icons.Heart className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{title}</div>
              {!isLoading && user?.email && <div className="text-xs opacity-80 truncate">{user.email}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav aria-label="Patient navigation" className="space-y-1">
          {items.map((item) =>
            (item.type ?? 'link') === 'group' ? (
              <div key={item.id} className="space-y-1">
                <GroupHeader item={item} />
                {expandedState.has(item.id) && !isCollapsed && (
                  <div className="mt-1 animate-slideDown">
                    <GroupChildren children={item.children ?? []} />
                  </div>
                )}
              </div>
            ) : (
              LinkRow(item)
            )
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        {/* Theme Toggle */}
        <div className={clsx(
          'flex items-center',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Theme</span>}
          <ThemeToggle size="sm" />
        </div>
        
        {/* Logout */}
        <button
          onClick={signOut}
          className={clsx(
            'inline-flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-white/10',
            isCollapsed ? 'justify-center' : 'justify-start'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <Icons.LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}