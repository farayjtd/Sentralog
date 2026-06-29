import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, Platform, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import AppShell from '../../components/AppShell'
import { Card, Button, Badge, SectionHeader, EmptyState, Skeleton, IconChip } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { deliveryBadge } from '../../lib/status'
import { c, sp, radius, font, numStyle } from '../../lib/theme'

const ACCENT = '#ea580c'
const ACTIVE = ['disiapkan', 'driver_acc', 'berangkat']

interface Delivery { id: string; status: string; project?: { name: string; client_address?: string; install_lat?: number; install_lng?: number } }

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export default function SopirLokasi() {
  const { user } = useAuthStore()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('deliveries').select('id, status, project:project_id(name, client_address, install_lat, install_lng)').eq('driver_id', user!.id).in('status', ACTIVE)
    setDeliveries((data as any) ?? []); setLoading(false)
  }, [user])

  const getGps = useCallback(async () => {
    setGpsLoading(true)
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) { setGpsLoading(false); return }
      navigator.geolocation.getCurrentPosition(
        (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGpsLoading(false) },
        () => { Alert.alert('GPS', 'Tidak bisa mengambil lokasi.'); setGpsLoading(false) },
        { enableHighAccuracy: true, timeout: 10000 }
      )
      return
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') { Alert.alert('Izin lokasi', 'Izin lokasi diperlukan.'); setGpsLoading(false); return }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setPos({ lat: loc.coords.latitude, lng: loc.coords.longitude })
    } catch (e: any) { Alert.alert('GPS', e.message) }
    finally { setGpsLoading(false) }
  }, [])

  useEffect(() => { load(); getGps() }, [])

  return (
    <AppShell role="sopir" title="Status Lokasi" subtitle="Lokasi Anda & tujuan pengiriman.">
      <Card accent={ACCENT} style={{ marginBottom: sp(6) }}>
        <View style={styles.gpsHead}>
          <IconChip name="location" color={ACCENT} />
          <View style={{ flex: 1 }}>
            <Text style={styles.gpsLabel}>Lokasi saya saat ini</Text>
            <Text style={[styles.gpsValue, numStyle]}>{pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : 'Belum terdeteksi'}</Text>
          </View>
        </View>
        <View style={{ height: sp(3) }} />
        <Button label="Perbarui lokasi" icon="refresh" accent={ACCENT} onPress={getGps} loading={gpsLoading} full />
      </Card>

      <SectionHeader eyebrow="Tugas" title="Pengiriman aktif"
        action={<Ionicons name="navigate" size={18} color={c.faint} />} />

      {loading ? (
        <View>{[0, 1].map((i) => <Skeleton key={i} height={104} />)}</View>
      ) : deliveries.length === 0 ? (
        <Card><EmptyState icon="cube-outline" title="Tidak ada pengiriman aktif" hint="Tugas pengiriman baru akan tampil di sini." /></Card>
      ) : (
        deliveries.map((d) => {
          const b = deliveryBadge(d.status)
          const lat = d.project?.install_lat
          const lng = d.project?.install_lng
          const dist = pos && lat && lng ? distanceKm(pos.lat, pos.lng, lat, lng) : null
          return (
            <Card key={d.id} style={{ marginBottom: sp(3) }}>
              <View style={styles.head}>
                <IconChip name="cube-outline" color={ACCENT} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{d.project?.name ?? 'Pengiriman'}</Text>
                  <Text style={styles.sub} numberOfLines={1}>{d.project?.client_address ?? 'Alamat belum diisi'}</Text>
                </View>
                <Badge text={b.text} color={b.color} bg={b.bg} />
              </View>
              {dist !== null && (
                <View style={styles.distRow}>
                  <Ionicons name="navigate-circle-outline" size={16} color={ACCENT} />
                  <Text style={[styles.dist, numStyle]}>± {dist.toFixed(1)} km dari lokasi Anda</Text>
                </View>
              )}
            </Card>
          )
        })
      )}
    </AppShell>
  )
}

const styles = StyleSheet.create({
  gpsHead: { flexDirection: 'row', alignItems: 'center', gap: sp(3) },
  gpsLabel: { fontSize: font.small, color: c.muted },
  gpsValue: { fontSize: font.h2, fontWeight: '800', color: c.ink, marginTop: 2, letterSpacing: -0.3 },
  head: { flexDirection: 'row', alignItems: 'center', gap: sp(3) },
  title: { fontSize: font.h3, fontWeight: '700', color: c.ink },
  sub: { fontSize: font.small, color: c.muted, marginTop: 1 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: sp(3), paddingTop: sp(3), borderTopWidth: 1, borderTopColor: c.lineSoft },
  dist: { fontSize: font.small, fontWeight: '700', color: ACCENT },
})
