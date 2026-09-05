import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllAttendance,
  updateAttendanceStatus,
} from "../../services/attendanceService";

function Attendance() {
  const { user, userData } = useAuth();

  // =====================================================
  // TANGGAL HARI INI
  // =====================================================

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] =
    useState(getToday());

  const [attendance, setAttendance] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedAttendance, setSelectedAttendance] =
    useState(null);

  const [adminNote, setAdminNote] =
    useState("");

  const [processing, setProcessing] =
    useState(false);


  // =====================================================
  // AMBIL DATA ABSENSI
  // =====================================================

  const loadAttendance = async () => {
    try {
      setLoading(true);

      const data =
        await getAllAttendance();

      setAttendance(data);

    } catch (error) {

      console.error(
        "Gagal mengambil data absensi:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadAttendance();
  }, []);


  // =====================================================
  // FILTER BERDASARKAN TANGGAL + SEARCH
  // =====================================================

  const filteredAttendance =
    attendance.filter((item) => {

      const sameDate =
        item.date === selectedDate;

      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return sameDate;
      }

      const name =
        item.name
          ?.toLowerCase() || "";

      const activity =
        item.activity
          ?.toLowerCase() || "";

      return (
        sameDate &&
        (
          name.includes(keyword) ||
          activity.includes(keyword)
        )
      );
    });


  // =====================================================
  // STATISTIK BERDASARKAN TANGGAL TERPILIH
  // =====================================================

  const pendingCount =
    filteredAttendance.filter(
      (item) =>
        item.status === "pending"
    ).length;

  const approvedCount =
    filteredAttendance.filter(
      (item) =>
        item.status === "approved"
    ).length;

  const rejectedCount =
    filteredAttendance.filter(
      (item) =>
        item.status === "rejected"
    ).length;

  const hadirCount =
    filteredAttendance.filter(
      (item) =>
        item.type === "hadir"
    ).length;

  const izinCount =
    filteredAttendance.filter(
      (item) =>
        item.type === "izin"
    ).length;

  const sakitCount =
    filteredAttendance.filter(
      (item) =>
        item.type === "sakit"
    ).length;


  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const [year, month, day] =
      date.split("-");

    if (!year || !month || !day) {
      return date;
    }

    const dateObject =
      new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );

    return dateObject.toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };


  // =====================================================
  // GANTI TANGGAL
  // =====================================================

  const changeDate = (amount) => {

    const current =
      new Date(
        `${selectedDate}T00:00:00`
      );

    current.setDate(
      current.getDate() + amount
    );

    const year =
      current.getFullYear();

    const month =
      String(
        current.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        current.getDate()
      ).padStart(2, "0");

    setSelectedDate(
      `${year}-${month}-${day}`
    );

    setSearch("");
  };


  // =====================================================
  // HARI INI
  // =====================================================

  const goToToday = () => {

    setSelectedDate(
      getToday()
    );

    setSearch("");
  };


  // =====================================================
  // DETAIL
  // =====================================================

  const openDetail = (item) => {

    setSelectedAttendance(item);

    setAdminNote(
      item.adminNote || ""
    );
  };


  const closeDetail = () => {

    if (processing) {
      return;
    }

    setSelectedAttendance(null);

    setAdminNote("");
  };


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleUpdateStatus =
    async (status) => {

      if (!selectedAttendance) {
        return;
      }

      if (
        status === "rejected" &&
        !adminNote.trim()
      ) {

        alert(
          "Alasan penolakan wajib diisi."
        );

        return;
      }

      try {

        setProcessing(true);

        await updateAttendanceStatus(
          selectedAttendance.id,
          status,
          adminNote,
          user?.uid || ""
        );

        alert(
          status === "approved"
            ? "Absensi berhasil disetujui."
            : "Absensi berhasil ditolak."
        );

        setSelectedAttendance(null);

        setAdminNote("");

        await loadAttendance();

      } catch (error) {

        console.error(
          "Gagal mengubah status absensi:",
          error
        );

        alert(
          error.message ||
            "Gagal mengubah status absensi."
        );

      } finally {

        setProcessing(false);

      }
    };


  // =====================================================
  // LABEL
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


  const getStatusLabel = (status) => {

    if (status === "pending") {
      return "Menunggu";
    }

    if (status === "approved") {
      return "Disetujui";
    }

    if (status === "rejected") {
      return "Ditolak";
    }

    return status;
  };


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
            Kelola Absensi
          </h1>

          <p>
            Kelola dan verifikasi pengajuan
            absensi anggota organisasi.
          </p>

        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadAttendance}
          disabled={loading}
        >
          🔄 Refresh
        </button>

      </div>


      {/* =================================================
          FILTER TANGGAL
      ================================================= */}

      <div className="attendance-date-panel">

        <div className="attendance-date-title">

          <span>
            📅
          </span>

          <div>

            <strong>
              Absensi Tanggal
            </strong>

            <small>
              {formatDate(selectedDate)}
            </small>

          </div>

        </div>


        <div className="attendance-date-controls">

          <button
            type="button"
            onClick={() =>
              changeDate(-1)
            }
            title="Hari sebelumnya"
          >
            ←
          </button>


          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(
                event.target.value
              );

              setSearch("");
            }}
          />


          <button
            type="button"
            onClick={() =>
              changeDate(1)
            }
            title="Hari berikutnya"
          >
            →
          </button>


          <button
            type="button"
            className="attendance-today-button"
            onClick={goToToday}
          >
            Hari Ini
          </button>

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="attendance-search-panel">

        <div className="attendance-search-box">

          <span>
            🔎
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Cari nama anggota atau kegiatan..."
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>

        <div className="attendance-result-info">

          Menampilkan{" "}
          <strong>
            {filteredAttendance.length}
          </strong>{" "}
          pengajuan

        </div>

      </div>


      {/* =================================================
          STATISTIK
      ================================================= */}

      <div className="attendance-admin-stats">

        <div className="attendance-admin-stat">

          <div className="attendance-admin-stat-icon">
            ⏳
          </div>

          <div>
            <span>
              Menunggu
            </span>

            <strong>
              {pendingCount}
            </strong>
          </div>

        </div>


        <div className="attendance-admin-stat">

          <div className="attendance-admin-stat-icon">
            ✅
          </div>

          <div>
            <span>
              Disetujui
            </span>

            <strong>
              {approvedCount}
            </strong>
          </div>

        </div>


        <div className="attendance-admin-stat">

          <div className="attendance-admin-stat-icon">
            ❌
          </div>

          <div>
            <span>
              Ditolak
            </span>

            <strong>
              {rejectedCount}
            </strong>
          </div>

        </div>


        <div className="attendance-admin-stat">

          <div className="attendance-admin-stat-icon">
            👋
          </div>

          <div>
            <span>
              Hadir
            </span>

            <strong>
              {hadirCount}
            </strong>
          </div>

        </div>


        <div className="attendance-admin-stat">

          <div className="attendance-admin-stat-icon">
            📝
          </div>

          <div>
            <span>
              Izin
            </span>

            <strong>
              {izinCount}
            </strong>
          </div>

        </div>


        <div className="attendance-admin-stat">

          <div className="attendance-admin-stat-icon">
            🏥
          </div>

          <div>
            <span>
              Sakit
            </span>

            <strong>
              {sakitCount}
            </strong>
          </div>

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="admin-card">

        <div className="admin-card-header">

          <div>

            <h2>
              Pengajuan Absensi
            </h2>

            <p>
              Data absensi untuk{" "}
              <strong>
                {formatDate(selectedDate)}
              </strong>
            </p>

          </div>

        </div>


        {loading ? (

          <div className="admin-loading">
            Memuat data absensi...
          </div>

        ) : filteredAttendance.length === 0 ? (

          <div className="attendance-date-empty">

            <div>
              📅
            </div>

            <h3>
              Tidak ada absensi
            </h3>

            <p>
              Tidak ada pengajuan absensi
              pada {formatDate(selectedDate)}.
            </p>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                Hapus Pencarian
              </button>
            )}

          </div>

        ) : (

          <div className="attendance-table-wrapper">

            <table className="attendance-table">

              <thead>

                <tr>

                  <th>
                    ANGGOTA
                  </th>

                  <th>
                    TANGGAL
                  </th>

                  <th>
                    KEGIATAN
                  </th>

                  <th>
                    PENGAJUAN
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    AKSI
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredAttendance.map(
                  (item) => (

                    <tr key={item.id}>

                      <td>

                        <strong>
                          {item.name || "-"}
                        </strong>

                      </td>


                      <td>
                        {formatDate(
                          item.date
                        )}
                      </td>


                      <td>
                        {item.activity || "-"}
                      </td>


                      <td>

                        <span
                          className={`admin-attendance-type ${item.type}`}
                        >
                          {getTypeLabel(
                            item.type
                          )}
                        </span>

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

                        <button
                          type="button"
                          className="admin-view-button"
                          onClick={() =>
                            openDetail(item)
                          }
                        >
                          Lihat Detail
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =================================================
          MODAL DETAIL
      ================================================= */}

      {selectedAttendance && (

        <div
          className="attendance-modal-overlay"
          onClick={closeDetail}
        >

          <div
            className="attendance-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="attendance-modal-header">

              <div>

                <h2>
                  Detail Absensi
                </h2>

                <p>
                  Periksa pengajuan anggota
                  sebelum memberikan keputusan.
                </p>

              </div>


              <button
                type="button"
                className="attendance-modal-close"
                onClick={closeDetail}
                disabled={processing}
              >
                ×
              </button>

            </div>


            <div className="attendance-modal-body">

              <div className="attendance-detail-grid">

                <div className="attendance-detail-item">

                  <span>
                    Nama Anggota
                  </span>

                  <strong>
                    {selectedAttendance.name || "-"}
                  </strong>

                </div>


                <div className="attendance-detail-item">

                  <span>
                    Tanggal
                  </span>

                  <strong>
                    {formatDate(
                      selectedAttendance.date
                    )}
                  </strong>

                </div>


                <div className="attendance-detail-item">

                  <span>
                    Kegiatan
                  </span>

                  <strong>
                    {selectedAttendance.activity || "-"}
                  </strong>

                </div>


                <div className="attendance-detail-item">

                  <span>
                    Jenis Absensi
                  </span>

                  <strong>
                    {getTypeLabel(
                      selectedAttendance.type
                    )}
                  </strong>

                </div>


                <div className="attendance-detail-item">

                  <span>
                    Status
                  </span>

                  <strong>

                    <span
                      className={`attendance-status ${selectedAttendance.status}`}
                    >
                      {getStatusLabel(
                        selectedAttendance.status
                      )}
                    </span>

                  </strong>

                </div>

              </div>


              {/* KETERANGAN */}

              <div className="attendance-detail-description">

                <span>
                  Keterangan
                </span>

                <div>
                  {selectedAttendance.description ||
                    "Tidak ada keterangan."}
                </div>

              </div>


              {/* BUKTI SAKIT */}

              {/* =================================================
                  BUKTI FOTO
              ================================================= */}

              {selectedAttendance.proofImage && (

                <div className="attendance-detail-proof">

                  <span>
                    {selectedAttendance.type === "hadir"
                      ? "Foto Bukti Kehadiran"
                      : selectedAttendance.type === "sakit"
                      ? "Bukti Surat Dokter / Bukti Sakit"
                      : "Bukti Foto"}
                  </span>

                  <a
                    href={selectedAttendance.proofImage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={selectedAttendance.proofImage}
                      alt={
                        selectedAttendance.type === "hadir"
                          ? "Foto bukti kehadiran"
                          : selectedAttendance.type === "sakit"
                          ? "Bukti surat dokter"
                          : "Bukti absensi"
                      }
                    />
                  </a>

                  <small>
                    Klik gambar untuk melihat ukuran penuh.
                  </small>

                </div>

              )}


              {/* CATATAN ADMIN */}

              <div className="attendance-admin-note">

                <label>
                  Catatan Admin
                </label>

                <textarea
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(
                      event.target.value
                    )
                  }
                  placeholder="Tambahkan catatan atau alasan penolakan..."
                  disabled={
                    processing ||
                    selectedAttendance.status !==
                      "pending"
                  }
                />

              </div>

            </div>


            {/* FOOTER */}

            <div className="attendance-modal-footer">

              {selectedAttendance.status ===
              "pending" ? (

                <>

                  <button
                    type="button"
                    className="attendance-reject-button"
                    onClick={() =>
                      handleUpdateStatus(
                        "rejected"
                      )
                    }
                    disabled={processing}
                  >
                    {processing
                      ? "Memproses..."
                      : "❌ Tolak"}
                  </button>


                  <button
                    type="button"
                    className="attendance-approve-button"
                    onClick={() =>
                      handleUpdateStatus(
                        "approved"
                      )
                    }
                    disabled={processing}
                  >
                    {processing
                      ? "Memproses..."
                      : "✅ ACC / Setujui"}
                  </button>

                </>

              ) : (

                <button
                  type="button"
                  className="admin-close-button"
                  onClick={closeDetail}
                  disabled={processing}
                >
                  Tutup
                </button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Attendance;