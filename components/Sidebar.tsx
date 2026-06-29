import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { ROLES } from '../lib/roles'
import { c, sp, radius, font } from '../lib/theme'

export const RAIL_WIDTH = 252

export function SidebarContent({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const def = ROLES[role]
  const router = useRouter()
  const pathname = usePathname()
  const { clearAuth, user } = useAuthStore()

  if (!def) return null

  const go = (key: string) => {
    onNavigate?.()
    router.push(key as any)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    clearAuth()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.rail}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={[styles.mark, { backgroundColor: def.accent }]}>
          <Ionicons name="layers" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.wordmark}>Sentralog</Text>
          <Text style={[styles.roleTag, { color: def.accent }]}>{def.label}</Text>
        </View>
      </View>

      {/* Menu */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: sp(2) }} showsVerticalScrollIndicator={false}>
        <Text style={styles.navlabel}>Menu</Text>
        {def.menu.map((m) => {
          const active = pathname === m.key || (m.key !== `/(${role.replace('_', '-')})` && m.key.split('/').length > 2 && pathname.startsWith(m.key))
          const isActive = pathname === m.key || active
          return (
            <TouchableOpacity
              key={m.key}
              activeOpacity={0.7}
              onPress={() => go(m.key)}
              style={[styles.item, isActive && { backgroundColor: def.soft }]}
            >
              <View style={[styles.activeBar, isActive && { backgroundColor: def.accent }]} />
              <Ionicons name={m.icon} size={19} color={isActive ? def.accent : c.muted} />
              <Text style={[styles.itemLabel, isActive && { color: def.accent, fontWeight: '700' }]}>{m.label}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Profile + logout */}
      <View style={styles.footer}>
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: def.accent }]}>
            <Text style={styles.avatarText}>{user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName} numberOfLines={1}>{user?.full_name ?? '-'}</Text>
            <Text style={styles.profileRole} numberOfLines={1}>{def.label}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logout} onPress={logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={c.danger} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rail: { width: RAIL_WIDTH, alignSelf: 'stretch', backgroundColor: c.surface, borderRightWidth: 1, borderRightColor: c.line },
  brand: { flexDirection: 'row', alignItems: 'center', gap: sp(3), paddingHorizontal: sp(4), paddingTop: sp(5), paddingBottom: sp(4), borderBottomWidth: 1, borderBottomColor: c.lineSoft },
  mark: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontSize: font.h3, fontWeight: '800', color: c.ink, letterSpacing: -0.3 },
  roleTag: { fontSize: font.micro, fontWeight: '700', letterSpacing: 0.3, marginTop: 1 },
  navlabel: { fontSize: font.micro, fontWeight: '700', letterSpacing: 1.2, color: c.faint, textTransform: 'uppercase', paddingHorizontal: sp(4), marginTop: sp(2), marginBottom: sp(2) },
  item: { flexDirection: 'row', alignItems: 'center', gap: sp(3), paddingVertical: sp(2.75), paddingRight: sp(4), borderRadius: radius.md, marginHorizontal: sp(2.5), marginBottom: 2 },
  activeBar: { width: 3, height: 18, borderRadius: 2, backgroundColor: 'transparent', marginRight: -2 },
  itemLabel: { fontSize: font.small, color: c.body, fontWeight: '500' },
  footer: { borderTopWidth: 1, borderTopColor: c.lineSoft, padding: sp(3) },
  profile: { flexDirection: 'row', alignItems: 'center', gap: sp(2.5), padding: sp(2), borderRadius: radius.md },
  avatar: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: font.body },
  profileName: { fontSize: font.small, fontWeight: '700', color: c.ink },
  profileRole: { fontSize: font.micro, color: c.faint, marginTop: 1 },
  logout: { flexDirection: 'row', alignItems: 'center', gap: sp(2), paddingVertical: sp(2.5), paddingHorizontal: sp(2), marginTop: sp(1.5), borderRadius: radius.md },
  logoutText: { fontSize: font.small, fontWeight: '600', color: c.danger },
})
