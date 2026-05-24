<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin - Sentralog</title>

    <style>
        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
        }

        :root{
            --primary:#2563eb;
            --primary-hover:#1d4ed8;

            --success:#10b981;
            --warning:#f59e0b;
            --danger:#ef4444;

            --bg:#f1f5f9;
            --white:#ffffff;

            --text:#0f172a;
            --text-light:#64748b;

            --border:#e2e8f0;

            --shadow:
                0 1px 3px rgba(15,23,42,0.05),
                0 8px 24px rgba(15,23,42,0.04);
        }

        body{
            font-family:'Segoe UI',sans-serif;
            background:var(--bg);
            color:var(--text);
            display:flex;
            min-height:100vh;
        }

        /* MAIN CONTENT */
        .main-content{
            margin-left:270px;
            width:100%;
            padding:40px;
        }

        /* HEADER */
        .header{
            margin-bottom:32px;
        }

        .header h1{
            font-size:32px;
            font-weight:700;
            margin-bottom:8px;
        }

        .header p{
            color:var(--text-light);
            font-size:14px;
            line-height:1.7;
        }

        /* STATS */
        .stats-grid{
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
            gap:20px;
            margin-bottom:28px;
        }

        .stat-card{
            background:var(--white);
            border-radius:18px;
            padding:24px;
            border:1px solid var(--border);
            box-shadow:var(--shadow);
            transition:.25s ease;
        }

        .stat-card:hover{
            transform:translateY(-4px);
        }

        .stat-card h3{
            font-size:12px;
            text-transform:uppercase;
            letter-spacing:1px;
            color:var(--text-light);
            margin-bottom:12px;
        }

        .stat-card .value{
            font-size:34px;
            font-weight:700;
            margin-bottom:6px;
        }

        .sub-text{
            color:var(--text-light);
            font-size:13px;
        }

        /* LAYOUT */
        .dashboard-grid{
            display:grid;
            grid-template-columns:2fr 1fr;
            gap:24px;
            margin-bottom:28px;
        }

        /* CARD */
        .card{
            background:var(--white);
            border-radius:18px;
            border:1px solid var(--border);
            padding:28px;
            box-shadow:var(--shadow);
        }

        .card-title{
            font-size:18px;
            font-weight:600;
            margin-bottom:22px;
            padding-bottom:14px;
            border-bottom:1px solid #f1f5f9;
        }

        /* ROLE GRID */
        .role-grid{
            display:grid;
            grid-template-columns:repeat(2,1fr);
            gap:14px;
        }

        .role-item{
            background:#f8fafc;
            border:1px solid var(--border);
            border-radius:14px;
            padding:16px 18px;

            display:flex;
            align-items:center;
            justify-content:space-between;

            transition:.2s ease;
        }

        .role-item:hover{
            background:#ffffff;
            border-color:#cbd5e1;
        }

        .role-name{
            font-size:14px;
            font-weight:500;
            color:#334155;
        }

        .role-count{
            background:#e2e8f0;
            color:#0f172a;
            font-size:14px;
            font-weight:700;
            padding:5px 10px;
            border-radius:8px;
        }

        .employee-total{
            margin-top:18px;
            font-size:13px;
            color:var(--text-light);
        }

        /* FORM */
        .form-group{
            margin-bottom:18px;
        }

        .form-label{
            display:block;
            margin-bottom:8px;
            font-size:13px;
            font-weight:600;
            color:#334155;
        }

        .form-control{
            width:100%;
            padding:13px 14px;
            border-radius:10px;
            border:1px solid #cbd5e1;
            background:#f8fafc;
            font-size:14px;
            outline:none;
            transition:.2s ease;
        }

        .form-control:focus{
            background:#ffffff;
            border-color:var(--primary);
            box-shadow:0 0 0 3px rgba(37,99,235,.10);
        }

        .form-control:disabled{
            background:#e2e8f0;
            color:#94a3b8;
            cursor:not-allowed;
        }

        /* BUTTON */
        .btn-primary{
            width:100%;
            border:none;
            padding:13px 16px;
            border-radius:10px;
            background:var(--primary);
            color:#ffffff;
            font-size:14px;
            font-weight:600;
            cursor:pointer;
            transition:.2s ease;
        }

        .btn-primary:hover{
            background:var(--primary-hover);
        }

        /* ACTIVITY */
        .activity-feed{
            list-style:none;
        }

        .activity-item{
            padding:16px 0;
            border-bottom:1px dashed #e2e8f0;
            font-size:14px;
            line-height:1.8;
            color:#334155;
        }

        .activity-item:last-child{
            border-bottom:none;
        }

        .activity-time{
            display:inline-block;
            margin-top:6px;
            font-size:12px;
            color:#94a3b8;
        }

        /* RESPONSIVE */
        @media(max-width:992px){

            .dashboard-grid{
                grid-template-columns:1fr;
            }

            .role-grid{
                grid-template-columns:1fr;
            }
        }

        @media(max-width:768px){

            .main-content{
                margin-left:0;
                padding:24px;
            }

            .stats-grid{
                grid-template-columns:1fr;
            }

            .header h1{
                font-size:26px;
            }
        }

    </style>
</head>

<body>

@include('admin.components.sidebar')

<div class="main-content">

    <!-- HEADER -->
    <div class="header">
        <h1>Dashboard Analitik Admin</h1>
        <p>
            Ringkasan operasional sistem logistik, aktivitas pengguna,
            dan distribusi tenaga kerja secara real-time.
        </p>
    </div>

    <!-- STATS -->
    <div class="stats-grid">

        <div class="stat-card" style="border-left:5px solid var(--success);">
            <h3>Project Selesai</h3>
            <div class="value" style="color:var(--success);">24</div>
            <div class="sub-text">Arsip proyek rampung</div>
        </div>

        <div class="stat-card" style="border-left:5px solid var(--warning);">
            <h3>Project Berjalan</h3>
            <div class="value" style="color:var(--warning);">7</div>
            <div class="sub-text">Sedang dikerjakan tim</div>
        </div>

        <div class="stat-card" style="border-left:5px solid var(--danger);">
            <h3>Project Pending</h3>
            <div class="value" style="color:var(--danger);">3</div>
            <div class="sub-text">Menunggu validasi</div>
        </div>

        <div class="stat-card" style="border-left:5px solid var(--primary);">
            <h3>Total Warehouse</h3>
            <div class="value">2</div>
            <div class="sub-text">Gudang aktif operasional</div>
        </div>

    </div>

    <!-- GRID -->
    <div class="dashboard-grid">

        <!-- ROLE -->
        <div class="card">

            <div class="card-title">
                Komposisi Karyawan Berdasarkan Role
            </div>

            <div class="role-grid">

                <div class="role-item">
                    <span class="role-name">💼 Owner</span>
                    <span class="role-count">1</span>
                </div>

                <div class="role-item">
                    <span class="role-name">📐 Teknik Sipil</span>
                    <span class="role-count">2</span>
                </div>

                <div class="role-item">
                    <span class="role-name">🏢 Kepala Warehouse</span>
                    <span class="role-count">2</span>
                </div>

                <div class="role-item">
                    <span class="role-name">🛠️ Mandor Lapangan</span>
                    <span class="role-count">4</span>
                </div>

                <div class="role-item">
                    <span class="role-name">🚛 Sopir Logistik</span>
                    <span class="role-count">5</span>
                </div>

                <div class="role-item">
                    <span class="role-name">🔨 Tukang Konstruksi</span>
                    <span class="role-count">18</span>
                </div>

            </div>

            <div class="employee-total">
                Total staf terdaftar saat ini:
                <strong>32 Personel</strong>
            </div>

        </div>

        <!-- RESET PASSWORD -->
        <div class="card">

            <div class="card-title">
                Reset Kredensial
            </div>

            <form onsubmit="event.preventDefault(); handleFormSubmit();">

                <div class="form-group">
                    <label class="form-label">Pilih Role</label>

                    <select id="roleSelect"
                        class="form-control"
                        onchange="updateUserDropdown()">

                        <option value="" selected disabled>
                            -- Pilih Role --
                        </option>

                        <option value="owner">Owner</option>
                        <option value="sipil">Teknik Sipil</option>
                        <option value="gudang">Kepala Warehouse</option>
                        <option value="mandor">Mandor Lapangan</option>
                        <option value="sopir">Sopir Logistik</option>
                        <option value="tukang">Tukang Konstruksi</option>

                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Pilih Pengguna</label>

                    <select id="userSelect"
                        class="form-control"
                        disabled>

                        <option value="" selected disabled>
                            -- Pilih Pengguna --
                        </option>

                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Password Baru</label>

                    <input type="password"
                        id="newPassword"
                        class="form-control"
                        placeholder="Masukkan password baru"
                        required>
                </div>

                <button type="submit" class="btn-primary">
                    Terapkan Password
                </button>

            </form>

        </div>

    </div>

    <!-- ACTIVITY -->
    <div class="card">

        <div class="card-title">
            Aktivitas Sistem Terbaru
        </div>

        <ul class="activity-feed">

            <li class="activity-item">
                🟢 <strong>Sistem Admin</strong>
                memperbarui password akun role
                <em>Mandor</em>.

                <br>

                <span class="activity-time">
                    Baru saja
                </span>
            </li>

            <li class="activity-item">
                📦 <strong>Kepala Warehouse</strong>
                mengunggah dokumentasi distribusi material
                proyek gudang Ponorogo.

                <br>

                <span class="activity-time">
                    10 menit yang lalu
                </span>
            </li>

            <li class="activity-item">
                📐 <strong>Teknik Sipil</strong>
                menerbitkan dokumen spesifikasi material baru.

                <br>

                <span class="activity-time">
                    42 menit yang lalu
                </span>
            </li>

            <li class="activity-item">
                🔧 Akun baru role
                <em>Tukang Konstruksi</em>
                berhasil ditambahkan oleh Admin.

                <br>

                <span class="activity-time">
                    1 jam yang lalu
                </span>
            </li>

        </ul>

    </div>

</div>

<script>

    const userDataByRole = {

        owner: [
            {
                name: "Pengguna Dummy 1",
                username: "owner"
            }
        ],

        sipil: [
            {
                name: "Pengguna Dummy 2",
                username: "sipil_pusat"
            },
            {
                name: "Pengguna Dummy 12",
                username: "sipil_lapangan"
            }
        ],

        gudang: [
            {
                name: "Pengguna Dummy 3",
                username: "gudang_pnr"
            },
            {
                name: "Pengguna Dummy 7",
                username: "gudang_prw"
            }
        ],

        mandor: [
            {
                name: "Pengguna Dummy 4",
                username: "mandor_utama"
            },
            {
                name: "Pengguna Dummy 8",
                username: "mandor_lapangan"
            }
        ],

        sopir: [
            {
                name: "Pengguna Dummy 5",
                username: "driver_pnr01"
            },
            {
                name: "Pengguna Dummy 9",
                username: "driver_prw02"
            }
        ],

        tukang: [
            {
                name: "Pengguna Dummy 6",
                username: "tukang_kayu"
            },
            {
                name: "Pengguna Dummy 10",
                username: "tukang_batu"
            },
            {
                name: "Pengguna Dummy 11",
                username: "tukang_besi"
            }
        ]
    };

    function updateUserDropdown(){

        const roleSelect =
            document.getElementById('roleSelect');

        const userSelect =
            document.getElementById('userSelect');

        const selectedRole = roleSelect.value;

        userSelect.innerHTML =
            '<option value="" selected disabled>-- Pilih Pengguna --</option>';

        if(selectedRole && userDataByRole[selectedRole]){

            userSelect.disabled = false;

            userDataByRole[selectedRole].forEach(user => {

                const option =
                    document.createElement('option');

                option.value = user.username;

                option.innerText =
                    `${user.name} (${user.username})`;

                userSelect.appendChild(option);

            });

        } else {

            userSelect.disabled = true;

        }
    }

    function handleFormSubmit(){

        const userSelect =
            document.getElementById('userSelect');

        const selectedText =
            userSelect.options[userSelect.selectedIndex].text;

        alert(
            `Password untuk "${selectedText}" berhasil diperbarui.`
        );

        document.getElementById('newPassword').value = '';

    }

</script>

</body>
</html>