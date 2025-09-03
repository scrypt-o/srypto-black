import PageShell from '@/components/layouts/PageShell'
import { pharmacyNavItems } from '@/config/pharmacyNav'

export const dynamic = 'force-dynamic'

export default function PharmacyRxAcceptedPage() {
  return (
    <PageShell sidebarItems={pharmacyNavItems} headerTitle="Prescriptions" headerSubtitle="Accepted">
      <div className="p-6">
        <div className="rounded-lg border border-rose-200/70 dark:border-rose-800/40 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-2">Accepted – Coming Soon</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">This view follows the Patient list pattern. Ready within 48 hours.</p>
        </div>
      </div>
    </PageShell>
  )
}
