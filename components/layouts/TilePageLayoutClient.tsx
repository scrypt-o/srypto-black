'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import { useLayoutStore } from '@/lib/stores/layout-store'
import * as Icons from 'lucide-react'
import PatientSidebar, { type NavItem } from '@/components/layouts/PatientSidebar'
import PharmacySidebar from '@/components/layouts/PharmacySidebar'
import AppHeader from './AppHeader'
import TileGridLayout, { type TileGridLayoutProps } from './TileGridLayout'
import MobileFooter from './MobileFooter'
import PharmacyMobileFooter from './PharmacyMobileFooter'
import ChatDock from '@/components/patterns/ChatDock'

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
  tileOrientation?: 'grid' | 'vertical'
  // Content heading below header and above tiles
  contentHeading?: string
  contentSubheading?: string
  // Optional subtle meta line
  contentNote?: string
  // Tiny icon buttons aligned to the right of the heading
  headingIcons?: Array<{ id: string; icon: keyof typeof Icons; href?: string; ariaLabel?: string }>
  
  // Options to show/hide components
  showSidebar?: boolean
  showHeader?: boolean
  showMobileMenu?: boolean
  
  // Layout style
  style?: 'flat' | 'elevated' | 'glass'
  motion?: 'none' | 'subtle'
  accent?: 'blue' | 'emerald' | 'healthcare'
  // Tile visuals
  tilesExpressive?: boolean
  tileComposition?: 'classic' | 'hero'
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
    tileOrientation = 'grid',
    contentHeading,
    contentSubheading,
    contentNote,
    headingIcons = [],
    showSidebar = true,
    showHeader = true,
    showMobileMenu = true,
    style = 'flat',
    motion = 'none',
    accent = 'blue',
  } = props

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isPharmacyRoute = pathname.startsWith('/pharmacy')
  const expressiveTilesQP = searchParams.get('tiles') === 'expressive' || searchParams.get('ui') === 'polish-tiles'
  const heroTilesQP = searchParams.get('tiles') === 'hero' || searchParams.get('ui') === 'polish-tiles-hero'
  // Local storage fallback for user pref
  const [lsTilesExpressive, setLsTilesExpressive] = React.useState<boolean | null>(null)
  const [lsTileComposition, setLsTileComposition] = React.useState<'classic' | 'hero' | null>(null)
  React.useEffect(() => {
    try {
      const te = localStorage.getItem('ui:tiles:expressive')
      const tc = localStorage.getItem('ui:tiles:composition') as 'classic' | 'hero' | null
      setLsTilesExpressive(te === '1')
      setLsTileComposition(tc === 'hero' ? 'hero' : 'classic')
    } catch {}
  }, [])
  const expressiveTiles = expressiveTilesQP || !!props.tilesExpressive || !!lsTilesExpressive
  const tileComposition = heroTilesQP ? 'hero' : (props.tileComposition ?? (lsTileComposition ?? 'classic'))
  
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
        router.push('/patient/presc/scan') 
        break
      case 'find-pharmacy':
        router.push('/patient/location/nearest-services')
        break
      default:
        console.warn(`Unknown quick action: ${action}`)
    }
  }

  // Choose sidebar and mobile footer components based on route
  const SidebarComponent = isPharmacyRoute ? PharmacySidebar : PatientSidebar
  const MobileFooterComponent = isPharmacyRoute ? PharmacyMobileFooter : MobileFooter

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar (hidden on small screens) */}
      {showSidebar && (
        <div className="hidden lg:block">
          <SidebarComponent
            title={sidebarTitle}
            items={sidebarItems}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            isMobile={false}
            style={style}
            accent={accent}
          />
        </div>
      )}
      
      {/* Mobile Sidebar (only on small screens) */}
      {showSidebar && showMobileMenu && (
        <div className="lg:hidden">
          <SidebarComponent
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
        </div>
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
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-20 md:pb-6">
          <div className="w-full max-w-7xl mx-auto">
            {/* Inline heading below AppHeader */}
            {(contentHeading || contentSubheading) && (
              <div className="mb-5 md:mb-7">
                <div className="flex items-center justify-between gap-3">
                  {contentHeading && (
                    <h1
                      className="flex-1 min-w-0 text-2xl md:text-3xl font-extrabold tracking-tight 
                                 bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent
                                 dark:from-blue-300 dark:to-indigo-300"
                    >
                      {contentHeading}
                    </h1>
                  )}
                  {headingIcons.length > 0 && (
                    <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                      {headingIcons.map((it) => {
                        const Ico = (Icons as any)[it.icon] as React.ComponentType<{ className?: string }>
                        const tone = (() => {
                          const id = it.id.toLowerCase()
                          if (id.includes('alert')) {
                            return {
                              text: 'text-rose-600 dark:text-rose-300',
                              hover: 'hover:bg-rose-50/80 dark:hover:bg-rose-900/25',
                              ring: 'ring-rose-200/80 dark:ring-rose-800/50'
                            }
                          }
                          if (id.includes('message') || it.icon === 'Mail') {
                            return {
                              text: 'text-indigo-600 dark:text-indigo-300',
                              hover: 'hover:bg-indigo-50/80 dark:hover:bg-indigo-900/25',
                              ring: 'ring-indigo-200/80 dark:ring-indigo-800/50'
                            }
                          }
                          // notifications/bell default
                          return {
                            text: 'text-blue-600 dark:text-blue-300',
                            hover: 'hover:bg-blue-50/80 dark:hover:bg-blue-900/25',
                            ring: 'ring-blue-200/80 dark:ring-blue-800/50'
                          }
                        })()
                        const inner = (
                          <span
                            key={it.id}
                            className={clsx(
                              'inline-flex items-center justify-center p-2 rounded-md ring-1 ring-inset transition-colors',
                              tone.text,
                              tone.hover,
                              tone.ring
                            )}
                            title={it.ariaLabel || it.id}
                            aria-label={it.ariaLabel || it.id}
                          >
                            {Ico ? <Ico className="h-4 w-4" /> : null}
                          </span>
                        )
                        return it.href ? (
                          <Link key={it.id} href={it.href} className="inline-flex">
                            {inner}
                          </Link>
                        ) : (
                          inner
                        )
                      })}
                    </div>
                  )}
                </div>
                {/* Accent underline bar for a polished look */}
                <div className="mt-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300" />
                {contentSubheading && (
                  <p className="mt-3 text-base text-left text-gray-700 dark:text-gray-300">{contentSubheading}</p>
                )}
                {contentNote && (
                  <p className="mt-1 text-sm text-left text-gray-500 dark:text-gray-400">{contentNote}</p>
                )}
              </div>
            )}
            <TileGridLayout 
              {...tileConfig}
              orientation={tileOrientation}
              onTileClick={handleTileClick}
              onQuickAction={handleQuickAction}
              style={style}
              expressive={expressiveTiles}
              composition={tileComposition}
            />
          </div>
        </main>
        {/* Mobile bottom navigation */}
        <MobileFooterComponent />
        {/* Chat dock */}
        <ChatDock />
      </div>
    </div>
  )
}
