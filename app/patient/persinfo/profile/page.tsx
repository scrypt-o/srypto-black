import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_patient__persinfo__profile')
    .select('*')
    .single()

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Profile">
      <div className="p-4">
        {error && <div className="text-red-600 mb-3">Failed to load profile</div>}
        {data ? (
          <div className="bg-white border rounded p-4 space-y-2 text-sm">
            {Object.entries(data).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2">
                <div className="font-medium text-gray-600">{k}</div>
                <div className="col-span-2 text-gray-900 break-words">{String(v ?? '')}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600">No profile data.</div>
        )}
      </div>
    </PageShell>
  )
}

