import PageShell from '@/components/layouts/PageShell'
import { pharmacyNavItems } from '@/config/pharmacyNav'

export const dynamic = 'force-dynamic'

export default async function PharmacySettingsNotificationsPage() {
  return (
    <PageShell sidebarItems={pharmacyNavItems} headerTitle="Settings" headerSubtitle="Notifications">
      <div className="p-6">
        <div className="rounded-lg border border-rose-200/70 dark:border-rose-800/40 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-2">Notifications – Coming Soon</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">Configure alerts and notifications within 48 hours.</p>
        </div>
      </div>
    </PageShell>
  )
}

