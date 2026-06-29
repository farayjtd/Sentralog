export const PROJECT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  input_spek: { label: 'Input Spek', color: '#1565c0', bg: '#e3f2fd' },
  cek_bahan_baku: { label: 'Cek Bahan Baku', color: '#f57f17', bg: '#fffde7' },
  produksi: { label: 'Produksi', color: '#e65100', bg: '#fff3e0' },
  qc_foto: { label: 'QC Foto', color: '#6a1b9a', bg: '#f3e5f5' },
  menunggu_acc_ts: { label: 'Menunggu ACC TS', color: '#c62828', bg: '#ffebee' },
  pengiriman: { label: 'Pengiriman', color: '#1565c0', bg: '#e3f2fd' },
  pemasangan: { label: 'Pemasangan', color: '#2d6a4f', bg: '#e8f5e9' },
  foto_hasil: { label: 'Menunggu ACC Hasil', color: '#c62828', bg: '#ffebee' },
  selesai: { label: 'Selesai', color: '#2e7d32', bg: '#e8f5e9' },
}
export const statusBadge = (s: string) => {
  const x = PROJECT_STATUS[s]
  return { text: x?.label ?? s, color: x?.color ?? '#888', bg: x?.bg ?? '#f5f5f5' }
}

export const DELIVERY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  disiapkan: { label: 'Disiapkan', color: '#f57f17', bg: '#fffde7' },
  driver_acc: { label: 'Driver ACC', color: '#1565c0', bg: '#e3f2fd' },
  berangkat: { label: 'Berangkat', color: '#e65100', bg: '#fff3e0' },
  sampai: { label: 'Sampai', color: '#2e7d32', bg: '#e8f5e9' },
}
export const deliveryBadge = (s: string) => {
  const x = DELIVERY_STATUS[s]
  return { text: x?.label ?? s, color: x?.color ?? '#888', bg: x?.bg ?? '#f5f5f5' }
}

export const TRUCK_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  standby: { label: 'Standby', color: '#2e7d32', bg: '#e8f5e9' },
  on_delivery: { label: 'Mengirim', color: '#1565c0', bg: '#e3f2fd' },
  returning: { label: 'Kembali', color: '#e65100', bg: '#fff3e0' },
  maintenance: { label: 'Maintenance', color: '#f57f17', bg: '#fffde7' },
  rusak: { label: 'Rusak', color: '#c62828', bg: '#ffebee' },
}
export const truckBadge = (s: string) => {
  const x = TRUCK_STATUS[s]
  return { text: x?.label ?? s, color: x?.color ?? '#888', bg: x?.bg ?? '#f5f5f5' }
}

export const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', owner: 'Owner', teknik_sipil: 'Teknik Sipil',
  kepala_wh: 'Kepala WH', sopir: 'Sopir', mandor: 'Mandor', tukang: 'Tukang',
}
