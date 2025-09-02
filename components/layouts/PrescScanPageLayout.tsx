import { getUserOrNull } from '@/lib/supabase-server'
import PrescScanPageLayoutClient, { type PrescScanPageLayoutClientProps } from './PrescScanPageLayoutClient'
import type { NavItem } from '@/components/layouts/PatientSidebar'

export type PrescScanPageLayoutProps = {
  sidebarItems: NavItem[]
  sidebarTitle?: string
  headerTitle?: string
  step?: 'camera' | 'analyzing' | 'results' | 'error'
  children?: React.ReactNode
}

export default async function PrescScanPageLayout(props: PrescScanPageLayoutProps) {
  await getUserOrNull()
  return <PrescScanPageLayoutClient {...(props as PrescScanPageLayoutClientProps)} />
}

