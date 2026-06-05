import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

const MENUS = [
  { key: '/(sopir)', label: '🏠 Dashboard' },
  { key: '/(sopir)/absen', label: '📅 Absensi' },
]

export default function SopirSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { clearAuth, user } = useAuthStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearAuth()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.charAt(0) ?? 'S'}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{user?.full_name}</Text>
        <Text style={styles.role}>Sopir</Text>
      </View>
      {MENUS.map(menu => {
        const isActive = pathname === menu.key
        return (
          <TouchableOpacity
            key={menu.key}
            style={[styles.menuItem, isActive && styles.menuItemActive]}
            onPress={() => router.push(menu.key as any)}
          >
            <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{menu.label}</Text>
          </TouchableOpacity>
        )
      })}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  sidebar: { width: 210, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#eee', flexDirection: 'column' },
  profile: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e65100', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  name: { fontSize: 13, fontWeight: '600', color: '#1a1a2e', textAlign: 'center' },
  role: { fontSize: 11, color: '#888', marginTop: 2 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16, borderLeftWidth: 3, borderLeftColor: 'transparent' },
  menuItemActive: { backgroundColor: '#fff3e0', borderLeftColor: '#e65100' },
  menuLabel: { fontSize: 13, color: '#555' },
  menuLabelActive: { color: '#e65100', fontWeight: '600' },
  logoutBtn: { marginTop: 'auto', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  logoutText: { fontSize: 13, color: '#c62828', fontWeight: '500' },
})