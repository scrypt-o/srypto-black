import { getServerClient, getUser } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import ListViewLayout, { type ListItem } from '@/components/layouts/ListViewLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ConversationPage({ params }: { params: Promise<{ with: string }> }) {
  const supabase = await getServerClient()
  const user = await getUser()
  const { with: withId } = await params

  const { data, error } = await supabase
    .from('v_patient__comm__messages')
    .select('*')
    .or(`user_from.eq.${withId},user_to.eq.${withId}`)
    .order('created_at', { ascending: false })
    .limit(200)
  let rows = data || []
  if (error) {
    const { data: legacy, error: legacyError } = await supabase
      .from('comm__communications')
      .select('*')
      .eq('comm_type', 'message')
      .or(`and(user_from.eq.${user?.id},user_to.eq.${withId}),and(user_from.eq.${withId},user_to.eq.${user?.id})`)
      .order('created_at', { ascending: false })
      .limit(200)
    rows = legacyError ? [] : (legacy || [])
  }

  const items: ListItem[] = rows.map((row: any) => ({
    id: row.comm_id,
    title: row.body ? String(row.body) : '(no text)',
    thirdColumn: row.created_at,
    data: row,
  }))

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Conversation" headerSubtitle="Messages">
      <div className="mb-3">
        <Link href="/patient/comm/inbox" className="text-blue-600">← Back to Inbox</Link>
      </div>
      <ListViewLayout
        items={items}
        pageTitle="Conversation"
        searchPlaceholder="Search this conversation..."
        showSecondaryLine={false}
        showInlineEdit={false}
      />
      <div className="mt-4 text-right">
        <form action="" method="get">
          <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Refresh</button>
        </form>
      </div>
    </ListPageLayout>
  )
}
