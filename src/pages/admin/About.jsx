import { useEffect, useState } from "react";

import {
  getAbout,
  saveAbout,
  uploadOrganizationPhoto,
} from "../../services/aboutService";

function About() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data organisasi
  const [name, setName] = useState("");
  const [vision, setVision] = useState("");

  const [missions, setMissions] = useState([
    "",
  ]);

  // Foto
  const [photo, setPhoto] = useState("");
  const [photoPublicId, setPhotoPublicId] =
    useState("");

  const [selectedPhoto, setSelectedPhoto] =
    useState(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      setLoading(true);

      const data = await getAbout();

      if (data) {
        setName(data.name || "");

        setVision(data.vision || "");

        setMissions(
          data.missions?.length
            ? data.missions
            : [""]
        );

        setPhoto(data.photo || "");

        setPhotoPublicId(
          data.photoPublicId || ""
        );

        setPhotoPreview(
          data.photo || ""
        );
      }
    } catch (error) {
      console.error(
        "Gagal mengambil data organisasi:",
        error
      );

      alert(
        error.message ||
          "Gagal mengambil data organisasi."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FOTO ORGANISASI
  // =====================================================

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Format foto harus JPG, PNG, atau WEBP."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "Ukuran foto maksimal 5 MB."
      );

      event.target.value = "";
      return;
    }

    // Hapus preview object URL sebelumnya
    if (
      photoPreview &&
      photoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewURL =
      URL.createObjectURL(file);

    setSelectedPhoto(file);
    setPhotoPreview(previewURL);
  };

  const removePhoto = () => {
    if (
      photoPreview &&
      photoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(photoPreview);
    }

    setSelectedPhoto(null);
    setPhoto("");
    setPhotoPublicId("");
    setPhotoPreview("");
  };

  // =====================================================
  // MISI
  // =====================================================

  const handleMissionChange = (
    index,
    value
  ) => {
    const updatedMissions = [
      ...missions,
    ];

    updatedMissions[index] = value;

    setMissions(updatedMissions);
  };

  const addMission = () => {
    setMissions([
      ...missions,
      "",
    ]);
  };

  const removeMission = (index) => {
    if (missions.length === 1) {
      setMissions([""]);
      return;
    }

    const updatedMissions =
      missions.filter(
        (_, missionIndex) =>
          missionIndex !== index
      );

    setMissions(updatedMissions);
  };

  // =====================================================
  // SIMPAN DATA
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validasi nama
    if (!name.trim()) {
      alert(
        "Nama organisasi wajib diisi."
      );
      return;
    }

    // Validasi visi
    if (!vision.trim()) {
      alert(
        "Visi organisasi wajib diisi."
      );
      return;
    }

    // Bersihkan misi kosong
    const cleanedMissions =
      missions
        .map((mission) =>
          mission.trim()
        )
        .filter(Boolean);

    // Validasi misi
    if (
      cleanedMissions.length === 0
    ) {
      alert(
        "Minimal harus ada satu misi."
      );
      return;
    }

    try {
      setSaving(true);

      let finalPhoto = photo;
      let finalPhotoPublicId =
        photoPublicId;

      // =================================================
      // UPLOAD FOTO BARU
      // =================================================

      if (selectedPhoto) {
        const uploaded =
          await uploadOrganizationPhoto(
            selectedPhoto
          );

        finalPhoto = uploaded.url;

        finalPhotoPublicId =
          uploaded.publicId;
      }

      // =================================================
      // SIMPAN FIRESTORE
      // =================================================

      await saveAbout({
        name: name.trim(),

        photo: finalPhoto,

        photoPublicId:
          finalPhotoPublicId,

        vision: vision.trim(),

        missions:
          cleanedMissions,
      });

      // Update state
      setPhoto(finalPhoto);

      setPhotoPublicId(
        finalPhotoPublicId
      );

      setSelectedPhoto(null);

      // Kalau upload foto baru,
      // preview menggunakan URL Cloudinary
      setPhotoPreview(
        finalPhoto
      );

      alert(
        "Informasi organisasi berhasil disimpan."
      );
    } catch (error) {
      console.error(
        "Gagal menyimpan informasi organisasi:",
        error
      );

      alert(
        error.message ||
          "Gagal menyimpan informasi organisasi."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-page">

        <div className="admin-page-header">
          <div>
            <h1>
              Tentang Organisasi
            </h1>

            <p>
              Kelola informasi utama
              organisasi.
            </p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-loading">
            Memuat data organisasi...
          </div>
        </div>

      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="admin-page-header">

        <div>
          <h1>
            Tentang Organisasi
          </h1>

          <p>
            Kelola informasi utama
            organisasi seperti foto,
            nama, visi, dan misi.
          </p>
        </div>

      </div>

      {/* =================================================
          FORM
          ================================================= */}

      <form
        className="admin-card"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            FOTO ORGANISASI
            ================================================= */}

        <div className="admin-form-section">

          <div className="admin-form-section-title">

            <h2>
              Foto Organisasi
            </h2>

            <p>
              Gunakan logo atau foto utama
              organisasi.
            </p>

          </div>

          <div className="about-photo-upload">

            {/* PREVIEW */}

            <div className="about-photo-preview">

              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Foto organisasi"
                />
              ) : (
                <div className="about-photo-placeholder">
                  <span>🏢</span>
                </div>
              )}

            </div>

            {/* ACTION */}

            <div className="about-photo-actions">

              <label className="admin-button primary">

                {photoPreview
                  ? "Ganti Foto"
                  : "Pilih Foto"}

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={
                    handlePhotoSelect
                  }
                  hidden
                />

              </label>

              {photoPreview && (
                <button
                  type="button"
                  className="admin-button danger"
                  onClick={removePhoto}
                >
                  Hapus Foto
                </button>
              )}

              <small>
                JPG, PNG, atau WEBP
                <br />
                Maksimal 5 MB
              </small>

            </div>

          </div>

        </div>

        {/* =================================================
            NAMA ORGANISASI
            ================================================= */}

        <div className="admin-form-section">

          <div className="admin-form-group">

            <label>
              Nama Organisasi
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Contoh: OSIS SMA Negeri 1 ..."
              required
            />

          </div>

        </div>

        {/* =================================================
            VISI
            ================================================= */}

        <div className="admin-form-section">

          <div className="admin-form-group">

            <label>
              Visi
            </label>

            <textarea
              value={vision}
              onChange={(event) =>
                setVision(
                  event.target.value
                )
              }
              placeholder="Masukkan visi organisasi..."
              rows="5"
              required
            />

          </div>

        </div>

        {/* =================================================
            MISI
            ================================================= */}

        <div className="admin-form-section">

          <div className="admin-form-section-title">

            <h2>
              Misi
            </h2>

            <p>
              Tambahkan misi organisasi
              satu per satu.
            </p>

          </div>

          <div className="about-missions">

            {missions.map(
              (mission, index) => (
                <div
                  className="about-mission-row"
                  key={index}
                >

                  <div className="about-mission-number">
                    {index + 1}
                  </div>

                  <input
                    type="text"
                    value={mission}
                    onChange={(event) =>
                      handleMissionChange(
                        index,
                        event.target.value
                      )
                    }
                    placeholder={`Misi ${
                      index + 1
                    }`}
                  />

                  <button
                    type="button"
                    className="admin-button danger"
                    onClick={() =>
                      removeMission(
                        index
                      )
                    }
                  >
                    Hapus
                  </button>

                </div>
              )
            )}

          </div>

          <button
            type="button"
            className="admin-button secondary"
            onClick={addMission}
          >
            + Tambah Misi
          </button>

        </div>

        {/* =================================================
            SIMPAN
            ================================================= */}

        <div className="admin-form-actions">

          <button
            type="submit"
            className="admin-button primary"
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default About;