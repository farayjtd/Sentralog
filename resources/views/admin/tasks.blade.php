<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Manajemen Tugas - Sentralog</title>

<style>

/* ===== DESIGN SYSTEM (SAMA DENGAN WAREHOUSE) ===== */

:root{
    --primary:#2563eb;
    --primary-dark:#1d4ed8;

    --bg:#f8fafc;
    --card:#ffffff;

    --text:#0f172a;
    --text-light:#64748b;

    --border:#e2e8f0;
    --danger:#ef4444;
    --warning:#f59e0b;
}

/* RESET */
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family:'Segoe UI',sans-serif;
    background:var(--bg);
    color:var(--text);
    display:flex;
    min-height:100vh;
}

/* MAIN */
.main-content{
    margin-left:270px;
    width:100%;
    padding:40px;
}

/* HEADER */
.header{
    margin-bottom:30px;
}

.header h1{
    font-size:30px;
    font-weight:700;
    margin-bottom:6px;
}

.header p{
    color:var(--text-light);
    font-size:14px;
}

/* TOOLBAR */
.toolbar{
    display:flex;
    gap:12px;
    margin-bottom:24px;
    max-width:700px;
    flex-wrap:wrap;
}

.form-control{
    width:100%;
    padding:12px 14px;
    border:1px solid var(--border);
    border-radius:10px;
    background:#fff;
    font-size:14px;
}

/* CARD */
.content-card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:16px;
    padding:24px;
}

/* TABLE */
.data-table{
    width:100%;
    border-collapse:collapse;
}

.data-table th{
    background:#f8fafc;
    color:var(--text-light);
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:.5px;
    padding:14px;
    border-bottom:2px solid var(--border);
    text-align:left;
}

.data-table td{
    padding:14px;
    border-bottom:1px solid var(--border);
    font-size:14px;
}

/* ACTION */
.action-group{
    display:flex;
    gap:8px;
}

.btn-action{
    border:none;
    padding:8px 12px;
    border-radius:8px;
    font-size:12px;
    font-weight:600;
    cursor:pointer;
}

/* sama seperti warehouse */
.btn-detail{
    background:#eff6ff;
    color:var(--primary);
}
.btn-detail:hover{
    background:var(--primary);
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
    color:var(--danger);
}
.btn-delete:hover{
    background:#ef4444;
    color:#fff;
}

/* MODAL (SAMA DENGAN WAREHOUSE) */
.modal-overlay{
    display:none;
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.6);
    justify-content:center;
    align-items:center;
    z-index:999;
}

.modal-box{
    background:#fff;
    width:100%;
    max-width:520px;
    border-radius:18px;
    padding:24px;
}

/* INFO ROW */
.info-row{
    display:flex;
    justify-content:space-between;
    padding:12px 0;
    border-bottom:1px dashed var(--border);
    font-size:14px;
}

/* FORM */
.form-group-block{
    margin-bottom:12px;
}

.form-group-block label{
    display:block;
    font-size:12px;
    color:var(--text-light);
    margin-bottom:6px;
    font-weight:600;
}

/* BUTTON PRIMARY */
.btn-primary{
    width:100%;
    padding:12px;
    border:none;
    border-radius:10px;
    background:var(--primary);
    color:#fff;
    font-weight:600;
    cursor:pointer;
}

.btn-primary:hover{
    background:var(--primary-dark);
}

</style>
</head>

<body>

@include('admin.components.sidebar')

<div class="main-content">

    <!-- HEADER -->
    <div class="header">
        <h1>Manajemen Tugas Lapangan</h1>
        <p>Kelola progres proyek dan penugasan mandor di setiap lokasi.</p>
    </div>

    <!-- TOOLBAR -->
    <div class="toolbar">
        <input type="text" id="searchInput" class="form-control" placeholder="Cari proyek..." onkeyup="filterAndSortTable()">

        <select id="sortOrder" class="form-control" onchange="filterAndSortTable()">
            <option value="asc">A - Z</option>
            <option value="desc">Z - A</option>
        </select>
    </div>

    <!-- TABLE -->
    <div class="content-card">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Proyek</th>
                    <th>Mandor</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>

            <tbody id="taskBody">

                <tr id="t1">
                    <td><strong>Pengecoran Lantai B</strong></td>
                    <td>Pak Budi</td>
                    <td>In Progress</td>
                    <td>
                        <div class="action-group">
                            <button class="btn-action btn-detail" onclick="showDetail('t1')">Detail</button>
                            <button class="btn-action btn-edit" onclick="openEditModal('t1')">Edit</button>
                            <button class="btn-action btn-delete" onclick="openDeleteModal('t1')">Hapus</button>
                        </div>
                    </td>
                </tr>

                <tr id="t2">
                    <td><strong>Pemasangan Rangka Baja</strong></td>
                    <td>Pak Ahmad</td>
                    <td>Done</td>
                    <td>
                        <div class="action-group">
                            <button class="btn-action btn-detail" onclick="showDetail('t2')">Detail</button>
                            <button class="btn-action btn-edit" onclick="openEditModal('t2')">Edit</button>
                            <button class="btn-action btn-delete" onclick="openDeleteModal('t2')">Hapus</button>
                        </div>
                    </td>
                </tr>

            </tbody>
        </table>
    </div>

</div>

<!-- DETAIL -->
<div id="detailModal" class="modal-overlay" onclick="closeModal('detailModal')">
<div class="modal-box" onclick="event.stopPropagation()">
    <h3>Detail Tugas</h3>
    <div id="modalContent"></div>
    <button class="btn-primary" style="margin-top:16px;" onclick="closeModal('detailModal')">Tutup</button>
</div>
</div>

<!-- EDIT -->
<div id="editModal" class="modal-overlay" onclick="closeModal('editModal')">
<div class="modal-box" onclick="event.stopPropagation()">

    <h3>Edit Tugas</h3>

    <input type="hidden" id="editId">

    <div class="form-group-block">
        <label>Proyek</label>
        <input id="editProyek" class="form-control">
    </div>

    <div class="form-group-block">
        <label>Mandor</label>
        <input id="editMandor" class="form-control">
    </div>

    <div class="form-group-block">
        <label>Status</label>
        <select id="editStatus" class="form-control">
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
        </select>
    </div>

    <button class="btn-primary" onclick="saveEdit()">Simpan</button>

</div>
</div>

<!-- DELETE -->
<div id="deleteModal" class="modal-overlay" onclick="closeModal('deleteModal')">
<div class="modal-box" onclick="event.stopPropagation()">
    <h3>Hapus Data?</h3>
    <p style="margin:16px 0;">Yakin ingin menghapus?</p>
    <button class="btn-primary" style="background:#ef4444;" onclick="confirmDelete()">Hapus</button>
</div>
</div>

<script>
let currentId=null;

function showDetail(id){
    const row=document.getElementById(id);

    document.getElementById('modalContent').innerHTML=`
        <div class="info-row"><span>Proyek</span><b>${row.cells[0].innerText}</b></div>
        <div class="info-row"><span>Mandor</span>${row.cells[1].innerText}</div>
        <div class="info-row"><span>Status</span>${row.cells[2].innerText}</div>
    `;

    document.getElementById('detailModal').style.display='flex';
}

function openEditModal(id){
    currentId=id;
    const row=document.getElementById(id);

    editProyek.value=row.cells[0].innerText;
    editMandor.value=row.cells[1].innerText;
    editStatus.value=row.cells[2].innerText;

    document.getElementById('editModal').style.display='flex';
}

function saveEdit(){
    const row=document.getElementById(currentId);

    row.cells[0].innerHTML=`<strong>${editProyek.value}</strong>`;
    row.cells[1].innerText=editMandor.value;
    row.cells[2].innerText=editStatus.value;

    closeModal('editModal');
}

function openDeleteModal(id){
    currentId=id;
    document.getElementById('deleteModal').style.display='flex';
}

function confirmDelete(){
    document.getElementById(currentId).remove();
    closeModal('deleteModal');
}

function closeModal(id){
    document.getElementById(id).style.display='none';
}

function filterAndSortTable(){
    const s=searchInput.value.toLowerCase();
    const order=sortOrder.value;

    const rows=[...taskBody.querySelectorAll('tr')];

    rows.sort((a,b)=>
        order==='asc'
        ?a.cells[0].innerText.localeCompare(b.cells[0].innerText)
        :b.cells[0].innerText.localeCompare(a.cells[0].innerText)
    );

    rows.forEach(r=>{
        r.style.display=r.cells[0].innerText.toLowerCase().includes(s)?"":"none";
        taskBody.appendChild(r);
    });
}
</script>

</body>
</html>