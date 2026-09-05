import { useEffect, useState } from "react";
import { getAbout } from "../../services/aboutService";

function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAbout();

      setAbout(data);
    } catch (err) {
      console.error(
        "Gagal mengambil data tentang organisasi:",
        err
      );

      setError(
        "Gagal memuat informasi organisasi."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="about-page">
        <section className="page-header">
          <div className="page-header-container">
            <span>TENTANG ORGANISASI</span>

            <h1>Tentang Kami</h1>

            <p>
              Mengenal lebih dekat organisasi siswa,
              visi, misi, dan tujuan kami.
            </p>
          </div>
        </section>

        <section className="about-introduction">
          <div className="about-introduction-container">
            <div className="about-loading">
              Memuat informasi organisasi...
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="about-page">
        <section className="page-header">
          <div className="page-header-container">
            <span>TENTANG ORGANISASI</span>

            <h1>Tentang Kami</h1>

            <p>
              Mengenal lebih dekat organisasi siswa,
              visi, misi, dan tujuan kami.
            </p>
          </div>
        </section>

        <section className="about-introduction">
          <div className="about-introduction-container">
            <div className="about-error">
              {error}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const organizationName =
    about?.name || "Organisasi Siswa";

  const organizationPhoto =
    about?.photo || "";

  const vision =
    about?.vision ||
    "Visi organisasi belum tersedia.";

  const missions =
    Array.isArray(about?.missions)
      ? about.missions
      : [];

  return (
    <div className="about-page">

      {/* HEADER */}
      <section className="page-header">
        <div className="page-header-container">

          <span>
            TENTANG ORGANISASI
          </span>

          <h1>
            Tentang Kami
          </h1>

          <p>
            Mengenal lebih dekat{" "}
            {organizationName},
            visi, misi, dan tujuan kami.
          </p>

        </div>
      </section>


      {/* INTRODUCTION */}
      <section className="about-introduction">

        <div className="about-introduction-container">

          {/* FOTO ORGANISASI */}
          <div className="about-image">

            {organizationPhoto ? (
              <img
                src={organizationPhoto}
                alt={organizationName}
              />
            ) : (
              <div className="about-image-placeholder">
                <span>🏢</span>

                <p>
                  Foto Organisasi
                </p>
              </div>
            )}

          </div>


          {/* INFORMASI ORGANISASI */}
          <div className="about-content">

            <span className="section-label">
              TENTANG ORGANISASI
            </span>

            <h2>
              {organizationName}
            </h2>

            <p>
              Organisasi siswa merupakan wadah
              bagi siswa untuk mengembangkan
              potensi, kreativitas, kepemimpinan,
              dan kemampuan bekerja sama.
            </p>

            <p>
              Melalui berbagai kegiatan dan
              program kerja,{" "}
              {organizationName} berusaha
              memberikan kontribusi positif bagi
              lingkungan sekolah serta menjadi
              tempat bagi siswa untuk belajar
              berorganisasi secara aktif.
            </p>

          </div>

        </div>

      </section>


      {/* VISI MISI */}
      <section className="vision-mission">

        <div className="vision-mission-container">

          {/* VISI */}
          <div className="vision-card">

            <div className="about-icon">
              🎯
            </div>

            <span className="section-label">
              VISI
            </span>

            <h2>
              {vision}
            </h2>

            <p>
              Visi menjadi landasan utama dalam
              menentukan arah dan tujuan
              organisasi.
            </p>

          </div>


          {/* MISI */}
          <div className="mission-card">

            <div className="about-icon">
              🚀
            </div>

            <span className="section-label">
              MISI
            </span>

            {missions.length > 0 ? (
              <ul>
                {missions.map(
                  (mission, index) => (
                    <li key={index}>
                      {mission}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                Misi organisasi belum tersedia.
              </p>
            )}

          </div>

        </div>

      </section>
    </div>
  );
}

export default About;