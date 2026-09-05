import { useEffect, useMemo, useRef, useState } from "react";

import {
  createNews,
  getNews,
  updateNews,
  deleteNews,
  uploadNewsImage,
} from "../../services/newsService";

function News() {
  const fileInputRef = useRef(null);

  const [news, setNews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [editingNews, setEditingNews] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [filterCategory, setFilterCategory] =
    useState("Semua");

  const [filterStatus, setFilterStatus] =
    useState("Semua");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    imagePublicId: "",
    category: "Umum",
    author: "Admin",
    published: true,
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD NEWS
  |--------------------------------------------------------------------------
  */

  const loadNews = async () => {
    try {
      setLoading(true);

      setError("");

      const data = await getNews();

      setNews(data);
    } catch (error) {
      console.error(
        "Gagal mengambil berita:",
        error
      );

      setError(
        error.message ||
          "Gagal mengambil data berita."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      let jsDate;

      if (date?.toDate) {
        jsDate = date.toDate();
      } else if (date instanceof Date) {
        jsDate = date;
      } else {
        jsDate = new Date(date);
      }

      if (Number.isNaN(jsDate.getTime())) {
        return "-";
      }

      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ).format(jsDate);
    } catch {
      return "-";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | RESET FORM
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image: "",
      imagePublicId: "",
      category: "Umum",
      author: "Admin",
      published: true,
    });

    setSelectedFile(null);

    setImagePreview("");

    setEditingNews(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ADD
  |--------------------------------------------------------------------------
  */

  const handleAdd = () => {
    resetForm();

    setError("");

    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const handleEdit = (item) => {
    setEditingNews(item);

    setFormData({
      title: item.title || "",

      content: item.content || "",

      image: item.image || "",

      imagePublicId:
        item.imagePublicId || "",

      category:
        item.category || "Umum",

      author:
        item.author || "Admin",

      published:
        item.published ?? true,
    });

    setSelectedFile(null);

    setImagePreview(
      item.image || ""
    );

    setError("");

    setSuccess("");

    setShowForm(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | CANCEL
  |--------------------------------------------------------------------------
  */

  const handleCancel = () => {
    setShowForm(false);

    resetForm();

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE SELECT
  |--------------------------------------------------------------------------
  */

  const handleImageSelect = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Format gambar harus JPG, PNG, atau WEBP."
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Ukuran gambar maksimal 5 MB."
      );

      event.target.value = "";

      return;
    }

    setSelectedFile(file);

    const previewURL =
      URL.createObjectURL(file);

    setImagePreview(previewURL);
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE IMAGE
  |--------------------------------------------------------------------------
  */

  const handleRemoveImage = () => {
    setSelectedFile(null);

    setImagePreview("");

    /*
     * Saat gambar dihapus dari form,
     * kita kosongkan URL.
     */

    setFormData((previous) => ({
      ...previous,
      image: "",
      imagePublicId: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccess("");

    if (!formData.title.trim()) {
      setError(
        "Judul berita wajib diisi."
      );

      return;
    }

    if (!formData.content.trim()) {
      setError(
        "Isi berita wajib diisi."
      );

      return;
    }

    if (!formData.author.trim()) {
      setError(
        "Nama penulis wajib diisi."
      );

      return;
    }

    try {
      setSaving(true);

      let imageURL =
        formData.image || "";

      let imagePublicId =
        formData.imagePublicId || "";

      /*
      |--------------------------------------------------------------------------
      | UPLOAD IMAGE
      |--------------------------------------------------------------------------
      */

      if (selectedFile) {
        setUploadingImage(true);

        try {
          const uploaded =
            await uploadNewsImage(
              selectedFile
            );

          imageURL =
            uploaded.url;

          imagePublicId =
            uploaded.publicId;
        } catch (uploadError) {
          console.error(
            "Gagal upload:",
            uploadError
          );

          throw uploadError;
        } finally {
          setUploadingImage(false);
        }
      }

      /*
      |--------------------------------------------------------------------------
      | DATA
      |--------------------------------------------------------------------------
      */

      const cleanData = {
        title:
          formData.title.trim(),

        content:
          formData.content.trim(),

        image: imageURL,

        imagePublicId,

        category:
          formData.category,

        author:
          formData.author.trim(),

        published:
          formData.published,
      };

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      if (editingNews) {
        await updateNews(
          editingNews.id,
          cleanData
        );

        setSuccess(
          "Berita berhasil diperbarui."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */

      else {
        await createNews(
          cleanData
        );

        setSuccess(
          "Berita berhasil ditambahkan."
        );
      }

      setShowForm(false);

      resetForm();

      await loadNews();

    } catch (error) {
      console.error(
        "Gagal menyimpan berita:",
        error
      );

      setError(
        error.message ||
          "Gagal menyimpan berita."
      );
    } finally {
      setSaving(false);

      setUploadingImage(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (item) => {
    const confirmed =
      window.confirm(
        `Apakah Anda yakin ingin menghapus berita "${item.title}"?\n\nData berita akan dihapus secara permanen.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      await deleteNews(
        item.id
      );

      setSuccess(
        "Berita berhasil dihapus."
      );

      await loadNews();

    } catch (error) {
      console.error(
        "Gagal menghapus berita:",
        error
      );

      setError(
        error.message ||
          "Gagal menghapus berita."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      const matchesSearch =
        !keyword ||
        item.title
          ?.toLowerCase()
          .includes(keyword) ||
        item.author
          ?.toLowerCase()
          .includes(keyword);

      const matchesCategory =
        filterCategory ===
          "Semua" ||
        item.category ===
          filterCategory;

      const matchesStatus =
        filterStatus ===
          "Semua" ||
        (
          filterStatus ===
            "Publikasi" &&
          item.published === true
        ) ||
        (
          filterStatus ===
            "Draft" &&
          item.published === false
        );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    news,
    search,
    filterCategory,
    filterStatus,
  ]);

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const totalNews =
    news.length;

  const publishedNews =
    news.filter(
      (item) =>
        item.published === true
    ).length;

  const draftNews =
    news.filter(
      (item) =>
        item.published === false
    ).length;

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="admin-page">

        <div className="admin-page-header">

          <div>

            <span className="admin-page-eyebrow">
              CONTENT MANAGEMENT
            </span>

            <h1>
              Berita
            </h1>

            <p>
              Kelola berita organisasi
              dari sini.
            </p>

          </div>

        </div>

        <div className="admin-loading-card">

          <div className="admin-loading-spinner"></div>

          <span>
            Memuat data berita...
          </span>

        </div>

      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-page-header news-page-header">

        <div>

          <span className="admin-page-eyebrow">
            CONTENT MANAGEMENT
          </span>

          <h1>
            Berita
          </h1>

          <p>
            Kelola berita organisasi
            yang tampil di website utama.
          </p>

        </div>

        {!showForm && (
          <button
            type="button"
            className="admin-primary-button"
            onClick={handleAdd}
          >
            <span className="button-icon">
              +
            </span>

            Tambah Berita
          </button>
        )}

      </div>

      {/* ERROR */}

      {error && (
        <div className="admin-alert error">

          <span className="alert-icon">
            !
          </span>

          <div>

            <strong>
              Terjadi kesalahan
            </strong>

            <p>
              {error}
            </p>

          </div>

          <button
            type="button"
            className="alert-close"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="admin-alert success">

          <span className="alert-icon">
            ✓
          </span>

          <div>

            <strong>
              Berhasil
            </strong>

            <p>
              {success}
            </p>

          </div>

          <button
            type="button"
            className="alert-close"
            onClick={() =>
              setSuccess("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* FORM */}

      {showForm ? (

        <div className="news-form-card">

          <div className="news-form-title">

            <div className="news-form-title-icon">
              📰
            </div>

            <div>

              <h2>
                {editingNews
                  ? "Edit Berita"
                  : "Tambah Berita"}
              </h2>

              <p>
                {editingNews
                  ? "Perbarui informasi berita."
                  : "Buat berita baru untuk website."}
              </p>

            </div>

          </div>

          <form
            className="news-form"
            onSubmit={handleSubmit}
          >

            {/* TITLE + CATEGORY */}

            <div className="news-form-grid">

              <div className="admin-form-group">

                <label htmlFor="title">
                  Judul Berita
                  <span>*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Masukkan judul berita..."
                  maxLength={150}
                />

              </div>

              <div className="admin-form-group">

                <label htmlFor="category">
                  Kategori
                  <span>*</span>
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Umum">
                    Umum
                  </option>

                  <option value="Kegiatan">
                    Kegiatan
                  </option>

                  <option value="Pengumuman">
                    Pengumuman
                  </option>

                  <option value="Prestasi">
                    Prestasi
                  </option>
                </select>

              </div>

            </div>

            {/* AUTHOR */}

            <div className="admin-form-group">

              <label htmlFor="author">
                Penulis
                <span>*</span>
              </label>

              <input
                id="author"
                name="author"
                type="text"
                value={formData.author}
                onChange={handleChange}
                placeholder="Nama penulis..."
              />

            </div>

            {/* IMAGE */}

            <div className="admin-form-group">

              <label>
                Gambar Berita
              </label>

              <div className="news-upload-area">

                {imagePreview ? (

                  <div className="news-upload-preview">

                    <img
                      src={imagePreview}
                      alt="Preview berita"
                    />

                    <div className="news-upload-overlay">

                      <button
                        type="button"
                        className="news-change-image"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        disabled={saving}
                      >
                        Ganti Gambar
                      </button>

                      <button
                        type="button"
                        className="news-remove-image"
                        onClick={handleRemoveImage}
                        disabled={saving}
                      >
                        Hapus Gambar
                      </button>

                    </div>

                  </div>

                ) : (

                  <button
                    type="button"
                    className="news-upload-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={saving}
                  >

                    <div className="news-upload-icon">
                      📷
                    </div>

                    <strong>
                      Pilih Gambar dari PC
                    </strong>

                    <span>
                      JPG, PNG, WEBP
                    </span>

                    <small>
                      Maksimal 5 MB
                    </small>

                  </button>

                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  style={{
                    display: "none",
                  }}
                />

              </div>

              {selectedFile && (
                <div className="news-selected-file">

                  <span>
                    ✓
                  </span>

                  <div>

                    <strong>
                      {selectedFile.name}
                    </strong>

                    <small>
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </small>

                  </div>

                </div>
              )}

              <small>
                Gambar akan diupload
                otomatis ke Cloudinary.
              </small>

            </div>

            {/* CONTENT */}

            <div className="admin-form-group">

              <label htmlFor="content">
                Isi Berita
                <span>*</span>
              </label>

              <textarea
                id="content"
                name="content"
                rows="14"
                value={formData.content}
                onChange={handleChange}
                placeholder="Tulis isi berita di sini..."
              />

            </div>

            {/* PUBLISH */}

            <div className="news-publish-box">

              <div>

                <strong>
                  Status Publikasi
                </strong>

                <p>
                  Tentukan apakah berita
                  langsung tampil di website.
                </p>

              </div>

              <label className="news-switch">

                <input
                  type="checkbox"
                  name="published"
                  checked={
                    formData.published
                  }
                  onChange={handleChange}
                />

                <span className="news-switch-slider"></span>

                <span className="news-switch-text">
                  {formData.published
                    ? "Dipublikasikan"
                    : "Draft"}
                </span>

              </label>

            </div>

            {/* BUTTON */}

            <div className="news-form-actions">

              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Batal
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >

                {saving ? (

                  <>
                    <span className="button-spinner"></span>

                    {uploadingImage
                      ? "Mengupload gambar..."
                      : "Menyimpan..."}
                  </>

                ) : (

                  <>
                    <span>
                      {editingNews
                        ? "✓"
                        : "+"}
                    </span>

                    {editingNews
                      ? "Simpan Perubahan"
                      : "Simpan Berita"}
                  </>

                )}

              </button>

            </div>

          </form>

        </div>

      ) : (

        <>
          {/* STAT */}

          <div className="news-stat-grid">

            <div className="news-stat-card">

              <div className="news-stat-icon total">
                📰
              </div>

              <div>

                <span>
                  Total Berita
                </span>

                <strong>
                  {totalNews}
                </strong>

              </div>

            </div>

            <div className="news-stat-card">

              <div className="news-stat-icon published">
                ✓
              </div>

              <div>

                <span>
                  Dipublikasi
                </span>

                <strong>
                  {publishedNews}
                </strong>

              </div>

            </div>

            <div className="news-stat-card">

              <div className="news-stat-icon draft">
                ◷
              </div>

              <div>

                <span>
                  Draft
                </span>

                <strong>
                  {draftNews}
                </strong>

              </div>

            </div>

          </div>

          {/* TOOLBAR */}

          <div className="news-toolbar">

            <div className="news-search">

              <span className="news-search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Cari judul atau penulis..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  className="news-search-clear"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            <div className="news-filters">

              <select
                value={filterCategory}
                onChange={(event) =>
                  setFilterCategory(
                    event.target.value
                  )
                }
              >
                <option value="Semua">
                  Semua Kategori
                </option>

                <option value="Umum">
                  Umum
                </option>

                <option value="Kegiatan">
                  Kegiatan
                </option>

                <option value="Pengumuman">
                  Pengumuman
                </option>

                <option value="Prestasi">
                  Prestasi
                </option>

              </select>

              <select
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(
                    event.target.value
                  )
                }
              >
                <option value="Semua">
                  Semua Status
                </option>

                <option value="Publikasi">
                  Dipublikasi
                </option>

                <option value="Draft">
                  Draft
                </option>

              </select>

            </div>

          </div>

          {/* TABLE */}

          <div className="news-table-card">

            <div className="news-table-header">

              <div>

                <h2>
                  Daftar Berita
                </h2>

                <p>
                  {filteredNews.length} berita
                  ditemukan
                </p>

              </div>

            </div>

            {filteredNews.length === 0 ? (

              <div className="news-empty-state">

                <div className="news-empty-icon">
                  📰
                </div>

                <h3>
                  {news.length === 0
                    ? "Belum Ada Berita"
                    : "Berita Tidak Ditemukan"}
                </h3>

                <p>
                  {news.length === 0
                    ? "Belum ada berita yang ditambahkan."
                    : "Coba ubah pencarian atau filter."}
                </p>

                {news.length === 0 && (
                  <button
                    type="button"
                    className="admin-primary-button"
                    onClick={handleAdd}
                  >
                    + Tambah Berita
                  </button>
                )}

              </div>

            ) : (

              <div className="news-table-wrapper">

                <table className="news-table">

                  <thead>

                    <tr>

                      <th>
                        Berita
                      </th>

                      <th>
                        Kategori
                      </th>

                      <th>
                        Penulis
                      </th>

                      <th>
                        Tanggal
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredNews.map(
                      (item) => (

                        <tr
                          key={item.id}
                        >

                          <td>

                            <div className="news-table-title">

                              <div className="news-table-image">

                                {item.image ? (

                                  <img
                                    src={item.image}
                                    alt={item.title}
                                  />

                                ) : (

                                  <span>
                                    📰
                                  </span>

                                )}

                              </div>

                              <div>

                                <strong
                                  title={item.title}
                                >
                                  {item.title}
                                </strong>

                                <span>
                                  ID:{" "}
                                  {item.id.slice(
                                    0,
                                    8
                                  )}
                                </span>

                              </div>

                            </div>

                          </td>

                          <td>

                            <span className="news-category">
                              {item.category ||
                                "Umum"}
                            </span>

                          </td>

                          <td>

                            <span className="news-author">
                              {item.author ||
                                "Admin"}
                            </span>

                          </td>

                          <td>

                            <span className="news-date">
                              {formatDate(
                                item.createdAt
                              )}
                            </span>

                          </td>

                          <td>

                            {item.published ? (

                              <span className="news-status published">

                                <span></span>

                                Dipublikasi

                              </span>

                            ) : (

                              <span className="news-status draft">

                                <span></span>

                                Draft

                              </span>

                            )}

                          </td>

                          <td>

                            <div className="news-actions">

                              <button
                                type="button"
                                className="news-action edit"
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                                disabled={
                                  saving
                                }
                                title="Edit berita"
                              >
                                ✎
                              </button>

                              <button
                                type="button"
                                className="news-action delete"
                                onClick={() =>
                                  handleDelete(
                                    item
                                  )
                                }
                                disabled={
                                  saving
                                }
                                title="Hapus berita"
                              >
                                🗑
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}

export default News;