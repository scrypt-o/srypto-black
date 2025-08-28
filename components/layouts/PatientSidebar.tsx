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

  // Distinct icon colors for each top-level group (ids from config/patientNav.ts)
  const groupIconColors: Record<string, string> = {
    communications: 'text-indigo-600 dark:text-indigo-400',
    'personal-info': 'text-emerald-600 dark:text-emerald-400',
    prescriptions: 'text-rose-600 dark:text-rose-400',
    medications: 'text-amber-600 dark:text-amber-400',
    vitality: 'text-fuchsia-600 dark:text-fuchsia-400',
    'care-network': 'text-cyan-600 dark:text-cyan-400',
    medhist: 'text-blue-600 dark:text-blue-400',
    'lab-results': 'text-purple-600 dark:text-purple-400',
    location: 'text-teal-600 dark:text-teal-400',
    deals: 'text-pink-600 dark:text-pink-400',
    rewards: 'text-yellow-600 dark:text-yellow-400',
  }

  // Subtle tinted backgrounds per group to match Home tiles
  const groupRowTints: Record<string, { active: string; hover: string; ring: string; text: string; iconActive?: string }> = {
    communications: { active: 'bg-indigo-50 dark:bg-indigo-900/25 text-indigo-900 dark:text-indigo-100', hover: 'hover:bg-indigo-50/70 dark:hover:bg-indigo-900/15', ring: 'ring-1 ring-inset ring-indigo-200/70 dark:ring-indigo-800/40', text: 'text-indigo-900 dark:text-indigo-100', iconActive: 'text-indigo-700 dark:text-indigo-200' },
    'personal-info': { active: 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-900 dark:text-emerald-100', hover: 'hover:bg-emerald-50/70 dark:hover:bg-emerald-900/15', ring: 'ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-800/40', text: 'text-emerald-900 dark:text-emerald-100', iconActive: 'text-emerald-700 dark:text-emerald-200' },
    prescriptions: { active: 'bg-rose-50 dark:bg-rose-900/25 text-rose-900 dark:text-rose-100', hover: 'hover:bg-rose-50/70 dark:hover:bg-rose-900/15', ring: 'ring-1 ring-inset ring-rose-200/70 dark:ring-rose-800/40', text: 'text-rose-900 dark:text-rose-100', iconActive: 'text-rose-700 dark:text-rose-200' },
    medications: { active: 'bg-amber-50 dark:bg-amber-900/25 text-amber-900 dark:text-amber-100', hover: 'hover:bg-amber-50/70 dark:hover:bg-amber-900/15', ring: 'ring-1 ring-inset ring-amber-200/70 dark:ring-amber-800/40', text: 'text-amber-900 dark:text-amber-100', iconActive: 'text-amber-700 dark:text-amber-200' },
    vitality: { active: 'bg-fuchsia-50 dark:bg-fuchsia-900/25 text-fuchsia-900 dark:text-fuchsia-100', hover: 'hover:bg-fuchsia-50/70 dark:hover:bg-fuchsia-900/15', ring: 'ring-1 ring-inset ring-fuchsia-200/70 dark:ring-fuchsia-800/40', text: 'text-fuchsia-900 dark:text-fuchsia-100', iconActive: 'text-fuchsia-700 dark:text-fuchsia-200' },
    'care-network': { active: 'bg-cyan-50 dark:bg-cyan-900/25 text-cyan-900 dark:text-cyan-100', hover: 'hover:bg-cyan-50/70 dark:hover:bg-cyan-900/15', ring: 'ring-1 ring-inset ring-cyan-200/70 dark:ring-cyan-800/40', text: 'text-cyan-900 dark:text-cyan-100', iconActive: 'text-cyan-700 dark:text-cyan-200' },
    medhist: { active: 'bg-blue-50 dark:bg-blue-900/25 text-blue-900 dark:text-blue-100', hover: 'hover:bg-blue-50/70 dark:hover:bg-blue-900/15', ring: 'ring-1 ring-inset ring-blue-200/70 dark:ring-blue-800/40', text: 'text-blue-900 dark:text-blue-100', iconActive: 'text-blue-700 dark:text-blue-200' },
    'lab-results': { active: 'bg-purple-50 dark:bg-purple-900/25 text-purple-900 dark:text-purple-100', hover: 'hover:bg-purple-50/70 dark:hover:bg-purple-900/15', ring: 'ring-1 ring-inset ring-purple-200/70 dark:ring-purple-800/40', text: 'text-purple-900 dark:text-purple-100', iconActive: 'text-purple-700 dark:text-purple-200' },
    location: { active: 'bg-teal-50 dark:bg-teal-900/25 text-teal-900 dark:text-teal-100', hover: 'hover:bg-teal-50/70 dark:hover:bg-teal-900/15', ring: 'ring-1 ring-inset ring-teal-200/70 dark:ring-teal-800/40', text: 'text-teal-900 dark:text-teal-100', iconActive: 'text-teal-700 dark:text-teal-200' },
    deals: { active: 'bg-pink-50 dark:bg-pink-900/25 text-pink-900 dark:text-pink-100', hover: 'hover:bg-pink-50/70 dark:hover:bg-pink-900/15', ring: 'ring-1 ring-inset ring-pink-200/70 dark:ring-pink-800/40', text: 'text-pink-900 dark:text-pink-100', iconActive: 'text-pink-700 dark:text-pink-200' },
    rewards: { active: 'bg-yellow-50 dark:bg-yellow-900/25 text-yellow-900 dark:text-yellow-100', hover: 'hover:bg-yellow-50/70 dark:hover:bg-yellow-900/15', ring: 'ring-1 ring-inset ring-yellow-200/70 dark:ring-yellow-800/40', text: 'text-yellow-900 dark:text-yellow-100', iconActive: 'text-yellow-700 dark:text-yellow-200' },
  }


  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  /** ------- Renderers ------- */
  const LinkRow = (item: NavItem, groupIdHint?: string) => {
    const active = isActive(item.href)
    const isHome = item.id === 'home'
    const groupKey = groupRowTints[groupIdHint ?? item.id] ? (groupIdHint ?? item.id) : undefined
    const tint = groupKey ? groupRowTints[groupKey] : undefined
    const rowCls = clsx(
      'group w-full inline-flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
      tint ? tint.hover : hoverCls,
      active && !isHome && (tint ? clsx(tint.active, tint.ring) : activeCls),
      isCollapsed ? 'justify-center' : 'justify-start'
    )
    const content = (
      <>
        <IconByName 
          name={String(item.icon)} 
          className={clsx(
            'h-5 w-5',
            active && !isHome
              ? (tint?.iconActive ?? activeIcon)
              : (groupKey ? groupIconColors[groupKey] : iconMuted)
          )} 
        />
        {!isCollapsed && (
          <span className={clsx('text-sm font-medium truncate', active && !isHome && tint ? tint.text : undefined)}>{item.label}</span>
        )}
        {item.badge != null && !isCollapsed && (
          <span className={clsx(
            'ml-auto inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
            tint ? 'bg-white text-current dark:bg-white/10' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200'
          )}>
            {item.badge}
          </span>
        )}
      </>
    )
    // If no href, render a non-interactive row (no link)
    if (!item.href) {
      return (
        <div key={item.id} className={rowCls} title={isCollapsed ? item.label : undefined}>
          {content}
        </div>
      )
    }
    // Otherwise, render as link
    return (
      <Link
        key={item.id}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={rowCls}
        title={isCollapsed ? item.label : undefined}
      >
        {content}
      </Link>
    )
  }

  /** store expanded in a ref for inner functions */
  const expandedState = React.useMemo(() => expanded, [expanded])

  function GroupHeader({ item }: { item: NavItem }) {
    const active = isActive(item.href)
    const isOpen = expandedState.has(item.id)
    const Chevron = isOpen ? Icons.ChevronDown : Icons.ChevronRight
    const groupIconClass = groupIconColors[item.id] || (active ? activeIcon : iconMuted)
    const tint = groupRowTints[item.id]
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
          tint ? tint.hover : hoverCls,
          active && (tint ? clsx(tint.active, tint.ring) : activeCls),
          isCollapsed ? 'justify-center' : 'justify-start'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <IconByName name={String(item.icon)} className={clsx('h-5 w-5', active && tint?.iconActive ? tint.iconActive : groupIconClass)} />
        {!isCollapsed && (
          <>
            <span className={clsx('flex-1 text-sm font-medium text-left truncate', active && tint ? tint.text : undefined)}>{item.label}</span>
            <span className="chevron rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10">
              <Chevron className={clsx('h-4 w-4', active ? 'text-white' : 'text-gray-400 dark:text-gray-500')} />
            </span>
          </>
        )}
      </button>
    )
  }

  function GroupChildren({ children, parentId }: { children: NavItem[]; parentId: string }) {
    return (
      <div className={clsx(isCollapsed ? 'hidden' : 'ml-6 space-y-1')}>
        {children.map((child) =>
          child.type === 'group' ? (
            <div key={child.id}>
              <GroupHeader item={child} />
              {expandedState.has(child.id) && (
                <div className="mt-1 animate-slideDown">
                  <GroupChildren children={child.children ?? []} parentId={child.id} />
                </div>
              )}
            </div>
          ) : (
            LinkRow(child, parentId)
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
                {/* Header (match AppHeader height, no icon/title) */}
                <div className={clsx('flex h-14 md:h-16 items-center justify-between px-4', 
                  accent === 'emerald' || accent === 'healthcare' 
                    ? 'bg-healthcare-primary text-white' 
                    : 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white dark:from-blue-600 dark:to-indigo-500'
                )}>
                  <div />
                  <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close menu">
                    <Icons.X className="h-5 w-5" />
                  </button>
                </div>

                {/* Nav */}
                <div className="max-h-[calc(100vh-56px-56px)] overflow-y-auto p-4">
                  <nav aria-label="Patient navigation" className="space-y-1">
                    {/* Home first (no active highlight) */}
                    {items.find(i => i.id === 'home' && (i.type ?? 'link') === 'link') && (
                      LinkRow(items.find(i => i.id === 'home') as NavItem)
                    )}
                    {/* Divider between Home and the rest */}
                    <div className="my-2 border-t border-gray-200 dark:border-white/10" />
                    {/* Rest of items excluding Home */}
                    {items.filter(i => i.id !== 'home').map((item) =>
                      (item.type ?? 'link') === 'group' ? (
                        <div key={item.id} className="space-y-1">
                          <GroupHeader item={item} />
                          {expandedState.has(item.id) && (
                            <div className="animate-slideDown">
                              <GroupChildren children={item.children ?? []} parentId={item.id} />
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
      {/* Header (match AppHeader height, no icon/title) */}
      <div className={clsx('flex h-14 md:h-16 items-center gap-3 px-4', 
        accent === 'emerald' || accent === 'healthcare' 
          ? 'bg-healthcare-primary text-white' 
          : 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white dark:from-blue-600 dark:to-indigo-500'
      )}>
        <button onClick={onToggleCollapse} className="rounded-lg p-2 hover:bg-white/10" aria-label="Toggle sidebar">
          <Icons.Menu className="h-5 w-5" />
        </button>
        {/* Intentionally no title or icon */}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav aria-label="Patient navigation" className="space-y-1">
          {/* Home first (no active highlight) */}
          {items.find(i => i.id === 'home' && (i.type ?? 'link') === 'link') && (
            LinkRow(items.find(i => i.id === 'home') as NavItem)
          )}
          {/* Divider */}
          <div className="my-2 border-t border-gray-200 dark:border-white/10" />
          {/* Rest */}
          {items.filter(i => i.id !== 'home').map((item) =>
            (item.type ?? 'link') === 'group' ? (
              <div key={item.id} className="space-y-1">
                <GroupHeader item={item} />
                {expandedState.has(item.id) && !isCollapsed && (
                  <div className="mt-1 animate-slideDown">
                    <GroupChildren children={item.children ?? []} parentId={item.id} />
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
