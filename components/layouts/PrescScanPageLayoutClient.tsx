'use client'

import * as React from 'react'
import PatientSidebar, { type NavItem } from '@/components/layouts/PatientSidebar'
import AppHeader from './AppHeader'
import MobileFooter from './MobileFooter'
import ChatDock from '@/components/patterns/ChatDock'

export type PrescScanPageLayoutClientProps = {
  sidebarItems: NavItem[]
  sidebarTitle?: string
  headerTitle?: string
  step?: 'camera' | 'analyzing' | 'results' | 'error'
  children?: React.ReactNode
}

export default function PrescScanPageLayoutClient(props: PrescScanPageLayoutClientProps) {
  const { sidebarItems, sidebarTitle = 'Patient Portal', headerTitle = 'Scan Prescription', step, children } = props
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-gray-50 dark:bg-gray-950">
      <PatientSidebar
        title={sidebarTitle}
        items={sidebarItems}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        isMobile={false}
        style={'flat'}
        accent={'blue'}
      />

      <PatientSidebar
        title={sidebarTitle}
        items={sidebarItems}
        isCollapsed={false}
        onToggleCollapse={() => {}}
        isMobile={true}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        style={'flat'}
        accent={'blue'}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <AppHeader
          title={headerTitle}
          showMobileMenu={true}
          onMobileMenuClick={() => setMobileSidebarOpen((o) => !o)}
          mobileSidebarOpen={mobileSidebarOpen}
          style={'flat'}
          accent={'blue'}
        />

        {/* Sticky step header */}
        <div className="sticky top-14 md:top-16 z-30 bg-white/90 backdrop-blur border-b">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3 text-sm text-gray-600">
            <span className={step === 'camera' ? 'font-semibold text-gray-900' : ''}>1. Capture</span>
            <span>›</span>
            <span className={step === 'analyzing' ? 'font-semibold text-gray-900' : ''}>2. Analyze</span>
            <span>›</span>
            <span className={step === 'results' ? 'font-semibold text-gray-900' : ''}>3. Review</span>
            <span>›</span>
            <span className={step === 'error' ? 'font-semibold text-rose-700' : ''}>Error</span>
          </div>
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
        <MobileFooter />
        <ChatDock />
      </div>
    </div>
  )
}

