# Sentralog — Catatan Fitur per Role

Aplikasi Expo Router (React Native + Supabase). Setiap role punya header + sidebar
dengan warna aksen sendiri. Fitur mengikuti rancangan (item bertanda merah dilewati).

## Cara menjalankan
```bash
npm install
npm run web      # atau: npm run android / npm run ios
```

## WAJIB: jalankan migrasi (sekali)
Fitur bahan baku/rekap butuh tabel `materials`. Buka Supabase > SQL Editor,
jalankan isi file `supabase/migrations/0001_materials.sql`.

## Fitur per role
- **Owner** (hijau): Dashboard, Cek Data WH, Cek Pegawai, Cek Unit Truk, Rekap Bahan.
- **Teknik Sipil** (biru): Dashboard, Input Spek (project), Input Bahan Baku, Cek Data WH, History, Absensi.
- **Kepala WH** (ungu): Dashboard, Cek Data WH, Cek Spek Pesanan, Cek Progres, Cek Bahan Baku,
  Cek Unit Truk, Input Hasil Jadi (upload bukti), ACC/TTD, Absensi.
- **Mandor** (merah): Dashboard, Cek Jadwal, Cek Barang Jadi, Cek Unit Truk, Rekap Bahan, Absensi.
- **Sopir** (oranye): Dashboard, Status Lokasi (GPS + jarak ke tujuan), Absensi.
- **Tukang** (abu): Dashboard, Absensi.
- **Admin**: manajemen penuh (sudah ada sebelumnya).

## Catatan teknis
- Komponen baru: `components/RoleShell.tsx` (shell header+sidebar), `components/CekList.tsx`
  (daftar read-only generik), `components/OwnerSidebar.tsx`, `lib/status.ts` (label/warna status).
- Upload bukti hasil jadi memakai bucket storage `project-files` (mode web).
- ACC/TTD memajukan status project (cek_bahan_baku→produksi, qc_foto→menunggu_acc_ts)
  dan mencatat ke `project_logs`.
- Item merah (Cek laporan barang & TTD Sopir, cek spek & TTD Mandor) sengaja tidak dibuat.
