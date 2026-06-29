import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import AppShell from '../../components/AppShell'
import { Card, Button, Badge, EmptyState, Skeleton, IconChip } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { statusBadge } from '../../lib/status'
import { c, sp, font } from '../../lib/theme'

const ACCENT = '#7c3aed'
const NEXT: Record<string, { to: string; action: string }> = {
  cek_bahan_baku: { to: 'produksi', action: 'ACC Bahan Baku' },
  qc_foto: { to: 'menunggu_acc_ts', action: 'ACC Hasil QC' },
}

interface Project { id: string; name: string; status: string; client_name: string }

export default function AccTtd() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('projects').select('id, name, status, client_name').in('status', Object.keys(NEXT)).order('created_at', { ascending: false })
    setProjects(data ?? []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [])

  const acc = async (p: Project) => {
    const next = NEXT[p.status]; if (!next) return
    setBusyId(p.id)
    try {
      const { error } = await supabase.from('projects').update({ status: next.to }).eq('id', p.id)
      if (error) throw error
      await supabase.from('project_logs').insert({ project_id: p.id, status_from: p.status, status_to: next.to, changed_by: user!.id, note: `TTD / ${next.action} oleh ${user?.full_name ?? 'Kepala WH'}` })
      await load()
      Alert.alert('Berhasil', `${next.action} telah ditandatangani.`)
    } catch (e: any) { Alert.alert('Gagal', e.message) }
    finally { setBusyId(null) }
  }

  return (
    <AppShell role="kepala_wh" title="ACC / TTD" subtitle="Tinjau & tanda tangani pesanan yang menunggu persetujuan.">
      {loading ? (
        <View>{[0, 1].map((i) => <Skeleton key={i} height={110} />)}</View>
      ) : projects.length === 0 ? (
        <Card><EmptyState icon="checkmark-circle-outline" title="Tidak ada yang menunggu TTD" hint="Semua pesanan sudah ditindaklanjuti." /></Card>
      ) : (
        projects.map((p) => {
          const b = statusBadge(p.status)
          const next = NEXT[p.status]
          return (
            <Card key={p.id} style={{ marginBottom: sp(3) }}>
              <View style={styles.head}>
                <IconChip name="create-outline" color={ACCENT} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{p.name}</Text>
                  <Text style={styles.sub}>{p.client_name} · {next.action}</Text>
                </View>
                <Badge text={b.text} color={b.color} bg={b.bg} />
              </View>
              <View style={{ height: sp(3) }} />
              <Button label={`Setujui & TTD`} icon="checkmark" accent={ACCENT} onPress={() => acc(p)} loading={busyId === p.id} full />
            </Card>
          )
        })
      )}
    </AppShell>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: sp(3) },
  title: { fontSize: font.h3, fontWeight: '700', color: c.ink },
  sub: { fontSize: font.small, color: c.muted, marginTop: 1 },
})
