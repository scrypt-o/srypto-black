import { getServerClient, getUser } from '@/lib/supabase-server'
import { pharmacyNavItems } from '@/config/pharmacyNav'
import PageShell from '@/components/layouts/PageShell'
import ListViewLayout, { type ListItem } from '@/components/layouts/ListViewLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PharmacyConversationPage({ params }: { params: Promise<{ with: string }> }) {
  const supabase = await getServerClient()
  const user = await getUser()
  const { with: withId } = await params

  const { data, error } = await supabase
    .from('v_comm__communications')
    .select('*')
    .eq('comm_type', 'message')
    .or(`and(user_from.eq.${user?.id},user_to.eq.${withId}),and(user_from.eq.${withId},user_to.eq.${user?.id})`)
    .order('created_at', { ascending: false })
    .limit(200)

  const items: ListItem[] = (error ? [] : (data || [])).map((row: any) => ({
    id: row.comm_id,
    title: row.body ? String(row.body) : '(no text)',
    thirdColumn: row.created_at,
    data: row,
  }))

  return (
    <PageShell sidebarItems={pharmacyNavItems} headerTitle="Conversation" headerSubtitle="Messages">
      <div className="mb-3">
        <Link href="/pharmacy/comm/inbox" className="text-blue-600">← Back to Inbox</Link>
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
    </PageShell>
  )
}
