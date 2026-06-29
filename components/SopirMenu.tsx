// components/SopirMenu.tsx

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, usePathname } from 'expo-router'

const MENUS = [
  { key: '/(sopir)/absen', label: '📅 Absen Harian' },
  { key: '/(sopir)/status', label: '📍 Status Lokasi' },
]

export default function SopirMenu() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <View style={styles.container}>
      {MENUS.map(menu => {
        const isActive = pathname === menu.key

        return (
          <TouchableOpacity
            key={menu.key}
            style={[styles.btn, isActive && styles.active]}
            onPress={() => router.push(menu.key as any)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {menu.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    backgroundColor: '#eee',
  },

  btn: {
    backgroundColor: '#d9d9d9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },

  active: {
    backgroundColor: '#bdbdbd',
  },

  text: {
    fontSize: 13,
    color: '#333',
  },

  textActive: {
    fontWeight: '600',
  },
})