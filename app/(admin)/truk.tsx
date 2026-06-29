import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Alert, ActivityIndicator, StatusBar, Image
} from 'react-native'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { supabase } from '../../lib/supabase'

const TRUCK_TYPES = [
  { label: 'CDD', value: 'CDD' },
  { label: 'Engkel', value: 'Engkel' },
  { label: 'Fuso', value: 'Fuso' },
];

const TRUCK_STATUS = [
  { label: 'Standby', value: 'standby', color: '#2e7d32', bg: '#e8f5e9' },
  { label: 'Mengirim', value: 'on_delivery', color: '#1565c0', bg: '#e3f2fd' },
  { label: 'Kembali', value: 'returning', color: '#e65100', bg: '#fff3e0' },
  { label: 'Maintenance', value: 'maintenance', color: '#f57f17', bg: '#fffde7' },
  { label: 'Rusak', value: 'rusak', color: '#c62828', bg: '#ffebee' },
]

interface Truck {
  id: string
  warehouse_id: string
  plate_number: string
  type: string
  photo_url?: string
  status: string
  current_lat?: number
  current_lng?: number
  last_updated_at?: string
  is_active: boolean
  warehouse?: { name: string }
}

interface Warehouse {
  id: string
  name: string
}

interface FormData {
  warehouse_id: string
  plate_number: string
  type: string
  photo_url: string
  status: string
  is_active: boolean
}

const emptyForm: FormData = {
  warehouse_id: '',
  plate_number: '',
  type: '',
  photo_url: '',
  status: 'standby',
  is_active: true,
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function Field({ label, value, onChange, placeholder, autoCapitalize }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoCapitalize?: any
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
        autoCapitalize={autoCapitalize ?? 'none'}
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
  const s = TRUCK_STATUS.find(t => t.value === status)
  return (
    <View style={[styles.statusBadge, { backgroundColor: s?.bg ?? '#f5f5f5' }]}>
      <Text style={[styles.statusText, { color: s?.color ?? '#888' }]}>{s?.label ?? status}</Text>
    </View>
  )
}

function WHDropdown({ form, setForm, warehouses, showDropdown, setShowDropdown }: {
  form: FormData
  setForm: (f: FormData) => void
  warehouses: Warehouse[]
  showDropdown: boolean
  setShowDropdown: (v: boolean) => void
}) {
  const selectedName = warehouses.find(w => w.id === form.warehouse_id)?.name
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>Warehouse *</Text>
      <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowDropdown(!showDropdown)}>
        <Text style={[styles.dropdownBtnText, !form.warehouse_id && { color: '#bbb' }]}>
          {selectedName ?? 'Pilih Warehouse...'}
        </Text>
        <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showDropdown && (
        <View style={styles.dropdownList}>
          {warehouses.length === 0 ? (
            <View style={styles.dropdownItem}>
              <Text style={[styles.dropdownItemText, { color: '#aaa' }]}>Tidak ada warehouse aktif</Text>
            </View>
          ) : warehouses.map(w => (
            <TouchableOpacity
              key={w.id}
              style={[styles.dropdownItem, form.warehouse_id === w.id && styles.dropdownItemActive]}
              onPress={() => { setForm({ ...form, warehouse_id: w.id }); setShowDropdown(false) }}
            >
              <Text style={[styles.dropdownItemText, form.warehouse_id === w.id && { color: '#1a1a2e', fontWeight: '600' }]}>
                {w.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

function TruckFormContent({
  form, setForm, previewPhoto, setPreviewPhoto,
  uploadingPhoto, pickPhoto, warehouses,
  showWHDropdown, setShowWHDropdown,
}: {
  form: FormData
  setForm: (f: FormData) => void
  previewPhoto: string
  setPreviewPhoto: (v: string) => void
  uploadingPhoto: boolean
  pickPhoto: () => void
  warehouses: Warehouse[]
  showWHDropdown: boolean
  setShowWHDropdown: (v: boolean) => void
}) {
  return (
    <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">

      {/* Foto */}
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.fieldLabel}>Foto Truk</Text>
        <View style={styles.photoPickerRow}>
          {previewPhoto ? (
            <Image source={{ uri: previewPhoto }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ fontSize: 28 }}>🚛</Text>
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

      <WHDropdown
        form={form}
        setForm={setForm}
        warehouses={warehouses}
        showDropdown={showWHDropdown}
        setShowDropdown={setShowWHDropdown}
      />

      <Field
        label="Nomor Plat *"
        value={form.plate_number}
        onChange={v => setForm({ ...form, plate_number: v.toUpperCase() })}
        placeholder="Contoh: B 1234 ABC"
        autoCapitalize="characters"
      />

      {/* Tipe Kendaraan */}
      <Text style={styles.fieldLabel}>Tipe Kendaraan</Text>
      <View style={styles.statusGrid}>
        {TRUCK_TYPES.map(type => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.statusChip,
              form.type === type.value && {
                backgroundColor: '#2563EB',
                borderColor: '#2563EB',
              },
            ]}
            onPress={() => setForm({ ...form, type: type.value })}
          >
            <Text
              style={[
                styles.statusChipText,
                form.type === type.value && { color: '#fff' },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View> 

      {/* Status */}
      <Text style={styles.fieldLabel}>Status</Text>
      <View style={styles.statusGrid}>
        {TRUCK_STATUS.map(s => (
          <TouchableOpacity
            key={s.value}
            style={[
              styles.statusChip,
              form.status === s.value && { backgroundColor: s.color, borderColor: s.color }
            ]}
            onPress={() => setForm({ ...form, status: s.value })}
          >
            <Text style={[styles.statusChipText, form.status === s.value && { color: '#fff' }]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Aktif */}
      <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Kondisi</Text>
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

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TrukPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showWHDropdown, setShowWHDropdown] = useState(false)

  useEffect(() => {
    fetchTrucks()
    fetchWarehouses()
  }, [])

  const fetchTrucks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trucks')
      .select('*, warehouse:warehouse_id(name)')
      .order('plate_number', { ascending: true })
    if (!error && data) setTrucks(data)
    setLoading(false)
  }

  const fetchWarehouses = async () => {
    const { data } = await supabase
      .from('warehouses')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true })
    if (data) setWarehouses(data)
  }

  const uploadPhoto = async (truckId: string): Promise<string | null> => {
    if (!previewPhoto) return null
    try {
      setUploadingPhoto(true)
      const response = await fetch(previewPhoto)
      const blob = await response.blob()
      const fileExt = blob.type.split('/')[1] || 'jpg'
      const fileName = `${truckId}.${fileExt}`
      const { error } = await supabase.storage
        .from('trucks')
        .upload(fileName, blob, { upsert: true, contentType: blob.type })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('trucks').getPublicUrl(fileName)
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
    if (!form.warehouse_id || !form.plate_number) {
      Alert.alert('Perhatian', 'Warehouse dan nomor plat wajib diisi')
      return
    }
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('trucks')
        .insert({
          warehouse_id: form.warehouse_id,
          plate_number: form.plate_number,
          type: form.type || null,
          status: form.status,
          is_active: form.is_active,
        })
        .select()
        .single()

      if (error || !data) {
        Alert.alert('Error', error?.message ?? 'Gagal menambahkan truk')
        setSaving(false)
        return
      }

      if (previewPhoto) {
        const photoUrl = await uploadPhoto(data.id)
        if (photoUrl) {
          await supabase.from('trucks').update({ photo_url: photoUrl }).eq('id', data.id)
        }
      }

      Alert.alert('Berhasil', 'Truk berhasil ditambahkan')
      setShowAdd(false)
      setForm(emptyForm)
      setPreviewPhoto('')
      fetchTrucks()
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!selectedTruck || !form.warehouse_id || !form.plate_number) {
      Alert.alert('Perhatian', 'Warehouse dan nomor plat wajib diisi')
      return
    }
    setSaving(true)
    try {
      let photoUrl = form.photo_url
      if (previewPhoto && previewPhoto !== form.photo_url) {
        const url = await uploadPhoto(selectedTruck.id)
        if (url) photoUrl = url
      }

      const { error } = await supabase
        .from('trucks')
        .update({
          warehouse_id: form.warehouse_id,
          plate_number: form.plate_number,
          type: form.type || null,
          photo_url: photoUrl || null,
          status: form.status,
          is_active: form.is_active,
        })
        .eq('id', selectedTruck.id)

      if (error) {
        Alert.alert('Error', error.message)
        setSaving(false)
        return
      }

      Alert.alert('Berhasil', 'Truk berhasil diupdate')
      setShowEdit(false)
      setPreviewPhoto('')
      fetchTrucks()
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedTruck) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('trucks').delete().eq('id', selectedTruck.id)
      if (error) {
        Alert.alert('Error', error.message)
      } else {
        setShowDeleteConfirm(false)
        setSelectedTruck(null)
        Alert.alert('Berhasil', 'Truk berhasil dihapus')
        fetchTrucks()
      }
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setDeleting(false)
  }

  const openDetail = (t: Truck) => { setSelectedTruck(t); setShowDetail(true) }
  const openEdit = (t: Truck) => {
    setSelectedTruck(t)
    setPreviewPhoto(t.photo_url ?? '')
    setForm({
      warehouse_id: t.warehouse_id,
      plate_number: t.plate_number,
      type: t.type ?? '',
      photo_url: t.photo_url ?? '',
      status: t.status,
      is_active: t.is_active,
    })
    setShowWHDropdown(false)
    setShowEdit(true)
  }
  const openDelete = (t: Truck) => { setSelectedTruck(t); setShowDeleteConfirm(true) }

  const formatDate = (iso?: string) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const STATUS_FILTERS = [{ label: 'Semua', value: 'all' }, ...TRUCK_STATUS]

  const filtered = trucks.filter(t => {
    const matchSearch =
      t.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.type?.toLowerCase().includes(search.toLowerCase()) ||
      t.warehouse?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchStatus
  })

  const formProps = {
    form, setForm,
    previewPhoto, setPreviewPhoto,
    uploadingPhoto, pickPhoto,
    warehouses,
    showWHDropdown, setShowWHDropdown,
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <AdminHeader title="Data Truk" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <View style={styles.body}>
        {sidebarOpen && <AdminSidebar />}
        <View style={styles.main}>

          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Data Truk</Text>
              <Text style={styles.pageSub}>{trucks.length} truk terdaftar</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setForm(emptyForm)
                setPreviewPhoto('')
                setShowWHDropdown(false)
                setShowAdd(true)
              }}
            >
              <Text style={styles.addBtnText}>+ Tambah Truk</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            placeholder="Cari plat, tipe, atau warehouse..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />

          {/* Filter Status */}
          <View style={styles.filterWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {STATUS_FILTERS.map(s => {
                const statusData = TRUCK_STATUS.find(t => t.value === s.value)
                const isActive = filterStatus === s.value
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[
                      styles.filterChip,
                      isActive && {
                        backgroundColor: s.value === 'all' ? '#1a1a2e' : (statusData?.color ?? '#1a1a2e'),
                        borderColor: s.value === 'all' ? '#1a1a2e' : (statusData?.color ?? '#1a1a2e'),
                      }
                    ]}
                    onPress={() => setFilterStatus(s.value)}
                  >
                    <Text style={[styles.filterChipText, isActive && { color: '#fff' }]}>
                      {s.label}
                      {s.value !== 'all' && ` (${trucks.filter(t => t.status === s.value).length})`}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>

          {/* Table */}
          {loading ? (
            <ActivityIndicator size="large" color="#1a1a2e" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 0.5 }]}>Foto</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Plat</Text>
                <Text style={[styles.th, { flex: 1 }]}>Tipe</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Warehouse</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Status</Text>
                <Text style={[styles.th, { flex: 1 }]}>Kondisi</Text>
                <Text style={[styles.th, { flex: 2 }]}>Aksi</Text>
              </View>

              {filtered.length === 0 ? (
                <Text style={styles.empty}>Tidak ada data truk</Text>
              ) : filtered.map((t, i) => (
                <View key={t.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                  <View style={{ flex: 0.5, justifyContent: 'center' }}>
                    {t.photo_url ? (
                      <Image source={{ uri: t.photo_url }} style={styles.tablePhoto} />
                    ) : (
                      <View style={styles.tablePhotoPlaceholder}>
                        <Text style={{ fontSize: 18 }}>🚛</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.tdPlat}>{t.plate_number}</Text>
                  </View>
                  <Text style={[styles.td, { flex: 1 }]}>{t.type ?? '-'}</Text>
                  <Text style={[styles.td, { flex: 1.5 }]}>{t.warehouse?.name ?? '-'}</Text>
                  <View style={{ flex: 1.5, justifyContent: 'center' }}>
                    <StatusBadge status={t.status} />
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={[styles.kondisiBadge, { backgroundColor: t.is_active ? '#e8f5e9' : '#ffebee' }]}>
                      <Text style={[styles.kondisiText, { color: t.is_active ? '#2e7d32' : '#c62828' }]}>
                        {t.is_active ? 'Aktif' : 'Nonaktif'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.actions, { flex: 2 }]}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} onPress={() => openDetail(t)}>
                      <Text style={[styles.actionText, { color: '#1565c0' }]}>Detail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fff3e0' }]} onPress={() => openEdit(t)}>
                      <Text style={[styles.actionText, { color: '#e65100' }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ffebee' }]} onPress={() => openDelete(t)}>
                      <Text style={[styles.actionText, { color: '#c62828' }]}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* MODAL TAMBAH */}
      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Truk</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <TruckFormContent {...formProps} />
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
              <Text style={styles.modalTitle}>Detail Truk</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {!!selectedTruck && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailTop}>
                  {selectedTruck.photo_url ? (
                    <Image source={{ uri: selectedTruck.photo_url }} style={styles.detailPhoto} />
                  ) : (
                    <View style={styles.detailPhotoPlaceholder}>
                      <Text style={{ fontSize: 40 }}>🚛</Text>
                    </View>
                  )}
                  <Text style={styles.detailPlat}>{selectedTruck.plate_number}</Text>
                  <Text style={styles.detailType}>{selectedTruck.type ?? '-'}</Text>
                  <View style={{ marginTop: 8 }}>
                    <StatusBadge status={selectedTruck.status} />
                  </View>
                </View>
                <DRow label="Warehouse" value={selectedTruck.warehouse?.name ?? '-'} />
                <DRow label="Tipe" value={selectedTruck.type ?? '-'} />
                <DRow label="Kondisi" value={selectedTruck.is_active ? 'Aktif' : 'Nonaktif'} />
                <DRow label="Lokasi GPS" value={
                  selectedTruck.current_lat && selectedTruck.current_lng
                    ? `${selectedTruck.current_lat.toFixed(6)}, ${selectedTruck.current_lng.toFixed(6)}`
                    : 'Belum ada data GPS'
                } />
                <DRow label="Update GPS" value={formatDate(selectedTruck.last_updated_at)} />
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
              <Text style={styles.modalTitle}>Edit Truk</Text>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <TruckFormContent {...formProps} />
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
              <Text style={styles.modalTitle}>Hapus Truk</Text>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.deleteIcon}>🗑️</Text>
              <Text style={styles.deleteTitle}>Yakin ingin menghapus?</Text>
              <Text style={styles.deleteSub}>
                {'Truk '}
                <Text style={{ fontWeight: '600', color: '#1a1a2e' }}>{selectedTruck?.plate_number}</Text>
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
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, marginBottom: 10, color: '#333' },
  filterWrap: { height: 40, marginBottom: 12 },
  filterScroll: { flexDirection: 'row', alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff', height: 32, justifyContent: 'center' },
  filterChipText: { fontSize: 12, color: '#555', fontWeight: '500' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1a1a2e', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  th: { fontSize: 12, fontWeight: '600', color: '#fff' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#fff' },
  td: { fontSize: 13, color: '#333' },
  tdPlat: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', letterSpacing: 0.5 },
  tablePhoto: { width: 40, height: 40, borderRadius: 6 },
  tablePhotoPlaceholder: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '500' },
  kondisiBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  kondisiText: { fontSize: 11, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  actionText: { fontSize: 11, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, width: '90%', maxWidth: 480, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  closeBtn: { fontSize: 18, color: '#888', paddingHorizontal: 4 },
  modalBody: { padding: 16, maxHeight: 480 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#444', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#333', backgroundColor: '#fafafa' },
  dropdownBtn: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#fafafa', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownBtnText: { fontSize: 13, color: '#333' },
  dropdownArrow: { fontSize: 10, color: '#888' },
  dropdownList: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, backgroundColor: '#fff', marginTop: 4, maxHeight: 160, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  dropdownItemActive: { backgroundColor: '#f0f2ff' },
  dropdownItemText: { fontSize: 13, color: '#333' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statusChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  statusChipText: { fontSize: 12, color: '#555' },
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
  detailPhoto: { width: 120, height: 80, borderRadius: 12, marginBottom: 8 },
  detailPhotoPlaceholder: { width: 120, height: 80, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  detailPlat: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e', letterSpacing: 1 },
  detailType: { fontSize: 13, color: '#888', marginTop: 2 },
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