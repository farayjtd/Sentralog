import AppShell from '../../components/AppShell'
import DataList from '../../components/DataList'
import { supabase } from '../../lib/supabase'
import { statusBadge } from '../../lib/status'
import { useAuthStore } from '../../stores/authStore'

const ACCENT = '#dc2626'

export default function CekJadwal() {
  const { user } = useAuthStore()
  interface P { id: string; name: string; status: string; client_name: string; client_address?: string; deadline?: string; warehouse?: { name: string } }
  const fetcher = async (): Promise<P[]> => {
    const { data } = await supabase.from('projects').select('*, warehouse:warehouse_id(name)').eq('mandor_id', user!.id).not('status', 'eq', 'selesai').order('deadline')
    return data ?? []
  }
  return (
    <AppShell role="mandor" title="Jadwal Pengerjaan" subtitle="Pesanan yang ditugaskan ke Anda.">
      <DataList<P>
        accent={ACCENT}
        icon="calendar-clear-outline"
        countNoun="pesanan"
        fetcher={fetcher}
        titleOf={(p) => p.name}
        subtitleOf={(p) => p.client_name}
        badgeOf={(p) => statusBadge(p.status)}
        columns={[
          { label: 'Lokasi', render: (p) => p.client_address ?? '—' },
          { label: 'Warehouse', render: (p) => p.warehouse?.name ?? '—' },
          { label: 'Deadline', render: (p) => p.deadline ? new Date(p.deadline).toLocaleDateString('id-ID') : '—' },
        ]}
        emptyTitle="Belum ada penugasan"
        emptyHint="Pesanan yang ditugaskan ke Anda akan muncul di sini."
        emptyIcon="calendar-clear-outline"
      />
    </AppShell>
  )
}
