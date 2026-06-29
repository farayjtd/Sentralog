import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card, Badge, EmptyState, Skeleton, IconChip } from './ui'
import { c, sp, radius, font } from '../lib/theme'

type IconName = keyof typeof Ionicons.glyphMap

export interface Col<T> { label: string; render: (r: T) => string }

interface Props<T> {
  accent: string
  icon?: IconName
  fetcher: () => Promise<T[]>
  titleOf: (r: T) => string
  subtitleOf?: (r: T) => string
  columns: Col<T>[]
  badgeOf?: (r: T) => { text: string; color: string; bg: string } | null
  emptyTitle?: string
  emptyHint?: string
  emptyIcon?: IconName
  countNoun?: string
}

export default function DataList<T>({
  accent, icon = 'document-outline', fetcher, titleOf, subtitleOf, columns,
  badgeOf, emptyTitle = 'Belum ada data', emptyHint, emptyIcon, countNoun = 'data',
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setRows((await fetcher()) ?? []) }
    catch (e) { console.log('DataList:', e); setRows([]) }
    finally { setLoading(false) }
  }, [fetcher])

  useEffect(() => { load() }, [])

  return (
    <View>
      <View style={styles.bar}>
        <Text style={styles.count}>{loading ? 'Memuat…' : `${rows.length} ${countNoun}`}</Text>
        <TouchableOpacity onPress={load} style={styles.refresh} activeOpacity={0.7}>
          <Ionicons name="refresh" size={15} color={accent} />
          <Text style={[styles.refreshText, { color: accent }]}>Muat ulang</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View>{[0, 1, 2].map((i) => <Skeleton key={i} height={92} />)}</View>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={emptyIcon} title={emptyTitle} hint={emptyHint} /></Card>
      ) : (
        rows.map((row, i) => {
          const badge = badgeOf?.(row)
          const sub = subtitleOf?.(row)
          return (
            <Card key={i} style={{ marginBottom: sp(3) }}>
              <View style={styles.head}>
                <IconChip name={icon} color={accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={1}>{titleOf(row)}</Text>
                  {sub ? <Text style={styles.sub} numberOfLines={1}>{sub}</Text> : null}
                </View>
                {badge && <Badge text={badge.text} color={badge.color} bg={badge.bg} />}
              </View>
              <View style={styles.divider} />
              <View style={styles.grid}>
                {columns.map((col, j) => (
                  <View key={j} style={styles.cell}>
                    <Text style={styles.cellLabel}>{col.label}</Text>
                    <Text style={styles.cellValue}>{col.render(row) || '—'}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )
        })
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sp(3) },
  count: { fontSize: font.small, color: c.muted, fontWeight: '600' },
  refresh: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: sp(3), borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line },
  refreshText: { fontSize: font.small, fontWeight: '600' },
  head: { flexDirection: 'row', alignItems: 'center', gap: sp(3) },
  title: { fontSize: font.h3, fontWeight: '700', color: c.ink },
  sub: { fontSize: font.small, color: c.muted, marginTop: 1 },
  divider: { height: 1, backgroundColor: c.lineSoft, marginVertical: sp(3) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(3) },
  cell: { flexBasis: '45%', flexGrow: 1, minWidth: 130 },
  cellLabel: { fontSize: font.micro, color: c.faint, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  cellValue: { fontSize: font.small, color: c.body, marginTop: 2, lineHeight: 18 },
})
