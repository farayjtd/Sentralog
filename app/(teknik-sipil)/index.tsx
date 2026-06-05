import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, StatusBar, Platform, TouchableOpacity
} from 'react-native'
import { useRouter } from 'expo-router'
import TeknikSipilSidebar from '../../components/TeknikSipilSidebar'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface WHSummary {
  id: string
  name: string
  active_count: number
  total_count: number
}

interface ProjectSummary {
  total: number
  aktif: number
  selesai: number
  menunggu_acc: number
}

export default function TeknikSipilDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [whSummary, setWhSummary] = useState<WHSummary[]>([])
  const [projectSummary, setProjectSummary] = useState<ProjectSummary>({
    total: 0, aktif: 0, selesai: 0, menunggu_acc: 0
  })

  useEffect(() => {
    if (user) {
      fetchDashboard()
    }
  }, [user])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      // Fetch semua project milik user ini
      const { data: projects } = await supabase
        .from('projects')
        .select('id, status, warehouse_id')
        .eq('created_by', user!.id)

      if (projects) {
        const aktif = projects.filter(p => !['selesai'].includes(p.status)).length
        const selesai = projects.filter(p => p.status === 'selesai').length
        const menunggu_acc = projects.filter(p =>
          ['menunggu_acc_ts', 'foto_hasil'].includes(p.status)
        ).length

        setProjectSummary({
          total: projects.length,
          aktif,
          selesai,
          menunggu_acc,
        })
      }

      // Fetch warehouse summary
      const { data: warehouses } = await supabase
        .from('warehouses')
        .select('id, name')
        .eq('is_active', true)

      if (warehouses) {
        const { data: allProjects } = await supabase
          .from('projects')
          .select('warehouse_id, status')

        const summary = warehouses.map(wh => {
          const whProjects = allProjects?.filter(p => p.warehouse_id === wh.id) ?? []
          return {
            id: wh.id,
            name: wh.name,
            active_count: whProjects.filter(p => p.status !== 'selesai').length,
            total_count: whProjects.length,
          }
        })
        setWhSummary(summary.sort((a, b) => a.active_count - b.active_count))
      }
    } catch (e) {
      console.log('Error fetching dashboard:', e)
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />
      <View style={[styles.header, { backgroundColor: '#1565c0' }]}>
        <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <View style={styles.body}>
        {sidebarOpen && <TeknikSipilSidebar />}
        <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>

            {/* Greeting */}
            <View style={styles.greetBox}>
              <Text style={styles.greetText}>Selamat datang,</Text>
              <Text style={styles.greetName}>{user?.full_name} 👋</Text>
            </View>

            {/* Project Summary */}
            <Text style={styles.sectionTitle}>Ringkasan Project Saya</Text>
            {loading ? (
              <ActivityIndicator color="#1565c0" />
            ) : (
              <View style={styles.summaryGrid}>
                <View style={[styles.summaryCard, { borderLeftColor: '#1565c0' }]}>
                  <Text style={styles.summaryNum}>{projectSummary.total}</Text>
                  <Text style={styles.summaryLabel}>Total Project</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#2e7d32' }]}>
                  <Text style={styles.summaryNum}>{projectSummary.aktif}</Text>
                  <Text style={styles.summaryLabel}>Sedang Berjalan</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#f57f17' }]}>
                  <Text style={[styles.summaryNum, projectSummary.menunggu_acc > 0 && { color: '#f57f17' }]}>
                    {projectSummary.menunggu_acc}
                  </Text>
                  <Text style={styles.summaryLabel}>Menunggu ACC</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#888' }]}>
                  <Text style={styles.summaryNum}>{projectSummary.selesai}</Text>
                  <Text style={styles.summaryLabel}>Selesai</Text>
                </View>
              </View>
            )}

            {/* Notif ACC */}
            {projectSummary.menunggu_acc > 0 && (
              <TouchableOpacity
                style={styles.notifBox}
                onPress={() => router.push('/(teknik-sipil)/project' as any)}
              >
                <Text style={styles.notifIcon}>🔔</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle}>Ada {projectSummary.menunggu_acc} project menunggu ACC kamu</Text>
                  <Text style={styles.notifSub}>Tap untuk lihat dan ACC sekarang</Text>
                </View>
                <Text style={styles.notifArrow}>›</Text>
              </TouchableOpacity>
            )}

            {/* Warehouse Summary */}
            <Text style={styles.sectionTitle}>Kondisi Warehouse</Text>
            <Text style={styles.sectionSub}>Diurutkan dari yang paling sepi — pilih WH yang sepi untuk project baru</Text>
            {whSummary.map(wh => {
              const isBusy = wh.active_count >= 3
              const isMedium = wh.active_count >= 1 && wh.active_count < 3
              const color = isBusy ? '#c62828' : isMedium ? '#f57f17' : '#2e7d32'
              const label = isBusy ? 'Sibuk' : isMedium ? 'Sedang' : 'Sepi'
              const pct = Math.min((wh.active_count / 5) * 100, 100)
              return (
                <View key={wh.id} style={styles.whCard}>
                  <View style={styles.whCardTop}>
                    <Text style={styles.whName}>🏭 {wh.name}</Text>
                    <View style={[styles.whStatusBadge, { backgroundColor: color + '20' }]}>
                      <Text style={[styles.whStatusText, { color }]}>{label}</Text>
                    </View>
                  </View>
                  <View style={styles.whBarBg}>
                    <View style={[styles.whBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.whCount}>
                    {wh.active_count} project aktif · {wh.total_count} total
                  </Text>
                </View>
              )
            })}

          </View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { paddingTop: Platform.OS === 'android' ? 48 : 60, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { padding: 4 },
  menuIcon: { fontSize: 20, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1 },
  content: { padding: 20 },
  greetBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20 },
  greetText: { fontSize: 13, color: '#888' },
  greetName: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginBottom: 4, marginTop: 8 },
  sectionSub: { fontSize: 12, color: '#888', marginBottom: 12 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, minWidth: 120, backgroundColor: '#fff', borderRadius: 10, padding: 14, borderLeftWidth: 4 },
  summaryNum: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e' },
  summaryLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  notifBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3e0', borderRadius: 12, padding: 14, marginBottom: 20, gap: 10, borderWidth: 1, borderColor: '#ffe0b2' },
  notifIcon: { fontSize: 24 },
  notifTitle: { fontSize: 13, fontWeight: '600', color: '#e65100' },
  notifSub: { fontSize: 11, color: '#888', marginTop: 2 },
  notifArrow: { fontSize: 20, color: '#e65100' },
  whCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  whCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  whName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  whStatusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  whStatusText: { fontSize: 11, fontWeight: '600' },
  whBarBg: { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, marginBottom: 6 },
  whBarFill: { height: 6, borderRadius: 3 },
  whCount: { fontSize: 11, color: '#888' },
})