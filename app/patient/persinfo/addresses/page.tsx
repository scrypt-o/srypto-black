import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'

export const dynamic = 'force-dynamic'

export default async function AddressesPage() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_patient__persinfo__addresses')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = data ?? []

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Addresses">
      <div className="p-4">
        {error && <div className="text-red-600 mb-3">Failed to load addresses</div>}
        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2">Type</th>
                <th className="p-2">Line 1</th>
                <th className="p-2">City</th>
                <th className="p-2">Postal Code</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.address_id} className="border-t">
                  <td className="p-2">{r.address_type ?? '-'}</td>
                  <td className="p-2">{r.line1 ?? '-'}</td>
                  <td className="p-2">{r.city ?? '-'}</td>
                  <td className="p-2">{r.postal_code ?? '-'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="p-3 text-gray-500" colSpan={4}>No addresses.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}

