import AppShell from '../../components/AppShell'
import DataList from '../../components/DataList'
import { supabase } from '../../lib/supabase'
import { truckBadge } from '../../lib/status'

const ACCENT = '#047857'

export default function CekTruk() {
  interface Truck { id: string; plate_number: string; type: string; status: string; last_updated_at?: string; warehouse?: { name: string } }
  const fetcher = async (): Promise<Truck[]> => {
    const { data } = await supabase.from('trucks').select('*, warehouse:warehouse_id(name)').order('plate_number')
    return data ?? []
  }
  return (
    <AppShell role="owner" title="Unit Truk" subtitle="Armada & statusnya.">
      <DataList<Truck>
        accent={ACCENT}
        icon="car-outline"
        countNoun="unit"
        fetcher={fetcher}
        titleOf={(t) => t.plate_number}
        subtitleOf={(t) => t.type ?? 'Truk'}
        badgeOf={(t) => truckBadge(t.status)}
        columns={[
          { label: 'Warehouse', render: (t) => t.warehouse?.name ?? '—' },
          { label: 'Update Terakhir', render: (t) => t.last_updated_at ? new Date(t.last_updated_at).toLocaleString('id-ID') : '—' },
        ]}
        emptyTitle="Belum ada unit truk"
        emptyIcon="car-outline"
      />
    </AppShell>
  )
}
