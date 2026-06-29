import { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Platform, StatusBar, Image, Alert, Modal
} from 'react-native'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import AppShell from './AppShell'
import { roleAccent } from '../lib/roles'
import { c, sp, radius, font, shadow, numStyle } from '../lib/theme'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

interface Warehouse {
  id: string
  name: string
  lat: number
  lng: number
}

interface Project {
  id: string
  name: string
  install_lat: number
  install_lng: number
}

interface Attendance {
  id: string
  date: string
  location_type: string
  check_in_at: string
  check_in_photo?: string
  is_mock_gps: boolean
  warehouse?: { name: string }
  project?: { name: string }
}

type LocationRule = 'wh_only' | 'lapangan_only' | 'both' | 'free'

interface Props {
  color: string
  locationRule: LocationRule
  roleName: string
  role?: string
  SidebarComponent?: React.ComponentType
  headerTitle: string
}

const GEOFENCE_RADIUS = 200

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function AbsenPage({ color, locationRule, roleName, role, SidebarComponent, headerTitle }: Props) {
  const { user } = useAuthStore()
  const accent = role ? roleAccent(role) : color

  // Absen form state
  const [showAbsenForm, setShowAbsenForm] = useState(false)
  const [step, setStep] = useState<'pilih' | 'foto' | 'proses' | 'selesai'>('pilih')
  const [locationType, setLocationType] = useState<'wh' | 'lapangan' | 'kantor' | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedWH, setSelectedWH] = useState<Warehouse | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [photoUri, setPhotoUri] = useState('')
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'ok' | 'fake' | 'jauh' | 'error'>('idle')
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<any>(null)
  const canvasRef = useRef<any>(null)
  const streamRef = useRef<any>(null)

  // Rekap state
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (user) {
      fetchTodayAttendance()
      fetchAttendances()
      fetchData()
    }
  }, [user])

  useEffect(() => {
    if (user) fetchAttendances()
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    if (locationRule === 'wh_only') setLocationType('wh')
    if (locationRule === 'lapangan_only') setLocationType('lapangan')
    if (locationRule === 'free') setLocationType('kantor')
  }, [locationRule])

  const fetchTodayAttendance = async () => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('attendances')
      .select('*, warehouse:warehouse_id(name), project:project_id(name)')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('check_in_at', { ascending: true })
    if (data) setTodayAttendance(data)
  }

  const fetchAttendances = async () => {
    if (!user) return
    setLoading(true)
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]
    const { data } = await supabase
      .from('attendances')
      .select('*, warehouse:warehouse_id(name), project:project_id(name)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    if (data) setAttendances(data)
    setLoading(false)
  }

  const fetchData = async () => {
    if (!user) return
    if (locationRule === 'wh_only' || locationRule === 'both') {
      if (roleName === 'Kepala WH') {
        const { data } = await supabase
          .from('warehouses')
          .select('id, name, lat, lng')
          .eq('head_user_id', user.id)
          .eq('is_active', true)
        if (data) setWarehouses(data)
      } else if (roleName === 'Sopir') {
        const { data: deliveries } = await supabase
          .from('deliveries')
          .select('project:project_id(warehouse_id)')
          .eq('driver_id', user.id)
          .eq('status', 'disiapkan')
        if (deliveries?.length) {
          const whIds = deliveries.map((d: any) => d.project?.warehouse_id).filter(Boolean)
          if (whIds.length) {
            const { data: whs } = await supabase
              .from('warehouses')
              .select('id, name, lat, lng')
              .in('id', whIds)
            if (whs) setWarehouses(whs)
          }
        }
      } else {
        const { data } = await supabase
          .from('warehouses')
          .select('id, name, lat, lng')
          .eq('is_active', true)
        if (data) setWarehouses(data)
      }
    }
    if (locationRule === 'lapangan_only' || locationRule === 'both') {
      const { data } = await supabase
        .from('projects')
        .select('id, name, install_lat, install_lng')
        .in('status', ['pengiriman', 'pemasangan'])
      if (data) setProjects(data)
    }
  }

  const checkGPS = async (targetLat?: number, targetLng?: number): Promise<boolean> => {
    if (locationRule === 'free') {
      setGpsStatus('ok')
      setCurrentLocation({ lat: 0, lng: 0 })
      return true
    }
    if (Platform.OS === 'web') {
      return new Promise(resolve => {
        if (!navigator.geolocation) {
          setGpsStatus('ok')
          setCurrentLocation({ lat: 0, lng: 0 })
          resolve(true)
          return
        }
        navigator.geolocation.getCurrentPosition(
          pos => {
            const { latitude: lat, longitude: lng } = pos.coords
            setCurrentLocation({ lat, lng })
            if (targetLat && targetLng) {
              const dist = getDistance(lat, lng, targetLat, targetLng)
              if (dist > GEOFENCE_RADIUS) {
                setGpsStatus('jauh')
                Alert.alert('Diluar Radius', `Anda berada ${Math.round(dist)}m dari lokasi. Maksimal ${GEOFENCE_RADIUS}m.`)
                resolve(false)
                return
              }
            }
            setGpsStatus('ok')
            resolve(true)
          },
          () => {
            setGpsStatus('ok')
            setCurrentLocation({ lat: 0, lng: 0 })
            resolve(true)
          },
          { enableHighAccuracy: true, timeout: 10000 }
        )
      })
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Error', 'Izin lokasi diperlukan')
        return false
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      if ((loc.coords as any).mocked) {
        setGpsStatus('fake')
        setCurrentLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude })
        return true
      }
      setCurrentLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude })
      if (targetLat && targetLng) {
        const dist = getDistance(loc.coords.latitude, loc.coords.longitude, targetLat, targetLng)
        if (dist > GEOFENCE_RADIUS) {
          setGpsStatus('jauh')
          Alert.alert('Diluar Radius', `Anda berada ${Math.round(dist)}m dari lokasi.`)
          return false
        }
      }
      setGpsStatus('ok')
      return true
    } catch {
      setGpsStatus('error')
      Alert.alert('Error', 'Gagal mendapatkan lokasi GPS')
      return false
    }
  }

  const openCamera = async () => {
    setShowCamera(true)
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      } catch {
        Alert.alert('Error', 'Gagal akses kamera')
        setShowCamera(false)
      }
    }, 300)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      setPhotoUri(canvas.toDataURL('image/jpeg', 0.8))
      stopCamera()
      setShowCamera(false)
      setStep('foto')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t: any) => t.stop())
      streamRef.current = null
    }
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!user || !photoUri) return null
    try {
      const response = await fetch(photoUri)
      const blob = await response.blob()
      const today = new Date().toISOString().split('T')[0]
      const fileName = `${user.id}/${today}-${Date.now()}.jpg`
      const { error } = await supabase.storage.from('attendance-photos').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) throw error
      const { data } = supabase.storage.from('attendance-photos').getPublicUrl(fileName)
      return data.publicUrl
    } catch (e: any) {
      Alert.alert('Error', 'Gagal upload foto: ' + e.message)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!user || !locationType) return
    if (!photoUri) { Alert.alert('Perhatian', 'Foto selfie wajib diambil'); return }

    const targetLat = locationType === 'wh' ? selectedWH?.lat : locationType === 'lapangan' ? selectedProject?.install_lat : undefined
    const targetLng = locationType === 'wh' ? selectedWH?.lng : locationType === 'lapangan' ? selectedProject?.install_lng : undefined

    setStep('proses')

    let isMockGps = false
    let loc = currentLocation

    if (Platform.OS === 'web' || locationRule === 'free') {
      setGpsStatus('ok')
      loc = { lat: 0, lng: 0 }
    } else {
      const ok = await checkGPS(targetLat, targetLng)
      if (!ok && gpsStatus !== 'fake') { setStep('foto'); return }
      isMockGps = gpsStatus === 'fake'
      loc = currentLocation
    }

    const photoUrl = await uploadPhoto()
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase.from('attendances').insert({
      user_id: user.id,
      warehouse_id: locationType === 'wh' ? selectedWH?.id : null,
      project_id: locationType === 'lapangan' ? selectedProject?.id : null,
      date: today,
      location_type: locationType === 'kantor' ? 'wh' : locationType,
      check_in_at: new Date().toISOString(),
      check_in_lat: loc?.lat ?? null,
      check_in_lng: loc?.lng ?? null,
      check_in_photo: photoUrl,
      is_mock_gps: isMockGps,
      is_manual: false,
    })

    if (error) { Alert.alert('Error', error.message); setStep('foto'); return }

    setStep('selesai')
  }

  const handleLanjut = async () => {
    if (locationType === 'wh' && !selectedWH) { Alert.alert('Perhatian', 'Pilih warehouse terlebih dahulu'); return }
    if (locationType === 'lapangan' && !selectedProject) { Alert.alert('Perhatian', 'Pilih project terlebih dahulu'); return }
    await openCamera()
  }

  const resetAbsen = () => {
    setStep('pilih')
    setPhotoUri('')
    setSelectedWH(null)
    setSelectedProject(null)
    setGpsStatus('idle')
    setCurrentLocation(null)
    if (locationRule === 'wh_only') setLocationType('wh')
    else if (locationRule === 'lapangan_only') setLocationType('lapangan')
    else if (locationRule === 'free') setLocationType('kantor')
    else setLocationType(null)
  }

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
  const uniqueDays = new Set(attendances.map(a => a.date)).size

  return (
    <AppShell role={role ?? 'tukang'} title={headerTitle}>
            {/* ===== ABSEN HARI INI ===== */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Absensi Hari Ini</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>

              {todayAttendance.length > 0 && todayAttendance.map(a => (
                <View key={a.id} style={styles.todayCard}>
                  <View style={styles.todayLeft}>
                    <View style={[styles.badge, { backgroundColor: a.location_type === 'wh' ? '#e3f2fd' : '#f3e5f5' }]}>
                      <Text style={[styles.badgeText, { color: a.location_type === 'wh' ? '#1565c0' : '#6a1b9a' }]}>
                        {a.location_type === 'wh' ? '🏭 WH' : '📍 Lapangan'}
                      </Text>
                    </View>
                    <Text style={styles.todayLoc}>
                      {a.location_type === 'wh' ? (a.warehouse?.name ?? '-') : (a.project?.name ?? 'Lapangan')}
                    </Text>
                    <Text style={styles.todayTime}>Masuk: {formatTime(a.check_in_at)}</Text>
                    {a.is_mock_gps && <Text style={styles.mockWarn}>⚠️ Fake GPS terdeteksi</Text>}
                  </View>
                  {!!a.check_in_photo && <Image source={{ uri: a.check_in_photo }} style={styles.todayPhoto} />}
                </View>
              ))}

              {/* Form Absen */}
              {!showAbsenForm ? (
                <TouchableOpacity style={[styles.absenBtn, { backgroundColor: color }]} onPress={() => { resetAbsen(); setShowAbsenForm(true) }}>
                  <Text style={styles.absenBtnText}>📸 Absen Sekarang</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.absenForm, { borderColor: color + '40' }]}>
                  <View style={styles.absenFormHeader}>
                    <Text style={[styles.absenFormTitle, { color }]}>Form Absensi</Text>
                    {step !== 'proses' && (
                      <TouchableOpacity onPress={() => setShowAbsenForm(false)}>
                        <Text style={styles.absenFormClose}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* STEP: Pilih Lokasi */}
                  {step === 'pilih' && (
                    <View>
                      {/* Info box */}
                      <View style={[styles.infoBox, { borderColor: color + '40', backgroundColor: color + '10' }]}>
                        <Text style={[styles.infoText, { color }]}>
                          {locationRule === 'free' && '🏢 Absen dapat dilakukan dari mana saja'}
                          {locationRule === 'wh_only' && roleName === 'Kepala WH' && '🏭 Absen di warehouse yang Anda kepalai'}
                          {locationRule === 'wh_only' && roleName === 'Sopir' && '🚛 Absen di warehouse saat ada tugas pengiriman'}
                          {locationRule === 'lapangan_only' && '📍 Absen di lokasi project yang sedang berjalan'}
                        </Text>
                      </View>

                      {/* Pilih tipe lokasi untuk tukang (both) */}
                      {locationRule === 'both' && (
                        <View style={{ marginBottom: 12 }}>
                          <TouchableOpacity
                            style={[styles.locOption, locationType === 'wh' && { borderColor: color, backgroundColor: color + '10' }]}
                            onPress={() => setLocationType('wh')}
                          >
                            <Text style={styles.locOptionIcon}>🏭</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.locOptionTitle}>Absen di Warehouse</Text>
                            </View>
                            {locationType === 'wh' && <Text style={{ color }}>✓</Text>}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.locOption, locationType === 'lapangan' && { borderColor: color, backgroundColor: color + '10' }]}
                            onPress={() => setLocationType('lapangan')}
                          >
                            <Text style={styles.locOptionIcon}>📍</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.locOptionTitle}>Absen di Lapangan</Text>
                            </View>
                            {locationType === 'lapangan' && <Text style={{ color }}>✓</Text>}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Pilih WH */}
                      {locationType === 'wh' && (
                        <View style={styles.subSection}>
                          <Text style={styles.subLabel}>Pilih Warehouse</Text>
                          {warehouses.length === 0 ? (
                            <Text style={styles.emptySmall}>
                              {roleName === 'Sopir' ? 'Tidak ada tugas pengiriman aktif' : 'Tidak ada warehouse tersedia'}
                            </Text>
                          ) : warehouses.map(w => (
                            <TouchableOpacity
                              key={w.id}
                              style={[styles.subOption, selectedWH?.id === w.id && { borderColor: color, backgroundColor: color + '10' }]}
                              onPress={() => setSelectedWH(w)}
                            >
                              <Text style={styles.subOptionText}>{w.name}</Text>
                              {selectedWH?.id === w.id && <Text style={{ color }}>✓</Text>}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {/* Pilih Project */}
                      {locationType === 'lapangan' && (
                        <View style={styles.subSection}>
                          <Text style={styles.subLabel}>Pilih Project</Text>
                          {projects.length === 0 ? (
                            <Text style={styles.emptySmall}>Tidak ada project aktif di lapangan</Text>
                          ) : projects.map(p => (
                            <TouchableOpacity
                              key={p.id}
                              style={[styles.subOption, selectedProject?.id === p.id && { borderColor: color, backgroundColor: color + '10' }]}
                              onPress={() => setSelectedProject(p)}
                            >
                              <Text style={styles.subOptionText}>{p.name}</Text>
                              {selectedProject?.id === p.id && <Text style={{ color }}>✓</Text>}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      <TouchableOpacity
                        style={[styles.nextBtn, { backgroundColor: color }]}
                        onPress={locationRule === 'free' ? () => openCamera() : handleLanjut}
                      >
                        <Text style={styles.nextBtnText}>Ambil Foto Selfie →</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* STEP: Foto */}
                  {step === 'foto' && (
                    <View style={styles.fotoWrap}>
                      {photoUri ? (
                        <View style={{ alignItems: 'center' }}>
                          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                          <TouchableOpacity style={styles.retakeBtn} onPress={() => { setPhotoUri(''); openCamera() }}>
                            <Text style={styles.retakeBtnText}>📷 Ambil Ulang</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: color }]} onPress={handleSubmit}>
                            <Text style={styles.submitBtnText}>✓ Kirim Absensi</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: color }]} onPress={() => openCamera()}>
                          <Text style={styles.nextBtnText}>📷 Buka Kamera</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* STEP: Proses */}
                  {step === 'proses' && (
                    <View style={styles.prosesWrap}>
                      <ActivityIndicator size="large" color={color} />
                      <Text style={styles.prosesText}>Memproses absensi...</Text>
                    </View>
                  )}

                  {/* STEP: Selesai */}
                  {step === 'selesai' && (
                    <View style={styles.selesaiWrap}>
                      <Text style={styles.selesaiIcon}>✅</Text>
                      <Text style={styles.selesaiTitle}>Absensi Berhasil!</Text>
                      <Text style={styles.selesaiSub}>
                        {formatTime(new Date().toISOString())}
                        {' · '}
                        {locationType === 'wh' ? (selectedWH?.name ?? 'WH') : locationType === 'lapangan' ? (selectedProject?.name ?? 'Lapangan') : 'Kantor'}
                      </Text>
                      {gpsStatus === 'fake' && <Text style={styles.fakeWarn}>⚠️ Fake GPS terdeteksi, absensi ditandai</Text>}
                      <TouchableOpacity
                        style={[styles.doneBtn, { backgroundColor: color }]}
                        onPress={() => {
                          setShowAbsenForm(false)
                          resetAbsen()
                          fetchTodayAttendance()
                          fetchAttendances()
                        }}
                      >
                        <Text style={styles.doneBtnText}>Selesai</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* ===== REKAP BULANAN ===== */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rekap Absensi</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
                {MONTHS.map((m, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.monthChip, selectedMonth === idx + 1 && { backgroundColor: color, borderColor: color }]}
                    onPress={() => setSelectedMonth(idx + 1)}
                  >
                    <Text style={[styles.monthChipText, selectedMonth === idx + 1 && { color: '#fff' }]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.yearRow}>
                <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={styles.yearBtn}>
                  <Text style={styles.yearBtnText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.yearText}>{selectedYear}</Text>
                <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} style={styles.yearBtn}>
                  <Text style={styles.yearBtnText}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { borderLeftColor: color }]}>
                  <Text style={styles.summaryNum}>{uniqueDays}</Text>
                  <Text style={styles.summaryLabel}>Hari Hadir</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#1565c0' }]}>
                  <Text style={styles.summaryNum}>{attendances.filter(a => a.location_type === 'wh').length}</Text>
                  <Text style={styles.summaryLabel}>Absen WH</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#6a1b9a' }]}>
                  <Text style={styles.summaryNum}>{attendances.filter(a => a.location_type === 'lapangan').length}</Text>
                  <Text style={styles.summaryLabel}>Lapangan</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#e65100' }]}>
                  <Text style={styles.summaryNum}>{attendances.filter(a => a.is_mock_gps).length}</Text>
                  <Text style={styles.summaryLabel}>Fake GPS</Text>
                </View>
              </View>

              {loading ? (
                <ActivityIndicator color={color} style={{ marginTop: 16 }} />
              ) : attendances.length === 0 ? (
                <Text style={styles.emptySmall}>Tidak ada data absensi bulan ini</Text>
              ) : (
                <View>
                  <View style={styles.listHeader}>
                    <Text style={[styles.listTh, { flex: 1.5 }]}>Tanggal</Text>
                    <Text style={[styles.listTh, { flex: 1 }]}>Lokasi</Text>
                    <Text style={[styles.listTh, { flex: 1 }]}>Jam Masuk</Text>
                    <Text style={[styles.listTh, { flex: 0.5 }]}>GPS</Text>
                  </View>
                  {attendances.map((a, i) => (
                    <View key={a.id} style={[styles.listRow, i % 2 === 0 && styles.listRowAlt]}>
                      <Text style={[styles.listTd, { flex: 1.5 }]}>{formatDate(a.date)}</Text>
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <View style={[styles.badge, { backgroundColor: a.location_type === 'wh' ? '#e3f2fd' : '#f3e5f5' }]}>
                          <Text style={[styles.badgeText, { color: a.location_type === 'wh' ? '#1565c0' : '#6a1b9a', fontSize: 10 }]}>
                            {a.location_type === 'wh' ? '🏭 WH' : '📍 Lapangan'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.listTd, { flex: 1 }]}>{formatTime(a.check_in_at)}</Text>
                      <Text style={[styles.listTd, { flex: 0.5 }]}>{a.is_mock_gps ? '⚠️' : '✅'}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

      {/* Modal Kamera */}
      <Modal visible={showCamera} transparent animationType="fade" onRequestClose={() => { stopCamera(); setShowCamera(false) }}>
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraBox}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Ambil Foto Selfie</Text>
              <TouchableOpacity onPress={() => { stopCamera(); setShowCamera(false) }}>
                <Text style={styles.cameraClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'web' && (
              <View style={{ flex: 1 }}>
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' } as any} playsInline muted />
                <canvas ref={canvasRef} style={{ display: 'none' } as any} />
              </View>
            )}
            <TouchableOpacity style={[styles.captureBtn, { backgroundColor: color }]} onPress={capturePhoto}>
              <Text style={styles.captureBtnText}>📸 Ambil Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppShell>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: c.surface, borderRadius: radius.lg, padding: sp(4), marginBottom: sp(4), borderWidth: 1, borderColor: c.line, ...shadow(1) },
  cardTitle: { fontSize: font.h2, fontWeight: '800', color: c.ink, marginBottom: 4, letterSpacing: -0.3 },
  dateText: { fontSize: font.small, color: c.muted, marginBottom: sp(3) },
  todayCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.surfaceAlt, borderRadius: radius.md, padding: sp(3), marginBottom: sp(2), borderWidth: 1, borderColor: c.lineSoft },
  todayLeft: { flex: 1 },
  badge: { paddingHorizontal: sp(2.5), paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start', marginBottom: 4 },
  badgeText: { fontSize: font.micro, fontWeight: '700' },
  todayLoc: { fontSize: font.body, fontWeight: '600', color: c.ink, marginBottom: 2 },
  todayTime: { fontSize: font.small, color: c.muted },
  mockWarn: { fontSize: font.micro, color: c.danger, marginTop: 4, fontWeight: '600' },
  todayPhoto: { width: 52, height: 52, borderRadius: radius.md, marginLeft: sp(2) },
  absenBtn: { borderRadius: radius.md, paddingVertical: sp(3.5), alignItems: 'center', marginTop: sp(3), ...shadow(1) },
  absenBtnText: { color: '#fff', fontSize: font.body, fontWeight: '700' },
  absenForm: { borderWidth: 1, borderRadius: radius.lg, padding: sp(3.5), marginTop: sp(3), backgroundColor: c.surfaceAlt },
  absenFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sp(3) },
  absenFormTitle: { fontSize: font.h3, fontWeight: '700' },
  absenFormClose: { fontSize: 18, color: c.faint, fontWeight: '600' },
  infoBox: { borderWidth: 1, borderRadius: radius.md, padding: sp(2.5), marginBottom: sp(3) },
  infoText: { fontSize: font.small, fontWeight: '600' },
  locOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.md, padding: sp(3), marginBottom: sp(2), borderWidth: 1.5, borderColor: c.line, gap: sp(2.5) },
  locOptionIcon: { fontSize: 22 },
  locOptionTitle: { fontSize: font.body, fontWeight: '700', color: c.ink },
  subSection: { backgroundColor: c.surface, borderRadius: radius.md, padding: sp(3), marginBottom: sp(2.5), borderWidth: 1, borderColor: c.lineSoft },
  subLabel: { fontSize: font.small, fontWeight: '600', color: c.body, marginBottom: sp(2) },
  subOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: sp(2.5), borderRadius: radius.sm, borderWidth: 1, borderColor: c.line, marginBottom: 6, backgroundColor: c.surface },
  subOptionText: { fontSize: font.small, color: c.body },
  nextBtn: { borderRadius: radius.md, paddingVertical: sp(3), alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: font.small, fontWeight: '700' },
  fotoWrap: { alignItems: 'center' },
  photoPreview: { width: 200, height: 200, borderRadius: radius.lg, marginBottom: sp(3) },
  retakeBtn: { borderWidth: 1, borderColor: c.line, borderRadius: radius.md, paddingVertical: sp(2.5), paddingHorizontal: sp(5), marginBottom: sp(2), width: '100%', alignItems: 'center' },
  retakeBtnText: { fontSize: font.small, color: c.body, fontWeight: '600' },
  submitBtn: { borderRadius: radius.md, paddingVertical: sp(3), alignItems: 'center', width: '100%' },
  submitBtnText: { color: '#fff', fontSize: font.body, fontWeight: '700' },
  prosesWrap: { alignItems: 'center', paddingVertical: sp(6) },
  prosesText: { fontSize: font.body, color: c.body, marginTop: sp(3) },
  selesaiWrap: { alignItems: 'center', paddingVertical: sp(4) },
  selesaiIcon: { fontSize: 48, marginBottom: sp(2) },
  selesaiTitle: { fontSize: font.h1, fontWeight: '800', color: c.ink, marginBottom: 4 },
  selesaiSub: { fontSize: font.small, color: c.muted, marginBottom: sp(2) },
  fakeWarn: { fontSize: font.small, color: c.danger, marginBottom: sp(2), fontWeight: '600' },
  doneBtn: { borderRadius: radius.md, paddingVertical: sp(2.5), paddingHorizontal: sp(7), alignItems: 'center', marginTop: sp(2) },
  doneBtnText: { color: '#fff', fontSize: font.small, fontWeight: '700' },
  monthScroll: { marginBottom: sp(2.5) },
  monthChip: { paddingHorizontal: sp(3), paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: c.line, marginRight: sp(2), backgroundColor: c.surface },
  monthChipText: { fontSize: font.small, color: c.body, fontWeight: '600' },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: sp(3.5) },
  yearBtn: { padding: sp(2) },
  yearBtnText: { fontSize: 20, color: c.ink },
  yearText: { fontSize: font.body, fontWeight: '700', color: c.ink, marginHorizontal: sp(4) },
  summaryRow: { flexDirection: 'row', gap: sp(2), marginBottom: sp(3.5), flexWrap: 'wrap' },
  summaryCard: { flexGrow: 1, flexBasis: 70, backgroundColor: c.surfaceAlt, borderRadius: radius.md, padding: sp(2.5), borderLeftWidth: 3, borderWidth: 1, borderColor: c.lineSoft },
  summaryNum: { fontSize: font.h1, fontWeight: '800', color: c.ink, ...numStyle },
  summaryLabel: { fontSize: font.micro, color: c.muted, marginTop: 2 },
  listHeader: { flexDirection: 'row', backgroundColor: c.surfaceAlt, padding: sp(2), borderRadius: radius.sm, marginBottom: 4 },
  listTh: { fontSize: font.micro, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.3 },
  listRow: { flexDirection: 'row', paddingVertical: sp(2), paddingHorizontal: 4, alignItems: 'center' },
  listRowAlt: { backgroundColor: c.surfaceAlt, borderRadius: 4 },
  listTd: { fontSize: font.small, color: c.body },
  emptySmall: { textAlign: 'center', color: c.faint, fontSize: font.small, paddingVertical: sp(4) },
  cameraOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', justifyContent: 'center', alignItems: 'center' },
  cameraBox: { width: '90%', maxWidth: 400, backgroundColor: '#000', borderRadius: radius.lg, overflow: 'hidden', height: 480 },
  cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: sp(3.5), backgroundColor: '#111' },
  cameraTitle: { color: '#fff', fontSize: font.body, fontWeight: '600' },
  cameraClose: { color: '#fff', fontSize: 18 },
  captureBtn: { padding: sp(3.5), alignItems: 'center' },
  captureBtnText: { color: '#fff', fontSize: font.body, fontWeight: '700' },
})
