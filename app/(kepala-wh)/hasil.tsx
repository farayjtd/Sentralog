import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, Platform, Alert, Image } from 'react-native'
import AppShell from '../../components/AppShell'
import { Card, Button, Badge, EmptyState, Skeleton, IconChip } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { statusBadge } from '../../lib/status'
import { c, sp, radius, font } from '../../lib/theme'

const ACCENT = '#7c3aed'
const STAGES = ['produksi', 'qc_foto', 'menunggu_acc_ts', 'pengiriman', 'pemasangan', 'foto_hasil']

interface Project { id: string; name: string; status: string; client_name: string }
interface Bukti { id: string; file_url: string; project_id: string }

export default function InputHasil() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [bukti, setBukti] = useState<Record<string, Bukti[]>>({})
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: proj } = await supabase.from('projects').select('id, name, status, client_name').in('status', STAGES).order('created_at', { ascending: false })
    const list = proj ?? []
    setProjects(list)
    if (list.length) {
      const { data: files } = await supabase.from('project_files').select('id, file_url, project_id').in('project_id', list.map((p) => p.id)).eq('file_type', 'foto_hasil').order('uploaded_at', { ascending: false })
      const grouped: Record<string, Bukti[]> = {}
      ;(files ?? []).forEach((f) => { grouped[f.project_id] = grouped[f.project_id] ? [...grouped[f.project_id], f] : [f] })
      setBukti(grouped)
    } else { setBukti({}) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [])

  const upload = (projectId: string) => {
    if (Platform.OS !== 'web') { Alert.alert('Info', 'Upload bukti tersedia di versi web.'); return }
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]; if (!file) return
      setUploadingId(projectId)
      try {
        const fileName = `${projectId}/hasil-${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('project-files').upload(fileName, file, { upsert: false, contentType: file.type })
        if (error) throw error
        const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(fileName)
        await supabase.from('project_files').insert({ project_id: projectId, file_name: file.name, file_url: urlData.publicUrl, file_type: 'foto_hasil', file_size: file.size, uploaded_by: user!.id })
        await load()
        Alert.alert('Berhasil', 'Bukti hasil jadi berhasil diunggah.')
      } catch (err: any) { Alert.alert('Gagal mengunggah', err.message) }
      finally { setUploadingId(null) }
    }
    input.click()
  }

  return (
    <AppShell role="kepala_wh" title="Input Hasil Jadi" subtitle="Unggah foto barang jadi sebagai bukti.">
      {loading ? (
        <View>{[0, 1].map((i) => <Skeleton key={i} height={120} />)}</View>
      ) : projects.length === 0 ? (
        <Card><EmptyState icon="camera-outline" title="Tidak ada pesanan produksi" hint="Pesanan pada tahap produksi akan muncul di sini." /></Card>
      ) : (
        projects.map((p) => {
          const b = statusBadge(p.status)
          const files = bukti[p.id] ?? []
          return (
            <Card key={p.id} style={{ marginBottom: sp(3) }}>
              <View style={styles.head}>
                <IconChip name="camera-outline" color={ACCENT} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{p.name}</Text>
                  <Text style={styles.sub}>{p.client_name}</Text>
                </View>
                <Badge text={b.text} color={b.color} bg={b.bg} />
              </View>

              {files.length > 0 && (
                <View style={styles.thumbRow}>
                  {files.map((f) => <Image key={f.id} source={{ uri: f.file_url }} style={styles.thumb} />)}
                </View>
              )}
              <Text style={styles.count}>{files.length} bukti terunggah</Text>
              <View style={{ height: sp(3) }} />
              <Button label="Unggah bukti" icon="cloud-upload-outline" accent={ACCENT} variant="outline" onPress={() => upload(p.id)} loading={uploadingId === p.id} full />
            </Card>
          )
        })
      )}
    </AppShell>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: sp(3), marginBottom: sp(3) },
  title: { fontSize: font.h3, fontWeight: '700', color: c.ink },
  sub: { fontSize: font.small, color: c.muted, marginTop: 1 },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(2), marginBottom: sp(2) },
  thumb: { width: 68, height: 68, borderRadius: radius.md, backgroundColor: c.lineSoft },
  count: { fontSize: font.small, color: c.muted },
})
