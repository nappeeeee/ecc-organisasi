import { useEffect, useState } from "react";

import {
  getSections,
  getMembers,
} from "../../services/organizationService";


function Organization() {

  const [sections, setSections] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // LOAD ORGANIZATION
  // =========================================================

  useEffect(() => {

    const loadOrganization = async () => {

      try {

        setLoading(true);
        setError("");


        // =====================================================
        // DATA PUBLIC
        //
        // Tidak lagi mengambil users karena halaman ini
        // dapat diakses tanpa login.
        // =====================================================

        const [
          sectionData,
          memberData,
        ] = await Promise.all([
          getSections(),
          getMembers(),
        ]);


        // =====================================================
        // HANYA TAMPILKAN BAGIAN AKTIF
        // =====================================================

        const activeSections =
          sectionData
            .filter(
              (section) =>
                section.active !== false
            )
            .sort(
              (a, b) =>
                (a.order || 0) -
                (b.order || 0)
            );


        // =====================================================
        // HANYA TAMPILKAN ANGGOTA AKTIF
        // =====================================================

        const activeMembers =
          memberData
            .filter(
              (member) =>
                member.active !== false
            )
            .sort(
              (a, b) =>
                (a.order || 0) -
                (b.order || 0)
            );


        // =====================================================
        // MEMBER DATA
        //
        // Tidak mengambil data dari users.
        //
        // Nama dan foto langsung menggunakan data yang
        // tersimpan di organization_members / members.
        // =====================================================

        const membersWithData =
          activeMembers.map(
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

              uid:
                member.uid ||
                "",
            })
          );


        setSections(
          activeSections
        );

        setMembers(
          membersWithData
        );


      } catch (error) {

        console.error(
          "Gagal mengambil struktur organisasi:",
          error
        );

        setError(
          "Gagal memuat struktur organisasi."
        );

      } finally {

        setLoading(false);

      }

    };


    loadOrganization();

  }, []);


  // =========================================================
  // HELPER
  // =========================================================

  const getMembersBySection = (
    sectionId
  ) => {

    return members
      .filter(
        (member) =>
          member.sectionId ===
          sectionId
      )
      .sort(
        (a, b) =>
          (a.order || 0) -
          (b.order || 0)
      );

  };


  const getFirstMember = (
    sectionId
  ) => {

    const sectionMembers =
      getMembersBySection(
        sectionId
      );

    return (
      sectionMembers[0] ||
      null
    );

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="organization-page">

        <section className="page-header">

          <div className="page-header-container">

            <span>
              STRUKTUR ORGANISASI
            </span>

            <h1>
              Struktur Organisasi
            </h1>

            <p>
              Mengenal susunan kepengurusan
              organisasi siswa pada periode
              2026.
            </p>

          </div>

        </section>


        <section className="organization-section">

          <div
            className="organization-section-container"
            style={{
              textAlign: "center",
              padding: "80px 20px",
            }}
          >

            <div
              style={{
                width: "42px",
                height: "42px",
                border: "4px solid #e5e7eb",
                borderTopColor: "#6c63ff",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation:
                  "organizationSpin 0.8s linear infinite",
              }}
            />


            <p>
              Memuat struktur organisasi...
            </p>

          </div>

        </section>


        <style>
          {`
            @keyframes organizationSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>

      </div>

    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <div className="organization-page">

        <section className="page-header">

          <div className="page-header-container">

            <span>
              STRUKTUR ORGANISASI
            </span>

            <h1>
              Struktur Organisasi
            </h1>

            <p>
              Mengenal susunan kepengurusan
              organisasi siswa pada periode
              2026.
            </p>

          </div>

        </section>


        <section className="organization-section">

          <div
            className="organization-section-container"
            style={{
              textAlign: "center",
              padding: "80px 20px",
            }}
          >

            <div
              style={{
                fontSize: "50px",
                marginBottom: "20px",
              }}
            >
              🏢
            </div>


            <h2>
              Gagal Memuat Struktur
            </h2>


            <p>
              {error}
            </p>


            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>

          </div>

        </section>

      </div>

    );

  }


  // =========================================================
  // CARI BAGIAN UTAMA
  // =========================================================

  const ketuaSection =
    sections.find(
      (section) =>
        section.name
          ?.toLowerCase() ===
        "ketua"
    );


  const wakilSection =
    sections.find(
      (section) => {

        const name =
          section.name
            ?.toLowerCase() ||
          "";

        return (
          name.includes("wakil") &&
          name.includes("ketua")
        );

      }
    );


  const sekretarisSection =
    sections.find(
      (section) =>
        section.name
          ?.toLowerCase()
          .includes("sekretaris")
    );


  const bendaharaSection =
    sections.find(
      (section) =>
        section.name
          ?.toLowerCase()
          .includes("bendahara")
    );


  // =========================================================
  // BAGIAN SELAIN STRUKTUR UTAMA
  // =========================================================

  const divisionSections =
    sections.filter(
      (section) => {

        const name =
          section.name
            ?.toLowerCase() ||
          "";


        return (
          section.id !==
            ketuaSection?.id &&
          section.id !==
            wakilSection?.id &&
          section.id !==
            sekretarisSection?.id &&
          section.id !==
            bendaharaSection?.id
        );

      }
    );


  // =========================================================
  // CARD ANGGOTA
  // =========================================================

  const renderMemberCard = (
    member,
    section,
    isMain = false
  ) => {

    // =======================================================
    // BELUM ADA ANGGOTA
    // =======================================================

    if (!member) {

      return (

        <div
          className={`org-card ${
            isMain ? "main" : ""
          }`}
        >

          <div className="org-photo">

            <span>
              Foto
            </span>

          </div>


          <div className="org-info">

            <span className="org-position">

              {section?.name
                ?.toUpperCase()}

            </span>


            <h3>
              Belum Ada Anggota
            </h3>


            <p>
              {section?.name}
            </p>

          </div>

        </div>

      );

    }


    // =======================================================
    // ADA ANGGOTA
    // =======================================================

    return (

      <div
        className={`org-card ${
          isMain ? "main" : ""
        }`}
      >

        <div className="org-photo">

          {member.photo ? (

            <img
              src={member.photo}
              alt={
                member.name ||
                "Anggota"
              }
              loading="lazy"
            />

          ) : (

            <div className="org-photo-placeholder">

              {member.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "?"}

            </div>

          )}

        </div>


        <div className="org-info">

          <span className="org-position">

            {section?.name
              ?.toUpperCase()}

          </span>


          <h3>
            {member.name}
          </h3>


          <p>
            {member.position ||
              member.jabatan ||
              section?.name ||
              "Anggota"}
          </p>

        </div>

      </div>

    );

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="organization-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="page-header">

        <div className="page-header-container">

          <span>
            STRUKTUR ORGANISASI
          </span>


          <h1>
            Struktur Organisasi
          </h1>


          <p>
            Mengenal susunan kepengurusan
            organisasi siswa pada periode
            2026.
          </p>

        </div>

      </section>


      {/* =====================================================
          ORGANIZATION
      ===================================================== */}

      <section className="organization-section">

        <div className="organization-section-container">


          {/* =================================================
              KETUA
          ================================================= */}

          {ketuaSection && (

            <>

              <div className="org-level">

                {renderMemberCard(
                  getFirstMember(
                    ketuaSection.id
                  ),
                  ketuaSection,
                  true
                )}

              </div>


              {(
                wakilSection ||
                sekretarisSection ||
                bendaharaSection ||
                divisionSections.length > 0
              ) && (

                <div className="org-connector"></div>

              )}

            </>

          )}


          {/* =================================================
              WAKIL
          ================================================= */}

          {wakilSection && (

            <>

              <div className="org-level">

                {renderMemberCard(
                  getFirstMember(
                    wakilSection.id
                  ),
                  wakilSection
                )}

              </div>


              {(
                sekretarisSection ||
                bendaharaSection ||
                divisionSections.length > 0
              ) && (

                <div className="org-connector"></div>

              )}

            </>

          )}


          {/* =================================================
              SEKRETARIS & BENDAHARA
          ================================================= */}

          {(
            sekretarisSection ||
            bendaharaSection
          ) && (

            <>

              <div className="org-grid">

                {sekretarisSection && (

                  renderMemberCard(
                    getFirstMember(
                      sekretarisSection.id
                    ),
                    sekretarisSection
                  )

                )}


                {bendaharaSection && (

                  renderMemberCard(
                    getFirstMember(
                      bendaharaSection.id
                    ),
                    bendaharaSection
                  )

                )}

              </div>


              {divisionSections.length > 0 && (

                <div className="org-connector"></div>

              )}

            </>

          )}


          {/* =================================================
              DIVISI / BAGIAN LAIN
          ================================================= */}

          {divisionSections.length > 0 && (

            <>

              <div className="division-title">

                <span>
                  BIDANG / DIVISI
                </span>


                <h2>
                  Divisi Organisasi
                </h2>

              </div>


              <div className="division-grid">

                {divisionSections.map(
                  (section) => {

                    const sectionMembers =
                      getMembersBySection(
                        section.id
                      );


                    // =======================================
                    // BAGIAN MEMILIKI ANGGOTA
                    // =======================================

                    if (
                      sectionMembers.length > 0
                    ) {

                      return (

                        <div
                          className="division-group"
                          key={section.id}
                        >

                          <div className="division-group-title">

                            {section.name}

                          </div>


                          <div className="division-group-members">

                            {sectionMembers.map(
                              (member) =>
                                renderMemberCard(
                                  member,
                                  section
                                )
                            )}

                          </div>

                        </div>

                      );

                    }


                    // =======================================
                    // BAGIAN BELUM MEMILIKI ANGGOTA
                    // =======================================

                    return (

                      <div
                        className="division-group"
                        key={section.id}
                      >

                        <div className="division-group-title">

                          {section.name}

                        </div>


                        {renderMemberCard(
                          null,
                          section
                        )}

                      </div>

                    );

                  }
                )}

              </div>

            </>

          )}


          {/* =================================================
              BELUM ADA DATA
          ================================================= */}

          {sections.length === 0 && (

            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
              }}
            >

              <div
                style={{
                  fontSize: "55px",
                  marginBottom: "20px",
                }}
              >
                🏢
              </div>


              <h2>
                Struktur Organisasi
                Belum Tersedia
              </h2>


              <p>
                Data struktur organisasi
                belum ditambahkan.
              </p>

            </div>

          )}

        </div>

      </section>

    </div>

  );

}


export default Organization;