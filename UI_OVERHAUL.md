# Sentralog — Pembaruan UI/UX & Fitur

Dokumen ini merangkum perombakan tampilan dan kelengkapan fitur yang diterapkan
di seluruh aplikasi (kecuali panel Admin yang sudah berdiri sendiri).

## 1. Design system baru
- `lib/theme.ts` — token warna (kanvas slate sejuk, surface putih), skala spacing 4px,
  radius, preset shadow, skala tipografi, dan `numStyle` (tabular-nums di web).
- `lib/roles.ts` — sumber tunggal identitas peran: warna aksen, ikon, dan menu navigasi
  tiap peran. Aksen: Owner hijau, Teknik Sipil biru, Kepala WH ungu, Mandor merah,
  Sopir oranye, Tukang slate.
- `lib/status.ts` — badge status pesanan / pengiriman / truk (sudah ada, dipakai ulang).

## 2. Komponen UI (`components/ui/`)
Card, IconChip, Badge, Button (primary/outline/ghost), SectionHeader, EmptyState,
Skeleton (animasi loading), Field (input), StatCard (kartu angka ringkasan).

## 3. Kerangka aplikasi
- `components/AppShell.tsx` — shell responsif:
  - Layar lebar (>= 900px): sidebar rail tetap di kiri.
  - Layar sempit (HP): top bar + tombol menu + **drawer** geser dengan scrim.
- `components/Sidebar.tsx` — sidebar berbasis konfigurasi peran (ikon Ionicons,
  state aktif, profil + tombol keluar).
- `components/DataList.tsx` — daftar baca generik (skeleton, empty state, muat ulang).
- `components/RoleDashboard.tsx` — dashboard: grid StatCard + kartu "Aksi cepat".

## 4. Dependency baru
- `@expo/vector-icons` (^15.0.3) untuk ikon Ionicons. Jalankan `npm install`.

## 5. Halaman yang diperbarui (semua peran)
- Dashboard: Owner, Teknik Sipil, Kepala WH, Mandor, Sopir, Tukang.
- Owner: Data Warehouse, Pegawai, Unit Truk, Rekap Bahan.
- Teknik Sipil: Input Spek (project), Input Bahan Baku, Data Warehouse, Riwayat, Absensi.
- Kepala WH: Warehouse, Spek, Progres, Bahan, Truk, Input Hasil Jadi, ACC/TTD, Absensi.
- Mandor: Jadwal, Barang Jadi, Truk, Rekap Bahan, Absensi.
- Sopir: Status Lokasi (GPS + jarak ke titik pasang), Absensi.
- Tukang: Dashboard, Absensi.
- Komponen Absensi (dipakai 6 peran) kini memakai AppShell + kartu desain baru,
  logika kamera/GPS dipertahankan.

## 6. Yang perlu dijalankan manual
- Migrasi tabel material: jalankan `supabase/migrations/0001_materials.sql`
  di Supabase SQL Editor (tabel `materials` belum ada di skema awal).
- Upload bukti "Hasil Jadi" saat ini berjalan di versi **web**.

## 7. Catatan verifikasi
Kode telah lolos pengecekan syntax + JSX, resolusi seluruh import antar-file,
validitas 33 nama ikon Ionicons, dan instalasi `@expo/vector-icons`.
Belum dilakukan type-check penuh / run visual (dependency Expo tidak diinstal di sini).
Setelah unduh: `npm install` lalu `npm run web` / android / ios.
