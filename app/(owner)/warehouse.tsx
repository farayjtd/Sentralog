import AppShell from '../../components/AppShell'
import DataList from '../../components/DataList'
import { supabase } from '../../lib/supabase'

const ACCENT = '#047857'

export default function CekWarehouse() {
  interface WH { id: string; name: string; address?: string; lat?: number; lng?: number; is_active: boolean; head_user?: { full_name: string } }
  const fetcher = async (): Promise<WH[]> => {
    const { data } = await supabase.from('warehouses').select('*, head_user:head_user_id(full_name)').order('name')
    return data ?? []
  }
  return (
    <AppShell role="owner" title="Data Warehouse" subtitle="Daftar gudang & lokasi.">
      <DataList<WH>
        accent={ACCENT}
        icon="business-outline"
        countNoun="warehouse"
        fetcher={fetcher}
        titleOf={(w) => w.name}
        subtitleOf={(w) => w.address ?? 'Alamat belum diisi'}
        badgeOf={(w) => w.is_active ? { text: 'Aktif', color: '#059669', bg: '#ecfdf5' } : { text: 'Nonaktif', color: '#dc2626', bg: '#fef2f2' }}
        columns={[
          { label: 'Kepala WH', render: (w) => w.head_user?.full_name ?? 'Belum ditentukan' },
          { label: 'Koordinat', render: (w) => (w.lat && w.lng) ? `${w.lat}, ${w.lng}` : 'Belum diset' },
        ]}
        emptyTitle="Belum ada warehouse"
        emptyHint="Data warehouse akan muncul di sini."
        emptyIcon="business-outline"
      />
    </AppShell>
  )
}
