import { getServerClient, getUser } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import { type ListItem } from '@/components/layouts/ListViewLayout'
import InboxList from '@/components/features/comm/InboxList'

export const dynamic = 'force-dynamic'

export default async function PatientInboxPage() {
  const supabase = await getServerClient()
  const user = await getUser()

  const { data, error } = await supabase
    .from('v_patient__comm__messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  let rows = data || []
  if (error) {
    // Fallback to legacy view if patient-scoped view not present yet
    const { data: legacy, error: legacyError } = await supabase
      .from('v_comm__communications')
      .select('*')
      .eq('comm_type', 'message')
      .order('created_at', { ascending: false })
      .limit(100)
    rows = legacyError ? [] : (legacy || [])
  }

  const items: ListItem[] = rows.map((row: any) => ({
    id: row.comm_id,
    title: row.subject || (row.body ? String(row.body).slice(0, 60) : '(no subject)'),
    thirdColumn: row.created_at,
    data: row,
  }))

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Inbox" headerSubtitle="Messages">
      <InboxList items={items} currentUserId={user!.id} />
      <div className="mt-4 text-right">
        <form action="" method="get">
          <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Refresh</button>
        </form>
      </div>
    </ListPageLayout>
  )
}
