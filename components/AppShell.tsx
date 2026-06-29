import { ReactNode, useState } from 'react'
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView,
  useWindowDimensions, Pressable, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SidebarContent, RAIL_WIDTH } from './Sidebar'
import { ROLES } from '../lib/roles'
import { c, sp, radius, font, shadow } from '../lib/theme'

interface Props {
  role: string
  title: string
  subtitle?: string
  headerRight?: ReactNode
  children: ReactNode
  scroll?: boolean
}

const WIDE = 900

export default function AppShell({ role, title, subtitle, headerRight, children, scroll = true }: Props) {
  const { width } = useWindowDimensions()
  const isWide = width >= WIDE
  const [drawer, setDrawer] = useState(false)
  const def = ROLES[role]
  const accent = def?.accent ?? c.ink

  const Body = scroll ? ScrollView : View
  const bodyProps = scroll
    ? { contentContainerStyle: { padding: sp(isWide ? 7 : 4), paddingBottom: sp(16), maxWidth: 1100, width: '100%' as const, alignSelf: 'center' as const } }
    : { style: { flex: 1, padding: sp(isWide ? 7 : 4) } }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={c.surface} />

      {isWide && <SidebarContent role={role} />}

      <View style={styles.main}>
        {/* Top bar */}
        <View style={styles.topbar}>
          {!isWide && (
            <TouchableOpacity onPress={() => setDrawer(true)} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="menu" size={22} color={c.ink} />
            </TouchableOpacity>
          )}
          {!isWide && (
            <View style={[styles.miniMark, { backgroundColor: accent }]}>
              <Ionicons name="layers" size={14} color="#fff" />
            </View>
          )}
          <Text style={styles.topTitle} numberOfLines={1}>
            {isWide ? 'Sentralog' : title}
          </Text>
          <View style={{ flex: 1 }} />
          {isWide && def && (
            <View style={[styles.rolePill, { backgroundColor: def.soft }]}>
              <Ionicons name={def.icon} size={14} color={accent} />
              <Text style={[styles.rolePillText, { color: accent }]}>{def.label}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <Body {...bodyProps}>
          <View style={styles.pageHead}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pageEyebrow, { color: accent }]}>{def?.label ?? ''}</Text>
              <Text style={styles.pageTitle}>{title}</Text>
              {subtitle ? <Text style={styles.pageSub}>{subtitle}</Text> : null}
            </View>
            {headerRight}
          </View>
          {children}
        </Body>
      </View>

      {/* Mobile drawer */}
      {!isWide && drawer && (
        <View style={StyleSheet.absoluteFill as any}>
          <Pressable style={styles.scrim} onPress={() => setDrawer(false)} />
          <View style={[styles.drawer, shadow(3)]}>
            <SidebarContent role={role} onNavigate={() => setDrawer(false)} />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: c.bg },
  main: { flex: 1 },
  topbar: {
    height: 60, flexDirection: 'row', alignItems: 'center', gap: sp(2.5),
    paddingHorizontal: sp(4), backgroundColor: c.surface,
    borderBottomWidth: 1, borderBottomColor: c.line,
    paddingTop: Platform.OS === 'android' ? 6 : 0,
  },
  iconBtn: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  miniMark: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: font.h3, fontWeight: '800', color: c.ink, letterSpacing: -0.2 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: sp(3), paddingVertical: 7, borderRadius: radius.pill },
  rolePillText: { fontSize: font.small, fontWeight: '700' },
  pageHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: sp(5), gap: sp(3) },
  pageEyebrow: { fontSize: font.micro, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  pageTitle: { fontSize: font.display, fontWeight: '800', color: c.ink, letterSpacing: -0.6 },
  pageSub: { fontSize: font.body, color: c.muted, marginTop: 6, lineHeight: 20 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: RAIL_WIDTH },
})
