import AppShell from '../../components/AppShell'
import DataList from '../../components/DataList'
import { supabase } from '../../lib/supabase'
import { statusBadge } from '../../lib/status'

const ACCENT = '#7c3aed'

export default function CekSpek() {
  interface P { id: string; name: string; status: string; client_name: string; spec_notes?: string; deadline?: string; warehouse?: { name: string } }
  const fetcher = async (): Promise<P[]> => {
    const { data } = await supabase.from('projects').select('*, warehouse:warehouse_id(name)').order('created_at', { ascending: false })
    return data ?? []
  }
  return (
    <AppShell role="kepala_wh" title="Spek Pesanan" subtitle="Spesifikasi tiap pesanan.">
      <DataList<P>
        accent={ACCENT}
        icon="document-text-outline"
        countNoun="pesanan"
        fetcher={fetcher}
        titleOf={(p) => p.name}
        subtitleOf={(p) => p.client_name}
        badgeOf={(p) => statusBadge(p.status)}
        columns={[
          { label: 'Warehouse', render: (p) => p.warehouse?.name ?? '—' },
          { label: 'Deadline', render: (p) => p.deadline ? new Date(p.deadline).toLocaleDateString('id-ID') : '—' },
          { label: 'Spesifikasi', render: (p) => p.spec_notes ?? 'Tidak ada catatan' },
        ]}
        emptyTitle="Belum ada pesanan"
        emptyIcon="document-text-outline"
      />
    </AppShell>
  )
}
