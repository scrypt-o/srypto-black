import { getServerClient } from '@/lib/supabase-server'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import { patientNavItems } from '@/config/patientNav'
import DocumentsUploader from '@/components/features/patient/persinfo/DocumentsUploader'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_patient__persinfo__documents')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = data ?? []

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Documents">
      <div className="p-4 space-y-4">
        {error && <div className="text-red-600 mb-3">Failed to load documents</div>}
        <DocumentsUploader />
        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2">Type</th>
                <th className="p-2">Number</th>
                <th className="p-2">Issued</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.document_id} className="border-t">
                  <td className="p-2">{r.document_type ?? '-'}</td>
                  <td className="p-2">{r.document_number ?? '-'}</td>
                  <td className="p-2">{r.issued_at ? new Date(r.issued_at).toLocaleDateString() : '-'}</td>
                  <td className="p-2 text-right">
                    <a className="text-blue-600 hover:underline mr-3" href={`/api/patient/personal-info/documents/${r.document_id}/download`}>Download</a>
                    <form method="post" action={`/api/patient/personal-info/documents/${r.document_id}`} onSubmit={(e) => { e.preventDefault(); fetch(`/api/patient/personal-info/documents/${r.document_id}`, { method: 'DELETE' }).then(() => (window as any).location?.reload()); }} className="inline">
                      <button type="submit" className="text-red-600 hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="p-3 text-gray-500" colSpan={3}>No documents.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ListPageLayout>
  )
}
