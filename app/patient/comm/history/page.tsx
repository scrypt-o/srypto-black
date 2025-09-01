import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import ListViewLayout, { type ListItem } from '@/components/layouts/ListViewLayout'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const supabase = await getServerClient()

  // Prefer patient-scoped view; fallback to generic communications view
  const { data, error } = await supabase
    .from('v_patient__comm__communications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  let rows = data || []
  if (error) {
    const { data: legacy, error: legacyError } = await supabase
      .from('v_comm__communications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    rows = legacyError ? [] : (legacy || [])
  }

  const items: ListItem[] = rows.map((row: any) => ({
    id: row.comm_id,
    title: row.subject || (row.body ? String(row.body).slice(0, 60) : '(no subject)'),
    thirdColumn: row.created_at,
    data: row,
  }))

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="History" headerSubtitle="Messages">
      <ListViewLayout
        items={items}
        pageTitle="Message History"
        searchPlaceholder="Search communications..."
        showSecondaryLine={false}
        showInlineEdit={false}
        exportEnabled
      />
      <div className="mt-4 text-right">
        <form action="" method="get">
          <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Refresh</button>
        </form>
      </div>
    </ListPageLayout>
  )
}

