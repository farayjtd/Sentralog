import RoleDashboard, { Stat } from '../../components/RoleDashboard'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const loadStats = async (): Promise<Stat[]> => {
    const { data } = await supabase.from('deliveries').select('id, status').eq('driver_id', user!.id)
    const arr = data ?? []
    const aktif = arr.filter((d: any) => ['disiapkan', 'driver_acc', 'berangkat'].includes(d.status)).length
    return [
      { value: aktif, label: 'Pengiriman Aktif', icon: 'navigate-outline' },
      { value: arr.length, label: 'Total Pengiriman', icon: 'cube-outline' },
    ]
  }
  return (
    <RoleDashboard
      role="sopir"
      greeting={`Halo ${user?.full_name ?? ''} — kelola pengiriman Anda.`}
      loadStats={loadStats}
    />
  )
}
