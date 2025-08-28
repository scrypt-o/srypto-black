'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useLayoutStore } from '@/lib/stores/layout-store'
import PatientSidebar, { type NavItem } from '@/components/nav/PatientSidebar'
import AppHeader from './AppHeader'
import TileGridLayout, { type TileGridLayoutProps } from './TileGridLayout'

export type TilePageLayoutClientProps = {
  // Navigation props
  sidebarItems: NavItem[]
  sidebarTitle?: string
  
  // Header props  
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
  
  // Tile grid props
  tileConfig: TileGridLayoutProps
  
  // Options to show/hide components
  showSidebar?: boolean
  showHeader?: boolean
  showMobileMenu?: boolean
  
  // Layout style
  style?: 'flat' | 'elevated' | 'glass'
  motion?: 'none' | 'subtle'
  accent?: 'blue' | 'emerald' | 'healthcare'
}

export default function TilePageLayoutClient(props: TilePageLayoutClientProps) {
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
    tileConfig,
    showSidebar = true,
    showHeader = true,
    showMobileMenu = true,
    style = 'flat',
    motion = 'none',
    accent = 'blue',
  } = props

  const router = useRouter()
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleSidebar,
    openMobileSidebar,
    closeMobileSidebar
  } = useLayoutStore()

  const handleTileClick = (href: string) => {
    router.push(href)
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'update-profile':
        router.push('/patient/persinfo/profile')
        break
      case 'scan-prescription':
        router.push('/patient/presc/scanning') 
        break
      case 'find-pharmacy':
        router.push('/patient/location/nearest-services')
        break
      default:
        console.warn(`Unknown quick action: ${action}`)
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
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
      
      {/* Mobile Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
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

        {/* Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div className="w-full max-w-7xl mx-auto">
            <TileGridLayout 
              {...tileConfig}
              onTileClick={handleTileClick}
              onQuickAction={handleQuickAction}
              style={style}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
