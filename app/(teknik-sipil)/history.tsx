import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AppShell from '../../components/AppShell'
import { Card, Badge, EmptyState, Skeleton, IconChip, SectionHeader } from '../../components/ui'
import { StatCard } from '../../components/ui/StatCard'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { statusBadge, PROJECT_STATUS } from '../../lib/status'
import { c, sp, radius, font } from '../../lib/theme'

const ACCENT = '#1d4ed8'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

interface Project { id: string; code: string; name: string; status: string; client_name: string; deadline?: string; created_at: string; warehouse?: { name: string } }
interface ProjectLog { id: string; status_from: string; status_to: string; note?: string; created_at: string; user?: { full_name: string } }

export default function HistoryPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Project | null>(null)
  const [logs, setLogs] = useState<ProjectLog[]>([])
  const [showDetail, setShowDetail] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => { if (user) fetchHistory() }, [user, month, year])

  const fetchHistory = async () => {
    setLoading(true)
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = new Date(year, month, 0).toISOString().split('T')[0]
    const { data } = await supabase.from('projects').select('*, warehouse:warehouse_id(name)')
      .eq('created_by', user!.id).gte('created_at', start).lte('created_at', end + 'T23:59:59')
      .order('created_at', { ascending: false })
    setProjects(data ?? []); setLoading(false)
  }

  const openDetail = async (p: Project) => {
    setSelected(p); setShowDetail(true); setLoadingLogs(true)
    const { data } = await supabase.from('project_logs').select('*, user:changed_by(full_name)').eq('project_id', p.id).order('created_at', { ascending: true })
    setLogs(data ?? []); setLoadingLogs(false)
  }

  const fdate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const fdt = (iso: string) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const lbl = (s: string) => PROJECT_STATUS[s]?.label ?? s

  const selesai = projects.filter((p) => p.status === 'selesai').length
  const berjalan = projects.length - selesai
  const filtered = projects.filter((p) =>
    [p.name, p.client_name, p.code].some((v) => v?.toLowerCase().includes(search.toLowerCase())))

  return (
    <AppShell role="teknik_sipil" title="Riwayat Pesanan" subtitle="Lacak semua pesanan & log perubahannya.">
      <View style={styles.statGrid}>
        <StatCard value={projects.length} label="Total Pesanan" icon="document-text-outline" accent={ACCENT} />
        <StatCard value={selesai} label="Selesai" icon="checkmark-done-outline" accent="#059669" />
        <StatCard value={berjalan} label="Berjalan" icon="trending-up-outline" accent="#ea580c" />
      </View>

      <View style={{ height: sp(5) }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: sp(3) }}>
        {MONTHS.map((m, i) => (
          <TouchableOpacity key={i} onPress={() => setMonth(i + 1)}
            style={[styles.chip, month === i + 1 && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
            <Text style={[styles.chipText, month === i + 1 && { color: '#fff' }]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => setYear((y) => y - 1)} style={styles.yearBtn}><Ionicons name="chevron-back" size={18} color={c.ink} /></TouchableOpacity>
        <Text style={styles.yearText}>{year}</Text>
        <TouchableOpacity onPress={() => setYear((y) => y + 1)} style={styles.yearBtn}><Ionicons name="chevron-forward" size={18} color={c.ink} /></TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={c.faint} />
        <TextInput style={styles.search} placeholder="Cari nama, klien, atau kode…" placeholderTextColor={c.faint} value={search} onChangeText={setSearch} />
      </View>

      {loading ? (
        <View>{[0, 1, 2].map((i) => <Skeleton key={i} height={88} />)}</View>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="time-outline" title="Belum ada riwayat" hint="Tidak ada pesanan pada periode ini." /></Card>
      ) : (
        filtered.map((p) => {
          const b = statusBadge(p.status)
          return (
            <Card key={p.id} style={{ marginBottom: sp(3) }}>
              <View style={styles.row}>
                <IconChip name="document-text-outline" color={ACCENT} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.meta}>{p.code} · {p.client_name}</Text>
                </View>
                <Badge text={b.text} color={b.color} bg={b.bg} />
              </View>
              <View style={styles.divider} />
              <View style={styles.footer}>
                <Text style={styles.foot}>{p.warehouse?.name ?? '—'} · {fdate(p.created_at)}</Text>
                <TouchableOpacity style={styles.logBtn} onPress={() => openDetail(p)} activeOpacity={0.7}>
                  <Ionicons name="git-commit-outline" size={15} color={ACCENT} />
                  <Text style={[styles.logBtnText, { color: ACCENT }]}>Lihat log</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )
        })
      )}

      <Modal visible={showDetail} transparent animationType="fade" onRequestClose={() => setShowDetail(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>{selected?.name}</Text>
                <Text style={styles.modalSub}>{selected?.code} · {selected?.client_name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetail(false)}><Ionicons name="close" size={22} color={c.muted} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {loadingLogs ? (
                <ActivityIndicator color={ACCENT} style={{ marginTop: sp(5) }} />
              ) : logs.length === 0 ? (
                <EmptyState icon="git-commit-outline" title="Belum ada log" />
              ) : (
                <View style={styles.timeline}>
                  {logs.map((log, i) => (
                    <View key={log.id} style={styles.tlItem}>
                      <View style={styles.tlDot} />
                      {i < logs.length - 1 && <View style={styles.tlLine} />}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tlStatus}>{lbl(log.status_from)} → {lbl(log.status_to)}</Text>
                        <Text style={styles.tlBy}>oleh {log.user?.full_name ?? '—'} · {fdt(log.created_at)}</Text>
                        {!!log.note && <Text style={styles.tlNote}>{log.note}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(3) },
  chip: { paddingHorizontal: sp(3), paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: c.line, marginRight: sp(2), backgroundColor: c.surface },
  chipText: { fontSize: font.small, color: c.body, fontWeight: '600' },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: sp(3) },
  yearBtn: { padding: sp(2) },
  yearText: { fontSize: font.body, fontWeight: '700', color: c.ink, marginHorizontal: sp(4) },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: sp(2), backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: radius.md, paddingHorizontal: sp(3.5), marginBottom: sp(4) },
  search: { flex: 1, paddingVertical: sp(3), fontSize: font.body, color: c.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp(3) },
  name: { fontSize: font.h3, fontWeight: '700', color: c.ink },
  meta: { fontSize: font.small, color: c.muted, marginTop: 1 },
  divider: { height: 1, backgroundColor: c.lineSoft, marginVertical: sp(3) },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  foot: { fontSize: font.small, color: c.muted, flex: 1 },
  logBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: sp(3), borderRadius: radius.pill, backgroundColor: ACCENT + '12' },
  logBtnText: { fontSize: font.small, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center', padding: sp(4) },
  modalBox: { backgroundColor: c.surface, borderRadius: radius.xl, width: '100%', maxWidth: 560, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: sp(3), padding: sp(4), borderBottomWidth: 1, borderBottomColor: c.lineSoft },
  modalTitle: { fontSize: font.h2, fontWeight: '800', color: c.ink },
  modalSub: { fontSize: font.small, color: c.muted, marginTop: 2 },
  modalBody: { padding: sp(4), maxHeight: 480 },
  timeline: { paddingLeft: sp(2) },
  tlItem: { flexDirection: 'row', marginBottom: sp(4), gap: sp(3) },
  tlDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: ACCENT, marginTop: 3, flexShrink: 0 },
  tlLine: { position: 'absolute', left: 5, top: 16, bottom: -16, width: 2, backgroundColor: c.line },
  tlStatus: { fontSize: font.small, fontWeight: '700', color: c.ink },
  tlBy: { fontSize: font.micro, color: c.muted, marginTop: 2 },
  tlNote: { fontSize: font.small, color: c.body, fontStyle: 'italic', marginTop: 6, backgroundColor: c.surfaceAlt, padding: sp(2.5), borderRadius: radius.sm },
})
