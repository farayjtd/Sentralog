import RoleDashboard, { Stat } from '../../components/RoleDashboard'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const loadStats = async (): Promise<Stat[]> => {
    const [jadwal, jadi] = await Promise.all([
      supabase.from('projects').select('id').eq('mandor_id', user!.id).not('status', 'eq', 'selesai'),
      supabase.from('projects').select('id').in('status', ['qc_foto', 'menunggu_acc_ts', 'pengiriman', 'pemasangan', 'foto_hasil', 'selesai']),
    ])
    return [
      { value: jadwal.data?.length ?? 0, label: 'Jadwal Saya', icon: 'calendar-clear-outline' },
      { value: jadi.data?.length ?? 0, label: 'Barang Jadi', icon: 'checkmark-done-outline' },
    ]
  }
  return (
    <RoleDashboard
      role="mandor"
      greeting={`Halo ${user?.full_name ?? ''} — pantau pengerjaan lapangan.`}
      loadStats={loadStats}
    />
  )
}
