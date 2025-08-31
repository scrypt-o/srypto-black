import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'

export const dynamic = 'force-dynamic'

export default async function ActivePrescriptionsPage() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_patient__presc__prescriptions')
    .select('*')
    .order('created_at', { ascending: false })

  const items = data ?? []

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Prescriptions" >
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">My Prescriptions</h1>
        {error && (
          <div className="text-red-600 mb-3">Failed to load prescriptions</div>
        )}
        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2">Created</th>
                <th className="p-2">Status</th>
                <th className="p-2">Confidence</th>
                <th className="p-2">Medications</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.prescription_id} className="border-t">
                  <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">{r.analysis_data?.overallConfidence ?? '-'}</td>
                  <td className="p-2">{Array.isArray(r.analysis_data?.medications) ? r.analysis_data.medications.length : 0}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="p-3 text-gray-500" colSpan={4}>No prescriptions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}

