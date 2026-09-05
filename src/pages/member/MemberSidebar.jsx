import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

function MemberSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { userData } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  const handleMenuClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* OVERLAY MOBILE */}
      <div
        className={`member-sidebar-overlay ${
          isOpen ? "show" : ""
        }`}
        onClick={onClose}
      />

      <aside
        className={`member-sidebar ${
          isOpen ? "mobile-open" : ""
        }`}
      >

        {/* LOGO */}

        <div className="member-logo">

          <div className="member-logo-box">
            ORG
          </div>

          <div>
            <h2>
              Organisasi
            </h2>

            <span>
              Member Panel
            </span>
          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="member-nav">

          <p className="member-nav-title">
            MENU UTAMA
          </p>

          <NavLink
            to="/member/dashboard"
            onClick={handleMenuClick}
            className={({ isActive }) =>
              `member-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>▣</span>
            Dashboard
          </NavLink>


          <p className="member-nav-title">
            AKTIVITAS
          </p>


          <NavLink
            to="/member/profile"
            onClick={handleMenuClick}
            className={({ isActive }) =>
              `member-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>👤</span>
            Profil Saya
          </NavLink>


          <NavLink
            to="/member/attendance"
            onClick={handleMenuClick}
            className={({ isActive }) =>
              `member-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>📋</span>
            Absen
          </NavLink>

        </nav>


        {/* USER INFO */}

        <div className="member-sidebar-user">

          <div className="member-user-avatar">
            {userData?.name
              ?.charAt(0)
              ?.toUpperCase() || "A"}
          </div>

          <div className="member-user-info">

            <strong>
              {userData?.name ||
                "Anggota"}
            </strong>

            <span>
              Anggota
            </span>

          </div>

        </div>


        {/* LOGOUT */}

        <div className="member-sidebar-bottom">

          <button
            type="button"
            className="member-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>
    </>
  );
}

export default MemberSidebar;