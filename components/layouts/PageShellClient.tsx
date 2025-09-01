"use client"

import * as React from 'react'
import PatientSidebar, { type NavItem } from '@/components/layouts/PatientSidebar'
import AppHeader from './AppHeader'
import MobileFooter from './MobileFooter'
import ChatDock from '@/components/patterns/ChatDock'

export type PageShellClientProps = {
  sidebarItems: NavItem[]
  sidebarTitle?: string
  headerTitle?: string
  headerSubtitle?: string
  showSearch?: boolean
  searchValue?: string
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  user?: { email: string; name?: string; avatar?: string }
  notifications?: number
  onNotificationClick?: () => void
  onUserMenuClick?: (action: string) => void
  children?: React.ReactNode
  showSidebar?: boolean
  showHeader?: boolean
  showMobileMenu?: boolean
  style?: 'flat' | 'elevated' | 'glass'
  motion?: 'none' | 'subtle'
  accent?: 'blue' | 'emerald' | 'healthcare'
}

export default function PageShellClient(props: PageShellClientProps) {
  const {
    sidebarItems,
    sidebarTitle = 'Patient Portal',
    headerTitle,
    headerSubtitle,
    showSearch = false,
    searchValue,
    onSearch,
    searchPlaceholder,
    user,
    notifications,
    onNotificationClick,
    onUserMenuClick,
    children,
    showSidebar = true,
    showHeader = true,
    showMobileMenu = true,
    style = 'flat',
    motion = 'subtle',
    accent = 'blue',
  } = props

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)
  const openMobileSidebar = () => setMobileSidebarOpen(true)
  const closeMobileSidebar = () => setMobileSidebarOpen(false)

  const [notifCount, setNotifCount] = React.useState<number | undefined>(props.notifications)

  React.useEffect(() => {
    let timer: any
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/comm/unread-count', { cache: 'no-store' })
        const json = await res.json()
        if (typeof json.count === 'number') setNotifCount(json.count)
      } catch {}
    }
    fetchCount()
    timer = setInterval(fetchCount, 15000)
    const onFocus = () => fetchCount()
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(timer); window.removeEventListener('focus', onFocus) }
  }, [])

  const defaultOnNotif = React.useCallback(() => {
    try {
      const path = window.location.pathname
      if (path.startsWith('/pharmacy')) {
        window.location.href = '/pharmacy/comm'
      } else {
        window.location.href = '/patient/comm/inbox'
      }
    } catch {}
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-gray-50 dark:bg-gray-950">
      {showSidebar && (
        <PatientSidebar
          title={sidebarTitle}
          items={sidebarItems}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          isMobile={false}
          style={style}
          accent={accent}
        />
      )}

      {showSidebar && showMobileMenu && (
        <PatientSidebar
          title={sidebarTitle}
          items={sidebarItems}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          isMobile={true}
          isOpen={mobileSidebarOpen}
          onClose={closeMobileSidebar}
          style={style}
          accent={accent}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {showHeader && (
          <AppHeader
            title={headerTitle ?? ''}
            subtitle={headerSubtitle ?? ''}
            showSearch={showSearch}
            searchValue={searchValue ?? ''}
            onSearch={onSearch ?? (() => {})}
            searchPlaceholder={searchPlaceholder || 'Search...'}
            showMobileMenu={showMobileMenu && showSidebar}
            onMobileMenuClick={openMobileSidebar}
            {...(user ? { user } : {})}
            {...(onUserMenuClick ? { onUserMenuClick } : {})}
            notifications={notifCount ?? 0}
            onNotificationClick={onNotificationClick ?? defaultOnNotif}
            style={style}
            accent={accent}
          />
        )}

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-6 pb-20 md:pb-6">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <MobileFooter />
        <ChatDock />
      </div>
    </div>
  )
}
