import { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Platform, StatusBar, Image, Alert, Modal
} from 'react-native'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
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

interface Props {
  roleName: string
  color: string
  backRoute: string
  requireGeofencing?: boolean
}

const GEOFENCE_RADIUS = 200 // meter

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function AbsenForm({ roleName, color, backRoute, requireGeofencing = true }: Props) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [step, setStep] = useState<'pilih' | 'foto' | 'proses' | 'selesai'>('pilih')
  const [locationType, setLocationType] = useState<'wh' | 'lapangan' | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedWH, setSelectedWH] = useState<Warehouse | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [photoUri, setPhotoUri] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'checking' | 'ok' | 'fake' | 'error' | 'jauh'>('idle')
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<any>(null)
  const canvasRef = useRef<any>(null)
  const streamRef = useRef<any>(null)

  useEffect(() => {
    fetchWarehouses()
    fetchProjects()
  }, [])

  const fetchWarehouses = async () => {
    const { data } = await supabase
      .from('warehouses')
      .select('id, name, lat, lng')
      .eq('is_active', true)
    if (data) setWarehouses(data)
  }

  const fetchProjects = async () => {
    if (!user) return
    const { data } = await supabase
      .from('projects')
      .select('id, name, install_lat, install_lng')
      .in('status', ['pengiriman', 'pemasangan'])
    if (data) setProjects(data)
  }

  const checkGPS = async (targetLat?: number, targetLng?: number): Promise<boolean> => {
    setGpsStatus('checking')
    try {
      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            // Jika tidak ada geolocation, tetap izinkan absen
            setGpsStatus('ok')
            setCurrentLocation({ lat: 0, lng: 0 })
            resolve(true)
            return
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude
              const lng = pos.coords.longitude
              setCurrentLocation({ lat, lng })

              if (requireGeofencing && targetLat && targetLng) {
                const dist = getDistance(lat, lng, targetLat, targetLng)
                if (dist > GEOFENCE_RADIUS) {
                  setGpsStatus('jauh')
                  Alert.alert('Diluar Radius', `Anda berada ${Math.round(dist)} meter dari lokasi. Maksimal ${GEOFENCE_RADIUS} meter.`)
                  resolve(false)
                  return
                }
              }
              setGpsStatus('ok')
              resolve(true)
            },
            (err) => {
              console.log('GPS error web:', err)
              setGpsStatus('ok')
              setCurrentLocation({ lat: 0, lng: 0 })
              resolve(true)
            },
            { enableHighAccuracy: true, timeout: 10000 }
          )
        })
      }

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setGpsStatus('error')
        Alert.alert('Error', 'Izin lokasi diperlukan')
        return false
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })

      if ((loc.coords as any).mocked === true) {
        setGpsStatus('fake')
        setCurrentLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude })
        return true
      }

      setCurrentLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude })

      if (requireGeofencing && targetLat && targetLng) {
        const dist = getDistance(loc.coords.latitude, loc.coords.longitude, targetLat, targetLng)
        if (dist > GEOFENCE_RADIUS) {
          setGpsStatus('jauh')
          Alert.alert('Diluar Radius', `Anda berada ${Math.round(dist)} meter dari lokasi. Maksimal ${GEOFENCE_RADIUS} meter.`)
          return false
        }
      }

      setGpsStatus('ok')
      return true
    } catch (e) {
      console.log('GPS catch error:', e)
      setGpsStatus('error')
      Alert.alert('Error', 'Gagal mendapatkan lokasi GPS')
      return false
    }
  }

  const openCamera = async () => {
    if (Platform.OS === 'web') {
      setShowCamera(true)
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
        } catch (e) {
          Alert.alert('Error', 'Gagal akses kamera')
          setShowCamera(false)
        }
      }, 300)
    }
  }

  const capturePhoto = () => {
    if (Platform.OS === 'web' && videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setPhotoUri(dataUrl)
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

  const retakePhoto = () => {
    setPhotoUri('')
    openCamera()
  }

  const uploadPhoto = async (userId: string, date: string): Promise<string | null> => {
    if (!photoUri) {
      console.log('Upload photo: photoUri kosong')
      return null
    }
    try {
      console.log('Mulai upload foto...')
      const response = await fetch(photoUri)
      const blob = await response.blob()
      console.log('Blob type:', blob.type, 'size:', blob.size)
      const fileName = `${userId}/${date}-${Date.now()}.jpg`
      console.log('Upload ke:', fileName)

      const { data, error } = await supabase.storage
        .from('attendance-photos')
        .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' })

      console.log('Upload result:', data, error)

      if (error) throw error
      const { data: urlData } = supabase.storage.from('attendance-photos').getPublicUrl(fileName)
      console.log('Public URL:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (e: any) {
      console.log('Upload error:', e)
      Alert.alert('Error', 'Gagal upload foto: ' + e.message)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!user || !locationType) return
    if (!photoUri) { Alert.alert('Perhatian', 'Foto selfie wajib diambil'); return }

    console.log('handleSubmit dipanggil')
    console.log('photoUri length:', photoUri.length)
    console.log('user id:', user.id)
    console.log('locationType:', locationType)

    const targetLat = locationType === 'wh' ? selectedWH?.lat : selectedProject?.install_lat
    const targetLng = locationType === 'wh' ? selectedWH?.lng : selectedProject?.install_lng

    setStep('proses')
    setUploading(true)

    let isMockGps = false

    if (Platform.OS === 'web') {
      setGpsStatus('ok')
      setCurrentLocation({ lat: 0, lng: 0 })
    } else {
      const gpsOk = await checkGPS(targetLat, targetLng)
      if (!gpsOk && gpsStatus !== 'fake') {
        setStep('foto')
        setUploading(false)
        return
      }
      isMockGps = gpsStatus === 'fake'
    }

    const today = new Date().toISOString().split('T')[0]
    const photoUrl = await uploadPhoto(user.id, today)
    console.log('photoUrl hasil upload:', photoUrl)

    const { error } = await supabase.from('attendances').insert({
      user_id: user.id,
      warehouse_id: locationType === 'wh' ? selectedWH?.id : null,
      project_id: locationType === 'lapangan' ? selectedProject?.id : null,
      date: today,
      location_type: locationType,
      check_in_at: new Date().toISOString(),
      check_in_lat: currentLocation?.lat ?? null,
      check_in_lng: currentLocation?.lng ?? null,
      check_in_photo: photoUrl,
      is_mock_gps: isMockGps,
      is_manual: false,
    })

    console.log('Insert attendance error:', error)

    setUploading(false)

    if (error) {
      Alert.alert('Error', error.message)
      setStep('foto')
      return
    }

    setStep('selesai')
  }

  const handleLanjutPilih = async () => {
    if (locationType === 'wh' && !selectedWH) {
      Alert.alert('Perhatian', 'Pilih warehouse terlebih dahulu')
      return
    }
    if (locationType === 'lapangan' && !selectedProject) {
      Alert.alert('Perhatian', 'Pilih project terlebih dahulu')
      return
    }
    await openCamera()
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={color} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <TouchableOpacity onPress={() => { stopCamera(); router.replace(backRoute as any) }} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Absensi</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}>

        {/* STEP 1: Pilih Lokasi */}
        {step === 'pilih' && (
          <View>
            <Text style={styles.stepTitle}>Pilih Lokasi Absen</Text>

            <TouchableOpacity
              style={[styles.locOption, locationType === 'wh' && { borderColor: color, backgroundColor: color + '10' }]}
              onPress={() => setLocationType('wh')}
            >
              <Text style={styles.locOptionIcon}>🏭</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.locOptionTitle}>Absen di Warehouse</Text>
                <Text style={styles.locOptionSub}>Berada di lokasi gudang</Text>
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
                <Text style={styles.locOptionSub}>Berada di lokasi project</Text>
              </View>
              {locationType === 'lapangan' && <Text style={{ color }}>✓</Text>}
            </TouchableOpacity>

            {/* Pilih WH */}
            {locationType === 'wh' && (
              <View style={styles.subSection}>
                <Text style={styles.subLabel}>Pilih Warehouse</Text>
                {warehouses.map(w => (
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
                  <Text style={styles.empty}>Tidak ada project aktif di lapangan</Text>
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

            {locationType && (
              <TouchableOpacity style={[styles.nextBtn, { backgroundColor: color }]} onPress={handleLanjutPilih}>
                <Text style={styles.nextBtnText}>Lanjut → Ambil Foto Selfie</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* STEP 2: Preview Foto */}
        {step === 'foto' && (
          <View style={styles.fotoSection}>
            <Text style={styles.stepTitle}>Foto Selfie</Text>
            {photoUri ? (
              <View style={styles.photoWrap}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <Text style={styles.photoCaption}>Foto selfie berhasil diambil</Text>
                <TouchableOpacity style={styles.retakeBtn} onPress={retakePhoto}>
                  <Text style={styles.retakeBtnText}>📷 Ambil Ulang</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: color }]} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>✓ Kirim Absensi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noPhotoWrap}>
                <Text style={styles.noPhotoText}>Foto belum diambil</Text>
                <TouchableOpacity style={[styles.nextBtn, { backgroundColor: color }]} onPress={openCamera}>
                  <Text style={styles.nextBtnText}>📷 Buka Kamera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 3: Proses */}
        {step === 'proses' && (
          <View style={styles.prosesSection}>
            <ActivityIndicator size="large" color={color} />
            <Text style={styles.prosesText}>Memproses absensi...</Text>
            <Text style={styles.prosesSub}>Mengecek lokasi GPS dan mengupload foto</Text>
          </View>
        )}

        {/* STEP 4: Selesai */}
        {step === 'selesai' && (
          <View style={styles.selesaiSection}>
            <Text style={styles.selesaiIcon}>✅</Text>
            <Text style={styles.selesaiTitle}>Absensi Berhasil!</Text>
            <Text style={styles.selesaiSub}>
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              {' · '}
              {locationType === 'wh' ? selectedWH?.name : selectedProject?.name}
            </Text>
            {gpsStatus === 'fake' && (
              <Text style={styles.fakeWarning}>⚠️ Terdeteksi penggunaan fake GPS. Absensi tetap dicatat namun ditandai.</Text>
            )}
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: color }]} onPress={() => router.replace(backRoute as any)}>
              <Text style={styles.doneBtnText}>Kembali ke Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Modal Kamera Web */}
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
              <View style={{ flex: 1, position: 'relative' as any }}>
                <video
                  ref={videoRef}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' } as any}
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} style={{ display: 'none' } as any} />
              </View>
            )}
            <TouchableOpacity style={[styles.captureBtn, { backgroundColor: color }]} onPress={capturePhoto}>
              <Text style={styles.captureBtnText}>📸 Ambil Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { paddingTop: Platform.OS === 'android' ? 48 : 60, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 80 },
  backText: { color: '#fff', fontSize: 16 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  scroll: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 16 },
  locOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: '#eee', gap: 12 },
  locOptionIcon: { fontSize: 28 },
  locOptionTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  locOptionSub: { fontSize: 12, color: '#888', marginTop: 2 },
  subSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  subLabel: { fontSize: 13, fontWeight: '500', color: '#444', marginBottom: 10 },
  subOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
  subOptionText: { fontSize: 13, color: '#333' },
  nextBtn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  nextBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  fotoSection: { alignItems: 'center' },
  photoWrap: { width: '100%', alignItems: 'center' },
  photoPreview: { width: 240, height: 240, borderRadius: 16, marginBottom: 12 },
  photoCaption: { fontSize: 13, color: '#666', marginBottom: 16 },
  retakeBtn: { borderWidth: 1, borderColor: '#1a1a2e', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24, marginBottom: 10, width: '100%', alignItems: 'center' },
  retakeBtnText: { fontSize: 13, color: '#1a1a2e', fontWeight: '500' },
  submitBtn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', width: '100%' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  noPhotoWrap: { alignItems: 'center', paddingVertical: 40 },
  noPhotoText: { fontSize: 13, color: '#aaa', marginBottom: 16 },
  prosesSection: { alignItems: 'center', paddingVertical: 60 },
  prosesText: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginTop: 16 },
  prosesSub: { fontSize: 12, color: '#888', marginTop: 6 },
  selesaiSection: { alignItems: 'center', paddingVertical: 40 },
  selesaiIcon: { fontSize: 64, marginBottom: 16 },
  selesaiTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  selesaiSub: { fontSize: 13, color: '#666', marginBottom: 8 },
  fakeWarning: { fontSize: 12, color: '#e65100', textAlign: 'center', marginBottom: 16, paddingHorizontal: 20 },
  doneBtn: { borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', marginTop: 12 },
  doneBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#aaa', fontSize: 13, paddingVertical: 16 },
  cameraOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  cameraBox: { width: '90%', maxWidth: 400, backgroundColor: '#000', borderRadius: 16, overflow: 'hidden', height: 500 },
  cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1a1a1a' },
  cameraTitle: { color: '#fff', fontSize: 15, fontWeight: '500' },
  cameraClose: { color: '#fff', fontSize: 20, paddingHorizontal: 4 },
  captureBtn: { padding: 16, alignItems: 'center' },
  captureBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})