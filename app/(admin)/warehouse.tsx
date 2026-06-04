import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Alert, ActivityIndicator, StatusBar, Image, Platform
} from 'react-native'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { supabase } from '../../lib/supabase'

interface Warehouse {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  photo_url?: string
  head_user_id?: string
  is_active: boolean
  head_user?: { full_name: string; username: string }
}

interface KepalaWH {
  id: string
  full_name: string
  username: string
}

interface FormData {
  name: string
  address: string
  lat: string
  lng: string
  photo_url: string
  head_user_id: string
  is_active: boolean
}

const emptyForm: FormData = {
  name: '',
  address: '',
  lat: '',
  lng: '',
  photo_url: '',
  head_user_id: '',
  is_active: true,
}

function Field({ label, value, onChange, placeholder, keyboardType }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  keyboardType?: any
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        keyboardType={keyboardType ?? 'default'}
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

function KepalaDropdown({ form, setForm, kepalaList, showKepalaDropdown, setShowKepalaDropdown }: {
  form: FormData
  setForm: (f: FormData) => void
  kepalaList: KepalaWH[]
  showKepalaDropdown: boolean
  setShowKepalaDropdown: (v: boolean) => void
}) {
  const getKepalaName = (id: string) => {
    if (!id) return 'Belum ditentukan'
    return kepalaList.find(k => k.id === id)?.full_name ?? '-'
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.fieldLabel}>Kepala Warehouse</Text>
      <TouchableOpacity
        style={styles.dropdownBtn}
        onPress={() => setShowKepalaDropdown(!showKepalaDropdown)}
      >
        <Text style={[styles.dropdownBtnText, !form.head_user_id && { color: '#bbb' }]}>
          {form.head_user_id ? getKepalaName(form.head_user_id) : 'Pilih Kepala WH...'}
        </Text>
        <Text style={styles.dropdownArrow}>{showKepalaDropdown ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showKepalaDropdown && (
        <View style={styles.dropdownList}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setForm({ ...form, head_user_id: '' }); setShowKepalaDropdown(false) }}
          >
            <Text style={styles.dropdownItemText}>— Belum ditentukan —</Text>
          </TouchableOpacity>
          {kepalaList.length === 0 ? (
            <View style={styles.dropdownItem}>
              <Text style={[styles.dropdownItemText, { color: '#aaa' }]}>Tidak ada Kepala WH aktif</Text>
            </View>
          ) : (
            kepalaList.map(k => (
              <TouchableOpacity
                key={k.id}
                style={[styles.dropdownItem, form.head_user_id === k.id && styles.dropdownItemActive]}
                onPress={() => { setForm({ ...form, head_user_id: k.id }); setShowKepalaDropdown(false) }}
              >
                <Text style={[styles.dropdownItemText, form.head_user_id === k.id && { color: '#1a1a2e', fontWeight: '600' }]}>
                  {k.full_name}
                </Text>
                <Text style={styles.dropdownItemSub}>{k.username}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  )
}

function FormContent({ form, setForm, kepalaList, showKepalaDropdown, setShowKepalaDropdown,
  previewPhoto, setPreviewPhoto, uploadingPhoto, pickPhoto, setShowMap }: {
  form: FormData
  setForm: (f: FormData) => void
  kepalaList: KepalaWH[]
  showKepalaDropdown: boolean
  setShowKepalaDropdown: (v: boolean) => void
  previewPhoto: string
  setPreviewPhoto: (v: string) => void
  uploadingPhoto: boolean
  pickPhoto: () => void
  setShowMap: (v: boolean) => void
}) {
  return (
    <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
      {/* Foto */}
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.fieldLabel}>Foto Gudang</Text>
        <View style={styles.photoPickerRow}>
          {previewPhoto ? (
            <Image source={{ uri: previewPhoto }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ fontSize: 28 }}>🏭</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
            <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto} disabled={uploadingPhoto}>
              {uploadingPhoto
                ? <ActivityIndicator size="small" color="#1a1a2e" />
                : <Text style={styles.photoBtnText}>📷 Pilih Foto</Text>
              }
            </TouchableOpacity>
            {!!previewPhoto && (
              <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => setPreviewPhoto('')}>
                <Text style={styles.photoRemoveBtnText}>Hapus Foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Field label="Nama Warehouse *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Misal: Gudang Bekasi 1" />
      <Field label="Alamat *" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="Alamat lengkap warehouse" />

      {/* GPS */}
      <Text style={styles.fieldLabel}>Lokasi GPS</Text>
      <View style={styles.gpsRow}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.fieldInput}
            value={form.lat}
            onChangeText={v => setForm({ ...form, lat: v })}
            placeholder="Latitude"
            placeholderTextColor="#bbb"
            keyboardType="numeric"
          />
        </View>
        <View style={{ width: 8 }} />
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.fieldInput}
            value={form.lng}
            onChangeText={v => setForm({ ...form, lng: v })}
            placeholder="Longitude"
            placeholderTextColor="#bbb"
            keyboardType="numeric"
          />
        </View>
      </View>
      <TouchableOpacity style={styles.mapBtn} onPress={() => setShowMap(true)}>
        <Text style={styles.mapBtnText}>🗺️ Pilih Lokasi di Peta</Text>
      </TouchableOpacity>
      {!!form.lat && !!form.lng && (
        <Text style={styles.coordsText}>
          {'📍 ' + parseFloat(form.lat).toFixed(6) + ', ' + parseFloat(form.lng).toFixed(6)}
        </Text>
      )}

      {/* Kepala WH */}
      <KepalaDropdown
        form={form}
        setForm={setForm}
        kepalaList={kepalaList}
        showKepalaDropdown={showKepalaDropdown}
        setShowKepalaDropdown={setShowKepalaDropdown}
      />

      {/* Status */}
      <Text style={styles.fieldLabel}>Status</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, form.is_active && styles.toggleActive]}
          onPress={() => setForm({ ...form, is_active: true })}
        >
          <Text style={[styles.toggleText, form.is_active && styles.toggleTextActive]}>Aktif</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !form.is_active && { backgroundColor: '#c62828', borderColor: '#c62828' }]}
          onPress={() => setForm({ ...form, is_active: false })}
        >
          <Text style={[styles.toggleText, !form.is_active && styles.toggleTextActive]}>Nonaktif</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default function WarehousePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [kepalaList, setKepalaList] = useState<KepalaWH[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showKepalaDropdown, setShowKepalaDropdown] = useState(false)
  const [selectedWH, setSelectedWH] = useState<Warehouse | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    fetchWarehouses()
    fetchKepalaWH()
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'web') return
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'LOCATION_SELECTED') {
        setForm(prev => ({
          ...prev,
          lat: e.data.lat.toFixed(6),
          lng: e.data.lng.toFixed(6),
          address: e.data.address || prev.address,
        }))
        setShowMap(false)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const fetchWarehouses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('warehouses')
      .select('*, head_user:head_user_id(full_name, username)')
      .order('name', { ascending: true })
    if (!error && data) setWarehouses(data)
    setLoading(false)
  }

  const fetchKepalaWH = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, username')
      .eq('role', 'kepala_wh')
      .eq('is_active', true)
      .order('full_name', { ascending: true })
    if (data) setKepalaList(data)
  }

  const uploadPhoto = async (whId: string): Promise<string | null> => {
    if (!previewPhoto) return null
    try {
      setUploadingPhoto(true)
      const response = await fetch(previewPhoto)
      const blob = await response.blob()
      const fileExt = blob.type.split('/')[1] || 'jpg'
      const fileName = `${whId}.${fileExt}`
      const { error } = await supabase.storage
        .from('warehouses')
        .upload(fileName, blob, { upsert: true, contentType: blob.type })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('warehouses').getPublicUrl(fileName)
      return urlData.publicUrl
    } catch (e: any) {
      Alert.alert('Error', 'Gagal upload foto: ' + e.message)
      return null
    } finally {
      setUploadingPhoto(false)
    }
  }

  const pickPhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => setPreviewPhoto(ev.target?.result as string)
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleAdd = async () => {
    if (!form.name || !form.address) {
      Alert.alert('Perhatian', 'Nama dan alamat wajib diisi')
      return
    }
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .insert({
          name: form.name,
          address: form.address,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          head_user_id: form.head_user_id || null,
          is_active: form.is_active,
        })
        .select()
        .single()

      if (error || !data) {
        Alert.alert('Error', error?.message ?? 'Gagal menambahkan warehouse')
        setSaving(false)
        return
      }

      if (previewPhoto) {
        const photoUrl = await uploadPhoto(data.id)
        if (photoUrl) {
          await supabase.from('warehouses').update({ photo_url: photoUrl }).eq('id', data.id)
        }
      }

      Alert.alert('Berhasil', 'Warehouse berhasil ditambahkan')
      setShowAdd(false)
      setForm(emptyForm)
      setPreviewPhoto('')
      fetchWarehouses()
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!selectedWH || !form.name || !form.address) {
      Alert.alert('Perhatian', 'Nama dan alamat wajib diisi')
      return
    }
    setSaving(true)
    try {
      let photoUrl = form.photo_url
      if (previewPhoto && previewPhoto !== form.photo_url) {
        const url = await uploadPhoto(selectedWH.id)
        if (url) photoUrl = url
      }

      const { error } = await supabase
        .from('warehouses')
        .update({
          name: form.name,
          address: form.address,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          photo_url: photoUrl || null,
          head_user_id: form.head_user_id || null,
          is_active: form.is_active,
        })
        .eq('id', selectedWH.id)

      if (error) {
        Alert.alert('Error', error.message)
        setSaving(false)
        return
      }

      Alert.alert('Berhasil', 'Warehouse berhasil diupdate')
      setShowEdit(false)
      setPreviewPhoto('')
      fetchWarehouses()
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedWH) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('warehouses').delete().eq('id', selectedWH.id)
      if (error) {
        Alert.alert('Error', error.message)
      } else {
        setShowDeleteConfirm(false)
        setSelectedWH(null)
        Alert.alert('Berhasil', 'Warehouse berhasil dihapus')
        fetchWarehouses()
      }
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setDeleting(false)
  }

  const openDetail = (w: Warehouse) => { setSelectedWH(w); setShowDetail(true) }
  const openEdit = (w: Warehouse) => {
    setSelectedWH(w)
    setPreviewPhoto(w.photo_url ?? '')
    setForm({
      name: w.name,
      address: w.address,
      lat: w.lat?.toString() ?? '',
      lng: w.lng?.toString() ?? '',
      photo_url: w.photo_url ?? '',
      head_user_id: w.head_user_id ?? '',
      is_active: w.is_active,
    })
    setShowEdit(true)
  }
  const openDelete = (w: Warehouse) => { setSelectedWH(w); setShowDeleteConfirm(true) }

  const getMapHTML = (initLat?: number, initLng?: number) => {
    const lat = initLat ?? -6.2088
    const lng = initLng ?? 106.8456
    const zoom = initLat ? 15 : 10
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:sans-serif;overflow:hidden;}
#search-wrap{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:1000;width:92%;max-width:420px;}
#search-row{display:flex;gap:8px;}
#search-input{flex:1;padding:10px 14px;border-radius:8px;border:1px solid #ddd;font-size:14px;outline:none;box-shadow:0 2px 8px rgba(0,0,0,.15);}
#search-btn{padding:10px 16px;background:#1a1a2e;color:#fff;border:none;border-radius:8px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.15);}
#results{background:#fff;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.15);margin-top:6px;display:none;max-height:180px;overflow-y:auto;}
.ri{padding:10px 14px;font-size:13px;cursor:pointer;border-bottom:1px solid #f0f0f0;line-height:1.4;}
.ri:last-child{border-bottom:none;}
.ri:hover{background:#f5f5f5;}
#map{width:100%;height:calc(100vh - 56px);margin-top:56px;}
#bottom{position:absolute;bottom:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,.97);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 -2px 12px rgba(0,0,0,.1);}
#coords-text{font-size:12px;color:#555;}
#confirm-btn{padding:10px 24px;background:#1a1a2e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;}
</style>
</head>
<body>
<div id="search-wrap">
  <div id="search-row">
    <input id="search-input" type="text" placeholder="Cari lokasi di Indonesia..."/>
    <button id="search-btn" onclick="doSearch()">Cari</button>
  </div>
  <div id="results"></div>
</div>
<div id="map"></div>
<div id="bottom">
  <span id="coords-text">Klik peta atau drag pin untuk pilih lokasi</span>
  <button id="confirm-btn" onclick="confirm()">Gunakan Lokasi Ini</button>
</div>
<script>
var map = L.map('map').setView([${lat},${lng}],${zoom});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
var marker = L.marker([${lat},${lng}],{draggable:true}).addTo(map);
var curLat=${lat}, curLng=${lng}, curAddr='';

function updateCoords(lat,lng){
  curLat=lat; curLng=lng;
  document.getElementById('coords-text').textContent='📍 '+lat.toFixed(6)+', '+lng.toFixed(6);
}

marker.on('dragend',function(e){
  var p=e.target.getLatLng();
  updateCoords(p.lat,p.lng);
  reverseGeocode(p.lat,p.lng);
});

map.on('click',function(e){
  marker.setLatLng(e.latlng);
  updateCoords(e.latlng.lat,e.latlng.lng);
  reverseGeocode(e.latlng.lat,e.latlng.lng);
});

function reverseGeocode(lat,lng){
  fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lng+'&accept-language=id')
    .then(r=>r.json())
    .then(d=>{curAddr=d.display_name||'';})
    .catch(()=>{});
}

function doSearch(){
  var q=document.getElementById('search-input').value.trim();
  if(!q)return;
  var resultsEl=document.getElementById('results');
  resultsEl.innerHTML='<div class="ri">Mencari...</div>';
  resultsEl.style.display='block';
  fetch('https://nominatim.openstreetmap.org/search?format=json&q='+encodeURIComponent(q)+'&limit=7&countrycodes=id&accept-language=id&addressdetails=1')
    .then(r=>r.json())
    .then(data=>{
      if(!data.length){resultsEl.innerHTML='<div class="ri">Lokasi tidak ditemukan</div>';return;}
      resultsEl.innerHTML=data.map(function(r){
        return '<div class="ri" onclick="selectLoc('+r.lat+','+r.lon+',decodeURIComponent(\\'' +encodeURIComponent(r.display_name)+'\\'))">'+r.display_name+'</div>';
      }).join('');
    })
    .catch(()=>{resultsEl.innerHTML='<div class="ri">Gagal mencari lokasi</div>';});
}

function selectLoc(lat,lon,name){
  lat=parseFloat(lat); lon=parseFloat(lon);
  map.setView([lat,lon],17);
  marker.setLatLng([lat,lon]);
  updateCoords(lat,lon);
  curAddr=name;
  document.getElementById('search-input').value=name;
  document.getElementById('results').style.display='none';
}

function confirm(){
  window.parent.postMessage({type:'LOCATION_SELECTED',lat:curLat,lng:curLng,address:curAddr},'*');
}

document.getElementById('search-input').addEventListener('keydown',function(e){if(e.key==='Enter')doSearch();});
document.addEventListener('click',function(e){
  if(!e.target.closest('#search-wrap'))document.getElementById('results').style.display='none';
});

${initLat ? `updateCoords(${lat},${lng});` : ''}
</script>
</body>
</html>`
  }

  const filtered = warehouses.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <AdminHeader title="Data Warehouse" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <View style={styles.body}>
        {sidebarOpen && <AdminSidebar />}
        <View style={styles.main}>

          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Data Warehouse</Text>
              <Text style={styles.pageSub}>{warehouses.length} warehouse terdaftar</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setForm(emptyForm)
                setPreviewPhoto('')
                setShowKepalaDropdown(false)
                setShowAdd(true)
              }}
            >
              <Text style={styles.addBtnText}>+ Tambah Warehouse</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            placeholder="Cari nama atau alamat warehouse..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#1a1a2e" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 0.5 }]}>Foto</Text>
                <Text style={[styles.th, { flex: 2 }]}>Nama</Text>
                <Text style={[styles.th, { flex: 2 }]}>Alamat</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Kepala WH</Text>
                <Text style={[styles.th, { flex: 1 }]}>GPS</Text>
                <Text style={[styles.th, { flex: 1 }]}>Status</Text>
                <Text style={[styles.th, { flex: 2 }]}>Aksi</Text>
              </View>

              {filtered.length === 0 ? (
                <Text style={styles.empty}>Tidak ada data warehouse</Text>
              ) : (
                filtered.map((w, i) => (
                  <View key={w.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                    <View style={{ flex: 0.5, justifyContent: 'center' }}>
                      {w.photo_url ? (
                        <Image source={{ uri: w.photo_url }} style={styles.tablePhoto} />
                      ) : (
                        <View style={styles.tablePhotoPlaceholder}>
                          <Text style={{ fontSize: 18 }}>🏭</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.tdName}>{w.name}</Text>
                    </View>
                    <Text style={[styles.td, { flex: 2 }]} numberOfLines={2}>{w.address}</Text>
                    <Text style={[styles.td, { flex: 1.5 }]}>{w.head_user?.full_name ?? '-'}</Text>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={[styles.gpsBadge, { backgroundColor: w.lat && w.lng ? '#e8f5e9' : '#f5f5f5' }]}>
                        <Text style={[styles.gpsBadgeText, { color: w.lat && w.lng ? '#2e7d32' : '#aaa' }]}>
                          {w.lat && w.lng ? '📍 Ada' : 'Belum'}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={[styles.statusBadge, { backgroundColor: w.is_active ? '#e8f5e9' : '#ffebee' }]}>
                        <Text style={[styles.statusText, { color: w.is_active ? '#2e7d32' : '#c62828' }]}>
                          {w.is_active ? 'Aktif' : 'Nonaktif'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.actions, { flex: 2 }]}>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} onPress={() => openDetail(w)}>
                        <Text style={[styles.actionText, { color: '#1565c0' }]}>Detail</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fff3e0' }]} onPress={() => openEdit(w)}>
                        <Text style={[styles.actionText, { color: '#e65100' }]}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ffebee' }]} onPress={() => openDelete(w)}>
                        <Text style={[styles.actionText, { color: '#c62828' }]}>Hapus</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* MODAL TAMBAH */}
      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Warehouse</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <FormContent
              form={form}
              setForm={setForm}
              kepalaList={kepalaList}
              showKepalaDropdown={showKepalaDropdown}
              setShowKepalaDropdown={setShowKepalaDropdown}
              previewPhoto={previewPhoto}
              setPreviewPhoto={setPreviewPhoto}
              uploadingPhoto={uploadingPhoto}
              pickPhoto={pickPhoto}
              setShowMap={setShowMap}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DETAIL */}
      <Modal visible={showDetail} transparent animationType="fade" onRequestClose={() => setShowDetail(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Warehouse</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {!!selectedWH && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailTop}>
                  {selectedWH.photo_url ? (
                    <Image source={{ uri: selectedWH.photo_url }} style={styles.detailPhoto} />
                  ) : (
                    <View style={styles.detailPhotoPlaceholder}>
                      <Text style={{ fontSize: 40 }}>🏭</Text>
                    </View>
                  )}
                  <Text style={styles.detailName}>{selectedWH.name}</Text>
                  <View style={[styles.statusBadge, {
                    alignSelf: 'center', marginTop: 4,
                    backgroundColor: selectedWH.is_active ? '#e8f5e9' : '#ffebee'
                  }]}>
                    <Text style={[styles.statusText, { color: selectedWH.is_active ? '#2e7d32' : '#c62828' }]}>
                      {selectedWH.is_active ? 'Aktif' : 'Nonaktif'}
                    </Text>
                  </View>
                </View>

                <DRow label="Alamat" value={selectedWH.address} />
                <DRow label="Kepala WH" value={selectedWH.head_user?.full_name ?? 'Belum ditentukan'} />
                <DRow label="Latitude" value={selectedWH.lat?.toString() ?? '-'} />
                <DRow label="Longitude" value={selectedWH.lng?.toString() ?? '-'} />

                {!!(selectedWH.lat && selectedWH.lng && Platform.OS === 'web') && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Lokasi di Peta</Text>
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
                        <style>*{margin:0;padding:0;}#map{width:100%;height:200px;}</style>
                        </head><body><div id="map"></div>
                        <script>
                          var map=L.map('map').setView([${selectedWH.lat},${selectedWH.lng}],15);
                          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                          L.marker([${selectedWH.lat},${selectedWH.lng}]).addTo(map).bindPopup('${selectedWH.name}').openPopup();
                        </script></body></html>`}
                      style={{ width: '100%', height: 200, border: 'none', borderRadius: 8 } as any}
                    />
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

      {/* MODAL EDIT */}
      <Modal visible={showEdit} transparent animationType="fade" onRequestClose={() => setShowEdit(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Warehouse</Text>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <FormContent
              form={form}
              setForm={setForm}
              kepalaList={kepalaList}
              showKepalaDropdown={showKepalaDropdown}
              setShowKepalaDropdown={setShowKepalaDropdown}
              previewPhoto={previewPhoto}
              setPreviewPhoto={setPreviewPhoto}
              uploadingPhoto={uploadingPhoto}
              pickPhoto={pickPhoto}
              setShowMap={setShowMap}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEdit(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleEdit} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL HAPUS */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { maxWidth: 380 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hapus Warehouse</Text>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.deleteIcon}>🗑️</Text>
              <Text style={styles.deleteTitle}>Yakin ingin menghapus?</Text>
              <Text style={styles.deleteSub}>
                {'Warehouse '}
                <Text style={{ fontWeight: '600', color: '#1a1a2e' }}>{selectedWH?.name}</Text>
                {' akan dihapus permanen dan tidak dapat dikembalikan.'}
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteBtn, deleting && { opacity: 0.6 }]} onPress={handleDelete} disabled={deleting}>
                {deleting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Hapus</Text>}
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
              <Text style={styles.modalTitle}>Pilih Lokasi Warehouse</Text>
              <TouchableOpacity onPress={() => setShowMap(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {!!(showMap && Platform.OS === 'web') && (
              <iframe
                srcDoc={getMapHTML(
                  form.lat ? parseFloat(form.lat) : undefined,
                  form.lng ? parseFloat(form.lng) : undefined
                )}
                style={{ width: '100%', flex: 1, border: 'none' } as any}
              />
            )}
          </View>
        </View>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, padding: 20 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  pageSub: { fontSize: 12, color: '#888', marginTop: 2 },
  addBtn: { backgroundColor: '#1a1a2e', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, marginBottom: 12, color: '#333' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1a1a2e', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  th: { fontSize: 12, fontWeight: '600', color: '#fff' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#fff' },
  td: { fontSize: 13, color: '#333' },
  tdName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  tablePhoto: { width: 40, height: 40, borderRadius: 6 },
  tablePhotoPlaceholder: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  gpsBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  gpsBadgeText: { fontSize: 11, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  actionText: { fontSize: 11, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  mapOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  mapBox: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '92%', overflow: 'hidden', display: 'flex' as any, flexDirection: 'column' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, width: '90%', maxWidth: 520, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  closeBtn: { fontSize: 18, color: '#888', paddingHorizontal: 4 },
  modalBody: { padding: 16, maxHeight: 500 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#444', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#333', backgroundColor: '#fafafa' },
  gpsRow: { flexDirection: 'row', marginBottom: 8 },
  mapBtn: { borderWidth: 1, borderColor: '#1a1a2e', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginBottom: 8 },
  mapBtnText: { fontSize: 13, color: '#1a1a2e', fontWeight: '500' },
  coordsText: { fontSize: 11, color: '#2e7d32', textAlign: 'center', marginBottom: 12 },
  dropdownBtn: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#fafafa', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownBtnText: { fontSize: 13, color: '#333' },
  dropdownArrow: { fontSize: 10, color: '#888' },
  dropdownList: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, backgroundColor: '#fff', marginTop: 4, maxHeight: 200, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  dropdownItemActive: { backgroundColor: '#f0f2ff' },
  dropdownItemText: { fontSize: 13, color: '#333' },
  dropdownItemSub: { fontSize: 11, color: '#888', marginTop: 2 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  toggleActive: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  toggleText: { fontSize: 13, color: '#555' },
  toggleTextActive: { color: '#fff' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  cancelText: { fontSize: 13, color: '#555' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#1a1a2e' },
  saveText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  deleteBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#c62828' },
  deleteIcon: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
  deleteTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', textAlign: 'center', marginBottom: 8 },
  deleteSub: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
  detailTop: { alignItems: 'center', marginBottom: 16 },
  detailPhoto: { width: 100, height: 100, borderRadius: 12, marginBottom: 8 },
  detailPhotoPlaceholder: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  detailName: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
  dRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dLabel: { fontSize: 13, color: '#888' },
  dValue: { fontSize: 13, color: '#1a1a2e', fontWeight: '500', flex: 1, textAlign: 'right' },
  photoPickerRow: { flexDirection: 'row', alignItems: 'center' },
  photoPreview: { width: 72, height: 72, borderRadius: 8, borderWidth: 2, borderColor: '#e5e5e5' },
  photoPlaceholder: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#e5e5e5' },
  photoBtn: { borderWidth: 1, borderColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  photoBtnText: { fontSize: 12, color: '#1a1a2e', fontWeight: '500' },
  photoRemoveBtn: { borderWidth: 1, borderColor: '#c62828', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  photoRemoveBtnText: { fontSize: 12, color: '#c62828' },
})