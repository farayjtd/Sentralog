import RoleDashboard, { Stat } from '../../components/RoleDashboard'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const loadStats = async (): Promise<Stat[]> => {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase.from('attendances').select('id, check_in_at').eq('user_id', user!.id).eq('date', today).maybeSingle()
    return [
      { value: data?.check_in_at ? 'Sudah' : 'Belum', label: 'Absen Hari Ini', icon: 'calendar-outline' },
    ]
  }
  return (
    <RoleDashboard
      role="tukang"
      greeting={`Halo ${user?.full_name ?? ''} — selamat bekerja.`}
      loadStats={loadStats}
    />
  )
}
