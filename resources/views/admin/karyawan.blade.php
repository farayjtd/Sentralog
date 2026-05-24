<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Karyawan - Sentralog</title>
    <style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :root {
        --primary: #2563eb;
        --primary-dark: #1d4ed8;

        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;

        --bg: #f8fafc;
        --card: #ffffff;

        --text: #0f172a;
        --text-light: #64748b;

        --border: #e2e8f0;
    }

    body {
        font-family: 'Inter', 'Segoe UI', sans-serif;
        background: var(--bg);
        color: var(--text);
        display: flex;
        min-height: 100vh;
    }

    /* MAIN CONTENT */
    .main-content {
        margin-left: 270px;
        width: 100%;
        padding: 40px;
    }

    /* HEADER */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
        gap: 20px;
    }

    .header h1 {
        font-size: 30px;
        font-weight: 700;
        margin-bottom: 6px;
    }

    .header p {
        color: var(--text-light);
        font-size: 14px;
        line-height: 1.6;
    }

    /* TOOLBAR */
    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
    }

    .search-sort-group {
        display: flex;
        gap: 12px;
        width: 100%;
        max-width: 650px;
    }

    /* FORM */
    .form-control {
        width: 100%;
        padding: 12px 14px;

        border: 1px solid #cbd5e1;
        border-radius: 10px;

        background: #ffffff;

        font-size: 14px;
        color: var(--text);

        transition: all 0.2s ease;
        outline: none;
    }

    .form-control:focus {
        border-color: var(--primary);

        box-shadow:
            0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .select-control {
        max-width: 200px;
        cursor: pointer;
    }

    /* BUTTON */
    .btn-primary {
        padding: 12px 20px;

        border: none;
        border-radius: 10px;

        background: var(--primary);
        color: #ffffff;

        font-size: 14px;
        font-weight: 600;

        cursor: pointer;

        display: flex;
        align-items: center;
        gap: 8px;

        transition: all 0.2s ease;
    }

    .btn-primary:hover {
        background: var(--primary-dark);
        transform: translateY(-1px);
    }

    /* CARD */
    .content-card {
        background: var(--card);
        border-radius: 18px;
        border: 1px solid var(--border);

        padding: 24px;

        box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.04),
            0 4px 12px rgba(15, 23, 42, 0.04);

        overflow-x: auto;
    }

    /* TABLE */
    .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 750px;
    }

    .data-table thead th {
        background: #f8fafc;

        padding: 16px;

        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .8px;

        color: #64748b;
        text-align: left;

        border-bottom: 1px solid var(--border);
    }

    .data-table tbody td {
        padding: 18px 16px;
        border-bottom: 1px solid #f1f5f9;

        font-size: 14px;
        color: #334155;

        vertical-align: middle;
    }

    .data-table tbody tr {
        transition: all 0.2s ease;
    }

    .data-table tbody tr:hover {
        background: #f8fafc;
    }

    /* BADGE */
    .role-badge {
        display: inline-flex;
        align-items: center;

        padding: 6px 12px;

        border-radius: 999px;

        font-size: 12px;
        font-weight: 600;
    }

    /* ACTION */
    .action-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .btn-action {
        padding: 8px 12px;

        border-radius: 8px;
        border: 1px solid transparent;

        font-size: 12px;
        font-weight: 600;

        cursor: pointer;

        transition: all 0.2s ease;
    }

    .btn-action:hover {
        transform: translateY(-1px);
    }

    .btn-action.detail {
        background: #eff6ff;
        color: #2563eb;
        border-color: #bfdbfe;
    }

    .btn-action.detail:hover {
        background: #2563eb;
        color: #ffffff;
    }

    .btn-action.edit {
        background: #fef3c7;
        color: #d97706;
        border-color: #fde68a;
    }

    .btn-action.edit:hover {
        background: #d97706;
        color: #ffffff;
    }

    .btn-action.delete {
        background: #fee2e2;
        color: #ef4444;
        border-color: #fecaca;
    }

    .btn-action.delete:hover {
        background: #ef4444;
        color: #ffffff;
    }

    /* MODAL */
    .modal-overlay {
        position: fixed;
        inset: 0;

        display: none;
        justify-content: center;
        align-items: center;

        padding: 20px;

        background: rgba(15, 23, 42, 0.55);

        backdrop-filter: blur(4px);

        z-index: 999;
    }

    .modal-box {
        width: 100%;
        max-width: 520px;

        background: #ffffff;

        border-radius: 20px;

        padding: 26px;

        box-shadow:
            0 20px 40px rgba(15, 23, 42, 0.15);

        animation: modalFade .25s ease;
    }

    @keyframes modalFade {
        from {
            opacity: 0;
            transform: translateY(-10px) scale(.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* MODAL HEADER */
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        margin-bottom: 24px;
        padding-bottom: 16px;

        border-bottom: 1px solid #f1f5f9;
    }

    .modal-header h3 {
        font-size: 20px;
        font-weight: 700;
    }

    .modal-close {
        width: 38px;
        height: 38px;

        border: none;
        border-radius: 10px;

        background: #f8fafc;

        font-size: 20px;
        color: #64748b;

        cursor: pointer;

        transition: all 0.2s ease;
    }

    .modal-close:hover {
        background: #ef4444;
        color: #ffffff;
    }

    /* PROFILE */
    .profile-container {
        text-align: center;
        margin-bottom: 24px;
    }

    .profile-avatar {
        width: 90px;
        height: 90px;

        border-radius: 50%;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        background: #dbeafe;
        color: #2563eb;

        font-size: 32px;
        font-weight: 700;

        border: 4px solid #bfdbfe;
    }

    /* INFO */
    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        padding: 14px 0;

        border-bottom: 1px dashed #e2e8f0;

        gap: 20px;
    }

    .info-label {
        font-size: 13px;
        color: #64748b;
    }

    .info-value {
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
        text-align: right;
    }

    /* FORM GROUP */
    .form-group-block {
        margin-bottom: 18px;
    }

    .form-group-block label {
        display: block;

        margin-bottom: 8px;

        font-size: 13px;
        font-weight: 600;

        color: #334155;
    }

    /* WARNING */
    .delete-warning-text {
        text-align: center;
        font-size: 14px;
        line-height: 1.7;
        color: #475569;
        margin: 10px 0;
    }

    .modal-footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;

        margin-top: 24px;
    }

    .btn-secondary {
        padding: 11px 18px;

        border-radius: 10px;
        border: 1px solid #cbd5e1;

        background: #f8fafc;
        color: #475569;

        font-size: 14px;
        font-weight: 600;

        cursor: pointer;

        transition: all 0.2s ease;
    }

    .btn-secondary:hover {
        background: #e2e8f0;
    }

    /* RESPONSIVE */
    @media (max-width: 992px) {
        .main-content {
            margin-left: 0;
            padding: 24px;
        }

        .header {
            flex-direction: column;
            align-items: flex-start;
        }

        .toolbar {
            flex-direction: column;
            align-items: stretch;
        }

        .search-sort-group {
            flex-direction: column;
            max-width: 100%;
        }

        .select-control {
            max-width: 100%;
        }
    }

    @media (max-width: 768px) {
        .header h1 {
            font-size: 24px;
        }

        .modal-box {
            padding: 22px;
        }

        .action-group {
            flex-direction: column;
        }
    }
</style>
</head>
<body>

    @include('admin.components.sidebar')

    <div class="main-content">
        <div class="header">
            <div>
                <h1>Manajemen Karyawan</h1>
                <p>Kelola, cari, dan tinjau berkas identitas serta absensi staf operasional.</p>
            </div>
            <button class="btn-primary" onclick="openAddModal()">
                ➕ Tambah Karyawan
            </button>
        </div>

        <div class="toolbar">
            <div class="search-sort-group">
                <input type="text" id="searchInput" class="form-control" placeholder="Cari berdasarkan nama atau username..." onkeyup="filterAndSortTable()">
                <select id="sortSelect" class="form-control select-control" onchange="filterAndSortTable()">
                    <option value="asc">Nama: A - Z</option>
                    <option value="desc">Nama: Z - A</option>
                </select>
            </div>
        </div>

        <div class="content-card">
            <table class="data-table" id="employeeTable">
                <thead>
                    <tr>
                        <th>Nama Karyawan</th>
                        <th>Username</th>
                        <th>Peran Sistem (*Role*)</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    <tr id="row-dummy1">
                        <td><strong>Pengguna Dummy 1</strong></td>
                        <td>owner</td>
                        <td><span class="role-badge" style="background-color: #fef3c7; color: #d97706;">Owner</span></td>
                        <td>
                            <div class="action-group">
                                <button class="btn-action detail" onclick="openDetailModal('Pengguna Dummy 1', 'owner', '••••••••', 'Owner', '081234567890', 22)">Detail</button>
                                <button class="btn-action edit" onclick="openEditModal('row-dummy1', 'Pengguna Dummy 1', 'owner', 'Owner', '081234567890')">Edit</button>
                                <button class="btn-action delete" onclick="openDeleteWarningModal('row-dummy1', 'Pengguna Dummy 1')">Hapus</button>
                            </div>
                        </td>
                    </tr>
                    <tr id="row-dummy2">
                        <td><strong>Pengguna Dummy 2</strong></td>
                        <td>sipil_pusat</td>
                        <td><span class="role-badge" style="background-color: #e0f2fe; color: #0369a1;">Teknik Sipil</span></td>
                        <td>
                            <div class="action-group">
                                <button class="btn-action detail" onclick="openDetailModal('Pengguna Dummy 2', 'sipil_pusat', '••••••••', 'Teknik Sipil', '081345678901', 20)">Detail</button>
                                <button class="btn-action edit" onclick="openEditModal('row-dummy2', 'Pengguna Dummy 2', 'sipil_pusat', 'Teknik Sipil', '081345678901')">Edit</button>
                                <button class="btn-action delete" onclick="openDeleteWarningModal('row-dummy2', 'Pengguna Dummy 2')">Hapus</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div id="detailModal" class="modal-overlay" onclick="closeModal('detailModal')">
        <div class="modal-box" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>Berkas Identitas Karyawan</h3>
                <button class="modal-close" onclick="closeModal('detailModal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="profile-container"><div class="profile-avatar" id="detAvatar">U</div></div>
                <div class="info-group">
                    <div class="info-row"><span class="info-label">Nama Lengkap:</span><span class="info-value" id="detNama">-</span></div>
                    <div class="info-row"><span class="info-label">Nama Akun (Username):</span><span class="info-value" id="detUser">-</span></div>
                    <div class="info-row"><span class="info-label">Kata Sandi (Password):</span><span class="info-value" id="detPass" style="font-family: monospace;">-</span></div>
                    <div class="info-row"><span class="info-label">No. Handphone:</span><span class="info-value" id="detHp">-</span></div>
                    <div class="info-row"><span class="info-label">Peran Kerja (Role):</span><span class="info-value" id="detRole">-</span></div>
                    <div class="info-row"><span class="info-label">Absensi Bulan Ini:</span><span class="info-value" id="detAbsen" style="color: #10b981;">-</span></div>
                </div>
            </div>
        </div>
    </div>

    <div id="addModal" class="modal-overlay" onclick="closeModal('addModal')">
        <div class="modal-box" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>Daftarkan Karyawan Baru</h3>
                <button class="modal-close" onclick="closeModal('addModal')">&times;</button>
            </div>
            <form onsubmit="event.preventDefault(); handleAddEmployee();">
                <div class="modal-body">
                    <div class="form-group-block"><label>Nama Lengkap</label><input type="text" id="addNama" class="form-control" required></div>
                    <div class="form-group-block"><label>Nama Akun (Username)</label><input type="text" id="addUser" class="form-control" required></div>
                    <div class="form-group-block"><label>Kata Sandi (Password)</label><input type="password" id="addPass" class="form-control" required></div>
                    <div class="form-group-block"><label>No. Handphone</label><input type="tel" id="addHp" class="form-control" required></div>
                    <div class="form-group-block">
                        <label>Peran Kerja (*Role*)</label>
                        <select id="addRole" class="form-control">
                            <option>Owner</option><option>Teknik Sipil</option><option>Kepala Warehouse</option><option>Mandor Lapangan</option><option>Sopir Logistik</option><option selected>Tukang Konstruksi</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">Simpan Data Akses</button>
            </form>
        </div>
    </div>

    <div id="editModal" class="modal-overlay" onclick="closeModal('editModal')">
        <div class="modal-box" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>Ubah Data Karyawan</h3>
                <button class="modal-close" onclick="closeModal('editModal')">&times;</button>
            </div>
            <form onsubmit="event.preventDefault(); handleUpdateEmployee();">
                <input type="hidden" id="editRowId">
                <div class="modal-body">
                    <div class="form-group-block"><label>Nama Lengkap</label><input type="text" id="editNama" class="form-control" required></div>
                    <div class="form-group-block"><label>Nama Akun (Username)</label><input type="text" id="editUser" class="form-control" required></div>
                    <div class="form-group-block"><label>No. Handphone</label><input type="tel" id="editHp" class="form-control" required></div>
                    <div class="form-group-block">
                        <label>Peran Kerja (*Role*)</label>
                        <select id="editRole" class="form-control">
                            <option>Owner</option><option>Teknik Sipil</option><option>Kepala Warehouse</option><option>Mandor Lapangan</option><option>Sopir Logistik</option><option>Tukang Konstruksi</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 10px; background-color: #d97706;">Perbarui Data</button>
            </form>
        </div>
    </div>

    <div id="deleteWarningModal" class="modal-overlay" onclick="closeModal('deleteWarningModal')">
        <div class="modal-box" onclick="event.stopPropagation()" style="border-top: 4px solid #ef4444; max-width: 420px;">
            <div class="modal-header">
                <h3 style="color: #ef4444; display: flex; align-items: center; gap: 8px;">⚠️ Konfirmasi Hapus</h3>
                <button class="modal-close" onclick="closeModal('deleteWarningModal')">&times;</button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="deleteTargetRowId">
                <p class="delete-warning-text">
                    Apakah Anda yakin ingin menghapus akun milik <strong id="deleteTargetName" style="color: #0f172a;">-</strong>?<br>
                    Tindakan ini akan mencabut seluruh hak otorisasi dalam sistem secara permanen.
                </p>
                <div class="modal-footer-actions">
                    <button class="btn-secondary" onclick="closeModal('deleteWarningModal')">Batal</button>
                    <button class="btn-action delete" style="padding: 10px 20px; font-size: 14px;" onclick="executeDeleteRow()">Ya, Hapus Akun</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Modal Handlers
        function openDetailModal(nama, username, password, role, hp, absen) {
            document.getElementById('detNama').innerText = nama;
            document.getElementById('detUser').innerText = username;
            document.getElementById('detPass').innerText = password;
            document.getElementById('detRole').innerText = role;
            document.getElementById('detHp').innerText = hp;
            document.getElementById('detAbsen').innerText = absen + ' Hari Hadir';
            document.getElementById('detAvatar').innerText = nama.charAt(0);
            document.getElementById('detailModal').style.display = 'flex';
        }

        function openAddModal() { document.getElementById('addModal').style.display = 'flex'; }
        
        function openEditModal(rowId, nama, username, role, hp) {
            document.getElementById('editRowId').value = rowId;
            document.getElementById('editNama').value = nama;
            document.getElementById('editUser').value = username;
            document.getElementById('editHp').value = hp;
            document.getElementById('editRole').value = role;
            document.getElementById('editModal').style.display = 'flex';
        }

        function openDeleteWarningModal(rowId, name) {
            document.getElementById('deleteTargetRowId').value = rowId;
            document.getElementById('deleteTargetName').innerText = name;
            document.getElementById('deleteWarningModal').style.display = 'flex';
        }

        function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

        function executeDeleteRow() {
            const rowId = document.getElementById('deleteTargetRowId').value;
            const targetRow = document.getElementById(rowId);
            if (targetRow) { targetRow.remove(); }
            closeModal('deleteWarningModal');
        }

        // Tambah Karyawan
        let newCount = 100;
        function handleAddEmployee() {
            const nama = document.getElementById('addNama').value;
            const user = document.getElementById('addUser').value;
            const role = document.getElementById('addRole').value;
            const hp = document.getElementById('addHp').value;
            newCount++;
            const rowId = `row-generated${newCount}`;

            let badgeColor = role === 'Owner' ? '#fef3c7; color: #d97706;' : (role === 'Teknik Sipil' ? '#e0f2fe; color: #0369a1;' : '#dcfce7; color: #15803d;');

            const tableBody = document.getElementById('tableBody');
            const newRow = document.createElement('tr');
            newRow.id = rowId;
            newRow.innerHTML = `
                <td><strong>${nama}</strong></td>
                <td>${user}</td>
                <td><span class="role-badge" style="background-color: ${badgeColor}">${role}</span></td>
                <td>
                    <div class="action-group">
                        <button class="btn-action detail" onclick="openDetailModal('${nama}', '${user}', '••••••••', '${role}', '${hp}', 0)">Detail</button>
                        <button class="btn-action edit" onclick="openEditModal('${rowId}', '${nama}', '${user}', '${role}', '${hp}')">Edit</button>
                        <button class="btn-action delete" onclick="openDeleteWarningModal('${rowId}', '${nama}')">Hapus</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(newRow);
            closeModal('addModal');
        }

        // Edit Karyawan
        function handleUpdateEmployee() {
            const rowId = document.getElementById('editRowId').value;
            const nama = document.getElementById('editNama').value;
            const user = document.getElementById('editUser').value;
            const hp = document.getElementById('editHp').value;
            const role = document.getElementById('editRole').value;

            const targetRow = document.getElementById(rowId);
            if (targetRow) {
                let badgeColor = role === 'Owner' ? '#fef3c7; color: #d97706;' : (role === 'Teknik Sipil' ? '#e0f2fe; color: #0369a1;' : '#dcfce7; color: #15803d;');
                
                targetRow.cells[0].innerHTML = `<strong>${nama}</strong>`;
                targetRow.cells[1].innerText = user;
                targetRow.cells[2].innerHTML = `<span class="role-badge" style="background-color: ${badgeColor}">${role}</span>`;
                
                const actionGroup = targetRow.cells[3].querySelector('.action-group');
                actionGroup.innerHTML = `
                    <button class="btn-action detail" onclick="openDetailModal('${nama}', '${user}', '••••••••', '${role}', '${hp}', 20)">Detail</button>
                    <button class="btn-action edit" onclick="openEditModal('${rowId}', '${nama}', '${user}', '${role}', '${hp}')">Edit</button>
                    <button class="btn-action delete" onclick="openDeleteWarningModal('${rowId}', '${nama}')">Hapus</button>
                `;
            }
            closeModal('editModal');
        }

        // Search & Sort
        function filterAndSortTable() {
            const filter = document.getElementById('searchInput').value.toLowerCase();
            const sortOrder = document.getElementById('sortSelect').value;
            const tableBody = document.getElementById('tableBody');
            const rows = Array.from(tableBody.getElementsByTagName('tr'));

            const filteredRows = rows.filter(row => {
                const nameText = row.cells[0].innerText.toLowerCase();
                const userText = row.cells[1].innerText.toLowerCase();
                if (nameText.includes(filter) || userText.includes(filter)) {
                    row.style.display = ""; return true;
                } else {
                    row.style.display = "none"; return false;
                }
            });

            filteredRows.sort((a, b) => {
                const nameA = a.cells[0].innerText.toLowerCase();
                const nameB = b.cells[0].innerText.toLowerCase();
                return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });

            filteredRows.forEach(row => tableBody.appendChild(row));
        }
    </script>
</body>
</html>