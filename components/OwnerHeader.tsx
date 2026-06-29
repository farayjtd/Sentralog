import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'

interface Props {
  title: string
  onToggleSidebar: () => void
}

export default function OwnerHeader({ title, onToggleSidebar }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onToggleSidebar} style={styles.menuBtn}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1a1a2e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  menuBtn: { padding: 4, marginRight: 12 },
  menuIcon: { fontSize: 20, color: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
})