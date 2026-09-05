import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { userData } = useAuth();

  return (
    <div className="member-page">

      {/* HEADER */}

      <div className="member-page-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Selamat datang di panel anggota
            organisasi.
          </p>

        </div>

      </div>


      {/* WELCOME */}

      <div className="member-welcome-card">

        <div>

          <span>
            SELAMAT DATANG
          </span>

          <h2>
            Halo,{" "}
            {userData?.name ||
              "Anggota"}! 👋
          </h2>

          <p>
            Senang melihat kamu kembali.
            Gunakan panel ini untuk melihat
            profil dan melakukan absensi
            kegiatan organisasi.
          </p>

        </div>

        <div className="member-welcome-icon">
          👋
        </div>

      </div>


      {/* MENU */}

      <div className="member-dashboard-grid">

        <Link
          to="/member/profile"
          className="member-dashboard-card"
        >

          <div className="member-dashboard-icon">
            👤
          </div>

          <div>

            <h3>
              Profil Saya
            </h3>

            <p>
              Lihat informasi dan data
              profil anggota kamu.
            </p>

          </div>

          <span className="member-card-arrow">
            →
          </span>

        </Link>


        <Link
          to="/member/attendance"
          className="member-dashboard-card"
        >

          <div className="member-dashboard-icon">
            📋
          </div>

          <div>

            <h3>
              Absensi
            </h3>

            <p>
              Lakukan absensi untuk
              kegiatan organisasi.
            </p>

          </div>

          <span className="member-card-arrow">
            →
          </span>

        </Link>

      </div>


      {/* INFO */}

      <div className="member-info-card">

        <div className="member-info-icon">
          ℹ️
        </div>

        <div>

          <h3>
            Informasi Anggota
          </h3>

          <p>
            Pastikan data profil kamu
            sudah sesuai. Absensi kegiatan
            akan tercatat berdasarkan akun
            yang sedang digunakan.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;