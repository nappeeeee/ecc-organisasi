import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // ==============================
      // LOGIN FIREBASE AUTHENTICATION
      // ==============================

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // ==============================
      // AMBIL DATA USER FIRESTORE
      // ==============================

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const userSnap =
        await getDoc(userRef);

      // ==============================
      // DATA USER TIDAK DITEMUKAN
      // ==============================

      if (!userSnap.exists()) {
        await auth.signOut();

        setError(
          "Data akun tidak ditemukan."
        );

        return;
      }

      const userData =
        userSnap.data();

      // ==============================
      // CEK ROLE
      // ==============================

      if (
        userData.role === "admin"
      ) {
        // ADMIN
        navigate("/admin/dashboard");

      } else if (
        userData.role === "anggota"
      ) {
        // ANGGOTA
        navigate("/member/dashboard");

      } else {
        // ROLE TIDAK DIKENAL
        await auth.signOut();

        setError(
          "Role akun tidak dikenali."
        );
      }

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      // ==============================
      // ERROR FIREBASE AUTH
      // ==============================

      if (
        error.code ===
          "auth/invalid-credential" ||
        error.code ===
          "auth/wrong-password" ||
        error.code ===
          "auth/user-not-found"
      ) {
        setError(
          "Email atau password salah."
        );

      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Terlalu banyak percobaan login. Silakan coba beberapa saat lagi."
        );

      } else {
        setError(
          "Terjadi kesalahan saat login."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* HEADER */}

        <div className="login-header">

          <div className="login-logo">
            ORG
          </div>

          <h1>
            Login
          </h1>

          <p>
            Masuk ke website organisasi
          </p>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleLogin}
          className="login-form"
        >

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Memproses..."
              : "Login"}
          </button>

        </form>


        {/* FOOTER */}

        <div className="login-footer">

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
          >
            ← Kembali ke Website
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;