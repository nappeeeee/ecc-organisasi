import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  createAttendance,
  getMemberAttendance,
  uploadAttendanceProof,
} from "../../services/attendanceService";

function Attendance() {
  const { user, userData } = useAuth();

  const fileInputRef = useRef(null);

  const [activity, setActivity] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("hadir");
  const [description, setDescription] = useState("");

  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState("");

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // AMBIL RIWAYAT
  // =====================================================

  const loadHistory = async () => {
    if (!user?.uid) {
      setHistoryLoading(false);
      return;
    }

    try {
      setHistoryLoading(true);

      const data = await getMemberAttendance(user.uid);

      setHistory(data);
    } catch (error) {
      console.error(
        "Gagal mengambil riwayat:",
        error
      );

      setError(
        "Gagal mengambil riwayat absensi."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // =====================================================
  // PILIH FOTO BUKTI
  // =====================================================

  const handleProofChange = (event) => {
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
      setError(
        "Format foto harus JPG, PNG, atau WEBP."
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Ukuran foto maksimal 5 MB."
      );

      return;
    }

    setError("");
    setMessage("");

    setProofFile(file);

    const previewUrl = URL.createObjectURL(file);

    setProofPreview(previewUrl);
  };

  // =====================================================
  // HAPUS FOTO
  // =====================================================

  const removeProof = () => {
    setProofFile(null);
    setProofPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================================
  // GANTI TIPE ABSENSI
  // =====================================================

  const handleChangeType = (newType) => {
    setType(newType);

    setError("");
    setMessage("");

    /*
      Jika memilih Izin, foto tidak diperlukan.
      Foto sebelumnya dihapus.
    */
    if (newType === "izin") {
      removeProof();
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // ---------------------------------------------------
    // VALIDASI USER
    // ---------------------------------------------------

    if (!user?.uid) {
      setError(
        "Akun tidak ditemukan. Silakan login kembali."
      );

      return;
    }

    // ---------------------------------------------------
    // VALIDASI KEGIATAN
    // ---------------------------------------------------

    if (!activity.trim()) {
      setError(
        "Silakan masukkan nama kegiatan."
      );

      return;
    }

    // ---------------------------------------------------
    // VALIDASI TANGGAL
    // ---------------------------------------------------

    if (!date) {
      setError(
        "Silakan pilih tanggal."
      );

      return;
    }

    // ---------------------------------------------------
    // VALIDASI KETERANGAN
    // SEMUA TIPE WAJIB MEMILIKI KETERANGAN
    // ---------------------------------------------------

    if (!description.trim()) {
      if (type === "hadir") {
        setError(
          "Keterangan kehadiran wajib diisi."
        );
      } else if (type === "izin") {
        setError(
          "Keterangan izin wajib diisi."
        );
      } else if (type === "sakit") {
        setError(
          "Keterangan sakit wajib diisi."
        );
      }

      return;
    }

    // ---------------------------------------------------
    // VALIDASI FOTO HADIR
    // ---------------------------------------------------

    if (
      type === "hadir" &&
      !proofFile
    ) {
      setError(
        "Untuk pengajuan hadir, foto bukti kegiatan wajib diupload."
      );

      return;
    }

    // ---------------------------------------------------
    // VALIDASI FOTO SAKIT
    // ---------------------------------------------------

    if (
      type === "sakit" &&
      !proofFile
    ) {
      setError(
        "Untuk pengajuan sakit, foto surat dokter atau bukti sakit wajib diupload."
      );

      return;
    }

    try {
      setLoading(true);

      let proofData = {
        url: "",
        publicId: "",
      };

      // -------------------------------------------------
      // UPLOAD FOTO
      //
      // HADIR = FOTO KEGIATAN
      // SAKIT = SURAT DOKTER / BUKTI SAKIT
      // -------------------------------------------------

      if (
        (type === "hadir" ||
          type === "sakit") &&
        proofFile
      ) {
        proofData =
          await uploadAttendanceProof(
            proofFile
          );
      }

      // -------------------------------------------------
      // SIMPAN ABSENSI
      // -------------------------------------------------

      await createAttendance({
        uid: user.uid,

        name:
          userData?.name ||
          user.displayName ||
          "Anggota",

        activity:
          activity.trim(),

        date,

        type,

        description:
          description.trim(),

        proofImage:
          proofData.url,

        proofImagePublicId:
          proofData.publicId,
      });

      // -------------------------------------------------
      // BERHASIL
      // -------------------------------------------------

      setMessage(
        "Pengajuan absensi berhasil dikirim. Silakan tunggu persetujuan admin."
      );

      setActivity("");
      setDate("");
      setDescription("");
      setType("hadir");

      removeProof();

      await loadHistory();
    } catch (error) {
      console.error(
        "Gagal mengajukan absensi:",
        error
      );

      setError(
        error.message ||
          "Gagal mengirim pengajuan absensi."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT STATUS
  // =====================================================

  const getStatusLabel = (status) => {
    if (status === "approved") {
      return "Disetujui";
    }

    if (status === "rejected") {
      return "Ditolak";
    }

    return "Menunggu";
  };

  // =====================================================
  // FORMAT TIPE
  // =====================================================

  const getTypeLabel = (type) => {
    if (type === "hadir") {
      return "Hadir";
    }

    if (type === "izin") {
      return "Izin";
    }

    if (type === "sakit") {
      return "Sakit";
    }

    return type;
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="member-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="member-page-header">

        <h1>
          Absensi
        </h1>

        <p>
          Ajukan kehadiran kegiatan organisasi.
          Pengajuan akan diverifikasi oleh admin.
        </p>

      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="attendance-card">

        <div className="attendance-icon">
          📋
        </div>

        <span className="section-label">
          PENGAJUAN ABSENSI
        </span>

        <h2>
          Isi Kehadiran
        </h2>

        <p>
          Pilih jenis kehadiran kamu.
          Semua pengajuan harus disetujui admin
          sebelum tercatat sebagai absensi.
        </p>

        <form
          className="attendance-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              KEGIATAN
          ================================================= */}

          <div className="attendance-form-group">

            <label>
              Nama Kegiatan
            </label>

            <input
              type="text"
              value={activity}
              onChange={(event) =>
                setActivity(
                  event.target.value
                )
              }
              placeholder="Contoh: Rapat Organisasi"
              required
            />

          </div>

          {/* =================================================
              TANGGAL
          ================================================= */}

          <div className="attendance-form-group">

            <label>
              Tanggal
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(
                  event.target.value
                )
              }
              required
            />

          </div>

          {/* =================================================
              TIPE ABSENSI
          ================================================= */}

          <div className="attendance-form-group">

            <label>
              Jenis Kehadiran
            </label>

            <div className="attendance-type-grid">

              {/* HADIR */}

              <button
                type="button"
                className={`attendance-type ${
                  type === "hadir"
                    ? "selected hadir"
                    : ""
                }`}
                onClick={() =>
                  handleChangeType(
                    "hadir"
                  )
                }
              >

                <span>
                  🟢
                </span>

                <strong>
                  Hadir
                </strong>

                <small>
                  Hadir mengikuti kegiatan
                </small>

              </button>

              {/* IZIN */}

              <button
                type="button"
                className={`attendance-type ${
                  type === "izin"
                    ? "selected izin"
                    : ""
                }`}
                onClick={() =>
                  handleChangeType(
                    "izin"
                  )
                }
              >

                <span>
                  🟡
                </span>

                <strong>
                  Izin
                </strong>

                <small>
                  Tidak dapat hadir dengan alasan
                </small>

              </button>

              {/* SAKIT */}

              <button
                type="button"
                className={`attendance-type ${
                  type === "sakit"
                    ? "selected sakit"
                    : ""
                }`}
                onClick={() =>
                  handleChangeType(
                    "sakit"
                  )
                }
              >

                <span>
                  🔴
                </span>

                <strong>
                  Sakit
                </strong>

                <small>
                  Tidak hadir karena sakit
                </small>

              </button>

            </div>

          </div>

          {/* =================================================
              KETERANGAN
              SEMUA TIPE ABSENSI
          ================================================= */}

          <div className="attendance-form-group">

            <label>
              {type === "hadir"
                ? "Keterangan Kehadiran"
                : type === "izin"
                ? "Keterangan Izin"
                : "Keterangan Sakit"}
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder={
                type === "hadir"
                  ? "Contoh: Mengikuti kegiatan dari awal sampai selesai..."
                  : type === "izin"
                  ? "Jelaskan alasan izin..."
                  : "Jelaskan kondisi atau alasan sakit..."
              }
              rows="4"
              required
            />

            <small className="attendance-help">
              {type === "hadir"
                ? "Jelaskan secara singkat keikutsertaan kamu dalam kegiatan."
                : type === "izin"
                ? "Jelaskan alasan kamu tidak dapat mengikuti kegiatan."
                : "Jelaskan kondisi atau alasan kamu tidak dapat mengikuti kegiatan."}
            </small>

          </div>

          {/* =================================================
              FOTO BUKTI HADIR
          ================================================= */}

          {type === "hadir" && (

            <div className="attendance-form-group">

              <label>
                Foto Bukti Kehadiran
                <span
                  style={{
                    color: "#dc2626",
                    marginLeft: "4px",
                  }}
                >
                  *
                </span>
              </label>

              <p className="attendance-proof-description">
                Upload foto kamu saat mengikuti
                kegiatan sebagai bukti kehadiran
                pada tanggal tersebut.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleProofChange
                }
                required
              />

              <small className="attendance-help">
                Foto harus memperlihatkan kamu
                sedang mengikuti kegiatan.
                Format JPG, PNG, atau WEBP.
                Maksimal 5 MB.
              </small>

              {proofPreview && (

                <div className="attendance-proof-preview">

                  <img
                    src={proofPreview}
                    alt="Preview bukti kehadiran"
                  />

                  <button
                    type="button"
                    onClick={removeProof}
                  >
                    Hapus Foto
                  </button>

                </div>

              )}

            </div>

          )}

          {/* =================================================
              FOTO SURAT DOKTER
          ================================================= */}

          {type === "sakit" && (

            <div className="attendance-form-group">

              <label>
                Surat Dokter / Bukti Sakit
                <span
                  style={{
                    color: "#dc2626",
                    marginLeft: "4px",
                  }}
                >
                  *
                </span>
              </label>

              <p className="attendance-proof-description">
                Upload surat dokter atau bukti
                sakit sebagai pendukung pengajuan.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleProofChange
                }
                required
              />

              <small className="attendance-help">
                Format JPG, PNG, atau WEBP.
                Maksimal 5 MB.
              </small>

              {proofPreview && (

                <div className="attendance-proof-preview">

                  <img
                    src={proofPreview}
                    alt="Preview bukti sakit"
                  />

                  <button
                    type="button"
                    onClick={removeProof}
                  >
                    Hapus Foto
                  </button>

                </div>

              )}

            </div>

          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="attendance-alert error">
              {error}
            </div>

          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {message && (

            <div className="attendance-alert success">
              {message}
            </div>

          )}

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="attendance-submit"
            disabled={loading}
          >
            {loading
              ? "Mengirim..."
              : "Ajukan Absensi"}
          </button>

        </form>

      </div>

      {/* =================================================
          RIWAYAT
      ================================================= */}

      <div className="attendance-history">

        <div className="attendance-history-header">

          <h2>
            Riwayat Absensi
          </h2>

          <p>
            Riwayat pengajuan absensi kamu.
          </p>

        </div>

        {historyLoading ? (

          <div className="attendance-empty">
            Memuat riwayat...
          </div>

        ) : history.length === 0 ? (

          <div className="attendance-empty">

            <div>
              📋
            </div>

            <p>
              Belum ada riwayat absensi.
            </p>

          </div>

        ) : (

          <div className="attendance-table-wrapper">

            <table className="attendance-table">

              <thead>

                <tr>

                  <th>
                    Tanggal
                  </th>

                  <th>
                    Kegiatan
                  </th>

                  <th>
                    Pengajuan
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Keterangan
                  </th>

                </tr>

              </thead>

              <tbody>

                {history.map(
                  (item) => (

                    <tr
                      key={item.id}
                    >

                      <td>
                        {item.date}
                      </td>

                      <td>
                        {item.activity}
                      </td>

                      <td>
                        {getTypeLabel(
                          item.type
                        )}
                      </td>

                      <td>

                        <span
                          className={`attendance-status ${item.status}`}
                        >
                          {getStatusLabel(
                            item.status
                          )}
                        </span>

                      </td>

                      <td>
                        <div className="attendance-description">
                          <div>{item.description || "-"}</div>

                          {item.status === "rejected" && (
                            <div className="attendance-rejection-reason">
                              <strong>Alasan ditolak:</strong>
                              <span>
                                {item.adminNote || "Tidak ada alasan yang diberikan admin."}
                              </span>
                            </div>
                          )}
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

    </div>
  );
}

export default Attendance;
