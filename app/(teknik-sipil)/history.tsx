import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, ActivityIndicator, StatusBar, Platform
} from 'react-native'
import TeknikSipilSidebar from '../../components/TeknikSipilSidebar'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Project {
  id: string
  code: string
  name: string
  status: string
  client_name: string
  deadline?: string
  created_at: string
  warehouse?: { name: string }
}

interface ProjectLog {
  id: string
  status_from: string
  status_to: string
  changed_by: string
  note?: string
  created_at: string
  user?: { full_name: string }
}

const STATUS_LABELS: Record<string, string> = {
  input_spek: 'Input Spek',
  cek_bahan_baku: 'Cek Bahan Baku',
  produksi: 'Produksi',
  qc_foto: 'QC Foto',
  menunggu_acc_ts: 'Menunggu ACC TS',
  pengiriman: 'Pengiriman',
  pemasangan: 'Pemasangan',
  foto_hasil: 'Foto Hasil',
  selesai: 'Selesai',
}

export default function HistoryPage() {
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectLogs, setProjectLogs] = useState<ProjectLog[]>([])
  const [showDetail, setShowDetail] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  useEffect(() => {
    if (user) fetchHistory()
  }, [user, selectedMonth, selectedYear])

  const fetchHistory = async () => {
    setLoading(true)
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('projects')
      .select('*, warehouse:warehouse_id(name)')
      .eq('created_by', user!.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59')
      .order('created_at', { ascending: false })

    if (data) setProjects(data)
    setLoading(false)
  }

  const fetchLogs = async (projectId: string) => {
    setLoadingLogs(true)
    const { data } = await supabase
      .from('project_logs')
      .select('*, user:changed_by(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    if (data) setProjectLogs(data)
    setLoadingLogs(false)
  }

  const openDetail = async (p: Project) => {
    setSelectedProject(p)
    await fetchLogs(p.id)
    setShowDetail(true)
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const totalSelesai = projects.filter(p => p.status === 'selesai').length
  const totalBerjalan = projects.filter(p => p.status !== 'selesai').length

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />
      <View style={[styles.header, { backgroundColor: '#1565c0' }]}>
        <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History Project</Text>
      </View>

      <View style={styles.body}>
        {sidebarOpen && <TeknikSipilSidebar />}
        <View style={styles.main}>

          {/* Filter Bulan Tahun */}
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              {MONTHS.map((m, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.monthChip, selectedMonth === idx + 1 && { backgroundColor: '#1565c0', borderColor: '#1565c0' }]}
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
          </View>

          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderLeftColor: '#1565c0' }]}>
              <Text style={styles.summaryNum}>{projects.length}</Text>
              <Text style={styles.summaryLabel}>Total Project</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: '#2e7d32' }]}>
              <Text style={styles.summaryNum}>{totalSelesai}</Text>
              <Text style={styles.summaryLabel}>Selesai</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: '#e65100' }]}>
              <Text style={styles.summaryNum}>{totalBerjalan}</Text>
              <Text style={styles.summaryLabel}>Berjalan</Text>
            </View>
          </View>

          <TextInput
            style={styles.search}
            placeholder="Cari nama, klien, atau kode..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#1565c0" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 1 }]}>Kode</Text>
                <Text style={[styles.th, { flex: 2 }]}>Nama Project</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Klien</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Warehouse</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Status</Text>
                <Text style={[styles.th, { flex: 1 }]}>Dibuat</Text>
                <Text style={[styles.th, { flex: 1 }]}>Aksi</Text>
              </View>

              {filtered.length === 0 ? (
                <Text style={styles.empty}>Tidak ada history project bulan ini</Text>
              ) : filtered.map((p, i) => (
                <View key={p.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tdCode, { flex: 1 }]}>{p.code}</Text>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.tdName}>{p.name}</Text>
                  </View>
                  <Text style={[styles.td, { flex: 1.5 }]}>{p.client_name}</Text>
                  <Text style={[styles.td, { flex: 1.5 }]}>{p.warehouse?.name ?? '-'}</Text>
                  <View style={{ flex: 1.5, justifyContent: 'center' }}>
                    <View style={[styles.statusBadge, {
                      backgroundColor: p.status === 'selesai' ? '#e8f5e9' : '#f0f2f5'
                    }]}>
                      <Text style={[styles.statusText, {
                        color: p.status === 'selesai' ? '#2e7d32' : '#555'
                      }]}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.td, { flex: 1 }]}>{formatDate(p.created_at)}</Text>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} onPress={() => openDetail(p)}>
                      <Text style={[styles.actionText, { color: '#1565c0' }]}>Log</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* MODAL LOG PROJECT */}
      <Modal visible={showDetail} transparent animationType="fade" onRequestClose={() => setShowDetail(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { maxWidth: 560 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedProject?.name}</Text>
                <Text style={styles.modalSub}>{selectedProject?.code} · {selectedProject?.client_name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {loadingLogs ? (
                <ActivityIndicator color="#1565c0" style={{ marginTop: 20 }} />
              ) : projectLogs.length === 0 ? (
                <Text style={styles.empty}>Belum ada log perubahan</Text>
              ) : (
                <View style={styles.timeline}>
                  {projectLogs.map((log, i) => (
                    <View key={log.id} style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                      {i < projectLogs.length - 1 && <View style={styles.timelineLine} />}
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineHeader}>
                          <Text style={styles.timelineStatus}>
                            {STATUS_LABELS[log.status_from] ?? log.status_from}
                            {' → '}
                            {STATUS_LABELS[log.status_to] ?? log.status_to}
                          </Text>
                        </View>
                        <Text style={styles.timelineBy}>oleh {log.user?.full_name ?? '-'}</Text>
                        <Text style={styles.timelineDate}>{formatDateTime(log.created_at)}</Text>
                        {!!log.note && (
                          <Text style={styles.timelineNote}>"{log.note}"</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.saveBtn} onPress={() => setShowDetail(false)}>
                <Text style={styles.saveText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  main: { flex: 1, padding: 20 },
  filterBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  monthChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', marginRight: 6, backgroundColor: '#fff' },
  monthChipText: { fontSize: 12, color: '#555' },
  yearRow: { flexDirection: 'row', alignItems: 'center' },
  yearBtn: { padding: 6 },
  yearBtnText: { fontSize: 18, color: '#1a1a2e' },
  yearText: { fontSize: 13, fontWeight: '600', color: '#1a1a2e', marginHorizontal: 8 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 14, borderLeftWidth: 4 },
  summaryNum: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  summaryLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, marginBottom: 12, color: '#333' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1565c0', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  th: { fontSize: 12, fontWeight: '600', color: '#fff' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#fff' },
  td: { fontSize: 13, color: '#333' },
  tdCode: { fontSize: 11, color: '#888' },
  tdName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '500' },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  actionText: { fontSize: 11, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, width: '92%', maxWidth: 520, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  modalSub: { fontSize: 12, color: '#888', marginTop: 2 },
  closeBtn: { fontSize: 18, color: '#888', paddingHorizontal: 4 },
  modalBody: { padding: 16, maxHeight: 480 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#1565c0' },
  saveText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  timeline: { paddingLeft: 16 },
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1565c0', marginTop: 4, marginRight: 12, flexShrink: 0 },
  timelineLine: { position: 'absolute', left: 5, top: 16, bottom: -16, width: 2, backgroundColor: '#e0e0e0' },
  timelineContent: { flex: 1 },
  timelineHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  timelineStatus: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  timelineBy: { fontSize: 12, color: '#666' },
  timelineDate: { fontSize: 11, color: '#aaa', marginTop: 2 },
  timelineNote: { fontSize: 12, color: '#555', fontStyle: 'italic', marginTop: 4, backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6 },
})