import type { NavItem } from '@/components/layouts/PatientSidebar'
import PageShellClient, { type PageShellClientProps } from './PageShellClient'

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

export default function PageShell(props: PageShellProps) {
  // Thin server wrapper delegating to the client shell
  return <PageShellClient {...(props as PageShellClientProps)} />
}

