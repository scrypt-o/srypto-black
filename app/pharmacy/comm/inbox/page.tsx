import { getServerClient } from '@/lib/supabase-server'
import { pharmacyNavItems } from '@/config/pharmacyNav'
import PageShell from '@/components/layouts/PageShell'
import ListViewLayout, { type ListItem } from '@/components/layouts/ListViewLayout'

export const dynamic = 'force-dynamic'

export default async function PharmacyInboxPage() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_comm__communications')
    .select('*')
    .eq('comm_type', 'message')
    .order('created_at', { ascending: false })
    .limit(100)

  const items: ListItem[] = (error ? [] : (data || [])).map((row: any) => ({
    id: row.comm_id,
    title: row.subject || (row.body ? String(row.body).slice(0, 60) : '(no subject)'),
    thirdColumn: row.created_at,
    data: row,
  }))

  return (
    <PageShell sidebarItems={pharmacyNavItems} headerTitle="Inbox" headerSubtitle="Messages">
      <ListViewLayout
        items={items}
        pageTitle="Messages Inbox"
        searchPlaceholder="Search messages..."
        showSecondaryLine={false}
        showInlineEdit={false}
      />
      <div className="mt-4 text-right">
        <form action="" method="get">
          <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Refresh</button>
        </form>
      </div>
    </PageShell>
  )
}

