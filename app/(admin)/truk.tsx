import { useState } from 'react'
import { View, Text, StyleSheet, StatusBar } from 'react-native'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'

export default function TrukPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <AdminHeader title="Data Truk" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <View style={styles.body}>
        {sidebarOpen && <AdminSidebar />}
        <View style={styles.main}>
          <Text style={styles.icon}>🚛</Text>
          <Text style={styles.title}>Manajemen Truk</Text>
          <Text style={styles.sub}>Segera hadir</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 6 },
  sub: { fontSize: 14, color: '#888' },
})