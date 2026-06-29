import AppShell from '../../components/AppShell'
import DataList from '../../components/DataList'
import { supabase } from '../../lib/supabase'
import { statusBadge, PROJECT_STATUS } from '../../lib/status'
const FLOW = Object.keys(PROJECT_STATUS)

const ACCENT = '#7c3aed'

export default function CekProgres() {
  interface P { id: string; name: string; status: string; client_name: string; warehouse?: { name: string } }
  const fetcher = async (): Promise<P[]> => {
    const { data } = await supabase.from('projects').select('*, warehouse:warehouse_id(name)').not('status', 'eq', 'selesai').order('created_at', { ascending: false })
    return data ?? []
  }
  const step = (s: string) => { const i = FLOW.indexOf(s); return i < 0 ? '—' : `Tahap ${i + 1}/${FLOW.length}` }
  return (
    <AppShell role="kepala_wh" title="Progres Pesanan" subtitle="Pesanan yang sedang berjalan.">
      <DataList<P>
        accent={ACCENT}
        icon="trending-up-outline"
        countNoun="pesanan"
        fetcher={fetcher}
        titleOf={(p) => p.name}
        subtitleOf={(p) => p.client_name}
        badgeOf={(p) => statusBadge(p.status)}
        columns={[
          { label: 'Warehouse', render: (p) => p.warehouse?.name ?? '—' },
          { label: 'Progres', render: (p) => step(p.status) },
        ]}
        emptyTitle="Tidak ada pesanan berjalan"
        emptyIcon="trending-up-outline"
      />
    </AppShell>
  )
}
