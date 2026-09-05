import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getNews } from "../../services/newsService";
import {
  getSections,
  getMembers,
} from "../../services/organizationService";
import { getAbout } from "../../services/aboutService";
import { getAllUsers } from "../../services/memberService";

function Home() {
  const [about, setAbout] = useState(null);
  const [news, setNews] = useState([]);
  const [sections, setSections] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
  try {
    setLoading(true);

    const [
      aboutData,
      newsData,
      sectionsData,
      membersData,
      usersData,
    ] = await Promise.all([
      getAbout(),
      getNews(),
      getSections(),
      getMembers(),
      getAllUsers(),
    ]);

    setAbout(aboutData);

    setNews(
      newsData
        .filter((item) => item.published !== false)
        .slice(0, 3)
    );

    const activeSectionsData = sectionsData.filter(
      (section) => section.active !== false
    );

    const activeMembersData = membersData.filter(
      (member) => member.active !== false
    );

    // ==========================================
    // GABUNGKAN DATA MEMBER DENGAN DATA USERS
    // FOTO DIAMBIL DARI users/{uid}
    // ==========================================

    const userMap = new Map();

    usersData.forEach((user) => {
      if (user.uid) {
        userMap.set(user.uid, user);
      } else if (user.id) {
        userMap.set(user.id, user);
      }
    });

    const membersWithUserData =
      activeMembersData.map((member) => {
        const user = member.uid
          ? userMap.get(member.uid)
          : null;

        return {
          ...member,

          // Nama tetap menggunakan data organisasi,
          // jika kosong ambil dari users
          name:
            member.name ||
            user?.name ||
            user?.displayName ||
            "Belum diisi",

          // Foto SELALU ambil dari akun users
          photo: user?.photo || "",

          email:
            member.email ||
            user?.email ||
            "",
        };
      });

    setSections(activeSectionsData);
    setMembers(membersWithUserData);
  } catch (error) {
    console.error(
      "Gagal mengambil data halaman utama:",
      error
    );
  } finally {
    setLoading(false);
  }
};

  // =========================
  // DATA ORGANISASI
  // =========================

  const organizationName =
    about?.name || "Organisasi Siswa";

  const activeSections = sections;

  const activeMembers = members;

  const memberCount = activeMembers.length;

  const divisionSections =
    activeSections.filter((section) => {
      const name =
        section.name?.toLowerCase() || "";

      return (
        !name.includes("ketua") &&
        !name.includes("sekretaris") &&
        !name.includes("bendahara")
      );
    });

  const divisionCount =
    divisionSections.length;

  const findMemberBySection = (
    keyword
  ) => {
    const section = activeSections.find(
      (item) =>
        item.name
          ?.toLowerCase()
          .includes(keyword)
    );

    if (!section) return null;

    return (
      activeMembers.find(
        (member) =>
          member.sectionId === section.id
      ) || null
    );
  };

  const ketua =
    findMemberBySection("ketua") &&
    !findMemberBySection("wakil")
      ? findMemberBySection("ketua")
      : activeMembers.find((member) => {
          const section =
            activeSections.find(
              (item) =>
                item.id === member.sectionId
            );

          const sectionName =
            section?.name?.toLowerCase() || "";

          return (
            sectionName === "ketua"
          );
        });

  const wakil =
    findMemberBySection("wakil");

  const sekretaris =
    findMemberBySection("sekretaris");

  const bendahara =
    findMemberBySection("bendahara");

  // =========================
  // FORMAT TANGGAL
  // =========================

  const formatDate = (date) => {
    if (!date) return "";

    let actualDate;

    if (date?.toDate) {
      actualDate = date.toDate();
    } else {
      actualDate = new Date(date);
    }

    if (Number.isNaN(actualDate.getTime())) {
      return "";
    }

    return actualDate.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const truncateText = (
    text,
    maxLength = 110
  ) => {
    if (!text) return "";

    if (text.length <= maxLength) {
      return text;
    }

    return (
      text.substring(0, maxLength) +
      "..."
    );
  };

  // =========================
  // MEMBER CARD
  // =========================

  const renderPosition = (
    label,
    member
  ) => {
    return (
      <div className="home-position">

        <div className="home-position-photo">

          {member?.photo ? (
            <img
              src={member.photo}
              alt={member.name}
            />
          ) : (
            <div className="home-position-placeholder">
              {member?.name
                ?.charAt(0)
                ?.toUpperCase() || "?"}
            </div>
          )}

        </div>

        <div className="home-position-info">

          <strong>
            {label}
          </strong>

          <span>
            {member?.name ||
              "Belum diisi"}
          </span>

        </div>

      </div>
    );
  };

  return (
    <div className="home">

      {/* ======================================
          HERO
      ====================================== */}

      <section className="hero">

        <div className="hero-container">

          <div className="hero-content">

            <span className="hero-badge">
              ORGANISASI SISWA
            </span>

            <h1>
              Bersama Membangun
              <span>
                {" "}
                Generasi Berprestasi
              </span>
            </h1>

            <p>
              Selamat datang di website resmi{" "}
              <strong>
                {organizationName}
              </strong>
              . Temukan informasi terbaru,
              struktur organisasi, kegiatan,
              dan berbagai informasi lainnya
              di sini.
            </p>

            <div className="hero-buttons">

              <Link
                to="/organization"
                className="btn-primary"
              >
                Lihat Struktur
              </Link>

              <Link
                to="/news"
                className="btn-secondary"
              >
                Lihat Berita
              </Link>

            </div>

          </div>


          <div className="hero-visual">

            <div className="hero-visual-main">

              {about?.photo ? (
                <img
                  src={about.photo}
                  alt={organizationName}
                />
              ) : (
                <div className="hero-visual-placeholder">
                  🏢
                </div>
              )}

            </div>

            <div className="hero-floating-card">

              <div className="hero-floating-icon">
                👥
              </div>

              <div>
                <strong>
                  {memberCount || "0"}+
                </strong>

                <span>
                  Anggota Aktif
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          STATISTICS
      ====================================== */}

      <section className="statistics">

        <div className="statistics-container">

          <div className="stat-item">

            <strong>
              {memberCount}+
            </strong>

            <span>
              Anggota
            </span>

          </div>


          <div className="stat-item">

            <strong>
              {news.length}+
            </strong>

            <span>
              Berita Terbaru
            </span>

          </div>


          <div className="stat-item">

            <strong>
              {divisionCount}
            </strong>

            <span>
              Divisi
            </span>

          </div>


          <div className="stat-item">

            <strong>
              2026
            </strong>

            <span>
              Periode
            </span>

          </div>

        </div>

      </section>


      {/* ======================================
          NEWS
      ====================================== */}

      <section className="section">

        <div className="section-header">

          <div>

            <span className="section-label">
              INFORMASI TERBARU
            </span>

            <h2>
              Berita Terbaru
            </h2>

            <p>
              Informasi dan kegiatan terbaru
              dari {organizationName}.
            </p>

          </div>

          <Link
            to="/news"
            className="view-all"
          >
            Lihat Semua →
          </Link>

        </div>


        {loading ? (

          <div className="home-loading">
            Memuat berita...
          </div>

        ) : news.length > 0 ? (

          <div className="news-grid">

            {news.map((item) => (

              <article
                className="news-card"
                key={item.id}
              >

                <div className="news-image">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                    />
                  ) : (
                    <div className="news-image-placeholder">
                      📰
                    </div>
                  )}

                </div>


                <div className="news-content">

                  <span className="news-date">
                    {formatDate(
                      item.createdAt
                    )}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {truncateText(
                      item.content
                    )}
                  </p>

                  <Link
                    to={`/news/${item.id}`}
                    className="read-more"
                  >
                    Baca Selengkapnya →
                  </Link>

                </div>

              </article>

            ))}

          </div>

        ) : (

          <div className="home-empty">
            Belum ada berita yang dipublikasikan.
          </div>

        )}

      </section>


      {/* ======================================
          ORGANIZATION PREVIEW
      ====================================== */}

      <section className="organization-preview">

        <div className="organization-container">

          <div className="organization-text">

            <span className="section-label">
              STRUKTUR ORGANISASI
            </span>

            <h2>
              Kenali Struktur
              Organisasi Kami
            </h2>

            <p>
              Kenali siapa saja yang menjadi
              bagian dari {organizationName}
              dan bagaimana struktur
              kepengurusan organisasi pada
              periode ini.
            </p>

            <Link
              to="/organization"
              className="btn-primary"
            >
              Lihat Struktur Organisasi
            </Link>

          </div>


          <div className="organization-tree">

            {renderPosition(
              "Ketua",
              ketua
            )}

            <div className="tree-line"></div>


            <div className="position-row">

              {renderPosition(
                "Wakil Ketua",
                wakil
              )}

              {renderPosition(
                "Sekretaris",
                sekretaris
              )}

              {renderPosition(
                "Bendahara",
                bendahara
              )}

            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          VISION
      ====================================== */}

      {about?.vision && (

        <section className="home-vision">

          <div className="home-vision-container">

            <div className="home-vision-icon">
              🎯
            </div>

            <div>

              <span className="section-label">
                VISI ORGANISASI
              </span>

              <h2>
                {about.vision}
              </h2>

            </div>

          </div>

        </section>

      )}


      {/* ======================================
          CTA
      ====================================== */}

      <section className="cta">

        <div className="cta-container">

          <span className="section-label">
            BERGABUNG BERSAMA KAMI
          </span>

          <h2>
            Ingin mengetahui
            lebih banyak?
          </h2>

          <p>
            Login sebagai anggota untuk
            mendapatkan akses ke informasi
            organisasi.
          </p>

          <Link
            to="/login"
            className="cta-button"
          >
            Login Anggota
          </Link>

        </div>

      </section>

    </div>
  );
}

export default Home;