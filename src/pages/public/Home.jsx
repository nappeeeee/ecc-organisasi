import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getNews } from "../../services/newsService";

import {
  getSections,
  getMembers,
} from "../../services/organizationService";

import { getAbout } from "../../services/aboutService";


function Home() {

  const [about, setAbout] = useState(null);
  const [news, setNews] = useState([]);
  const [sections, setSections] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);


  // =========================================================
  // LOAD HOME DATA
  // =========================================================

  useEffect(() => {
    loadHomeData();
  }, []);


  const loadHomeData = async () => {

    try {

      setLoading(true);


      // =====================================================
      // DATA PUBLIC
      // Tidak mengambil collection users
      // karena Home bisa diakses tanpa login
      // =====================================================

      const [
        aboutData,
        newsData,
        sectionsData,
        membersData,
      ] = await Promise.all([
        getAbout(),
        getNews(),
        getSections(),
        getMembers(),
      ]);


      // =====================================================
      // ABOUT
      // =====================================================

      setAbout(aboutData);


      // =====================================================
      // NEWS
      // =====================================================

      setNews(
        newsData
          .filter(
            (item) =>
              item.published !== false
          )
          .slice(0, 3)
      );


      // =====================================================
      // ACTIVE SECTIONS
      // =====================================================

      const activeSectionsData =
        sectionsData.filter(
          (section) =>
            section.active !== false
        );


      // =====================================================
      // ACTIVE MEMBERS
      // =====================================================

      const activeMembersData =
        membersData.filter(
          (member) =>
            member.active !== false
        );


      // =====================================================
      // MEMBER DATA
      //
      // Tidak lagi mengambil data dari users.
      //
      // Data nama, foto, email, dll menggunakan
      // data yang sudah tersedia di members.
      // =====================================================

      const membersWithData =
        activeMembersData.map(
          (member) => ({
            ...member,

            name:
              member.name ||
              member.nama ||
              "Belum diisi",

            photo:
              member.photo ||
              "",

            email:
              member.email ||
              "",
          })
        );


      setSections(
        activeSectionsData
      );

      setMembers(
        membersWithData
      );


    } catch (error) {

      console.error(
        "Gagal mengambil data halaman utama:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // DATA ORGANISASI
  // =========================================================

  const organizationName =
    about?.name ||
    "Organisasi Siswa";


  const activeSections =
    sections;


  const activeMembers =
    members;


  const memberCount =
    activeMembers.length;


  const divisionSections =
    activeSections.filter(
      (section) => {

        const name =
          section.name
            ?.toLowerCase() ||
          "";

        return (
          !name.includes("ketua") &&
          !name.includes("sekretaris") &&
          !name.includes("bendahara")
        );

      }
    );


  const divisionCount =
    divisionSections.length;


  // =========================================================
  // FIND MEMBER BY SECTION
  // =========================================================

  const findMemberBySection = (
    keyword
  ) => {

    const section =
      activeSections.find(
        (item) =>
          item.name
            ?.toLowerCase()
            .includes(keyword)
      );


    if (!section) {
      return null;
    }


    return (
      activeMembers.find(
        (member) =>
          member.sectionId ===
          section.id
      ) || null
    );

  };


  // =========================================================
  // ORGANIZATION POSITIONS
  // =========================================================

  const ketua =
    findMemberBySection("ketua") &&
    !findMemberBySection("wakil")
      ? findMemberBySection("ketua")
      : activeMembers.find(
          (member) => {

            const section =
              activeSections.find(
                (item) =>
                  item.id ===
                  member.sectionId
              );


            const sectionName =
              section?.name
                ?.toLowerCase() ||
              "";


            return (
              sectionName ===
              "ketua"
            );

          }
        );


  const wakil =
    findMemberBySection(
      "wakil"
    );


  const sekretaris =
    findMemberBySection(
      "sekretaris"
    );


  const bendahara =
    findMemberBySection(
      "bendahara"
    );


  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return "";
    }


    let actualDate;


    if (date?.toDate) {

      actualDate =
        date.toDate();

    } else {

      actualDate =
        new Date(date);

    }


    if (
      Number.isNaN(
        actualDate.getTime()
      )
    ) {

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


  // =========================================================
  // TRUNCATE TEXT
  // =========================================================

  const truncateText = (
    text,
    maxLength = 110
  ) => {

    if (!text) {
      return "";
    }


    if (
      text.length <=
      maxLength
    ) {

      return text;

    }


    return (
      text.substring(
        0,
        maxLength
      ) + "..."
    );

  };


  // =========================================================
  // MEMBER CARD
  // =========================================================

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
              alt={
                member.name ||
                label
              }
            />

          ) : (

            <div className="home-position-placeholder">

              {member?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "?"}

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


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="home">


      {/* ======================================
          HERO
      ====================================== */}

      <section className="hero">

        <div className="hero-container">

          <div className="hero-content">

            <span className="hero-badge">
              ENGLISH CONVERSATION CLUB
            </span>

            <h1>
              Welcome to English Conversation Club!{" "}
              <span>✨</span>
            </h1>

            <p>
              ECC is a place where English meets creativity, confidence,
              friendship, and new experiences. As an English extracurricular
              at SMA Negeri 5 Purwokerto, ECC brings students together to
              explore English in a fun, active, and meaningful way.
            </p>

            <p>
              Here, English is not limited to textbooks and classrooms.
              We learn through conversations, discussions, games, debates,
              creative projects, and activities that encourage members to
              think, speak, collaborate, and express themselves.
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
    VISION & MISSIONS
====================================== */}

{(about?.vision ||
  (about?.missions &&
    about.missions.filter(
      (mission) =>
        mission &&
        mission.trim() !== ""
    ).length > 0)) && (

  <section className="home-about-values">

    <div className="home-about-values-container">

      {/* ==================================
          VISION
      ================================== */}

      {about?.vision && (

        <div className="home-vision">

          <div className="home-vision-icon">
            🎯
          </div>

          <div className="home-vision-content">

            <span className="section-label">
              VISI ORGANISASI
            </span>

            <h2>
              {about.vision}
            </h2>

          </div>

        </div>

      )}


      {/* ==================================
          MISSIONS
      ================================== */}

            {about?.missions &&
              about.missions.filter(
                (mission) =>
                  mission &&
                  mission.trim() !== ""
              ).length > 0 && (

                <div className="home-missions">

                  <div className="home-missions-header">

                    <div className="home-missions-icon">
                      📋
                    </div>

                    <div>

                      <span className="section-label">
                        MISI ORGANISASI
                      </span>

                      <h2>
                        Misi Kami
                      </h2>

                    </div>

                  </div>


                  <div className="home-missions-list">

                    {about.missions
                      .filter(
                        (mission) =>
                          mission &&
                          mission.trim() !== ""
                      )
                      .map(
                        (mission, index) => (

                          <div
                            className="home-mission-item"
                            key={index}
                          >

                            <div className="home-mission-number">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <p>
                              {mission}
                            </p>

                          </div>

                        )
                      )}

                  </div>

                </div>

              )}

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