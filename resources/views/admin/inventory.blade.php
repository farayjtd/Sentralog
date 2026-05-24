<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventaris & Peralatan - Sentralog</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background-color: #f8fafc; color: #0f172a; font-family: 'Segoe UI', sans-serif; display: flex; min-vh: 100vh; }
        .main-content { margin-left: 260px; flex-grow: 1; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        
        /* Toolbar Search & Sort */
        .toolbar { display: flex; gap: 12px; margin-bottom: 20px; }
        .form-control { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; }
        
        .content-card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
        .data-table th { background: #f8fafc; padding: 14px; text-transform: uppercase; font-size: 11px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        .data-table td { padding: 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        
        .btn-primary { padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .action-group { display: flex; gap: 6px; }
        .btn-action { padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #cbd5e1; background: #fff; }
        .btn-delete { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }
        
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; justify-content: center; align-items: center; }
        .modal-box { background: #fff; padding: 24px; border-radius: 12px; width: 400px; }
        .form-control-modal { width: 100%; padding: 10px; margin: 8px 0 16px; border: 1px solid #cbd5e1; border-radius: 6px; }
    </style>
</head>
<body>
    @include('admin.components.sidebar')

    <div class="main-content">
        <div class="header">
            <div>
                <h1>Inventaris Peralatan & Armada</h1>
                <p>Kelola aset alat kerja dan armada truk operasional di seluruh cabang.</p>
            </div>
            <button class="btn-primary" onclick="openModal('addModal')">➕ Tambah Inventaris</button>
        </div>

        <div class="toolbar">
            <input type="text" id="searchInput" class="form-control" placeholder="Cari nama alat..." onkeyup="filterAndSortTable()" style="flex: 2;">
            <select id="sortOrder" class="form-control" onchange="filterAndSortTable()" style="flex: 1;">
                <option value="asc">Nama: A - Z</option>
                <option value="desc">Nama: Z - A</option>
            </select>
        </div>

        <div class="content-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama Alat/Armada</th>
                        <th>Kategori</th>
                        <th>Jumlah</th>
                        <th>Lokasi Warehouse</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="inventoryBody">
                    <tr id="inv-1"><td><strong>Gerinda Tangan Bosch</strong></td><td>Alat Kerja</td><td>5</td><td>Sentralog Ponorogo</td><td><div class="action-group"><button class="btn-action" onclick="editRow('inv-1')">Edit</button><button class="btn-action btn-delete" onclick="deleteRow('inv-1')">Hapus</button></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <div id="addModal" class="modal-overlay">
        <div class="modal-box">
            <h3 id="modalTitle">Tambah Inventaris Baru</h3>
            <input type="hidden" id="editId">
            <input type="text" id="itemName" class="form-control-modal" placeholder="Nama Alat/Armada">
            <select id="itemCat" class="form-control-modal">
                <option value="Alat Kerja">Alat Kerja</option>
                <option value="Armada Truk">Armada Truk</option>
            </select>
            <input type="number" id="itemQty" class="form-control-modal" placeholder="Jumlah Unit">
            <select id="itemWh" class="form-control-modal">
                <option value="Sentralog Ponorogo">Sentralog Ponorogo</option>
                <option value="Sentralog Purwantoro">Sentralog Purwantoro</option>
            </select>
            <button class="btn-primary" style="width:100%" onclick="saveInv()">Simpan Data</button>
        </div>
    </div>

    <script>
        function openModal(id, title = "Tambah Inventaris Baru") {
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('addModal').style.display = 'flex';
        }
        function closeModal() { document.getElementById('addModal').style.display = 'none'; }
        
        function saveInv() {
            const id = document.getElementById('editId').value || 'inv-' + Date.now();
            const name = document.getElementById('itemName').value;
            const cat = document.getElementById('itemCat').value;
            const qty = document.getElementById('itemQty').value;
            const wh = document.getElementById('itemWh').value;
            
            const existingRow = document.getElementById(id);
            if (existingRow) {
                existingRow.innerHTML = `<td><strong>${name}</strong></td><td>${cat}</td><td>${qty}</td><td>${wh}</td><td><div class="action-group"><button class="btn-action" onclick="editRow('${id}')">Edit</button><button class="btn-action btn-delete" onclick="deleteRow('${id}')">Hapus</button></div></td>`;
            } else {
                const tbody = document.getElementById('inventoryBody');
                tbody.innerHTML += `<tr id="${id}"><td><strong>${name}</strong></td><td>${cat}</td><td>${qty}</td><td>${wh}</td><td><div class="action-group"><button class="btn-action" onclick="editRow('${id}')">Edit</button><button class="btn-action btn-delete" onclick="deleteRow('${id}')">Hapus</button></div></td></tr>`;
            }
            closeModal();
        }

        function editRow(id) {
            const row = document.getElementById(id);
            document.getElementById('editId').value = id;
            document.getElementById('itemName').value = row.cells[0].innerText;
            document.getElementById('itemCat').value = row.cells[1].innerText;
            document.getElementById('itemQty').value = row.cells[2].innerText;
            document.getElementById('itemWh').value = row.cells[3].innerText;
            openModal('addModal', 'Edit Data Inventaris');
        }

        function deleteRow(id) { document.getElementById(id).remove(); }

        function filterAndSortTable() {
            const search = document.getElementById('searchInput').value.toLowerCase();
            const order = document.getElementById('sortOrder').value;
            const tbody = document.getElementById('inventoryBody');
            let rows = Array.from(tbody.querySelectorAll('tr'));

            rows.sort((a, b) => {
                const valA = a.cells[0].innerText.toLowerCase();
                const valB = b.cells[0].innerText.toLowerCase();
                return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });

            rows.forEach(row => {
                const name = row.cells[0].innerText.toLowerCase();
                row.style.display = name.includes(search) ? "" : "none";
                tbody.appendChild(row);
            });
        }
    </script>
</body>
</html>