'use client'

import * as React from 'react'
import PatientSidebar, { type NavItem } from '@/components/nav/PatientSidebar'
import AppHeader from './AppHeader'
import MobileFooter from './MobileFooter'
// Table ListViewLayout removed; use explicit children instead

export type ClientListPageChromeProps<Row> = {
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

export default function ClientListPageChrome<Row>(props: ClientListPageChromeProps<Row>) {
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
            {...(notifications != null ? { notifications } : {})}
            {...(onNotificationClick ? { onNotificationClick } : {})}
            style={style}
            accent={accent}
          />
        )}

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile bottom navigation */}
        <MobileFooter />
      </div>
    </div>
  )
}
