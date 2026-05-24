<div class="sidebar">
    <div class="sidebar-header">
        <div class="brand">
            <span class="brand-icon">🚀</span>
            <span>Sentralog</span>
        </div>
    </div>

    <div class="menu-wrapper">
    <span class="menu-title">Main Menu</span>

    <a href="/admin/dashboard" class="menu-item {{ request()->is('admin/dashboard') ? 'active' : '' }}">
        Dashboard
    </a>

    <a href="/admin/karyawan" class="menu-item {{ request()->is('admin/karyawan') ? 'active' : '' }}">
        Daftar Karyawan
    </a>

    <a href="/admin/warehouse" class="menu-item {{ request()->is('admin/warehouse') ? 'active' : '' }}">
        Data Warehouse
    </a>

    <a href="/admin/tasks" class="menu-item {{ request()->is('admin/tasks') ? 'active' : '' }}">
        Manajemen Tugas
    </a>

    <a href="/admin/inventory" class="menu-item {{ request()->is('admin/inventory') ? 'active' : '' }}">
        Inventaris Material
    </a>
</div>

    <div class="sidebar-footer">
        <a href="/" class="btn-logout">
            Logout
        </a>
    </div>
</div>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Inter', sans-serif;
        background-color: #f8fafc;
    }

    /* Sidebar */
    .sidebar {
        width: 270px;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;

        display: flex;
        flex-direction: column;
        justify-content: space-between;

        background: #ffffff;
        border-right: 1px solid #e2e8f0;

        padding: 24px 18px;
    }

    /* Header */
    .sidebar-header {
        margin-bottom: 30px;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 10px;

        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
    }

    .brand-icon {
        font-size: 24px;
    }

    /* Menu */
    .menu-wrapper {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
    }

    .menu-title {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #94a3b8;

        margin-bottom: 12px;
        padding: 0 12px;
    }

    .menu-item {
        display: flex;
        align-items: center;

        padding: 13px 14px;
        border-radius: 10px;

        text-decoration: none;

        color: #475569;
        font-size: 14px;
        font-weight: 500;

        transition: all 0.25s ease;
    }

    .menu-item:hover {
        background-color: #f1f5f9;
        color: #2563eb;
        transform: translateX(2px);
    }

    .menu-item.active {
        background-color: #2563eb;
        color: #ffffff;
        font-weight: 600;

        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }

    /* Footer */
    .sidebar-footer {
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }

    .btn-logout {
        display: block;
        width: 100%;

        padding: 12px;
        border-radius: 10px;

        text-align: center;
        text-decoration: none;

        background-color: #fff1f2;
        color: #dc2626;

        font-size: 14px;
        font-weight: 600;

        transition: all 0.25s ease;
    }

    .btn-logout:hover {
        background-color: #dc2626;
        color: #ffffff;
    }
</style>