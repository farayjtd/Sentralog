import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Alert, ActivityIndicator, StatusBar,
  Platform, Image
} from 'react-native'
import TeknikSipilSidebar from '../../components/TeknikSipilSidebar'
import AppShell from '../../components/AppShell'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

const PROJECT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  input_spek: { label: 'Input Spek', color: '#1565c0', bg: '#e3f2fd' },
  cek_bahan_baku: { label: 'Cek Bahan Baku', color: '#f57f17', bg: '#fffde7' },
  produksi: { label: 'Produksi', color: '#e65100', bg: '#fff3e0' },
  qc_foto: { label: 'QC Foto', color: '#6a1b9a', bg: '#f3e5f5' },
  menunggu_acc_ts: { label: 'Menunggu ACC Kamu', color: '#c62828', bg: '#ffebee' },
  pengiriman: { label: 'Pengiriman', color: '#1565c0', bg: '#e3f2fd' },
  pemasangan: { label: 'Pemasangan', color: '#2d6a4f', bg: '#e8f5e9' },
  foto_hasil: { label: 'Menunggu ACC Hasil', color: '#c62828', bg: '#ffebee' },
  selesai: { label: 'Selesai', color: '#2e7d32', bg: '#e8f5e9' },
}

interface Project {
  id: string
  code: string
  name: string
  status: string
  client_name: string
  client_phone?: string
  client_address?: string
  install_lat?: number
  install_lng?: number
  deadline?: string
  spec_notes?: string
  warehouse_id: string
  created_at: string
  warehouse?: { name: string }
  mandor?: { full_name: string }
}

interface ProjectFile {
  id: string
  file_name: string
  file_url: string
  file_type: string
  uploaded_at: string
}

interface Warehouse {
  id: string
  name: string
  active_count?: number
}

interface FormData {
  name: string
  client_name: string
  client_phone: string
  client_address: string
  install_lat: string
  install_lng: string
  deadline: string
  spec_notes: string
  warehouse_id: string
}

const emptyForm: FormData = {
  name: '', client_name: '', client_phone: '',
  client_address: '', install_lat: '', install_lng: '',
  deadline: '', spec_notes: '', warehouse_id: '',
}

function Field({ label, value, onChange, placeholder, multiline, keyboardType }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; multiline?: boolean; keyboardType?: any
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor="#bbb" multiline={multiline} keyboardType={keyboardType ?? 'default'}
      />
    </View>
  )
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dRow}>
      <Text style={styles.dLabel}>{label}</Text>
      <Text style={styles.dValue}>{value}</Text>
    </View>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = PROJECT_STATUS[status]
  return (
    <View style={[styles.statusBadge, { backgroundColor: s?.bg ?? '#f5f5f5' }]}>
      <Text style={[styles.statusText, { color: s?.color ?? '#888' }]}>{s?.label ?? status}</Text>
    </View>
  )
}

function WHDropdown({ form, setForm, warehouses, showDropdown, setShowDropdown }: {
  form: FormData; setForm: (f: FormData) => void
  warehouses: Warehouse[]; showDropdown: boolean; setShowDropdown: (v: boolean) => void
}) {
  const selected = warehouses.find(w => w.id === form.warehouse_id)
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>Pilih Warehouse * (diurutkan dari yang paling sepi)</Text>
      <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowDropdown(!showDropdown)}>
        <Text style={[styles.dropdownBtnText, !form.warehouse_id && { color: '#bbb' }]}>
          {selected ? `${selected.name} (${selected.active_count} aktif)` : 'Pilih Warehouse...'}
        </Text>
        <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showDropdown && (
        <View style={styles.dropdownList}>
          {warehouses.map(w => {
            const color = (w.active_count ?? 0) >= 3 ? '#c62828' : (w.active_count ?? 0) >= 1 ? '#f57f17' : '#2e7d32'
            return (
              <TouchableOpacity
                key={w.id}
                style={[styles.dropdownItem, form.warehouse_id === w.id && styles.dropdownItemActive]}
                onPress={() => { setForm({ ...form, warehouse_id: w.id }); setShowDropdown(false) }}
              >
                <Text style={[styles.dropdownItemText, form.warehouse_id === w.id && { fontWeight: '600' }]}>{w.name}</Text>
                <Text style={[styles.dropdownItemSub, { color }]}>{w.active_count} project aktif</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </View>
  )
}

export default function ProjectPage() {
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showACC, setShowACC] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showWHDropdown, setShowWHDropdown] = useState(false)
  const [uploadingBOQ, setUploadingBOQ] = useState(false)
  const [pendingBOQ, setPendingBOQ] = useState<File | null>(null)
  const [accComment, setAccComment] = useState('')
  const [accType, setAccType] = useState<'qc' | 'hasil' | null>(null)
  const [qcPhotos, setQcPhotos] = useState<any[]>([])
  const [hasilPhotos, setHasilPhotos] = useState<any[]>([])
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState('')

  useEffect(() => {
    if (user) { fetchProjects(); fetchWarehouses() }
  }, [user])

  useEffect(() => {
    if (Platform.OS !== 'web') return
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'INSTALL_LOCATION') {
        setForm(prev => ({ ...prev, install_lat: e.data.lat.toFixed(6), install_lng: e.data.lng.toFixed(6) }))
        setShowMap(false)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*, warehouse:warehouse_id(name), mandor:mandor_id(full_name)')
      .eq('created_by', user!.id)
      .not('status', 'eq', 'selesai')
      .order('created_at', { ascending: false })
    if (data) setProjects(data)
    setLoading(false)
  }

  const fetchWarehouses = async () => {
    const { data: whs } = await supabase.from('warehouses').select('id, name').eq('is_active', true)
    const { data: allProjects } = await supabase.from('projects').select('warehouse_id, status').not('status', 'eq', 'selesai')
    if (whs) {
      const withCount = whs.map(w => ({
        ...w,
        active_count: allProjects?.filter(p => p.warehouse_id === w.id).length ?? 0,
      })).sort((a, b) => a.active_count - b.active_count)
      setWarehouses(withCount)
    }
  }

  const fetchProjectFiles = async (projectId: string) => {
    const { data } = await supabase.from('project_files').select('*').eq('project_id', projectId).order('uploaded_at', { ascending: false })
    if (data) setProjectFiles(data)
  }

  const fetchQCPhotos = async (projectId: string) => {
    const { data: deliveries } = await supabase.from('deliveries').select('id').eq('project_id', projectId)
    if (!deliveries?.length) { setQcPhotos([]); return }
    const { data: photos } = await supabase.from('delivery_photos').select('*').in('delivery_id', deliveries.map(d => d.id)).eq('stage', 'kepala_wh')
    if (photos) setQcPhotos(photos)
  }

  const fetchHasilPhotos = async (projectId: string) => {
    const { data } = await supabase.from('project_files').select('*').eq('project_id', projectId).eq('file_type', 'foto_hasil_pasang')
    if (data) setHasilPhotos(data)
  }

  const pickBOQ = () => {
    if (Platform.OS !== 'web') return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.xlsx,.xls,.doc,.docx'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) setPendingBOQ(file)
    }
    input.click()
  }

  const uploadBOQFile = async (projectId: string, file: File): Promise<void> => {
    try {
      const fileName = `${projectId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('project-files').upload(fileName, file, { upsert: false, contentType: file.type })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(fileName)
      await supabase.from('project_files').insert({
        project_id: projectId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: 'boq',
        file_size: file.size,
        uploaded_by: user!.id,
      })
    } catch (e: any) {
      Alert.alert('Error Upload BOQ', e.message)
    }
  }

  const uploadMoreFile = async (projectId: string) => {
    if (Platform.OS !== 'web') return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.xlsx,.xls,.doc,.docx'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return
      setUploadingBOQ(true)
      await uploadBOQFile(projectId, file)
      await fetchProjectFiles(projectId)
      setUploadingBOQ(false)
      Alert.alert('Berhasil', 'File berhasil diupload')
    }
    input.click()
  }

  const handleAdd = async () => {
    if (!form.name || !form.client_name || !form.warehouse_id) {
      Alert.alert('Perhatian', 'Nama project, nama klien, dan warehouse wajib diisi')
      return
    }
    setSaving(true)
    try {
      const { data, error } = await supabase.from('projects').insert({
        name: form.name,
        client_name: form.client_name,
        client_phone: form.client_phone || null,
        client_address: form.client_address || null,
        install_lat: form.install_lat ? parseFloat(form.install_lat) : null,
        install_lng: form.install_lng ? parseFloat(form.install_lng) : null,
        deadline: form.deadline || null,
        spec_notes: form.spec_notes || null,
        warehouse_id: form.warehouse_id,
        created_by: user!.id,
        status: 'input_spek',
      }).select().single()

      if (error || !data) {
        Alert.alert('Error', error?.message ?? 'Gagal membuat project')
        setSaving(false)
        return
      }

      // Upload BOQ jika ada
      if (pendingBOQ) {
        await uploadBOQFile(data.id, pendingBOQ)
        setPendingBOQ(null)
      }

      Alert.alert('Berhasil', 'Project berhasil dibuat')
      setShowAdd(false)
      setForm(emptyForm)
      fetchProjects()
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setSaving(false)
  }

  const handleACC = async (approved: boolean) => {
    if (!selectedProject) return
    setSaving(true)
    try {
      let newStatus = selectedProject.status
      if (accType === 'qc') newStatus = approved ? 'pengiriman' : 'produksi'
      else if (accType === 'hasil') newStatus = approved ? 'selesai' : 'pemasangan'

      await supabase.from('projects').update({ status: newStatus }).eq('id', selectedProject.id)
      await supabase.from('project_logs').insert({
        project_id: selectedProject.id,
        status_from: selectedProject.status,
        status_to: newStatus,
        changed_by: user!.id,
        note: accComment || (approved ? 'Disetujui oleh Teknik Sipil' : 'Ditolak oleh Teknik Sipil'),
      })

      Alert.alert(approved ? 'ACC Berhasil' : 'Ditolak', approved ? 'Project dilanjutkan' : 'Project dikembalikan')
      setShowACC(false)
      setAccComment('')
      setAccType(null)
      fetchProjects()
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setSaving(false)
  }

  const openDetail = async (p: Project) => {
    setSelectedProject(p)
    await fetchProjectFiles(p.id)
    await fetchQCPhotos(p.id)
    await fetchHasilPhotos(p.id)
    setShowDetail(true)
  }

  const openACC = (p: Project, type: 'qc' | 'hasil') => {
    setSelectedProject(p)
    setAccType(type)
    setAccComment('')
    setShowACC(true)
  }

  const formatDate = (d?: string) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getMapHTML = () => {
    const lat = form.install_lat ? parseFloat(form.install_lat) : -6.2088
    const lng = form.install_lng ? parseFloat(form.install_lng) : 106.8456
    const zoom = form.install_lat ? 15 : 10
    return `<!DOCTYPE html><html style="height:100%;margin:0;"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<style>
html,body{height:100%;margin:0;padding:0;overflow:hidden;font-family:sans-serif;}
#sw{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:1000;width:92%;max-width:420px;}
#sr{display:flex;gap:8px;}
#si{flex:1;padding:10px 14px;border-radius:8px;border:1px solid #ddd;font-size:14px;outline:none;}
#sb{padding:10px 16px;background:#1565c0;color:#fff;border:none;border-radius:8px;cursor:pointer;}
#rl{background:#fff;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.15);margin-top:6px;display:none;max-height:200px;overflow-y:auto;}
.ri{padding:10px 14px;font-size:13px;cursor:pointer;border-bottom:1px solid #f0f0f0;}
.ri:hover{background:#f5f5f5;}
#map{position:fixed;top:0;left:0;right:0;bottom:52px;}
#bot{position:fixed;bottom:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,.97);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;height:52px;}
#ct{font-size:12px;color:#555;}
#cb{padding:8px 20px;background:#1565c0;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;}
</style></head><body>
<div id="map"></div>
<div id="sw"><div id="sr"><input id="si" type="text" placeholder="Cari lokasi pemasangan..."/><button id="sb" onclick="doSearch()">Cari</button></div><div id="rl"></div></div>
<div id="bot"><span id="ct">Klik peta untuk pilih lokasi pemasangan</span><button id="cb" onclick="confirmLoc()">✓ Gunakan Lokasi</button></div>
<script>
var map=L.map('map').setView([${lat},${lng}],${zoom});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
var marker=L.marker([${lat},${lng}],{draggable:true}).addTo(map);
var cLat=${lat},cLng=${lng};
function upd(lat,lng){cLat=lat;cLng=lng;document.getElementById('ct').textContent='📍 '+lat.toFixed(6)+', '+lng.toFixed(6);}
marker.on('dragend',function(e){var p=e.target.getLatLng();upd(p.lat,p.lng);});
map.on('click',function(e){marker.setLatLng(e.latlng);upd(e.latlng.lat,e.latlng.lng);});
function doSearch(){
  var q=document.getElementById('si').value.trim();if(!q)return;
  var rl=document.getElementById('rl');rl.innerHTML='<div class="ri">Mencari...</div>';rl.style.display='block';
  fetch('https://nominatim.openstreetmap.org/search?format=json&q='+encodeURIComponent(q)+'&limit=5&countrycodes=id')
    .then(r=>r.json()).then(data=>{
      if(!data.length){rl.innerHTML='<div class="ri">Tidak ditemukan</div>';return;}
      rl.innerHTML=data.map(r=>'<div class="ri" onclick="selLoc('+r.lat+','+r.lon+')">'+r.display_name+'</div>').join('');
    });
}
function selLoc(lat,lon){lat=parseFloat(lat);lon=parseFloat(lon);map.setView([lat,lon],17);marker.setLatLng([lat,lon]);upd(lat,lon);document.getElementById('rl').style.display='none';}
function confirmLoc(){window.parent.postMessage({type:'INSTALL_LOCATION',lat:cLat,lng:cLng},'*');}
document.getElementById('si').addEventListener('keydown',function(e){if(e.key==='Enter')doSearch();});
document.addEventListener('click',function(e){if(!e.target.closest('#sw'))document.getElementById('rl').style.display='none';});
setTimeout(function(){map.invalidateSize();},200);
${form.install_lat ? `upd(${lat},${lng});` : ''}
</script></body></html>`
  }

  const STATUS_FILTERS = [
    { label: 'Semua', value: 'all' },
    { label: 'Menunggu ACC', value: 'menunggu_acc' },
    { label: 'Berjalan', value: 'berjalan' },
  ]

  const filtered = projects.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'menunggu_acc' && ['menunggu_acc_ts', 'foto_hasil'].includes(p.status)) ||
      (filterStatus === 'berjalan' && !['menunggu_acc_ts', 'foto_hasil', 'selesai'].includes(p.status))
    return matchSearch && matchStatus
  })

  return (
    <AppShell role="teknik_sipil" title="Input Spek" subtitle={`${projects.length} pesanan aktif`} scroll={false}
      headerRight={
        <TouchableOpacity style={styles.addBtn} onPress={() => { setForm(emptyForm); setPendingBOQ(null); setShowWHDropdown(false); setShowAdd(true) }}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Buat Pesanan</Text>
        </TouchableOpacity>
      }>

          <TextInput style={styles.search} placeholder="Cari nama project, klien, atau kode..." placeholderTextColor="#aaa" value={search} onChangeText={setSearch} />

          <View style={styles.filterWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {STATUS_FILTERS.map(s => (
                <TouchableOpacity key={s.value} style={[styles.filterChip, filterStatus === s.value && { backgroundColor: '#1565c0', borderColor: '#1565c0' }]} onPress={() => setFilterStatus(s.value)}>
                  <Text style={[styles.filterChipText, filterStatus === s.value && { color: '#fff' }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#1565c0" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 1 }]}>Kode</Text>
                <Text style={[styles.th, { flex: 2 }]}>Nama Project</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Klien</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Warehouse</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Status</Text>
                <Text style={[styles.th, { flex: 1 }]}>Deadline</Text>
                <Text style={[styles.th, { flex: 2 }]}>Aksi</Text>
              </View>

              {filtered.length === 0 ? (
                <Text style={styles.empty}>Tidak ada project</Text>
              ) : filtered.map((p, i) => (
                <View key={p.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tdCode, { flex: 1 }]}>{p.code}</Text>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.tdName}>{p.name}</Text>
                  </View>
                  <Text style={[styles.td, { flex: 1.5 }]}>{p.client_name}</Text>
                  <Text style={[styles.td, { flex: 1.5 }]}>{p.warehouse?.name ?? '-'}</Text>
                  <View style={{ flex: 1.5, justifyContent: 'center' }}>
                    <StatusBadge status={p.status} />
                  </View>
                  <Text style={[styles.td, { flex: 1 }]}>
                    {p.deadline ? new Date(p.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                  </Text>
                  <View style={[styles.actions, { flex: 2 }]}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} onPress={() => openDetail(p)}>
                      <Text style={[styles.actionText, { color: '#1565c0' }]}>Detail</Text>
                    </TouchableOpacity>
                    {p.status === 'menunggu_acc_ts' && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fff3e0' }]} onPress={() => openACC(p, 'qc')}>
                        <Text style={[styles.actionText, { color: '#e65100' }]}>ACC QC</Text>
                      </TouchableOpacity>
                    )}
                    {p.status === 'foto_hasil' && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e8f5e9' }]} onPress={() => openACC(p, 'hasil')}>
                        <Text style={[styles.actionText, { color: '#2e7d32' }]}>ACC Hasil</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

      {/* MODAL TAMBAH PROJECT */}
      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buat Project Baru</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <Field label="Nama Project *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Nama project" />
              <Field label="Nama Klien *" value={form.client_name} onChange={v => setForm({ ...form, client_name: v })} placeholder="Nama klien/customer" />
              <Field label="No. HP Klien" value={form.client_phone} onChange={v => setForm({ ...form, client_phone: v })} placeholder="08xxx" keyboardType="phone-pad" />
              <Field label="Alamat Klien" value={form.client_address} onChange={v => setForm({ ...form, client_address: v })} placeholder="Alamat lengkap klien" multiline />
              <Field label="Catatan Spesifikasi" value={form.spec_notes} onChange={v => setForm({ ...form, spec_notes: v })} placeholder="Catatan spesifikasi teknis" multiline />
              <Field label="Deadline (YYYY-MM-DD)" value={form.deadline} onChange={v => setForm({ ...form, deadline: v })} placeholder="2026-12-31" />

              {/* Lokasi Pemasangan */}
              <Text style={styles.fieldLabel}>Lokasi Pemasangan</Text>
              <View style={styles.gpsRow}>
                <View style={{ flex: 1 }}>
                  <TextInput style={styles.fieldInput} value={form.install_lat} onChangeText={v => setForm({ ...form, install_lat: v })} placeholder="Latitude" placeholderTextColor="#bbb" keyboardType="numeric" />
                </View>
                <View style={{ width: 8 }} />
                <View style={{ flex: 1 }}>
                  <TextInput style={styles.fieldInput} value={form.install_lng} onChangeText={v => setForm({ ...form, install_lng: v })} placeholder="Longitude" placeholderTextColor="#bbb" keyboardType="numeric" />
                </View>
              </View>
              <TouchableOpacity style={styles.mapBtn} onPress={() => setShowMap(true)}>
                <Text style={styles.mapBtnText}>🗺️ Pilih Lokasi di Peta</Text>
              </TouchableOpacity>
              {!!(form.install_lat && form.install_lng) && (
                <Text style={styles.coordsText}>{'📍 ' + parseFloat(form.install_lat).toFixed(6) + ', ' + parseFloat(form.install_lng).toFixed(6)}</Text>
              )}

              <WHDropdown form={form} setForm={setForm} warehouses={warehouses} showDropdown={showWHDropdown} setShowDropdown={setShowWHDropdown} />

              {/* Upload BOQ */}
              <Text style={styles.fieldLabel}>File BOQ</Text>
              <TouchableOpacity style={styles.uploadBOQBtn} onPress={pickBOQ}>
                <Text style={styles.uploadBOQBtnText}>
                  {pendingBOQ ? `✅ ${pendingBOQ.name}` : '📎 Pilih File BOQ (PDF/Excel/Word)'}
                </Text>
              </TouchableOpacity>
              {!!pendingBOQ && (
                <TouchableOpacity onPress={() => setPendingBOQ(null)} style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 12, color: '#c62828' }}>✕ Hapus file</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Buat Project</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DETAIL */}
      <Modal visible={showDetail} transparent animationType="fade" onRequestClose={() => setShowDetail(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { maxWidth: 600 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedProject?.name}</Text>
                <Text style={styles.modalSub}>{selectedProject?.code}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {!!selectedProject && (
              <ScrollView style={styles.modalBody}>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <StatusBadge status={selectedProject.status} />
                </View>
                <DRow label="Klien" value={selectedProject.client_name} />
                <DRow label="No. HP Klien" value={selectedProject.client_phone ?? '-'} />
                <DRow label="Alamat Klien" value={selectedProject.client_address ?? '-'} />
                <DRow label="Warehouse" value={selectedProject.warehouse?.name ?? '-'} />
                <DRow label="Mandor" value={selectedProject.mandor?.full_name ?? 'Belum ditentukan'} />
                <DRow label="Deadline" value={formatDate(selectedProject.deadline)} />
                <DRow label="Lokasi Pemasangan" value={
                  selectedProject.install_lat && selectedProject.install_lng
                    ? `${selectedProject.install_lat.toFixed(6)}, ${selectedProject.install_lng.toFixed(6)}`
                    : '-'
                } />
                {!!selectedProject.spec_notes && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.dLabel}>Catatan Spesifikasi</Text>
                    <Text style={styles.specNotes}>{selectedProject.spec_notes}</Text>
                  </View>
                )}

                {/* File BOQ */}
                <View style={styles.fileSection}>
                  <View style={styles.fileSectionHeader}>
                    <Text style={styles.fileSectionTitle}>File BOQ & Dokumen</Text>
                    <TouchableOpacity style={styles.uploadBtn} onPress={() => uploadMoreFile(selectedProject.id)} disabled={uploadingBOQ}>
                      {uploadingBOQ ? <ActivityIndicator size="small" color="#1565c0" /> : <Text style={styles.uploadBtnText}>+ Upload File</Text>}
                    </TouchableOpacity>
                  </View>
                  {projectFiles.length === 0 ? (
                    <Text style={styles.emptyFile}>Belum ada file diupload</Text>
                  ) : projectFiles.map(f => (
                    <TouchableOpacity key={f.id} style={styles.fileItem} onPress={() => { if (Platform.OS === 'web') window.open(f.file_url, '_blank') }}>
                      <Text style={styles.fileIcon}>{f.file_type === 'boq' ? '📄' : '📎'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fileName}>{f.file_name}</Text>
                        <Text style={styles.fileDate}>{formatDate(f.uploaded_at)}</Text>
                      </View>
                      <Text style={styles.fileDownload}>Buka ›</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Foto QC */}
                {qcPhotos.length > 0 && (
                  <View style={styles.fileSection}>
                    <Text style={styles.fileSectionTitle}>Foto QC dari Kepala WH</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {qcPhotos.map(p => (
                        <TouchableOpacity key={p.id} onPress={() => { setSelectedPhoto(p.photo_url); setShowPhotoModal(true) }}>
                          <Image source={{ uri: p.photo_url }} style={styles.photoThumb} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {selectedProject.status === 'menunggu_acc_ts' && (
                      <TouchableOpacity style={styles.accBtn} onPress={() => { setShowDetail(false); openACC(selectedProject, 'qc') }}>
                        <Text style={styles.accBtnText}>✓ ACC / Tolak Hasil QC</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Foto Hasil */}
                {hasilPhotos.length > 0 && (
                  <View style={styles.fileSection}>
                    <Text style={styles.fileSectionTitle}>Foto Hasil Pemasangan</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {hasilPhotos.map(p => (
                        <TouchableOpacity key={p.id} onPress={() => { setSelectedPhoto(p.file_url); setShowPhotoModal(true) }}>
                          <Image source={{ uri: p.file_url }} style={styles.photoThumb} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {selectedProject.status === 'foto_hasil' && (
                      <TouchableOpacity style={[styles.accBtn, { backgroundColor: '#e8f5e9', borderColor: '#2e7d32' }]} onPress={() => { setShowDetail(false); openACC(selectedProject, 'hasil') }}>
                        <Text style={[styles.accBtnText, { color: '#2e7d32' }]}>✓ ACC / Tolak Hasil Pemasangan</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </ScrollView>
            )}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.saveBtn} onPress={() => setShowDetail(false)}>
                <Text style={styles.saveText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL ACC */}
      <Modal visible={showACC} transparent animationType="fade" onRequestClose={() => setShowACC(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { maxWidth: 420 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{accType === 'qc' ? 'ACC Hasil QC' : 'ACC Hasil Pemasangan'}</Text>
              <TouchableOpacity onPress={() => setShowACC(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.accInfo}>
                {accType === 'qc'
                  ? 'Periksa foto QC dari Kepala WH. ACC jika sudah sesuai spesifikasi, Tolak jika belum.'
                  : 'Periksa foto hasil pemasangan dari Mandor. ACC untuk menyelesaikan project.'}
              </Text>
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Komentar (opsional)</Text>
              <TextInput
                style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]}
                value={accComment} onChangeText={setAccComment}
                placeholder="Tulis catatan atau alasan..." placeholderTextColor="#bbb" multiline
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.rejectBtn, saving && { opacity: 0.6 }]} onPress={() => handleACC(false)} disabled={saving}>
                <Text style={styles.rejectBtnText}>✗ Tolak</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.approveBtn, saving && { opacity: 0.6 }]} onPress={() => handleACC(true)} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.approveBtnText}>✓ ACC</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL MAP */}
      <Modal visible={showMap} transparent animationType="slide" onRequestClose={() => setShowMap(false)}>
        <View style={styles.mapOverlay}>
          <View style={styles.mapBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Lokasi Pemasangan</Text>
              <TouchableOpacity onPress={() => setShowMap(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {!!(showMap && Platform.OS === 'web') && (
              <iframe srcDoc={getMapHTML()} style={{ width: '100%', flex: 1, border: 'none' } as any} />
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL FOTO */}
      <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
        <TouchableOpacity style={styles.photoOverlay} onPress={() => setShowPhotoModal(false)} activeOpacity={1}>
          <Image source={{ uri: selectedPhoto }} style={styles.fullPhoto} resizeMode="contain" />
          <Text style={styles.photoClose}>✕ Tutup</Text>
        </TouchableOpacity>
      </Modal>

    </AppShell>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { paddingTop: Platform.OS === 'android' ? 48 : 60, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { padding: 4 },
  menuIcon: { fontSize: 20, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, padding: 20 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  pageSub: { fontSize: 12, color: '#888', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1d4ed8', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, marginBottom: 10, color: '#333' },
  filterWrap: { height: 40, marginBottom: 12 },
  filterScroll: { flexDirection: 'row', alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff', height: 32, justifyContent: 'center' },
  filterChipText: { fontSize: 12, color: '#555', fontWeight: '500' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1565c0', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  th: { fontSize: 12, fontWeight: '600', color: '#fff' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#fff' },
  td: { fontSize: 13, color: '#333' },
  tdCode: { fontSize: 11, color: '#888' },
  tdName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 4, alignItems: 'center', flexWrap: 'wrap' },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 2 },
  actionText: { fontSize: 11, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  mapOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  mapBox: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '92%', overflow: 'hidden', display: 'flex' as any, flexDirection: 'column' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, width: '92%', maxWidth: 520, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  modalSub: { fontSize: 12, color: '#888', marginTop: 2 },
  closeBtn: { fontSize: 18, color: '#888', paddingHorizontal: 4 },
  modalBody: { padding: 16, maxHeight: 500 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#444', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#333', backgroundColor: '#fafafa' },
  gpsRow: { flexDirection: 'row', marginBottom: 8 },
  mapBtn: { borderWidth: 1, borderColor: '#1565c0', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginBottom: 8 },
  mapBtnText: { fontSize: 13, color: '#1565c0', fontWeight: '500' },
  coordsText: { fontSize: 11, color: '#2e7d32', textAlign: 'center', marginBottom: 12 },
  dropdownBtn: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#fafafa', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownBtnText: { fontSize: 13, color: '#333' },
  dropdownArrow: { fontSize: 10, color: '#888' },
  dropdownList: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, backgroundColor: '#fff', marginTop: 4, maxHeight: 200, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  dropdownItemActive: { backgroundColor: '#e3f2fd' },
  dropdownItemText: { fontSize: 13, color: '#333' },
  dropdownItemSub: { fontSize: 11, marginTop: 2 },
  uploadBOQBtn: { borderWidth: 1, borderColor: '#1565c0', borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#e3f2fd', marginBottom: 4 },
  uploadBOQBtnText: { fontSize: 13, color: '#1565c0', fontWeight: '500' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  cancelText: { fontSize: 13, color: '#555' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#1565c0' },
  saveText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  dRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dLabel: { fontSize: 13, color: '#888' },
  dValue: { fontSize: 13, color: '#1a1a2e', fontWeight: '500', flex: 1, textAlign: 'right' },
  specNotes: { fontSize: 13, color: '#333', backgroundColor: '#f8f9fa', borderRadius: 8, padding: 10, marginTop: 4 },
  fileSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  fileSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fileSectionTitle: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  uploadBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#e3f2fd', borderRadius: 6 },
  uploadBtnText: { fontSize: 12, color: '#1565c0', fontWeight: '500' },
  emptyFile: { fontSize: 12, color: '#aaa', textAlign: 'center', paddingVertical: 12 },
  fileItem: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 6, gap: 8 },
  fileIcon: { fontSize: 20 },
  fileName: { fontSize: 13, color: '#1a1a2e', fontWeight: '500' },
  fileDate: { fontSize: 11, color: '#888', marginTop: 2 },
  fileDownload: { fontSize: 13, color: '#1565c0' },
  photoThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  accBtn: { marginTop: 10, borderWidth: 1, borderColor: '#e65100', borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff3e0' },
  accBtnText: { fontSize: 13, color: '#e65100', fontWeight: '600' },
  accInfo: { fontSize: 13, color: '#555', lineHeight: 20, backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8 },
  rejectBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#c62828' },
  rejectBtnText: { fontSize: 13, color: '#c62828', fontWeight: '600' },
  approveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#1565c0' },
  approveBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  photoOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullPhoto: { width: '90%', height: '80%' },
  photoClose: { color: '#fff', marginTop: 16, fontSize: 14 },
})