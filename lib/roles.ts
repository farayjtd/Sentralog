import { Ionicons } from '@expo/vector-icons'

type IconName = keyof typeof Ionicons.glyphMap

export interface MenuItem { key: string; label: string; icon: IconName }
export interface RoleDef {
  label: string
  accent: string
  soft: string
  icon: IconName
  menu: MenuItem[]
}

/** Single source of truth for role identity + navigation. */
export const ROLES: Record<string, RoleDef> = {
  owner: {
    label: 'Owner', accent: '#047857', soft: '#ecfdf5', icon: 'briefcase',
    menu: [
      { key: '/(owner)', label: 'Dashboard', icon: 'grid-outline' },
      { key: '/(owner)/warehouse', label: 'Data Warehouse', icon: 'business-outline' },
      { key: '/(owner)/pegawai', label: 'Pegawai', icon: 'people-outline' },
      { key: '/(owner)/truk', label: 'Unit Truk', icon: 'car-outline' },
      { key: '/(owner)/rekap-bahan', label: 'Rekap Bahan', icon: 'cube-outline' },
    ],
  },
  teknik_sipil: {
    label: 'Teknik Sipil', accent: '#1d4ed8', soft: '#eff6ff', icon: 'construct',
    menu: [
      { key: '/(teknik-sipil)', label: 'Dashboard', icon: 'grid-outline' },
      { key: '/(teknik-sipil)/project', label: 'Input Spek', icon: 'document-text-outline' },
      { key: '/(teknik-sipil)/bahan', label: 'Input Bahan Baku', icon: 'cube-outline' },
      { key: '/(teknik-sipil)/warehouse', label: 'Data Warehouse', icon: 'business-outline' },
      { key: '/(teknik-sipil)/history', label: 'Riwayat', icon: 'time-outline' },
      { key: '/(teknik-sipil)/absen', label: 'Absensi', icon: 'calendar-outline' },
    ],
  },
  kepala_wh: {
    label: 'Kepala Warehouse', accent: '#7c3aed', soft: '#f5f3ff', icon: 'cube',
    menu: [
      { key: '/(kepala-wh)', label: 'Dashboard', icon: 'grid-outline' },
      { key: '/(kepala-wh)/warehouse', label: 'Data Warehouse', icon: 'business-outline' },
      { key: '/(kepala-wh)/spek', label: 'Spek Pesanan', icon: 'document-text-outline' },
      { key: '/(kepala-wh)/progres', label: 'Progres Pesanan', icon: 'trending-up-outline' },
      { key: '/(kepala-wh)/bahan', label: 'Bahan Baku', icon: 'cube-outline' },
      { key: '/(kepala-wh)/truk', label: 'Unit Truk', icon: 'car-outline' },
      { key: '/(kepala-wh)/hasil', label: 'Input Hasil Jadi', icon: 'camera-outline' },
      { key: '/(kepala-wh)/acc', label: 'ACC / TTD', icon: 'create-outline' },
      { key: '/(kepala-wh)/absen', label: 'Absensi', icon: 'calendar-outline' },
    ],
  },
  mandor: {
    label: 'Mandor', accent: '#dc2626', soft: '#fef2f2', icon: 'hammer',
    menu: [
      { key: '/(mandor)', label: 'Dashboard', icon: 'grid-outline' },
      { key: '/(mandor)/jadwal', label: 'Jadwal Pengerjaan', icon: 'calendar-clear-outline' },
      { key: '/(mandor)/barang-jadi', label: 'Barang Jadi', icon: 'checkmark-done-outline' },
      { key: '/(mandor)/truk', label: 'Unit Truk', icon: 'car-outline' },
      { key: '/(mandor)/rekap-bahan', label: 'Rekap Bahan', icon: 'cube-outline' },
      { key: '/(mandor)/absen', label: 'Absensi', icon: 'calendar-outline' },
    ],
  },
  sopir: {
    label: 'Sopir', accent: '#ea580c', soft: '#fff7ed', icon: 'car-sport',
    menu: [
      { key: '/(sopir)', label: 'Dashboard', icon: 'grid-outline' },
      { key: '/(sopir)/lokasi', label: 'Status Lokasi', icon: 'location-outline' },
      { key: '/(sopir)/absen', label: 'Absensi', icon: 'calendar-outline' },
    ],
  },
  tukang: {
    label: 'Tukang', accent: '#475569', soft: '#f1f5f9', icon: 'people',
    menu: [
      { key: '/(tukang)', label: 'Dashboard', icon: 'grid-outline' },
      { key: '/(tukang)/absen', label: 'Absensi', icon: 'calendar-outline' },
    ],
  },
}

export const roleAccent = (role: string) => ROLES[role]?.accent ?? '#0f172a'
