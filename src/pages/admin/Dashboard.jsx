import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { userData } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <span className="dashboard-label">ADMIN PANEL</span>

          <h2>
            Selamat datang,{" "}
            {userData?.name || "Administrator"} 👋
          </h2>

          <p>
            Kelola akun, berita, dan struktur organisasi
            melalui panel administrator.
          </p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div className="stat-icon">👥</div>

          <div>
            <span>Total Anggota</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">📰</div>

          <div>
            <span>Total Berita</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">🏢</div>

          <div>
            <span>Struktur</span>
            <strong>0</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h3>Aktivitas Terbaru</h3>
            <p>Aktivitas yang dilakukan di website.</p>
          </div>
        </div>

        <div className="dashboard-empty">
          <div>📋</div>
          <h4>Belum ada aktivitas</h4>
          <p>
            Aktivitas terbaru akan muncul di sini.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;