import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { pharmacyNavItems } from '@/config/pharmacyNav'

export const dynamic = 'force-dynamic'

export default async function PharmacyRxInboxPage() {
  const supabase = await getServerClient()
  
  // Get current user's pharmacy (simplified for demo)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get prescriptions in queue for this pharmacy
  // For demo, we'll show all pending prescriptions
  const { data: queue, error } = await supabase
    .from('v_prescription_pharmacy_queue')
    .select(`
      *,
      patient__presc__prescriptions (
        prescription_id,
        prescription_date,
        doctor_name,
        diagnosis,
        status,
        created_at
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <PageShell sidebarItems={pharmacyNavItems} headerTitle="Prescriptions" headerSubtitle="Inbox">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Prescription Requests</h1>
          <p className="text-sm text-gray-600 mt-1">
            New prescription requests from patients in your area
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-800">Failed to load prescriptions</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queue && queue.length > 0 ? (
                queue.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.patient__presc__prescriptions?.prescription_date 
                        ? new Date(item.patient__presc__prescriptions.prescription_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.patient__presc__prescriptions?.doctor_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.patient__presc__prescriptions?.diagnosis || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.distance_km ? `${Number(item.distance_km).toFixed(1)} km` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {item.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Quote
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No prescription requests at this time
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Patients submit prescriptions for quotes</li>
            <li>• You receive requests from patients within your service area</li>
            <li>• Review and provide competitive quotes</li>
            <li>• Patients choose the best offer</li>
          </ul>
        </div>
      </div>
    </PageShell>
  )
}