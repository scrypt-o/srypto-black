import type { NavItem } from '@/components/layouts/PatientSidebar'
import PageShellClient, { type PageShellClientProps } from './PageShellClient'
import { getUserOrNull } from '@/lib/supabase-server'

export type PageShellProps = {
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

export default async function PageShell(props: PageShellProps) {
  // Fetch current user (server-side) to show in header
  const u = await getUserOrNull()
  const user = u
    ? {
        email: u.email || '',
        name: (u.user_metadata as any)?.name || (u.user_metadata as any)?.full_name || undefined,
        avatar: (u.user_metadata as any)?.avatar_url || (u.user_metadata as any)?.picture || undefined,
      }
    : undefined
  return <PageShellClient {...({ ...props, ...(user ? { user } : {}) } as PageShellClientProps)} />
}
