import { useAuth } from "../../context/AuthContext";

function AdminHeader({ onMenuClick }) {
  const { userData, user } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-menu-button"
          onClick={onMenuClick}
          aria-label="Buka menu"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="admin-header-title">
          <h1>Dashboard</h1>
          <p>Kelola website organisasi dari sini.</p>
        </div>
      </div>

      <div className="admin-profile">
        <div className="admin-avatar">
          {(userData?.name || user?.email || "A")
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="admin-profile-info">
          <strong>{userData?.name || "Administrator"}</strong>
          <span>{user?.email}</span>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
