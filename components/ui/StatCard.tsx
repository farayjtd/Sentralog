import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { c, sp, radius, font, shadow, numStyle } from '../../lib/theme'

type IconName = keyof typeof Ionicons.glyphMap

export function StatCard({
  value, label, icon, accent, hint,
}: { value: number | string; label: string; icon: IconName; accent: string; hint?: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.chip, { backgroundColor: accent + '14' }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
      </View>
      <Text style={[styles.value, numStyle]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1, flexBasis: 150, minWidth: 150, maxWidth: 240,
    backgroundColor: c.surface, borderRadius: radius.lg, padding: sp(4),
    borderWidth: 1, borderColor: c.line, ...shadow(1),
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: sp(3) },
  chip: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 30, fontWeight: '800', color: c.ink, letterSpacing: -0.8 },
  label: { fontSize: font.small, color: c.muted, marginTop: 2, fontWeight: '500' },
  hint: { fontSize: font.micro, color: c.faint, marginTop: 6 },
})
