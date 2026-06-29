import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AppShell from '../../components/AppShell'
import { Card, Field, Button, SectionHeader, EmptyState, Skeleton, IconChip } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { c, sp, radius, font } from '../../lib/theme'

const ACCENT = '#1d4ed8'

interface Material { id: string; name: string; qty: number; unit: string; note?: string; created_at: string; warehouse?: { name: string } }
interface WH { id: string; name: string }

export default function TeknikBahan() {
  const { user } = useAuthStore()
  const [list, setList] = useState<Material[]>([])
  const [whs, setWhs] = useState<WH[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showWh, setShowWh] = useState(false)
  const [form, setForm] = useState({ name: '', qty: '', unit: 'pcs', note: '', warehouse_id: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: m }, { data: w }] = await Promise.all([
      supabase.from('materials').select('*, warehouse:warehouse_id(name)').eq('created_by', user!.id).order('created_at', { ascending: false }),
      supabase.from('warehouses').select('id, name').eq('is_active', true).order('name'),
    ])
    setList(m ?? []); setWhs(w ?? []); setLoading(false)
  }, [user])

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name.trim() || !form.qty.trim()) { Alert.alert('Lengkapi data', 'Nama bahan dan jumlah wajib diisi.'); return }
    setSaving(true)
    const { error } = await supabase.from('materials').insert({
      name: form.name.trim(), qty: parseFloat(form.qty) || 0, unit: form.unit.trim() || 'pcs',
      category: 'baku', note: form.note.trim() || null, warehouse_id: form.warehouse_id || null, created_by: user!.id,
    })
    setSaving(false)
    if (error) { Alert.alert('Gagal menyimpan', error.message); return }
    setForm({ name: '', qty: '', unit: 'pcs', note: '', warehouse_id: '' })
    load()
  }

  const whName = whs.find((w) => w.id === form.warehouse_id)?.name

  return (
    <AppShell role="teknik_sipil" title="Input Bahan Baku" subtitle="Catat kebutuhan bahan untuk produksi.">
      <Card style={{ marginBottom: sp(6) }}>
        <SectionHeader eyebrow="Form" title="Tambah bahan" />
        <Field label="Nama bahan" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="cth: Besi hollow 4x4" accent={ACCENT} />
        <View style={{ flexDirection: 'row', gap: sp(3) }}>
          <View style={{ flex: 1 }}><Field label="Jumlah" value={form.qty} onChangeText={(v) => setForm({ ...form, qty: v })} placeholder="0" keyboardType="numeric" accent={ACCENT} /></View>
          <View style={{ flex: 1 }}><Field label="Satuan" value={form.unit} onChangeText={(v) => setForm({ ...form, unit: v })} placeholder="pcs / batang / kg" accent={ACCENT} /></View>
        </View>

        <Text style={styles.label}>Warehouse</Text>
        <TouchableOpacity style={styles.select} onPress={() => setShowWh(!showWh)} activeOpacity={0.7}>
          <Text style={{ color: form.warehouse_id ? c.ink : c.faint, fontSize: font.body }}>{whName ?? 'Pilih warehouse (opsional)'}</Text>
          <Ionicons name={showWh ? 'chevron-up' : 'chevron-down'} size={18} color={c.faint} />
        </TouchableOpacity>
        {showWh && (
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropItem} onPress={() => { setForm({ ...form, warehouse_id: '' }); setShowWh(false) }}><Text style={styles.dropText}>- Tanpa warehouse -</Text></TouchableOpacity>
            {whs.map((w) => (
              <TouchableOpacity key={w.id} style={styles.dropItem} onPress={() => { setForm({ ...form, warehouse_id: w.id }); setShowWh(false) }}><Text style={styles.dropText}>{w.name}</Text></TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: sp(3) }} />
        <Field label="Catatan" value={form.note} onChangeText={(v) => setForm({ ...form, note: v })} placeholder="Catatan tambahan (opsional)" multiline accent={ACCENT} />
        <Button label="Simpan bahan" icon="add" accent={ACCENT} onPress={save} loading={saving} full />
      </Card>

      <SectionHeader eyebrow="Riwayat" title="Bahan yang diinput" />
      {loading ? (
        <View>{[0, 1].map((i) => <Skeleton key={i} height={80} />)}</View>
      ) : list.length === 0 ? (
        <Card><EmptyState icon="cube-outline" title="Belum ada bahan" hint="Bahan yang Anda input akan tampil di sini." /></Card>
      ) : (
        list.map((m) => (
          <Card key={m.id} style={{ marginBottom: sp(3) }}>
            <View style={styles.itemRow}>
              <IconChip name="cube-outline" color={ACCENT} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{m.name}</Text>
                <Text style={styles.itemMeta}>{m.warehouse?.name ?? 'Tanpa WH'} - {new Date(m.created_at).toLocaleDateString('id-ID')}</Text>
              </View>
              <Text style={styles.itemQty}>{m.qty} {m.unit}</Text>
            </View>
            {m.note ? <Text style={styles.itemNote}>{m.note}</Text> : null}
          </Card>
        ))
      )}
    </AppShell>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: font.small, fontWeight: '600', color: c.body, marginBottom: 6 },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: c.line, borderRadius: radius.md, paddingHorizontal: sp(3.5), paddingVertical: sp(3), backgroundColor: c.surfaceAlt },
  dropdown: { borderWidth: 1, borderColor: c.line, borderRadius: radius.md, marginTop: 6, overflow: 'hidden' },
  dropItem: { paddingVertical: sp(3), paddingHorizontal: sp(3.5), borderBottomWidth: 1, borderBottomColor: c.lineSoft },
  dropText: { fontSize: font.body, color: c.body },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: sp(3) },
  itemName: { fontSize: font.h3, fontWeight: '700', color: c.ink },
  itemMeta: { fontSize: font.small, color: c.muted, marginTop: 1 },
  itemQty: { fontSize: font.h3, fontWeight: '800', color: ACCENT },
  itemNote: { fontSize: font.small, color: c.muted, marginTop: sp(2.5), fontStyle: 'italic' },
})
