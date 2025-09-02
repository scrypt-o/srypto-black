import PatientSidebar, { type NavItem } from '@/components/layouts/PatientSidebar'
import ListPageLayoutClient from './ListPageLayoutClient'
import { getUserOrNull } from '@/lib/supabase-server'

export type ListPageLayoutProps<Row> = {
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
  
  // Provide explicit children (client view component)
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

export default async function ListPageLayout<Row>(props: ListPageLayoutProps<Row>) {
  const u = await getUserOrNull()
  const user = u
    ? {
        email: u.email || '',
        name: (u.user_metadata as any)?.name || (u.user_metadata as any)?.full_name || undefined,
        avatar: (u.user_metadata as any)?.avatar_url || (u.user_metadata as any)?.picture || undefined,
      }
    : undefined
  return <ListPageLayoutClient {...({ ...props, ...(user ? { user } : {}) } as any)} />
}
