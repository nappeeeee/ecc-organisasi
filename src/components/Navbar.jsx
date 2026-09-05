import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          ORGANISASI
        </Link>


        {/* DESKTOP MENU */}
        <div className="navbar-menu">

          <Link
            to="/"
            className={
              isActive("/")
                ? "active"
                : ""
            }
          >
            Beranda
          </Link>

          <Link
            to="/organization"
            className={
              isActive("/organization")
                ? "active"
                : ""
            }
          >
            Struktur Organisasi
          </Link>

          <Link
            to="/news"
            className={
              isActive("/news")
                ? "active"
                : ""
            }
          >
            Berita
          </Link>

          <Link
            to="/about"
            className={
              isActive("/about")
                ? "active"
                : ""
            }
          >
            Tentang
          </Link>

        </div>


        {/* DESKTOP LOGIN */}
        <Link
          to="/login"
          className="navbar-login"
        >
          Login
        </Link>


        {/* MOBILE BUTTON */}
        <button
          type="button"
          className={`navbar-toggle ${
            menuOpen ? "open" : ""
          }`}
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Buka menu"
          aria-expanded={menuOpen}
        >

          <span></span>
          <span></span>
          <span></span>

        </button>

      </div>


      {/* MOBILE MENU */}
      <div
        className={`navbar-mobile-menu ${
          menuOpen ? "show" : ""
        }`}
      >

        <Link
          to="/"
          className={
            isActive("/")
              ? "active"
              : ""
          }
          onClick={closeMenu}
        >
          Beranda
        </Link>

        <Link
          to="/organization"
          className={
            isActive("/organization")
              ? "active"
              : ""
          }
          onClick={closeMenu}
        >
          Struktur Organisasi
        </Link>

        <Link
          to="/news"
          className={
            isActive("/news")
              ? "active"
              : ""
          }
          onClick={closeMenu}
        >
          Berita
        </Link>

        <Link
          to="/about"
          className={
            isActive("/about")
              ? "active"
              : ""
          }
          onClick={closeMenu}
        >
          Tentang
        </Link>

        <Link
          to="/login"
          className="navbar-mobile-login"
          onClick={closeMenu}
        >
          Login
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;