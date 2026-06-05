import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Platform, StatusBar, Image
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

interface Attendance {
  id: string
  date: string
  location_type: string
  check_in_at: string
  check_out_at: string
  check_in_photo: string
  is_mock_gps: boolean
  is_manual: boolean
  warehouse?: { name: string }
  project?: { name: string }
}

interface Props {
  roleName: string
  color: string
  absenRoute: string
  SidebarComponent: React.ComponentType
}

export default function AbsenDashboard({ roleName, color, absenRoute, SidebarComponent }: Props) {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([])

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  useEffect(() => {
    if (user) {
      fetchAttendances()
      fetchTodayAttendance()
    }
  }, [user, selectedMonth, selectedYear])

  const fetchTodayAttendance = async () => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('attendances')
      .select('*, warehouse:warehouse_id(name), project:project_id(name)')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('check_in_at', { ascending: true })
    if (data) setTodayAttendance(data)
  }

  const fetchAttendances = async () => {
    if (!user) return
    setLoading(true)
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]
    const { data } = await supabase
      .from('attendances')
      .select('*, warehouse:warehouse_id(name), project:project_id(name)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    if (data) setAttendances(data)
    setLoading(false)
  }

  const formatTime = (iso: string) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const uniqueDays = new Set(attendances.map(a => a.date)).size

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={color} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <View style={styles.body}>
        {sidebarOpen && <SidebarComponent />}

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Status Absen Hari Ini */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Absensi Hari Ini</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>

            {todayAttendance.length === 0 ? (
              <View style={styles.noAbsenBox}>
                <Text style={styles.noAbsenIcon}>📋</Text>
                <Text style={styles.noAbsenText}>Belum ada absensi hari ini</Text>
              </View>
            ) : (
              todayAttendance.map(a => (
                <View key={a.id} style={styles.todayCard}>
                  <View style={styles.todayCardLeft}>
                    <View style={[styles.locTypeBadge, { backgroundColor: a.location_type === 'wh' ? '#e3f2fd' : '#f3e5f5' }]}>
                      <Text style={[styles.locTypeText, { color: a.location_type === 'wh' ? '#1565c0' : '#6a1b9a' }]}>
                        {a.location_type === 'wh' ? '🏭 WH' : '📍 Lapangan'}
                      </Text>
                    </View>
                    <Text style={styles.todayLocation}>
                      {a.location_type === 'wh' ? (a.warehouse?.name ?? '-') : (a.project?.name ?? 'Lapangan')}
                    </Text>
                    <Text style={styles.todayTime}>
                      {'Masuk: ' + formatTime(a.check_in_at)}
                    </Text>
                    {a.is_mock_gps && (
                      <Text style={styles.mockWarning}>⚠️ Terdeteksi fake GPS</Text>
                    )}
                  </View>
                  {!!a.check_in_photo && (
                    <Image source={{ uri: a.check_in_photo }} style={styles.todayPhoto} />
                  )}
                </View>
              ))
            )}

            <TouchableOpacity
              style={[styles.absenBtn, { backgroundColor: color }]}
              onPress={() => router.push(absenRoute as any)}
            >
              <Text style={styles.absenBtnText}>📸 Absen Sekarang</Text>
            </TouchableOpacity>
          </View>

          {/* Rekap Bulanan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rekap Absensi</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
              {MONTHS.map((m, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.monthChip, selectedMonth === idx + 1 && { backgroundColor: color, borderColor: color }]}
                  onPress={() => setSelectedMonth(idx + 1)}
                >
                  <Text style={[styles.monthChipText, selectedMonth === idx + 1 && { color: '#fff' }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.yearRow}>
              <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={styles.yearBtn}>
                <Text style={styles.yearBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} style={styles.yearBtn}>
                <Text style={styles.yearBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { borderLeftColor: color }]}>
                <Text style={styles.summaryNum}>{uniqueDays}</Text>
                <Text style={styles.summaryLabel}>Hari Hadir</Text>
              </View>
              <View style={[styles.summaryCard, { borderLeftColor: '#e65100' }]}>
                <Text style={styles.summaryNum}>{attendances.filter(a => a.is_mock_gps).length}</Text>
                <Text style={styles.summaryLabel}>Fake GPS</Text>
              </View>
              <View style={[styles.summaryCard, { borderLeftColor: '#1565c0' }]}>
                <Text style={styles.summaryNum}>{attendances.filter(a => a.location_type === 'wh').length}</Text>
                <Text style={styles.summaryLabel}>Absen WH</Text>
              </View>
              <View style={[styles.summaryCard, { borderLeftColor: '#6a1b9a' }]}>
                <Text style={styles.summaryNum}>{attendances.filter(a => a.location_type === 'lapangan').length}</Text>
                <Text style={styles.summaryLabel}>Lapangan</Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator color={color} style={{ marginTop: 20 }} />
            ) : attendances.length === 0 ? (
              <Text style={styles.empty}>Tidak ada data absensi bulan ini</Text>
            ) : (
              attendances.map((a, i) => (
                <View key={a.id} style={[styles.absenRow, i % 2 === 0 && styles.absenRowAlt]}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.absenDate}>{formatDate(a.date)}</Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={[styles.locTypeBadge, { backgroundColor: a.location_type === 'wh' ? '#e3f2fd' : '#f3e5f5' }]}>
                      <Text style={[styles.locTypeText, { color: a.location_type === 'wh' ? '#1565c0' : '#6a1b9a', fontSize: 10 }]}>
                        {a.location_type === 'wh' ? '🏭 WH' : '📍 Lapangan'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.absenTime, { flex: 1 }]}>{formatTime(a.check_in_at)}</Text>
                  <View style={{ flex: 0.5, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14 }}>{a.is_mock_gps ? '⚠️' : '✅'}</Text>
                  </View>
                </View>
              ))
            )}
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
  scroll: { flex: 1 },
  section: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  dateText: { fontSize: 12, color: '#888', marginBottom: 12 },
  noAbsenBox: { alignItems: 'center', paddingVertical: 20 },
  noAbsenIcon: { fontSize: 36, marginBottom: 8 },
  noAbsenText: { fontSize: 13, color: '#aaa' },
  todayCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12, marginBottom: 8 },
  todayCardLeft: { flex: 1 },
  locTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 4 },
  locTypeText: { fontSize: 11, fontWeight: '500' },
  todayLocation: { fontSize: 13, fontWeight: '500', color: '#1a1a2e', marginBottom: 2 },
  todayTime: { fontSize: 12, color: '#666' },
  mockWarning: { fontSize: 11, color: '#e65100', marginTop: 4 },
  todayPhoto: { width: 48, height: 48, borderRadius: 8, marginLeft: 8 },
  absenBtn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  absenBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  monthScroll: { marginBottom: 10 },
  monthChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff' },
  monthChipText: { fontSize: 12, color: '#555' },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  yearBtn: { padding: 8 },
  yearBtnText: { fontSize: 20, color: '#1a1a2e' },
  yearText: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginHorizontal: 16 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#f8f9fa', borderRadius: 8, padding: 10, borderLeftWidth: 3 },
  summaryNum: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  summaryLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  absenRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  absenRowAlt: { backgroundColor: '#f8f9fa', borderRadius: 6 },
  absenDate: { fontSize: 12, color: '#333', fontWeight: '500' },
  absenTime: { fontSize: 12, color: '#666' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 20, fontSize: 13 },
})