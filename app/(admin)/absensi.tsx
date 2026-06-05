import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, ActivityIndicator, StatusBar, Image
} from 'react-native'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { supabase } from '../../lib/supabase'

const ROLE_COLORS: Record<string, string> = {
  admin: '#1a1a2e', owner: '#2d6a4f', teknik_sipil: '#1565c0',
  kepala_wh: '#6a1b9a', sopir: '#e65100', mandor: '#c62828', tukang: '#37474f',
}

const ROLE_LABELS: Record<string, string> = {
  teknik_sipil: 'Teknik Sipil', kepala_wh: 'Kepala WH',
  sopir: 'Sopir', mandor: 'Mandor', tukang: 'Tukang',
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

interface User {
  id: string
  full_name: string
  username: string
  role: string
  avatar_url?: string
}

interface Attendance {
  id: string
  date: string
  location_type: string
  check_in_at: string
  check_out_at?: string
  check_in_photo?: string
  is_mock_gps: boolean
  is_manual: boolean
  warehouse?: { name: string }
  project?: { name: string }
}

export default function AbsensiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showPhoto, setShowPhoto] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => { fetchUsers() }, [])

  useEffect(() => {
    if (selectedUser) fetchAttendances(selectedUser.id)
  }, [selectedUser, selectedMonth, selectedYear])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('id, full_name, username, role, avatar_url')
      .not('role', 'in', '("admin","owner")')
      .eq('is_active', true)
      .order('full_name', { ascending: true })
    if (data) setUsers(data)
    setLoading(false)
  }

  const fetchAttendances = async (userId: string) => {
    setLoadingDetail(true)
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]
    const { data } = await supabase
      .from('attendances')
      .select('*, warehouse:warehouse_id(name), project:project_id(name)')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    if (data) setAttendances(data)
    setLoadingDetail(false)
  }

  const openDetail = (u: User) => {
    setSelectedUser(u)
    setShowDetail(true)
  }

  const formatTime = (iso: string) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const uniqueDays = new Set(attendances.map(a => a.date)).size
  const totalMockGPS = attendances.filter(a => a.is_mock_gps).length
  const totalWH = attendances.filter(a => a.location_type === 'wh').length
  const totalLapangan = attendances.filter(a => a.location_type === 'lapangan').length

  const ROLE_FILTERS = [
    { label: 'Semua', value: 'all' },
    { label: 'Tukang', value: 'tukang' },
    { label: 'Mandor', value: 'mandor' },
    { label: 'Sopir', value: 'sopir' },
    { label: 'Kepala WH', value: 'kepala_wh' },
    { label: 'Teknik Sipil', value: 'teknik_sipil' },
  ]

  const filtered = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'all' || u.role === filterRole
    return matchSearch && matchRole
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <AdminHeader title="Data Absensi" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <View style={styles.body}>
        {sidebarOpen && <AdminSidebar />}
        <View style={styles.main}>

          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Data Absensi</Text>
              <Text style={styles.pageSub}>Klik pegawai untuk lihat detail absensi</Text>
            </View>
          </View>

          <TextInput
            style={styles.search}
            placeholder="Cari nama atau username..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />

          {/* Filter Role */}
          <View style={styles.filterWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {ROLE_FILTERS.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.filterChip, filterRole === r.value && {
                    backgroundColor: r.value === 'all' ? '#1a1a2e' : ROLE_COLORS[r.value],
                    borderColor: r.value === 'all' ? '#1a1a2e' : ROLE_COLORS[r.value],
                  }]}
                  onPress={() => setFilterRole(r.value)}
                >
                  <Text style={[styles.filterChipText, filterRole === r.value && { color: '#fff' }]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* List Pegawai */}
          {loading ? (
            <ActivityIndicator size="large" color="#1a1a2e" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 0.5 }]}>Foto</Text>
                <Text style={[styles.th, { flex: 2 }]}>Nama</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Username</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Role</Text>
                <Text style={[styles.th, { flex: 1 }]}>Aksi</Text>
              </View>

              {filtered.length === 0 ? (
                <Text style={styles.empty}>Tidak ada data pegawai</Text>
              ) : filtered.map((u, i) => (
                <View key={u.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                  <View style={{ flex: 0.5, justifyContent: 'center' }}>
                    {u.avatar_url ? (
                      <Image source={{ uri: u.avatar_url }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: ROLE_COLORS[u.role] }]}>
                        <Text style={styles.avatarText}>{u.full_name?.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.tdName}>{u.full_name}</Text>
                  </View>
                  <Text style={[styles.td, { flex: 1.5 }]}>{u.username}</Text>
                  <View style={{ flex: 1.5, justifyContent: 'center' }}>
                    <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[u.role] + '20' }]}>
                      <Text style={[styles.roleText, { color: ROLE_COLORS[u.role] }]}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TouchableOpacity
                      style={[styles.detailBtn, { backgroundColor: '#e3f2fd' }]}
                      onPress={() => openDetail(u)}
                    >
                      <Text style={[styles.detailBtnText, { color: '#1565c0' }]}>Lihat Absensi</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* MODAL DETAIL ABSENSI */}
      <Modal visible={showDetail} transparent animationType="fade" onRequestClose={() => setShowDetail(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedUser?.full_name}</Text>
                <Text style={styles.modalSub}>{ROLE_LABELS[selectedUser?.role ?? ''] ?? selectedUser?.role}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {/* Filter Bulan Tahun */}
              <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  {MONTHS.map((m, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.monthChip, selectedMonth === idx + 1 && { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' }]}
                      onPress={() => setSelectedMonth(idx + 1)}
                    >
                      <Text style={[styles.monthChipText, selectedMonth === idx + 1 && { color: '#fff' }]}>
                        {m.slice(0, 3)}
                      </Text>
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
              </View>

              {/* Summary */}
              <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { borderLeftColor: '#1a1a2e' }]}>
                  <Text style={styles.summaryNum}>{uniqueDays}</Text>
                  <Text style={styles.summaryLabel}>Hari Hadir</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#1565c0' }]}>
                  <Text style={styles.summaryNum}>{totalWH}</Text>
                  <Text style={styles.summaryLabel}>Absen WH</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#6a1b9a' }]}>
                  <Text style={styles.summaryNum}>{totalLapangan}</Text>
                  <Text style={styles.summaryLabel}>Lapangan</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#e65100' }]}>
                  <Text style={styles.summaryNum}>{totalMockGPS}</Text>
                  <Text style={styles.summaryLabel}>Fake GPS</Text>
                </View>
              </View>

              {/* Daftar Absensi */}
              {loadingDetail ? (
                <ActivityIndicator color="#1a1a2e" style={{ marginTop: 20 }} />
              ) : attendances.length === 0 ? (
                <Text style={styles.empty}>Tidak ada absensi bulan ini</Text>
              ) : (
                <ScrollView style={styles.attendanceList}>
                  {attendances.map((a, i) => (
                    <View key={a.id} style={[styles.absenItem, i % 2 === 0 && styles.absenItemAlt]}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.absenDate}>{formatDate(a.date)}</Text>
                        <Text style={styles.absenLoc}>
                          {a.location_type === 'wh' ? '🏭 ' + (a.warehouse?.name ?? '-') : '📍 ' + (a.project?.name ?? 'Lapangan')}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.absenTime}>Masuk: {formatTime(a.check_in_at)}</Text>
                        {a.check_out_at && <Text style={styles.absenTime}>Keluar: {formatTime(a.check_out_at)}</Text>}
                      </View>
                      <View style={{ flex: 0.5, alignItems: 'center', gap: 4 }}>
                        {a.is_mock_gps && <Text style={{ fontSize: 14 }}>⚠️</Text>}
                        {a.is_manual && <Text style={{ fontSize: 11, color: '#888' }}>Manual</Text>}
                        {a.check_in_photo && (
                          <TouchableOpacity onPress={() => { setSelectedPhoto(a.check_in_photo!); setShowPhoto(true) }}>
                            <Image source={{ uri: a.check_in_photo }} style={styles.thumbPhoto} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowDetail(false)}>
                <Text style={styles.closeModalBtnText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL FOTO ABSENSI */}
      <Modal visible={showPhoto} transparent animationType="fade" onRequestClose={() => setShowPhoto(false)}>
        <TouchableOpacity style={styles.photoOverlay} onPress={() => setShowPhoto(false)} activeOpacity={1}>
          <Image source={{ uri: selectedPhoto }} style={styles.fullPhoto} resizeMode="contain" />
          <Text style={styles.photoClose}>✕ Tutup</Text>
        </TouchableOpacity>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, padding: 20 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  pageSub: { fontSize: 12, color: '#888', marginTop: 2 },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, marginBottom: 10, color: '#333' },
  filterWrap: { height: 40, marginBottom: 12 },
  filterScroll: { flexDirection: 'row', alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff', height: 32, justifyContent: 'center' },
  filterChipText: { fontSize: 12, color: '#555', fontWeight: '500' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1a1a2e', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  th: { fontSize: 12, fontWeight: '600', color: '#fff' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#fff' },
  td: { fontSize: 13, color: '#333' },
  tdName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  roleText: { fontSize: 11, fontWeight: '500' },
  detailBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  detailBtnText: { fontSize: 11, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, width: '92%', maxWidth: 680, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  modalSub: { fontSize: 12, color: '#888', marginTop: 2 },
  closeBtn: { fontSize: 18, color: '#888', paddingHorizontal: 4 },
  modalContent: { flex: 1, padding: 16 },
  filterBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  monthChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', marginRight: 6, backgroundColor: '#fff' },
  monthChipText: { fontSize: 11, color: '#555' },
  yearRow: { flexDirection: 'row', alignItems: 'center' },
  yearBtn: { padding: 6 },
  yearBtnText: { fontSize: 18, color: '#1a1a2e' },
  yearText: { fontSize: 13, fontWeight: '600', color: '#1a1a2e', marginHorizontal: 8 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: '#f8f9fa', borderRadius: 8, padding: 10, borderLeftWidth: 3 },
  summaryNum: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
  summaryLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  attendanceList: { flex: 1, maxHeight: 320 },
  absenItem: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, alignItems: 'center', borderRadius: 6 },
  absenItemAlt: { backgroundColor: '#f8f9fa' },
  absenDate: { fontSize: 12, fontWeight: '500', color: '#1a1a2e' },
  absenLoc: { fontSize: 11, color: '#666', marginTop: 2 },
  absenTime: { fontSize: 11, color: '#555' },
  thumbPhoto: { width: 36, height: 36, borderRadius: 6 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  closeModalBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#1a1a2e' },
  closeModalBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  photoOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullPhoto: { width: '90%', height: '80%' },
  photoClose: { color: '#fff', marginTop: 16, fontSize: 14 },
})