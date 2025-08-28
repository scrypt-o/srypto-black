import PatientSidebar, { type NavItem } from '@/components/nav/PatientSidebar'
import { type DetailViewLayoutProps } from './DetailViewLayout'
import DetailPageLayoutClient from './DetailPageLayoutClient'

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
  
  // Detail view props or custom island
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

export default function DetailPageLayout(props: DetailPageLayoutProps) {
  return <DetailPageLayoutClient {...props} />
}
