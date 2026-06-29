import RoleDashboard, { Stat } from '../../components/RoleDashboard'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const loadStats = async (): Promise<Stat[]> => {
    const [wh, peg, truk, proj, sel] = await Promise.all([
      supabase.from('warehouses').select('id'),
      supabase.from('users').select('id').neq('role', 'admin').neq('role', 'owner'),
      supabase.from('trucks').select('id'),
      supabase.from('projects').select('id'),
      supabase.from('projects').select('id').eq('status', 'selesai'),
    ])
    return [
      { value: wh.data?.length ?? 0, label: 'Warehouse', icon: 'business-outline' },
      { value: peg.data?.length ?? 0, label: 'Total Pegawai', icon: 'people-outline' },
      { value: truk.data?.length ?? 0, label: 'Unit Truk', icon: 'car-outline' },
      { value: proj.data?.length ?? 0, label: 'Total Pesanan', icon: 'document-text-outline' },
      { value: sel.data?.length ?? 0, label: 'Pesanan Selesai', icon: 'checkmark-done-outline' },
    ]
  }
  return (
    <RoleDashboard
      role="owner"
      greeting={`Halo ${user?.full_name ?? ''} — ringkasan operasional Sentralog.`}
      loadStats={loadStats}
    />
  )
}
