import RoleDashboard, { Stat } from '../../components/RoleDashboard'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const loadStats = async (): Promise<Stat[]> => {
    const [wh, berjalan, ttd, truk] = await Promise.all([
      supabase.from('warehouses').select('id'),
      supabase.from('projects').select('id').not('status', 'eq', 'selesai'),
      supabase.from('projects').select('id').in('status', ['cek_bahan_baku', 'qc_foto']),
      supabase.from('trucks').select('id'),
    ])
    return [
      { value: wh.data?.length ?? 0, label: 'Warehouse', icon: 'business-outline' },
      { value: berjalan.data?.length ?? 0, label: 'Pesanan Berjalan', icon: 'trending-up-outline' },
      { value: ttd.data?.length ?? 0, label: 'Menunggu TTD', icon: 'create-outline' },
      { value: truk.data?.length ?? 0, label: 'Unit Truk', icon: 'car-outline' },
    ]
  }
  return (
    <RoleDashboard
      role="kepala_wh"
      greeting={`Halo ${user?.full_name ?? ''} — kelola gudang & pesanan.`}
      loadStats={loadStats}
    />
  )
}
