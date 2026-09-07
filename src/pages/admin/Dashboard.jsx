import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  getMembersWithAttendance,
} from "../../services/memberService";

import { db } from "../../firebase/config";

import { useAuth } from "../../context/AuthContext";


function Dashboard() {

  const { userData } = useAuth();


  // =========================================================
  // STATE
  // =========================================================

  const [totalMembers, setTotalMembers] =
    useState(0);

  const [totalNews, setTotalNews] =
    useState(0);

  const [totalOrganization, setTotalOrganization] =
    useState(0);

  const [loading, setLoading] =
    useState(true);


  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  const loadDashboardData = async () => {

    try {

      setLoading(true);


      // =====================================================
      // TOTAL ANGGOTA
      // Menggunakan fungsi yang sama dengan Members.jsx
      // =====================================================

      const members =
        await getMembersWithAttendance();

      setTotalMembers(
        members.length
      );


      // =====================================================
      // TOTAL BERITA
      // =====================================================

      const newsSnapshot =
        await getDocs(
          collection(
            db,
            "news"
          )
        );

      setTotalNews(
        newsSnapshot.size
      );


      // =====================================================
      // TOTAL STRUKTUR
      // =====================================================

      const organizationSnapshot =
        await getDocs(
          collection(
            db,
            "organization"
          )
        );

      setTotalOrganization(
        organizationSnapshot.size
      );


    } catch (error) {

      console.error(
        "Gagal mengambil data dashboard:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // LOAD DATA SAAT DASHBOARD DIBUKA
  // =========================================================

  useEffect(() => {

    loadDashboardData();

  }, []);


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="dashboard-page">


      {/* =====================================================
          WELCOME
      ===================================================== */}

      <div className="dashboard-welcome">

        <div>

          <span className="dashboard-label">
            ADMIN PANEL
          </span>


          <h2>

            Selamat datang,{" "}

            {userData?.name ||
              "Administrator"} 👋

          </h2>


          <p>

            Kelola akun, berita, dan struktur organisasi
            melalui panel administrator.

          </p>

        </div>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="dashboard-stats">


        {/* ===================================================
            TOTAL ANGGOTA
        =================================================== */}

        <div className="dashboard-stat-card">

          <div className="stat-icon">
            👥
          </div>


          <div>

            <span>
              Total Anggota
            </span>


            <strong>

              {loading
                ? "..."
                : totalMembers}

            </strong>

          </div>

        </div>


        {/* ===================================================
            TOTAL BERITA
        =================================================== */}

        <div className="dashboard-stat-card">

          <div className="stat-icon">
            📰
          </div>


          <div>

            <span>
              Total Berita
            </span>


            <strong>

              {loading
                ? "..."
                : totalNews}

            </strong>

          </div>

        </div>


      </div> 

    </div>

  );

}


export default Dashboard;