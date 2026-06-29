import AppShell from '../../components/AppShell'
import DataList from '../../components/DataList'
import { supabase } from '../../lib/supabase'
import { statusBadge } from '../../lib/status'
const JADI = ['qc_foto','menunggu_acc_ts','pengiriman','pemasangan','foto_hasil','selesai']

const ACCENT = '#dc2626'

export default function CekBarangJadi() {
  interface P { id: string; name: string; status: string; client_name: string; created_at: string; warehouse?: { name: string } }
  const fetcher = async (): Promise<P[]> => {
    const { data } = await supabase.from('projects').select('*, warehouse:warehouse_id(name)').in('status', JADI).order('created_at', { ascending: false })
    return data ?? []
  }
  return (
    <AppShell role="mandor" title="Barang Jadi" subtitle="Produksi yang telah selesai.">
      <DataList<P>
        accent={ACCENT}
        icon="checkmark-done-outline"
        countNoun="barang"
        fetcher={fetcher}
        titleOf={(p) => p.name}
        subtitleOf={(p) => p.client_name}
        badgeOf={(p) => statusBadge(p.status)}
        columns={[
          { label: 'Warehouse', render: (p) => p.warehouse?.name ?? '—' },
          { label: 'Tanggal', render: (p) => new Date(p.created_at).toLocaleDateString('id-ID') },
        ]}
        emptyTitle="Belum ada barang jadi"
        emptyIcon="checkmark-done-outline"
      />
    </AppShell>
  )
}
