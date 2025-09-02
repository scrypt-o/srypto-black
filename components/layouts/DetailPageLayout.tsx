import PatientSidebar, { type NavItem } from '@/components/layouts/PatientSidebar'
import { type DetailViewLayoutProps } from './DetailViewLayout'
import DetailPageLayoutClient from './DetailPageLayoutClient'
import { getUserOrNull } from '@/lib/supabase-server'

export type DetailPageLayoutProps = {
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
  
  // Detail view props or custom feature component
  detailProps?: DetailViewLayoutProps
  children?: React.ReactNode
  
  // Options to show/hide components
  showSidebar?: boolean
  showHeader?: boolean
  showMobileMenu?: boolean
  
  // Layout style
  style?: 'flat' | 'elevated' | 'glass'
  motion?: 'none' | 'subtle'
  accent?: 'blue' | 'emerald' | 'healthcare'
}

export default async function DetailPageLayout(props: DetailPageLayoutProps) {
  const u = await getUserOrNull()
  const user = u
    ? {
        email: u.email || '',
        name: (u.user_metadata as any)?.name || (u.user_metadata as any)?.full_name || undefined,
        avatar: (u.user_metadata as any)?.avatar_url || (u.user_metadata as any)?.picture || undefined,
      }
    : undefined
  return <DetailPageLayoutClient {...({ ...props, ...(user ? { user } : {}) } as any)} />
}
