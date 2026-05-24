<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Warehouse - Sentralog</title>

    <style>
        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
        }

        :root{
            --primary:#2563eb;
            --primary-dark:#1d4ed8;

            --success:#10b981;
            --warning:#f59e0b;
            --danger:#ef4444;

            --bg:#f8fafc;
            --card:#ffffff;

            --text:#0f172a;
            --text-light:#64748b;

            --border:#e2e8f0;
        }

        body{
            background:var(--bg);
            color:var(--text);
            font-family:'Segoe UI',sans-serif;
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
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:30px;
            gap:20px;
            flex-wrap:wrap;
        }

        .header h1{
            font-size:30px;
            font-weight:700;
            margin-bottom:6px;
        }

        .header p{
            color:var(--text-light);
            font-size:14px;
            line-height:1.6;
        }

        /* BUTTON */
        .btn-primary{
            background:var(--primary);
            color:#fff;
            border:none;
            border-radius:10px;
            padding:12px 20px;
            font-size:14px;
            font-weight:600;
            cursor:pointer;
            transition:0.2s;
        }

        .btn-primary:hover{
            background:var(--primary-dark);
        }

        /* TOOLBAR */
        .toolbar{
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:16px;
            margin-bottom:24px;
            flex-wrap:wrap;
        }

        .search-sort-group{
            display:flex;
            gap:12px;
            flex:1;
            flex-wrap:wrap;
        }

        .form-control{
            width:100%;
            padding:12px 14px;
            border:1px solid #cbd5e1;
            border-radius:10px;
            background:#fff;
            font-size:14px;
            outline:none;
            transition:0.2s;
        }

        .form-control:focus{
            border-color:var(--primary);
            box-shadow:0 0 0 3px rgba(37,99,235,.1);
        }

        .select-control{
            max-width:220px;
            cursor:pointer;
        }

        /* CARD */
        .content-card{
            background:var(--card);
            border-radius:16px;
            padding:24px;
            border:1px solid var(--border);

            box-shadow:
                0 1px 2px rgba(15,23,42,.04),
                0 4px 12px rgba(15,23,42,.04);
        }

        /* TABLE */
        .table-wrapper{
            overflow-x:auto;
        }

        .data-table{
            width:100%;
            border-collapse:collapse;
            min-width:900px;
        }

        .data-table th{
            background:#f8fafc;
            padding:16px;
            font-size:11px;
            text-transform:uppercase;
            letter-spacing:.5px;
            color:var(--text-light);
            border-bottom:2px solid var(--border);
            text-align:left;
        }

        .data-table td{
            padding:16px;
            border-bottom:1px solid var(--border);
            font-size:14px;
            color:#334155;
            vertical-align:middle;
        }

        .data-table tr:hover{
            background:#f8fafc;
        }

        /* STATUS */
        .status-badge{
            display:inline-block;
            padding:6px 10px;
            border-radius:8px;
            font-size:12px;
            font-weight:600;
        }

        .status-active{
            background:#dcfce7;
            color:#15803d;
        }

        .status-warning{
            background:#fef3c7;
            color:#b45309;
        }

        .status-danger{
            background:#fee2e2;
            color:#b91c1c;
        }

        /* ACTION BUTTON */
        .action-group{
            display:flex;
            gap:8px;
            flex-wrap:wrap;
        }

        .btn-action{
            border:none;
            padding:8px 12px;
            border-radius:8px;
            font-size:12px;
            font-weight:600;
            cursor:pointer;
            transition:0.2s;
        }

        .btn-detail{
            background:#eff6ff;
            color:#2563eb;
        }

        .btn-detail:hover{
            background:#2563eb;
            color:#fff;
        }

        .btn-edit{
            background:#fef3c7;
            color:#b45309;
        }

        .btn-edit:hover{
            background:#d97706;
            color:#fff;
        }

        .btn-delete{
            background:#fee2e2;
            color:#dc2626;
        }

        .btn-delete:hover{
            background:#ef4444;
            color:#fff;
        }

        /* MODAL */
        .modal-overlay{
            position:fixed;
            inset:0;
            background:rgba(15,23,42,.65);
            display:none;
            justify-content:center;
            align-items:center;
            padding:20px;
            z-index:999;
        }

        .modal-box{
            width:100%;
            max-width:520px;
            background:#fff;
            border-radius:18px;
            padding:24px;
            animation:fadeIn .25s ease;
        }

        @keyframes fadeIn{
            from{
                opacity:0;
                transform:translateY(-10px);
            }
            to{
                opacity:1;
                transform:translateY(0);
            }
        }

        .modal-header{
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:20px;
        }

        .modal-header h3{
            font-size:20px;
            font-weight:700;
        }

        .modal-close{
            border:none;
            background:none;
            font-size:28px;
            cursor:pointer;
            color:#64748b;
        }

        .modal-close:hover{
            color:#0f172a;
        }

        .form-group{
            margin-bottom:16px;
        }

        .form-group label{
            display:block;
            margin-bottom:8px;
            font-size:13px;
            font-weight:600;
            color:#475569;
        }

        /* DETAIL */
        .warehouse-icon{
            width:90px;
            height:90px;
            border-radius:18px;
            background:#eff6ff;
            display:flex;
            align-items:center;
            justify-content:center;
            margin:0 auto 20px;
            font-size:40px;
            border:3px solid #2563eb;
        }

        .info-row{
            display:flex;
            justify-content:space-between;
            gap:20px;
            padding:14px 0;
            border-bottom:1px dashed #e2e8f0;
        }

        .info-label{
            color:#64748b;
            font-size:14px;
        }

        .info-value{
            font-weight:600;
            text-align:right;
        }

        /* DELETE */
        .delete-text{
            font-size:14px;
            line-height:1.7;
            color:#475569;
            margin:16px 0;
        }

        .modal-footer{
            display:flex;
            justify-content:flex-end;
            gap:12px;
            margin-top:20px;
        }

        .btn-secondary{
            background:#f1f5f9;
            color:#475569;
            border:1px solid #cbd5e1;
            border-radius:10px;
            padding:10px 18px;
            font-weight:600;
            cursor:pointer;
        }

        .btn-secondary:hover{
            background:#e2e8f0;
        }

        /* RESPONSIVE */
        @media(max-width:992px){
            .main-content{
                margin-left:0;
                padding:24px;
            }
        }

        @media(max-width:768px){
            .header{
                flex-direction:column;
                align-items:flex-start;
            }

            .search-sort-group{
                flex-direction:column;
            }

            .select-control{
                max-width:100%;
            }
        }
    </style>
</head>

<body>

@include('admin.components.sidebar')

<div class="main-content">

    <!-- HEADER -->
    <div class="header">
        <div>
            <h1>Manajemen Warehouse</h1>
            <p>
                Monitoring distribusi logistik, kepala warehouse,
                dan aktivitas operasional seluruh cabang Sentralog.
            </p>
        </div>

        <button class="btn-primary" onclick="openAddModal()">
            ➕ Tambah Warehouse
        </button>
    </div>

    <!-- TOOLBAR -->
    <div class="toolbar">
        <div class="search-sort-group">
            <input
                type="text"
                id="searchInput"
                class="form-control"
                placeholder="Cari nama warehouse atau lokasi..."
                onkeyup="filterAndSortTable()"
            >

            <select
                id="sortSelect"
                class="form-control select-control"
                onchange="filterAndSortTable()"
            >
                <option value="asc">Nama A - Z</option>
                <option value="desc">Nama Z - A</option>
            </select>
        </div>
    </div>

    <!-- TABLE -->
    <div class="content-card">
        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Warehouse</th>
                        <th>Lokasi</th>
                        <th>Kepala Warehouse</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>

                <tbody id="tableBody">

                    <tr id="wh-1">
                        <td><strong>Sentralog Ponorogo</strong></td>
                        <td>Ponorogo, Jawa Timur</td>
                        <td>Egi Setiawan</td>
                        <td>
                            <span class="status-badge status-active">
                                Aktif Penuh
                            </span>
                        </td>
                        <td>
                            <div class="action-group">
                                <button
                                    class="btn-action btn-detail"
                                    onclick="openDetailModal(
                                        'Sentralog Ponorogo',
                                        'Ponorogo, Jawa Timur',
                                        'Egi Setiawan',
                                        '081299887766',
                                        '45 Project Selesai',
                                        '8 Project Berjalan',
                                        'Aktif Penuh'
                                    )"
                                >
                                    Detail
                                </button>

                                <button
                                    class="btn-action btn-edit"
                                    onclick="openEditModal(
                                        'wh-1',
                                        'Sentralog Ponorogo',
                                        'Ponorogo, Jawa Timur',
                                        'Egi Setiawan',
                                        '081299887766'
                                    )"
                                >
                                    Edit
                                </button>

                                <button
                                    class="btn-action btn-delete"
                                    onclick="openDeleteModal(
                                        'wh-1',
                                        'Sentralog Ponorogo'
                                    )"
                                >
                                    Hapus
                                </button>
                            </div>
                        </td>
                    </tr>

                    <tr id="wh-2">
                        <td><strong>Sentralog Purwantoro</strong></td>
                        <td>Wonogiri, Jawa Tengah</td>
                        <td>Sukma Wijaya</td>
                        <td>
                            <span class="status-badge status-active">
                                Aktif Penuh
                            </span>
                        </td>
                        <td>
                            <div class="action-group">
                                <button
                                    class="btn-action btn-detail"
                                    onclick="openDetailModal(
                                        'Sentralog Purwantoro',
                                        'Wonogiri, Jawa Tengah',
                                        'Sukma Wijaya',
                                        '085744332211',
                                        '32 Project Selesai',
                                        '5 Project Berjalan',
                                        'Aktif Penuh'
                                    )"
                                >
                                    Detail
                                </button>

                                <button
                                    class="btn-action btn-edit"
                                    onclick="openEditModal(
                                        'wh-2',
                                        'Sentralog Purwantoro',
                                        'Wonogiri, Jawa Tengah',
                                        'Sukma Wijaya',
                                        '085744332211'
                                    )"
                                >
                                    Edit
                                </button>

                                <button
                                    class="btn-action btn-delete"
                                    onclick="openDeleteModal(
                                        'wh-2',
                                        'Sentralog Purwantoro'
                                    )"
                                >
                                    Hapus
                                </button>
                            </div>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    </div>

</div>

<!-- DETAIL MODAL -->
<div class="modal-overlay" id="detailModal">
    <div class="modal-box">

        <div class="modal-header">
            <h3>Detail Warehouse</h3>
            <button class="modal-close" onclick="closeModal('detailModal')">
                &times;
            </button>
        </div>

        <div class="warehouse-icon">
            🏢
        </div>

        <div class="info-row">
            <span class="info-label">Warehouse</span>
            <span class="info-value" id="detName">-</span>
        </div>

        <div class="info-row">
            <span class="info-label">Lokasi</span>
            <span class="info-value" id="detLoc">-</span>
        </div>

        <div class="info-row">
            <span class="info-label">Kepala Warehouse</span>
            <span class="info-value" id="detManager">-</span>
        </div>

        <div class="info-row">
            <span class="info-label">No. HP</span>
            <span class="info-value" id="detPhone">-</span>
        </div>

        <div class="info-row">
            <span class="info-label">Project Selesai</span>
            <span class="info-value" id="detDone">-</span>
        </div>

        <div class="info-row">
            <span class="info-label">Project Berjalan</span>
            <span class="info-value" id="detProgress">-</span>
        </div>

        <div class="info-row">
            <span class="info-label">Status Operasional</span>
            <span class="info-value" id="detStatus">-</span>
        </div>

    </div>
</div>

<!-- ADD MODAL -->
<div class="modal-overlay" id="addModal">
    <div class="modal-box">

        <div class="modal-header">
            <h3>Tambah Warehouse</h3>
            <button class="modal-close" onclick="closeModal('addModal')">
                &times;
            </button>
        </div>

        <form onsubmit="event.preventDefault(); addWarehouse();">

            <div class="form-group">
                <label>Nama Warehouse</label>
                <input type="text" id="addName" class="form-control" required>
            </div>

            <div class="form-group">
                <label>Lokasi</label>
                <input type="text" id="addLoc" class="form-control" required>
            </div>

            <div class="form-group">
                <label>Kepala Warehouse</label>
                <input type="text" id="addManager" class="form-control" required>
            </div>

            <div class="form-group">
                <label>No. HP</label>
                <input type="tel" id="addPhone" class="form-control" required>
            </div>

            <button class="btn-primary" style="width:100%;">
                Simpan Warehouse
            </button>

        </form>
    </div>
</div>

<!-- EDIT MODAL -->
<div class="modal-overlay" id="editModal">
    <div class="modal-box">

        <div class="modal-header">
            <h3>Edit Warehouse</h3>
            <button class="modal-close" onclick="closeModal('editModal')">
                &times;
            </button>
        </div>

        <form onsubmit="event.preventDefault(); updateWarehouse();">

            <input type="hidden" id="editId">

            <div class="form-group">
                <label>Nama Warehouse</label>
                <input type="text" id="editName" class="form-control" required>
            </div>

            <div class="form-group">
                <label>Lokasi</label>
                <input type="text" id="editLoc" class="form-control" required>
            </div>

            <div class="form-group">
                <label>Kepala Warehouse</label>
                <input type="text" id="editManager" class="form-control" required>
            </div>

            <div class="form-group">
                <label>No. HP</label>
                <input type="tel" id="editPhone" class="form-control" required>
            </div>

            <button
                class="btn-primary"
                style="width:100%; background:#d97706;"
            >
                Update Warehouse
            </button>

        </form>
    </div>
</div>

<!-- DELETE MODAL -->
<div class="modal-overlay" id="deleteModal">
    <div class="modal-box">

        <div class="modal-header">
            <h3 style="color:#ef4444;">
                ⚠️ Hapus Warehouse
            </h3>

            <button class="modal-close" onclick="closeModal('deleteModal')">
                &times;
            </button>
        </div>

        <input type="hidden" id="deleteId">

        <p class="delete-text">
            Apakah yakin ingin menghapus
            <strong id="deleteName"></strong> ?
            <br><br>
            Data warehouse akan dihapus permanen.
        </p>

        <div class="modal-footer">

            <button
                class="btn-secondary"
                onclick="closeModal('deleteModal')"
            >
                Batal
            </button>

            <button
                class="btn-action btn-delete"
                style="padding:10px 18px;"
                onclick="deleteWarehouse()"
            >
                Ya, Hapus
            </button>

        </div>

    </div>
</div>

<script>

    /* MODAL */
    function openModal(id){
        document.getElementById(id).style.display = 'flex';
    }

    function closeModal(id){
        document.getElementById(id).style.display = 'none';
    }

    /* DETAIL */
    function openDetailModal(
        name,
        loc,
        manager,
        phone,
        done,
        progress,
        status
    ){

        document.getElementById('detName').innerText = name;
        document.getElementById('detLoc').innerText = loc;
        document.getElementById('detManager').innerText = manager;
        document.getElementById('detPhone').innerText = phone;
        document.getElementById('detDone').innerText = done;
        document.getElementById('detProgress').innerText = progress;
        document.getElementById('detStatus').innerText = status;

        openModal('detailModal');
    }

    /* ADD */
    function openAddModal(){
        openModal('addModal');
    }

    let counter = 2;

    function addWarehouse(){

        const name = document.getElementById('addName').value;
        const loc = document.getElementById('addLoc').value;
        const manager = document.getElementById('addManager').value;
        const phone = document.getElementById('addPhone').value;

        counter++;

        const id = 'wh-' + counter;

        const row = `
            <tr id="${id}">
                <td><strong>${name}</strong></td>
                <td>${loc}</td>
                <td>${manager}</td>
                <td>
                    <span class="status-badge status-active">
                        Aktif Penuh
                    </span>
                </td>

                <td>
                    <div class="action-group">

                        <button
                            class="btn-action btn-detail"
                            onclick="openDetailModal(
                                '${name}',
                                '${loc}',
                                '${manager}',
                                '${phone}',
                                '0 Project Selesai',
                                '0 Project Berjalan',
                                'Aktif Penuh'
                            )"
                        >
                            Detail
                        </button>

                        <button
                            class="btn-action btn-edit"
                            onclick="openEditModal(
                                '${id}',
                                '${name}',
                                '${loc}',
                                '${manager}',
                                '${phone}'
                            )"
                        >
                            Edit
                        </button>

                        <button
                            class="btn-action btn-delete"
                            onclick="openDeleteModal(
                                '${id}',
                                '${name}'
                            )"
                        >
                            Hapus
                        </button>

                    </div>
                </td>
            </tr>
        `;

        document
            .getElementById('tableBody')
            .insertAdjacentHTML('beforeend', row);

        closeModal('addModal');

        document.querySelector('#addModal form').reset();
    }

    /* EDIT */
    function openEditModal(id, name, loc, manager, phone){

        document.getElementById('editId').value = id;
        document.getElementById('editName').value = name;
        document.getElementById('editLoc').value = loc;
        document.getElementById('editManager').value = manager;
        document.getElementById('editPhone').value = phone;

        openModal('editModal');
    }

    function updateWarehouse(){

        const id = document.getElementById('editId').value;

        const name = document.getElementById('editName').value;
        const loc = document.getElementById('editLoc').value;
        const manager = document.getElementById('editManager').value;
        const phone = document.getElementById('editPhone').value;

        const row = document.getElementById(id);

        row.cells[0].innerHTML = `<strong>${name}</strong>`;
        row.cells[1].innerText = loc;
        row.cells[2].innerText = manager;

        row.cells[4].innerHTML = `
            <div class="action-group">

                <button
                    class="btn-action btn-detail"
                    onclick="openDetailModal(
                        '${name}',
                        '${loc}',
                        '${manager}',
                        '${phone}',
                        '35 Project Selesai',
                        '4 Project Berjalan',
                        'Aktif Penuh'
                    )"
                >
                    Detail
                </button>

                <button
                    class="btn-action btn-edit"
                    onclick="openEditModal(
                        '${id}',
                        '${name}',
                        '${loc}',
                        '${manager}',
                        '${phone}'
                    )"
                >
                    Edit
                </button>

                <button
                    class="btn-action btn-delete"
                    onclick="openDeleteModal(
                        '${id}',
                        '${name}'
                    )"
                >
                    Hapus
                </button>

            </div>
        `;

        closeModal('editModal');
    }

    /* DELETE */
    function openDeleteModal(id, name){

        document.getElementById('deleteId').value = id;
        document.getElementById('deleteName').innerText = name;

        openModal('deleteModal');
    }

    function deleteWarehouse(){

        const id = document.getElementById('deleteId').value;

        document.getElementById(id).remove();

        closeModal('deleteModal');
    }

    /* FILTER & SORT */
    function filterAndSortTable(){

        const keyword = document
            .getElementById('searchInput')
            .value
            .toLowerCase();

        const sort = document.getElementById('sortSelect').value;

        const tbody = document.getElementById('tableBody');

        let rows = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((a,b)=>{

            const aText = a.cells[0].innerText.toLowerCase();
            const bText = b.cells[0].innerText.toLowerCase();

            return sort === 'asc'
                ? aText.localeCompare(bText)
                : bText.localeCompare(aText);
        });

        rows.forEach(row=>{

            const warehouse = row.cells[0].innerText.toLowerCase();
            const lokasi = row.cells[1].innerText.toLowerCase();

            if(
                warehouse.includes(keyword) ||
                lokasi.includes(keyword)
            ){
                row.style.display = '';
            }else{
                row.style.display = 'none';
            }

            tbody.appendChild(row);
        });
    }

    /* CLOSE MODAL CLICK OUTSIDE */
    window.onclick = function(e){

        document.querySelectorAll('.modal-overlay').forEach(modal=>{

            if(e.target === modal){
                modal.style.display = 'none';
            }
        });
    }

</script>

</body>
</html>