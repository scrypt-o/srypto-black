import { getUserOrNull } from '@/lib/supabase-server'
import AddressPageLayoutClient, { type AddressPageLayoutClientProps } from './AddressPageLayoutClient'
import type { NavItem } from '@/components/layouts/PatientSidebar'

export type AddressPageLayoutProps = {
  sidebarItems: NavItem[]
  sidebarTitle?: string
  headerTitle?: string
  headerSubtitle?: string
  showSidebar?: boolean
  showHeader?: boolean
  showMobileMenu?: boolean
  style?: 'flat' | 'elevated' | 'glass'
  accent?: 'blue' | 'emerald' | 'healthcare'
  children?: React.ReactNode
}

export default async function AddressPageLayout(props: AddressPageLayoutProps) {
  // Could pass user info if needed later for header avatar, etc.
  await getUserOrNull()
  return <AddressPageLayoutClient {...(props as AddressPageLayoutClientProps)} />
}

