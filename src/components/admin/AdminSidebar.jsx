import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  const handleMenuClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div className="admin-logo">
        <div className="admin-logo-box">ORG</div>

        <div>
          <h2>Organisasi</h2>
          <span>Admin Panel</span>
        </div>

        <button
          type="button"
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          ×
        </button>
      </div>

      <nav className="admin-nav">
        <p className="admin-nav-title">MENU UTAMA</p>

        <NavLink
          to="/admin/dashboard"
          onClick={handleMenuClick}
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <span>▣</span>
          Dashboard
        </NavLink>

        <p className="admin-nav-title">MANAJEMEN</p>

        <NavLink
          to="/admin/accounts"
          onClick={handleMenuClick}
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <span>👥</span>
          Kelola Akun
        </NavLink>

        <NavLink
          to="/admin/news"
          onClick={handleMenuClick}
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <span>📰</span>
          Berita
        </NavLink>

        <NavLink
          to="/admin/organization"
          onClick={handleMenuClick}
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <span>🏢</span>
          Struktur Organisasi
        </NavLink>

        <NavLink
          to="/admin/about"
          onClick={handleMenuClick}
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <span>ℹ️</span>
          Tentang
        </NavLink>

        <NavLink
          to="/admin/attendance"
          onClick={handleMenuClick}
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <span>📋</span>
          Absensi
        </NavLink>

        <NavLink
          to="/admin/members"
          onClick={handleMenuClick}
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <span>👥</span>
          Anggota
        </NavLink>
      </nav>

      <div className="admin-sidebar-bottom">
        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;

