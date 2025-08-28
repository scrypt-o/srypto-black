import PatientSidebar, { type NavItem } from '@/components/layouts/PatientSidebar'
import ListPageLayoutClient from './ListPageLayoutClient'

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

export default function ListPageLayout<Row>(props: ListPageLayoutProps<Row>) {
  return <ListPageLayoutClient {...props} />
}
