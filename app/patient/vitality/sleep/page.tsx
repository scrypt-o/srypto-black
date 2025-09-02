import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import ListViewLayout, { type ListItem } from '@/components/layouts/ListViewLayout'

export const dynamic = 'force-dynamic'

export default async function SleepListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await getServerClient()
  const spRaw = await searchParams

  const SortByEnum = z.enum(['sleep_date', 'created_at', 'sleep_quality_rating'])
  const SortDirEnum = z.enum(['asc', 'desc'])
  const PageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    min_quality: z.coerce.number().int().min(1).max(5).optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    sort_by: SortByEnum.optional(),
    sort_dir: SortDirEnum.optional(),
  })

  const sp = PageSchema.parse({
    page: (spRaw.page as string) ?? '1',
    pageSize: (spRaw.pageSize as string) ?? '20',
    search: (spRaw.search as string) || undefined,
    min_quality: (spRaw.min_quality as string) || undefined,
    date_from: (spRaw.date_from as string) || undefined,
    date_to: (spRaw.date_to as string) || undefined,
    sort_by: (spRaw.sort_by as string) || undefined,
    sort_dir: (spRaw.sort_dir as string) || undefined,
  })

  let query = supabase
    .from('v_patient__vitality__sleep')
    .select('*', { count: 'exact' })

  const sortBy = sp.sort_by ?? 'sleep_date'
  const sortDir = sp.sort_dir ?? 'desc'
  query = query.order(sortBy, { ascending: sortDir === 'asc' })

  if (sp.search) {
    query = query.or(`notes.ilike.%${sp.search}%,sleep_aids_used.ilike.%${sp.search}%`)
  }
  if (sp.min_quality) {
    query = query.gte('sleep_quality_rating', sp.min_quality)
  }
  if (sp.date_from) {
    query = query.gte('sleep_date', sp.date_from)
  }
  if (sp.date_to) {
    query = query.lte('sleep_date', sp.date_to)
  }

  const from = (sp.page - 1) * sp.pageSize
  const to = from + sp.pageSize - 1
  query = query.range(from, to)

  const { data, error } = await query

  const items: ListItem[] = (error ? [] : (data || [])).map((row: any) => ({
    id: row.sleep_id,
    title: `Sleep on ${row.sleep_date}`,
    thirdColumn: row.sleep_duration_hours ? `${row.sleep_duration_hours} h` : row.created_at,
    severity: typeof row.sleep_quality_rating === 'number' && row.sleep_quality_rating <= 2 ? 'moderate' : 'normal',
    data: row,
  }))

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Sleep" headerSubtitle="Vitality">
      <ListViewLayout
        items={items}
        pageTitle="Sleep"
        searchPlaceholder="Search notes or sleep aids..."
        thirdColumnLabel="Duration"
        showInlineEdit={false}
        showSecondaryLine={false}
        previewPolish
      />
    </ListPageLayout>
  )
}

