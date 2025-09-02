import PageShell from '@/components/layouts/PageShell'
import { pharmacyNavItems } from '@/config/pharmacyNav'

export const dynamic = 'force-dynamic'

export default async function PharmacyReportsPerformancePage() {
  return (
    <PageShell sidebarItems={pharmacyNavItems} headerTitle="Reports" headerSubtitle="Performance">
      <div className="p-6">
        <div className="rounded-lg border border-rose-200/70 dark:border-rose-800/40 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-2">Performance – Coming Soon</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">Productivity and SLA metrics will be available within 48 hours.</p>
        </div>
      </div>
    </PageShell>
  )
}

