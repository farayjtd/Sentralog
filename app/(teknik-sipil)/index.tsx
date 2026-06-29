import RoleDashboard, { Stat } from '../../components/RoleDashboard'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const loadStats = async (): Promise<Stat[]> => {
    const [total, spek, jalan, bahan] = await Promise.all([
      supabase.from('projects').select('id'),
      supabase.from('projects').select('id').eq('status', 'input_spek'),
      supabase.from('projects').select('id').not('status', 'eq', 'selesai'),
      supabase.from('materials').select('id').eq('created_by', user!.id),
    ])
    return [
      { value: total.data?.length ?? 0, label: 'Total Pesanan', icon: 'document-text-outline' },
      { value: spek.data?.length ?? 0, label: 'Tahap Input Spek', icon: 'create-outline' },
      { value: jalan.data?.length ?? 0, label: 'Sedang Berjalan', icon: 'trending-up-outline' },
      { value: bahan.data?.length ?? 0, label: 'Bahan Diinput', icon: 'cube-outline' },
    ]
  }
  return <RoleDashboard role="teknik_sipil" greeting={`Halo ${user?.full_name ?? ''} — kelola spesifikasi & bahan pesanan.`} loadStats={loadStats} />
}
