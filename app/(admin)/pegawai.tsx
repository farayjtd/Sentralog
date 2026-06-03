import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Alert, ActivityIndicator, StatusBar, Image, Platform
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { supabase, manageUser } from '../../lib/supabase'

const ROLES = [
  { label: 'Semua', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Owner', value: 'owner' },
  { label: 'Teknik Sipil', value: 'teknik_sipil' },
  { label: 'Kepala WH', value: 'kepala_wh' },
  { label: 'Sopir', value: 'sopir' },
  { label: 'Mandor', value: 'mandor' },
  { label: 'Tukang', value: 'tukang' },
]

const ROLE_FORM = ROLES.filter(r => r.value !== 'all')

const ROLE_COLORS: Record<string, string> = {
  admin: '#1a1a2e',
  owner: '#2d6a4f',
  teknik_sipil: '#1565c0',
  kepala_wh: '#6a1b9a',
  sopir: '#e65100',
  mandor: '#c62828',
  tukang: '#37474f',
}

interface User {
  id: string
  full_name: string
  username: string
  email: string
  phone: string
  role: string
  is_active: boolean
  avatar_url?: string
}

interface FormData {
  full_name: string
  username: string
  email: string
  phone: string
  password: string
  role: string
  is_active: boolean
  avatar_url: string
}

const emptyForm: FormData = {
  full_name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'tukang',
  is_active: true,
  avatar_url: '',
}

export default function PegawaiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [pegawai, setPegawai] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string>('')

  useEffect(() => { fetchPegawai() }, [])

  const fetchPegawai = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('role', { ascending: true })
      .order('full_name', { ascending: true })
    if (!error && data) setPegawai(data)
    setLoading(false)
  }

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!previewPhoto) return null
    try {
      setUploadingPhoto(true)
      const response = await fetch(previewPhoto)
      const blob = await response.blob()
      const fileExt = blob.type.split('/')[1] || 'jpg'
      const fileName = `${userId}.${fileExt}`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true, contentType: blob.type })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (e: any) {
      Alert.alert('Error', 'Gagal upload foto: ' + e.message)
      return null
    } finally {
      setUploadingPhoto(false)
    }
  }

  const pickPhoto = async () => {
    if (Platform.OS === 'web') {
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
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Perhatian', 'Izin akses galeri diperlukan')
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })
      if (!result.canceled) setPreviewPhoto(result.assets[0].uri)
    }
  }

  const handleAdd = async () => {
    if (!form.full_name || !form.username || !form.email || !form.password) {
      Alert.alert('Perhatian', 'Semua field wajib diisi')
      return
    }
    if (form.password.length < 6) {
      Alert.alert('Perhatian', 'Password minimal 6 karakter')
      return
    }
    setSaving(true)
    try {
      const result = await manageUser('create', {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        username: form.username.toLowerCase(),
        phone: form.phone,
        role: form.role,
        is_active: form.is_active,
      })

      if (!result.success) {
        Alert.alert('Error', result.error ?? 'Gagal menambahkan pegawai')
        setSaving(false)
        return
      }

      if (previewPhoto && result.id) {
        const photoUrl = await uploadPhoto(result.id)
        if (photoUrl) {
          await supabase.from('users').update({ avatar_url: photoUrl }).eq('id', result.id)
        }
      }

      Alert.alert('Berhasil', 'Pegawai berhasil ditambahkan')
      setShowAdd(false)
      setForm(emptyForm)
      setPreviewPhoto('')
      fetchPegawai()
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!selectedUser || !form.full_name || !form.username || !form.email) {
      Alert.alert('Perhatian', 'Field wajib diisi')
      return
    }
    setSaving(true)
    try {
      let avatarUrl = form.avatar_url
      if (previewPhoto && previewPhoto !== form.avatar_url) {
        const photoUrl = await uploadPhoto(selectedUser.id)
        if (photoUrl) avatarUrl = photoUrl
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: form.full_name,
          username: form.username.toLowerCase(),
          email: form.email,
          phone: form.phone,
          role: form.role,
          is_active: form.is_active,
          avatar_url: avatarUrl,
        })
        .eq('id', selectedUser.id)

      if (updateError) {
        Alert.alert('Error', updateError.message)
        setSaving(false)
        return
      }

      if (form.password && form.password.length >= 6) {
        const result = await manageUser('update_password', {
          id: selectedUser.id,
          password: form.password,
        })
        if (!result.success) {
          Alert.alert('Perhatian', 'Data tersimpan tapi password gagal diupdate')
          setSaving(false)
          setShowEdit(false)
          fetchPegawai()
          return
        }
      }

      Alert.alert('Berhasil', 'Data pegawai berhasil diupdate')
      setShowEdit(false)
      setPreviewPhoto('')
      fetchPegawai()
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    setDeleting(true)
    try {
      const result = await manageUser('delete', { id: selectedUser.id })
      if (!result.success) {
        Alert.alert('Error', result.error ?? 'Gagal menghapus pegawai')
      } else {
        setShowDeleteConfirm(false)
        setSelectedUser(null)
        Alert.alert('Berhasil', 'Pegawai berhasil dihapus')
        fetchPegawai()
      }
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan')
    }
    setDeleting(false)
  }

  const openDetail = (u: User) => { setSelectedUser(u); setShowDetail(true) }
  const openEdit = (u: User) => {
    setSelectedUser(u)
    setPreviewPhoto(u.avatar_url ?? '')
    setForm({
      full_name: u.full_name,
      username: u.username,
      email: u.email,
      phone: u.phone ?? '',
      password: '',
      role: u.role,
      is_active: u.is_active,
      avatar_url: u.avatar_url ?? '',
    })
    setShowEdit(true)
  }
  const openDelete = (u: User) => { setSelectedUser(u); setShowDeleteConfirm(true) }
  const getRoleLabel = (role: string) => ROLES.find(r => r.value === role)?.label ?? role

  const filtered = pegawai.filter(p => {
    const matchSearch =
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.username?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'all' || p.role === filterRole
    return matchSearch && matchRole
  })

  const PhotoPicker = ({ label }: { label: string }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.photoPickerRow}>
        {previewPhoto ? (
          <Image source={{ uri: previewPhoto }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>👤</Text>
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
          <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto} disabled={uploadingPhoto}>
            {uploadingPhoto
              ? <ActivityIndicator size="small" color="#1a1a2e" />
              : <Text style={styles.photoBtnText}>📷 Pilih Foto</Text>
            }
          </TouchableOpacity>
          {previewPhoto ? (
            <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => setPreviewPhoto('')}>
              <Text style={styles.photoRemoveBtnText}>Hapus Foto</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <AdminHeader title="Data Pegawai" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <View style={styles.body}>
        {sidebarOpen && <AdminSidebar />}
        <View style={styles.main}>

          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Data Pegawai</Text>
              <Text style={styles.pageSub}>{filtered.length} dari {pegawai.length} pegawai</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => { setForm(emptyForm); setPreviewPhoto(''); setShowAdd(true) }}>
              <Text style={styles.addBtnText}>+ Tambah Pegawai</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TextInput
            style={styles.search}
            placeholder="Cari nama, username, atau email..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />

          {/* Filter Role */}
          <View style={styles.filterWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[
                    styles.filterChip,
                    filterRole === r.value && {
                      backgroundColor: r.value === 'all' ? '#1a1a2e' : ROLE_COLORS[r.value],
                      borderColor: r.value === 'all' ? '#1a1a2e' : ROLE_COLORS[r.value],
                    }
                  ]}
                  onPress={() => setFilterRole(r.value)}
                >
                  <Text style={[styles.filterChipText, filterRole === r.value && { color: '#fff' }]}>
                    {r.label}
                    {r.value !== 'all' && ` (${pegawai.filter(p => p.role === r.value).length})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Table */}
          {loading ? (
            <ActivityIndicator size="large" color="#1a1a2e" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 0.5 }]}>Foto</Text>
                <Text style={[styles.th, { flex: 2 }]}>Nama</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Username</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Role</Text>
                <Text style={[styles.th, { flex: 1 }]}>Status</Text>
                <Text style={[styles.th, { flex: 2 }]}>Aksi</Text>
              </View>

              {filtered.length === 0 ? (
                <Text style={styles.empty}>Tidak ada data pegawai</Text>
              ) : (
                filtered.map((u, i) => (
                  <View key={u.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                    <View style={{ flex: 0.5, justifyContent: 'center' }}>
                      {u.avatar_url ? (
                        <Image source={{ uri: u.avatar_url }} style={styles.tableAvatar} />
                      ) : (
                        <View style={[styles.tableAvatarPlaceholder, { backgroundColor: ROLE_COLORS[u.role] }]}>
                          <Text style={styles.tableAvatarText}>{u.full_name?.charAt(0)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.tdName}>{u.full_name}</Text>
                      <Text style={styles.tdEmail}>{u.email}</Text>
                    </View>
                    <Text style={[styles.td, { flex: 1.5 }]}>{u.username}</Text>
                    <View style={{ flex: 1.5, justifyContent: 'center' }}>
                      <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[u.role] + '20' }]}>
                        <Text style={[styles.roleText, { color: ROLE_COLORS[u.role] }]}>{getRoleLabel(u.role)}</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={[styles.statusBadge, { backgroundColor: u.is_active ? '#e8f5e9' : '#ffebee' }]}>
                        <Text style={[styles.statusText, { color: u.is_active ? '#2e7d32' : '#c62828' }]}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.actions, { flex: 2 }]}>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} onPress={() => openDetail(u)}>
                        <Text style={[styles.actionText, { color: '#1565c0' }]}>Detail</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fff3e0' }]} onPress={() => openEdit(u)}>
                        <Text style={[styles.actionText, { color: '#e65100' }]}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ffebee' }]} onPress={() => openDelete(u)}>
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
              <Text style={styles.modalTitle}>Tambah Pegawai</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <PhotoPicker label="Foto Profil" />
              <Field label="Nama Lengkap *" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} placeholder="Nama lengkap" />
              <Field label="Username *" value={form.username} onChange={v => setForm({ ...form, username: v })} placeholder="Username" autoCapitalize="none" />
              <Field label="Email *" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
              <Field label="No. HP" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="Nomor HP" keyboardType="phone-pad" />
              <Field label="Password *" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Minimal 6 karakter" secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginBottom: 14 }}>
                <Text style={{ color: '#888', fontSize: 12 }}>{showPassword ? 'Sembunyikan' : 'Tampilkan'} password</Text>
              </TouchableOpacity>
              <Text style={styles.fieldLabel}>Role *</Text>
              <View style={styles.roleGrid}>
                {ROLE_FORM.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleChip, form.role === r.value && { backgroundColor: ROLE_COLORS[r.value], borderColor: ROLE_COLORS[r.value] }]}
                    onPress={() => setForm({ ...form, role: r.value })}
                  >
                    <Text style={[styles.roleChipText, form.role === r.value && { color: '#fff' }]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity style={[styles.toggleBtn, form.is_active && styles.toggleActive]} onPress={() => setForm({ ...form, is_active: true })}>
                  <Text style={[styles.toggleText, form.is_active && styles.toggleTextActive]}>Aktif</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleBtn, !form.is_active && { backgroundColor: '#c62828', borderColor: '#c62828' }]} onPress={() => setForm({ ...form, is_active: false })}>
                  <Text style={[styles.toggleText, !form.is_active && styles.toggleTextActive]}>Nonaktif</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
              <Text style={styles.modalTitle}>Detail Pegawai</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailTop}>
                  {selectedUser.avatar_url ? (
                    <Image source={{ uri: selectedUser.avatar_url }} style={styles.detailAvatarImg} />
                  ) : (
                    <View style={[styles.detailAvatar, { backgroundColor: ROLE_COLORS[selectedUser.role] }]}>
                      <Text style={styles.detailAvatarText}>{selectedUser.full_name?.charAt(0)}</Text>
                    </View>
                  )}
                  <Text style={styles.detailName}>{selectedUser.full_name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[selectedUser.role] + '20', alignSelf: 'center', marginTop: 4 }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[selectedUser.role] }]}>{getRoleLabel(selectedUser.role)}</Text>
                  </View>
                </View>
                <DRow label="Username" value={selectedUser.username} />
                <DRow label="Email" value={selectedUser.email} />
                <DRow label="No. HP" value={selectedUser.phone ?? '-'} />
                <DRow label="Status" value={selectedUser.is_active ? 'Aktif' : 'Nonaktif'} />
                <View style={styles.dRow}>
                  <Text style={styles.dLabel}>Password</Text>
                  <Text style={styles.dValue}>••••••••</Text>
                </View>
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
              <Text style={styles.modalTitle}>Edit Pegawai</Text>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <PhotoPicker label="Foto Profil" />
              <Field label="Nama Lengkap *" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} placeholder="Nama lengkap" />
              <Field label="Username *" value={form.username} onChange={v => setForm({ ...form, username: v })} placeholder="Username" autoCapitalize="none" />
              <Field label="Email *" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
              <Field label="No. HP" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="Nomor HP" keyboardType="phone-pad" />
              <Field label="Password Baru" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Kosongkan jika tidak diubah" secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginBottom: 14 }}>
                <Text style={{ color: '#888', fontSize: 12 }}>{showPassword ? 'Sembunyikan' : 'Tampilkan'} password</Text>
              </TouchableOpacity>
              <Text style={styles.fieldLabel}>Role *</Text>
              <View style={styles.roleGrid}>
                {ROLE_FORM.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleChip, form.role === r.value && { backgroundColor: ROLE_COLORS[r.value], borderColor: ROLE_COLORS[r.value] }]}
                    onPress={() => setForm({ ...form, role: r.value })}
                  >
                    <Text style={[styles.roleChipText, form.role === r.value && { color: '#fff' }]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity style={[styles.toggleBtn, form.is_active && styles.toggleActive]} onPress={() => setForm({ ...form, is_active: true })}>
                  <Text style={[styles.toggleText, form.is_active && styles.toggleTextActive]}>Aktif</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleBtn, !form.is_active && { backgroundColor: '#c62828', borderColor: '#c62828' }]} onPress={() => setForm({ ...form, is_active: false })}>
                  <Text style={[styles.toggleText, !form.is_active && styles.toggleTextActive]}>Nonaktif</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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

      {/* MODAL KONFIRMASI HAPUS */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { maxWidth: 380 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hapus Pegawai</Text>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.deleteIcon}>🗑️</Text>
              <Text style={styles.deleteTitle}>Yakin ingin menghapus?</Text>
              <Text style={styles.deleteSub}>
                Pegawai <Text style={{ fontWeight: '600', color: '#1a1a2e' }}>{selectedUser?.full_name}</Text> akan dihapus permanen dan tidak dapat dikembalikan.
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

function Field({ label, value, onChange, placeholder, secureTextEntry, keyboardType, autoCapitalize }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: any
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
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
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
  filterScroll: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 2 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff', height: 32, justifyContent: 'center' },
  filterChipText: { fontSize: 12, color: '#555', fontWeight: '500' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1a1a2e', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  th: { fontSize: 12, fontWeight: '600', color: '#fff' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#fff' },
  td: { fontSize: 13, color: '#333' },
  tdName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  tdEmail: { fontSize: 11, color: '#888', marginTop: 2 },
  tableAvatar: { width: 36, height: 36, borderRadius: 18 },
  tableAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tableAvatarText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  roleText: { fontSize: 11, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  actionText: { fontSize: 11, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, width: '90%', maxWidth: 480, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  closeBtn: { fontSize: 18, color: '#888', paddingHorizontal: 4 },
  modalBody: { padding: 16, maxHeight: 400 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#444', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#333', backgroundColor: '#fafafa' },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  roleChipText: { fontSize: 12, color: '#555' },
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
  detailAvatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  detailAvatarImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  detailAvatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  detailName: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
  dRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dLabel: { fontSize: 13, color: '#888' },
  dValue: { fontSize: 13, color: '#1a1a2e', fontWeight: '500', flex: 1, textAlign: 'right' },
  photoPickerRow: { flexDirection: 'row', alignItems: 'center' },
  photoPreview: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#e5e5e5' },
  photoPlaceholder: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#e5e5e5' },
  photoPlaceholderText: { fontSize: 28 },
  photoBtn: { borderWidth: 1, borderColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  photoBtnText: { fontSize: 12, color: '#1a1a2e', fontWeight: '500' },
  photoRemoveBtn: { borderWidth: 1, borderColor: '#c62828', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  photoRemoveBtnText: { fontSize: 12, color: '#c62828' },
})