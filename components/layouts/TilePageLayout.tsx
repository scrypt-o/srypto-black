import * as React from 'react'
import TilePageLayoutClient, { type TilePageLayoutClientProps } from './TilePageLayoutClient'
import { type NavItem } from '@/components/layouts/PatientSidebar'
import { type TileGridLayoutProps } from './TileGridLayout'

export type TilePageLayoutProps = {
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
  // Content heading shown above tiles (below AppHeader)
  contentHeading?: string
  contentSubheading?: string
  
  // Options to show/hide components
  showSidebar?: boolean
  showHeader?: boolean
  showMobileMenu?: boolean
  
  // Layout style
  style?: 'flat' | 'elevated' | 'glass'
  motion?: 'none' | 'subtle'
  accent?: 'blue' | 'emerald' | 'healthcare'
}

// Server component wrapper that delegates to client component
export default function TilePageLayout(props: TilePageLayoutProps) {
  return <TilePageLayoutClient {...props} />
}
