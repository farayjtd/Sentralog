import { useState } from 'react'
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Platform,
} from 'react-native'

interface Props {
  color: string
  title: string
  SidebarComponent: React.ComponentType
  children: React.ReactNode
  scroll?: boolean
}

/** Shell standar tiap halaman role: header + sidebar + body (meniru pola Admin/Absen). */
export default function RoleShell({ color, title, SidebarComponent, children, scroll = true }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={color} />

      <View style={[styles.header, { backgroundColor: color }]}>
        <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={styles.body}>
        {sidebarOpen && <SidebarComponent />}
        {scroll ? (
          <ScrollView style={styles.main} contentContainerStyle={{ padding: 20 }}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.main, { padding: 20 }]}>{children}</View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  menuBtn: { padding: 4 },
  menuIcon: { fontSize: 20, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1 },
})
