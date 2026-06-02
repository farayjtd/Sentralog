import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

interface Props {
  roleName: string
  color: string
}

export default function DashboardScreen({ roleName, color }: Props) {
  const router = useRouter()
  const { clearAuth, user } = useAuthStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearAuth()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={color} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <Text style={styles.appName}>Sentralog</Text>
        <Text style={styles.roleName}>{roleName}</Text>
        <Text style={styles.userName}>{user?.full_name ?? '-'}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Selamat datang,</Text>
          <Text style={[styles.nameText, { color }]}>{user?.full_name ?? '-'}</Text>
          <Text style={styles.roleText}>{roleName}</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  appName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  roleName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  userName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  body: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    elevation: 3,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    } : {}),
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  roleText: {
    fontSize: 13,
    color: '#aaa',
  },
  logoutBtn: {
    margin: 24,
    backgroundColor: '#e53935',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
})