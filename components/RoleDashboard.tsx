import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AppShell from './AppShell'
import { StatCard } from './ui/StatCard'
import { SectionHeader, Skeleton } from './ui'
import { ROLES } from '../lib/roles'
import { c, sp, radius, font, shadow } from '../lib/theme'

type IconName = keyof typeof Ionicons.glyphMap
export interface Stat { value: number | string; label: string; icon: IconName; hint?: string }

interface Props {
  role: string
  greeting: string
  loadStats: () => Promise<Stat[]>
}

export default function RoleDashboard({ role, greeting, loadStats }: Props) {
  const def = ROLES[role]
  const accent = def.accent
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try { setStats(await loadStats()) }
      catch (e) { console.log('dashboard:', e) }
      finally { setLoading(false) }
    })()
  }, [])

  const actions = def.menu.filter((m) => m.key !== `/(${role.replace('_', '-')})` && !m.label.includes('Dashboard'))
  const actionWidth = width >= 900 ? '31%' : '47%'

  return (
    <AppShell role={role} title="Dashboard" subtitle={greeting}>
      {loading ? (
        <View style={styles.statGrid}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={120} style={{ flexGrow: 1, flexBasis: 150, minWidth: 150, maxWidth: 240 }} />)}
        </View>
      ) : (
        <View style={styles.statGrid}>
          {stats.map((s, i) => (
            <StatCard key={i} value={s.value} label={s.label} icon={s.icon} accent={accent} hint={s.hint} />
          ))}
        </View>
      )}

      <View style={{ height: sp(7) }} />

      <SectionHeader eyebrow="Pintasan" title="Aksi cepat" />
      <View style={styles.actionGrid}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.key}
            activeOpacity={0.85}
            onPress={() => router.push(a.key as any)}
            style={[styles.action, { width: actionWidth as any }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: def.soft }]}>
              <Ionicons name={a.icon} size={20} color={accent} />
            </View>
            <Text style={styles.actionLabel} numberOfLines={2}>{a.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={c.faint} style={styles.chev} />
          </TouchableOpacity>
        ))}
      </View>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(3) },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(3) },
  action: {
    backgroundColor: c.surface, borderRadius: radius.lg, padding: sp(4),
    borderWidth: 1, borderColor: c.line, ...shadow(1), minHeight: 116, justifyContent: 'space-between',
  },
  actionIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: sp(3) },
  actionLabel: { fontSize: font.h3, fontWeight: '700', color: c.ink, lineHeight: 20 },
  chev: { position: 'absolute', top: sp(4), right: sp(4) },
})
