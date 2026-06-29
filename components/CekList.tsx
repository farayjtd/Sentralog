import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native'

export interface CekColumn<T> {
  label: string
  render: (row: T) => string
}

interface Props<T> {
  color: string
  subtitle?: string
  fetcher: () => Promise<T[]>
  titleOf: (row: T) => string
  columns: CekColumn<T>[]
  badgeOf?: (row: T) => { text: string; color: string; bg: string } | null
  emptyText?: string
}

/** Daftar read-only generik untuk semua fitur "Cek ...". */
export default function CekList<T>({
  color, subtitle, fetcher, titleOf, columns, badgeOf, emptyText = 'Belum ada data',
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetcher()
      setRows(data ?? [])
    } catch (e) {
      console.log('CekList error:', e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => { load() }, [])

  return (
    <View>
      <View style={styles.topRow}>
        <Text style={styles.count}>
          {loading ? 'Memuat...' : `${rows.length} data`}{subtitle ? ` · ${subtitle}` : ''}
        </Text>
        <TouchableOpacity onPress={load} style={[styles.refreshBtn, { borderColor: color }]}>
          <Text style={[styles.refreshText, { color }]}>↻ Muat ulang</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={color} style={{ marginTop: 40 }} />
      ) : rows.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>{emptyText}</Text></View>
      ) : (
        rows.map((row, i) => {
          const badge = badgeOf?.(row)
          return (
            <View key={i} style={[styles.card, { borderLeftColor: color }]}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle} numberOfLines={2}>{titleOf(row)}</Text>
                {badge && (
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
                  </View>
                )}
              </View>
              {columns.map((c, j) => (
                <View key={j} style={styles.row}>
                  <Text style={styles.label}>{c.label}</Text>
                  <Text style={styles.value}>{c.render(row) || '-'}</Text>
                </View>
              ))}
            </View>
          )
        })
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  count: { fontSize: 13, color: '#64748b' },
  refreshBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  refreshText: { fontSize: 12, fontWeight: '600' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, elevation: 2,
    ...(Platform.OS === 'web' ? { boxShadow: '0px 1px 4px rgba(0,0,0,0.06)' } : {}),
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', flex: 1, paddingRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  row: { flexDirection: 'row', paddingVertical: 3 },
  label: { width: 130, fontSize: 13, color: '#94a3b8' },
  value: { flex: 1, fontSize: 13, color: '#334155' },
})
