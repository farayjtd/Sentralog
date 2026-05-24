<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Absensi - Sentralog</title>
    <style>
        /* CSS sebelumnya tetap sama */
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        body { background-color: #f1f5f9; padding: 20px; }
        .container { max-width: 400px; margin: auto; }
        .card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .btn-upload { width: 100%; padding: 24px; border: 2px dashed #cbd5e1; border-radius: 12px; background: #f8fafc; cursor: pointer; color: #64748b; font-weight: 600; margin-bottom: 12px; }
        .btn-submit { width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 700; }
        .grid-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px; }
        .stat-box { padding: 15px; border-radius: 10px; text-align: center; }
        .hadir { background: #dcfce7; color: #166534; }
        .kosong { background: #fee2e2; color: #991b1b; }
        .history-list { margin-top: 20px; }
        .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    </style>
</head>
<body>

<div class="container">
    <h2 style="margin-bottom: 20px; color: #0f172a;">Absensi Tukang</h2>

    <div class="card">
        <input type="file" id="camera" accept="image/*" capture="environment" style="display:none">
        <button class="btn-upload" onclick="document.getElementById('camera').click()">📷 Ambil Foto</button>
        <button class="btn-submit">Kirim Absensi</button>
    </div>

    <div class="card">
        <h3 style="margin-bottom: 10px;">Rekap Mei 2026</h3>
        <div class="grid-stats">
            <div class="stat-box hadir"><small>Hadir</small><div style="font-size: 18px; font-weight: 700;">18 Hari</div></div>
            <div class="stat-box kosong"><small>Kosong</small><div style="font-size: 18px; font-weight: 700;">4 Hari</div></div>
        </div>
        <div class="history-list">
            <div class="item"><span>24 Mei 2026</span> <strong>Hadir</strong></div>
            <div class="item"><span>23 Mei 2026</span> <strong style="color: #dc2626;">Kosong</strong></div>
        </div>
    </div>

    <div style="margin-top: 20px; text-align: center;">
        <a href="/" style="color: #ef4444; text-decoration: none; font-size: 14px; font-weight: 600;">← Keluar dari Aplikasi</a>
    </div>
</div>

</body>
</html>