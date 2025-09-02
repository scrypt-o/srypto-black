'use client'

import * as React from 'react'
import PatientSidebar, { type NavItem } from '@/components/layouts/PatientSidebar'
import AppHeader from './AppHeader'
import MobileFooter from './MobileFooter'
import ChatDock from '@/components/patterns/ChatDock'

export type AddressPageLayoutClientProps = {
  sidebarItems: NavItem[]
  sidebarTitle?: string
  headerTitle?: string
  headerSubtitle?: string
  showSidebar?: boolean
  showHeader?: boolean
  showMobileMenu?: boolean
  style?: 'flat' | 'elevated' | 'glass'
  accent?: 'blue' | 'emerald' | 'healthcare'
  children?: React.ReactNode
}

export default function AddressPageLayoutClient(props: AddressPageLayoutClientProps) {
  const {
    sidebarItems,
    sidebarTitle = 'Patient Portal',
    headerTitle,
    headerSubtitle,
    showSidebar = true,
    showHeader = true,
    showMobileMenu = true,
    style = 'flat',
    accent = 'blue',
    children,
  } = props

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-gray-50 dark:bg-gray-950">
      {showSidebar && (
        <PatientSidebar
          title={sidebarTitle}
          items={sidebarItems}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
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
          onClose={() => setMobileSidebarOpen(false)}
          style={style}
          accent={accent}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {showHeader && (
          <AppHeader
            title={headerTitle ?? ''}
            subtitle={headerSubtitle ?? ''}
            showMobileMenu={showMobileMenu && showSidebar}
            onMobileMenuClick={() => setMobileSidebarOpen((o) => !o)}
            mobileSidebarOpen={mobileSidebarOpen}
            style={style}
            accent={accent}
          />
        )}

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-6 pb-20 md:pb-6">
          <div className="w-full max-w-4xl mx-auto">
            {children}
          </div>
        </main>
        <MobileFooter />
        <ChatDock />
      </div>
    </div>
  )
}

