<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sentralog</title>
    <style>
        /* Reset Dasar */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body { 
            background-color: #ffffff; 
            color: #1e293b;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-vh: 100vh;
            height: 100vh;
        }

        /* Container Kotak Login */
        .login-container {
            width: 100%;
            max-width: 400px;
            padding: 40px;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }

        /* Header */
        .login-header {
            text-align: center;
            margin-bottom: 32px;
        }

        .logo-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            border-radius: 10px;
            margin-bottom: 16px;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
        }

        .login-header h2 {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #0f172a;
            margin-bottom: 6px;
        }

        .login-header p {
            color: #64748b;
            font-size: 13px;
            line-height: 1.4;
        }

        /* Form Input */
        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            color: #475569;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .form-input {
            width: 100%;
            padding: 10px 14px;
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            color: #0f172a;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s, background-color 0.2s;
        }

        .form-input:focus {
            background-color: #ffffff;
            border-color: #2563eb;
        }

        /* Tombol Masuk */
        .btn-submit {
            width: 100%;
            padding: 12px;
            background-color: #2563eb;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 8px;
        }

        .btn-submit:hover {
            background-color: #1d4ed8;
        }
    </style>
</head>
<body>

<div class="login-container">
    
    <div class="login-header">
        <div class="logo-box">S</div>
        <h2>SENTRALOG</h2>
        <p>Sistem Manajemen Logistik & Multi-Warehouse CV Mugi Jaya</p>
    </div>

    <form id="loginForm" onsubmit="handleLogin(event)">
        
        <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input type="text" id="username" class="form-input" placeholder="Contoh: admin, owner, sipil" required>
        </div>

        <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input type="password" id="password" class="form-input" placeholder="Masukkan password" required>
        </div>

        <button type="submit" class="btn-submit">Masuk Sistem</button>
    </form>
</div>

<script>
    function handleLogin(event) {
        event.preventDefault(); // Mencegah refresh halaman
        
        // Ambil nilai teks yang diketik di input username (diubah ke huruf kecil semua)
        const username = document.getElementById('username').value.toLowerCase().trim();
        
        // Aturan pengecekan login sederhana
        if (username === 'admin') {
            alert('Login Berhasil sebagai Admin Pusat');
            window.location.href = '/dashboard-admin';
        } else if (username === 'owner') {
            alert('Login Berhasil sebagai Owner (Pak Sukma)');
            window.location.href = '/dashboard-owner';
        } else if (username === 'sipil') {
            alert('Login Berhasil sebagai Teknik Sipil');
            window.location.href = '/dashboard-sipil';
        } else if (username === 'gudang') {
            alert('Login Berhasil sebagai Kepala Warehouse');
            window.location.href = '/dashboard-wh';
        } else if (username === 'mandor') {
            alert('Login Berhasil sebagai Mandor Lapangan');
            window.location.href = '/dashboard-mandor';
        } else if (username === 'sopir') {
            alert('Login Berhasil sebagai Sopir Logistik');
            window.location.href = '/dashboard-sopir';
        } else if (username === 'tukang') {
            alert('Login Berhasil sebagai Tukang (Menu Absensi)');
            window.location.href = '/dashboard-tukang';
        } else {
            alert('Username tidak dikenali! Gunakan: admin, owner, sipil, gudang, mandor, sopir, atau tukang.');
        }
    }
</script>

</body>
</html>