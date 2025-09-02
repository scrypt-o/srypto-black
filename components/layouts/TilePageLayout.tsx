import * as React from 'react'
import TilePageLayoutClient, { type TilePageLayoutClientProps } from './TilePageLayoutClient'
import { type NavItem } from '@/components/layouts/PatientSidebar'
import { type TileGridLayoutProps } from './TileGridLayout'
import { getUserOrNull } from '@/lib/supabase-server'

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
  headingStats?: Array<{ id: string; icon?: string; label: string; value: string; href?: string; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }>
  contentNote?: string
  headingIcons?: Array<{ id: string; icon: any; href?: string; ariaLabel?: string }>
  
  // Options to show/hide components
  showSidebar?: boolean
  showHeader?: boolean
  showMobileMenu?: boolean
  
  // Layout style
  style?: 'flat' | 'elevated' | 'glass'
  motion?: 'none' | 'subtle'
  accent?: 'blue' | 'emerald' | 'healthcare'
  // Tile visuals (threaded to TileGridLayout)
  tilesExpressive?: boolean
  tileComposition?: 'classic' | 'hero'
}

// Server component wrapper that delegates to client component
export default async function TilePageLayout(props: TilePageLayoutProps) {
  const u = await getUserOrNull()
  const user = u
    ? {
        email: u.email || '',
        name: (u.user_metadata as any)?.name || (u.user_metadata as any)?.full_name || undefined,
        avatar: (u.user_metadata as any)?.avatar_url || (u.user_metadata as any)?.picture || undefined,
      }
    : undefined
  return <TilePageLayoutClient {...({ ...props, ...(user ? { user } : {}) } as TilePageLayoutClientProps)} />
}
