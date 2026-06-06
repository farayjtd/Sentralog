import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import KepalaWHSidebar from '../../components/KepalaWHSidebar'

export default function KepalaWHDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6a1b9a" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>
      <View style={styles.body}>
        {sidebarOpen && <KepalaWHSidebar />}
        <View style={styles.main}>
          <Text style={styles.title}>Selamat Datang 👋</Text>
          <Text style={styles.sub}>Pilih menu di sidebar</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { paddingTop: 48, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#6a1b9a' },
  menuBtn: { padding: 4 },
  menuIcon: { fontSize: 20, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  sub: { fontSize: 13, color: '#888', marginTop: 6 },
})