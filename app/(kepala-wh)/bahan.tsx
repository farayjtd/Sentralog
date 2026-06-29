import AppShell from '../../components/AppShell'
import DataList from '../../components/DataList'
import { supabase } from '../../lib/supabase'

const ACCENT = '#7c3aed'

export default function CekBahan() {
  interface M { id: string; name: string; qty: number; unit: string; category: string; note?: string; created_at: string; warehouse?: { name: string }; creator?: { full_name: string } }
  const fetcher = async (): Promise<M[]> => {
    const { data } = await supabase.from('materials').select('*, warehouse:warehouse_id(name), creator:created_by(full_name)').order('created_at', { ascending: false })
    return data ?? []
  }
  return (
    <AppShell role="kepala_wh" title="Bahan Baku" subtitle="Bahan baku terdaftar.">
      <DataList<M>
        accent={ACCENT}
        icon="cube-outline"
        countNoun="item"
        fetcher={fetcher}
        titleOf={(m) => m.name}
        subtitleOf={(m) => `${m.qty} ${m.unit} · ${m.category === 'baku' ? 'Bahan Baku' : 'Bahan Mentah'}`}
        columns={[
          { label: 'Warehouse', render: (m) => m.warehouse?.name ?? '—' },
          { label: 'Diinput oleh', render: (m) => m.creator?.full_name ?? '—' },
          { label: 'Tanggal', render: (m) => new Date(m.created_at).toLocaleDateString('id-ID') },
          { label: 'Catatan', render: (m) => m.note ?? '—' },
        ]}
        emptyTitle="Belum ada data bahan"
        emptyHint="Jalankan migrasi 'materials' lalu input dari menu Teknik Sipil."
        emptyIcon="cube-outline"
      />
    </AppShell>
  )
}
