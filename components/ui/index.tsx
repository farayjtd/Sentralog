import { ReactNode, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextInput,
  Animated, Easing, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { c, sp, radius, shadow, font, numStyle } from '../../lib/theme'

type IconName = keyof typeof Ionicons.glyphMap

/* ----------------------------- Card ----------------------------- */
export function Card({ children, style, accent }: { children: ReactNode; style?: ViewStyle; accent?: string }) {
  return (
    <View style={[styles.card, accent ? { borderTopColor: accent, borderTopWidth: 3 } : null, style]}>
      {children}
    </View>
  )
}

/* --------------------------- IconChip --------------------------- */
export function IconChip({ name, color, size = 18 }: { name: IconName; color: string; size?: number }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '1A' }]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  )
}

/* ---------------------------- Badge ----------------------------- */
export function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  )
}

/* ---------------------------- Button ---------------------------- */
export function Button({
  label, onPress, accent, icon, variant = 'primary', loading, disabled, full,
}: {
  label: string; onPress: () => void; accent: string; icon?: IconName
  variant?: 'primary' | 'outline' | 'ghost'; loading?: boolean; disabled?: boolean; full?: boolean
}) {
  const isPrimary = variant === 'primary'
  const isOutline = variant === 'outline'
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        full && { alignSelf: 'stretch' },
        isPrimary && { backgroundColor: accent },
        isOutline && { borderWidth: 1, borderColor: accent, backgroundColor: 'transparent' },
        variant === 'ghost' && { backgroundColor: accent + '14' },
        (disabled || loading) && { opacity: 0.55 },
      ]}
    >
      {icon && <Ionicons name={icon} size={16} color={isPrimary ? '#fff' : accent} />}
      <Text style={[styles.btnText, { color: isPrimary ? '#fff' : accent }]}>
        {loading ? 'Memproses…' : label}
      </Text>
    </TouchableOpacity>
  )
}

/* ------------------------- SectionHeader ------------------------ */
export function SectionHeader({
  eyebrow, title, action,
}: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action}
    </View>
  )
}

/* -------------------------- EmptyState -------------------------- */
export function EmptyState({ icon = 'file-tray-outline', title, hint }: { icon?: IconName; title: string; hint?: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Ionicons name={icon} size={26} color={c.faint} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
    </View>
  )
}

/* --------------------------- Skeleton --------------------------- */
export function Skeleton({ height = 78, style }: { height?: number; style?: ViewStyle }) {
  const a = useRef(new Animated.Value(0.4)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(a, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [a])
  return <Animated.View style={[{ height, borderRadius: radius.md, backgroundColor: c.lineSoft, opacity: a, marginBottom: sp(3) }, style]} />
}

/* ---------------------------- Field ----------------------------- */
export function Field({
  label, value, onChangeText, placeholder, keyboardType, multiline, accent,
}: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder?: string
  keyboardType?: 'default' | 'numeric'; multiline?: boolean; accent?: string
}) {
  return (
    <View style={{ marginBottom: sp(3) }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 78, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.faint}
        keyboardType={keyboardType}
        multiline={multiline}
        selectionColor={accent}
      />
    </View>
  )
}

export const numText = numStyle

const styles = StyleSheet.create({
  card: { backgroundColor: c.surface, borderRadius: radius.lg, padding: sp(4), borderWidth: 1, borderColor: c.line, ...shadow(1) },
  chip: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: sp(2.5), paddingVertical: 5, borderRadius: radius.pill },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: font.micro, fontWeight: '700', letterSpacing: 0.2 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, paddingHorizontal: sp(5), borderRadius: radius.md },
  btnText: { fontSize: font.body, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: sp(3.5), gap: sp(3) },
  eyebrow: { fontSize: font.micro, fontWeight: '700', letterSpacing: 1.2, color: c.faint, textTransform: 'uppercase', marginBottom: 3 },
  sectionTitle: { fontSize: font.h2, fontWeight: '800', color: c.ink, letterSpacing: -0.3 },
  empty: { alignItems: 'center', paddingVertical: sp(12) },
  emptyIcon: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: c.lineSoft, alignItems: 'center', justifyContent: 'center', marginBottom: sp(3) },
  emptyTitle: { fontSize: font.h3, fontWeight: '700', color: c.body },
  emptyHint: { fontSize: font.small, color: c.faint, marginTop: 4, textAlign: 'center', maxWidth: 280 },
  fieldLabel: { fontSize: font.small, fontWeight: '600', color: c.body, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: c.line, borderRadius: radius.md, paddingHorizontal: sp(3.5), paddingVertical: sp(3), fontSize: font.body, color: c.ink, backgroundColor: c.surfaceAlt },
})
