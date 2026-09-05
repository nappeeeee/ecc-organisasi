import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMembersWithAttendance,
} from "../../services/memberService";


function Members() {

  // =========================================================
  // STATE
  // =========================================================

  const [members, setMembers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedMember, setSelectedMember] =
    useState(null);


  // =========================================================
  // LOAD MEMBERS
  // =========================================================

  const loadMembers =
    async () => {

      try {

        setLoading(true);

        const data =
          await getMembersWithAttendance();

        setMembers(data);

      } catch (error) {

        console.error(
          "Gagal mengambil data anggota:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    loadMembers();

  }, []);


  // =========================================================
  // FILTER SEARCH
  // =========================================================

  const filteredMembers =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      if (!keyword) {

        return members;

      }


      return members.filter(
        (member) => {

          const name =
            member.name
              ?.toLowerCase() ||
            "";

          const position =
            member.position
              ?.toLowerCase() ||
            "";

          const jabatan =
            member.jabatan
              ?.toLowerCase() ||
            "";

          const email =
            member.email
              ?.toLowerCase() ||
            "";


          return (

            name.includes(
              keyword
            ) ||

            position.includes(
              keyword
            ) ||

            jabatan.includes(
              keyword
            ) ||

            email.includes(
              keyword
            )

          );

        }
      );

    }, [
      members,
      search,
    ]);


  // =========================================================
  // STATISTICS
  // =========================================================

  const totalMembers =
    members.length;


  const totalHadir =
    members.reduce(
      (total, member) =>
        total +
        (member.hadir || 0),
      0
    );


  const totalIzin =
    members.reduce(
      (total, member) =>
        total +
        (member.izin || 0),
      0
    );


  const totalSakit =
    members.reduce(
      (total, member) =>
        total +
        (member.sakit || 0),
      0
    );


  // =========================================================
  // HELPER NAME
  // =========================================================

  const getMemberName =
    (member) => {

      return (
        member.name ||
        member.nama ||
        "Tanpa Nama"
      );

    };


  // =========================================================
  // HELPER POSITION
  // =========================================================

  const getMemberPosition =
    (member) => {

      return (
        member.position ||
        member.jabatan ||
        member.role ||
        "Belum ada jabatan"
      );

    };


  // =========================================================
  // HELPER INITIAL
  // =========================================================

  const getMemberInitial =
    (member) => {

      return getMemberName(
        member
      )
        .charAt(0)
        .toUpperCase();

    };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate =
    (date) => {

      if (!date) {

        return "-";

      }


      /*
       * Jika Firestore Timestamp
       */

      if (
        typeof date?.toDate ===
        "function"
      ) {

        const convertedDate =
          date.toDate();

        const day =
          String(
            convertedDate.getDate()
          ).padStart(2, "0");

        const month =
          String(
            convertedDate.getMonth() +
              1
          ).padStart(2, "0");

        const year =
          convertedDate.getFullYear();

        return `${day}-${month}-${year}`;

      }


      /*
       * Jika Date object
       */

      if (
        date instanceof Date
      ) {

        const day =
          String(
            date.getDate()
          ).padStart(2, "0");

        const month =
          String(
            date.getMonth() + 1
          ).padStart(2, "0");

        const year =
          date.getFullYear();

        return `${day}-${month}-${year}`;

      }


      /*
       * Jika string YYYY-MM-DD
       */

      if (
        typeof date ===
        "string"
      ) {

        const parts =
          date.split("-");


        if (
          parts.length === 3
        ) {

          return `${parts[2]}-${parts[1]}-${parts[0]}`;

        }

      }


      return date;

    };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="admin-page members-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="admin-page-header">

        <div>

          <h1>
            Anggota
          </h1>

          <p>
            Daftar seluruh anggota
            berdasarkan struktur
            organisasi dan rekap
            kehadiran.
          </p>

        </div>


        <button
          type="button"
          className="admin-refresh-button"
          onClick={
            loadMembers
          }
          disabled={
            loading
          }
        >

          ↻{" "}

          {loading
            ? "Memuat..."
            : "Refresh"}

        </button>

      </div>


      {/* ===================================================
          STATISTIK
      =================================================== */}

      <div className="members-stats">


        <div className="members-stat-card">

          <div className="members-stat-icon">
            👥
          </div>

          <div>

            <span>
              Total Anggota
            </span>

            <strong>
              {totalMembers}
            </strong>

          </div>

        </div>


        <div className="members-stat-card">

          <div className="members-stat-icon">
            ✅
          </div>

          <div>

            <span>
              Total Hadir
            </span>

            <strong>
              {totalHadir}
            </strong>

          </div>

        </div>


        <div className="members-stat-card">

          <div className="members-stat-icon">
            🟡
          </div>

          <div>

            <span>
              Total Izin
            </span>

            <strong>
              {totalIzin}
            </strong>

          </div>

        </div>


        <div className="members-stat-card">

          <div className="members-stat-icon">
            🔴
          </div>

          <div>

            <span>
              Total Sakit
            </span>

            <strong>
              {totalSakit}
            </strong>

          </div>

        </div>


      </div>


      {/* ===================================================
          DAFTAR ANGGOTA
      =================================================== */}

      <div className="admin-card">


        <div className="admin-card-header">

          <div>

            <h2>
              Daftar Anggota
            </h2>

            <p>
              Jabatan mengikuti
              struktur organisasi.
            </p>

          </div>


          {/* SEARCH */}

          <div className="members-search">

            <span>
              ⌕
            </span>


            <input
              type="text"
              placeholder="Cari nama atau jabatan..."
              value={
                search
              }
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
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


        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="admin-loading">

            <div className="admin-loading-spinner"></div>

            <p>
              Memuat data anggota...
            </p>

          </div>


        ) : filteredMembers.length ===
          0 ? (


          /* ===============================================
             EMPTY
          =============================================== */

          <div className="members-empty">

            <div>
              👥
            </div>

            <h3>

              {search
                ? "Anggota tidak ditemukan"
                : "Belum ada anggota"}

            </h3>

            <p>

              {search
                ? "Coba gunakan kata pencarian yang berbeda."
                : "Tambahkan anggota terlebih dahulu melalui Struktur Organisasi."}

            </p>

          </div>


        ) : (


          /* ===============================================
             TABLE
          =============================================== */

          <div className="members-table-wrapper">

            <table className="members-table">

              <thead>

                <tr>

                  <th>
                    No
                  </th>

                  <th>
                    Anggota
                  </th>

                  <th>
                    Jabatan
                  </th>

                  <th>
                    Total Kehadiran
                  </th>

                  <th>
                    Hadir
                  </th>

                  <th>
                    Izin
                  </th>

                  <th>
                    Sakit
                  </th>

                  <th>
                    Detail
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredMembers.map(
                  (
                    member,
                    index
                  ) => (

                    <tr
                      key={
                        member.id
                      }
                    >


                      {/* NO */}

                      <td>

                        {
                          index + 1
                        }

                      </td>


                      {/* =================================
                          MEMBER
                      ================================= */}

                      <td>

                        <div className="member-table-user">


                          {/* FOTO */}

                          <div className="member-table-avatar">

                            {member.photo ? (

                              <img
                                src={
                                  member.photo
                                }
                                alt={
                                  getMemberName(
                                    member
                                  )
                                }
                              />

                            ) : (

                              getMemberInitial(
                                member
                              )

                            )}

                          </div>


                          {/* INFO */}

                          <div>

                            <strong>

                              {
                                getMemberName(
                                  member
                                )
                              }

                            </strong>


                            {member.email && (

                              <span>

                                {
                                  member.email
                                }

                              </span>

                            )}

                          </div>


                        </div>

                      </td>


                      {/* JABATAN */}

                      <td>

                        <span className="member-position">

                          {
                            getMemberPosition(
                              member
                            )
                          }

                        </span>

                      </td>


                      {/* TOTAL */}

                      <td>

                        <strong className="member-total-attendance">

                          {
                            member.attendanceTotal ||
                            0
                          }

                        </strong>

                      </td>


                      {/* HADIR */}

                      <td>

                        <span className="member-count hadir">

                          {
                            member.hadir ||
                            0
                          }

                        </span>

                      </td>


                      {/* IZIN */}

                      <td>

                        <span className="member-count izin">

                          {
                            member.izin ||
                            0
                          }

                        </span>

                      </td>


                      {/* SAKIT */}

                      <td>

                        <span className="member-count sakit">

                          {
                            member.sakit ||
                            0
                          }

                        </span>

                      </td>


                      {/* DETAIL */}

                      <td>

                        <button
                          type="button"
                          className="member-detail-button"
                          onClick={() =>
                            setSelectedMember(
                              member
                            )
                          }
                        >
                          Lihat
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


      {/* ===================================================
          MODAL DETAIL
      =================================================== */}

      {selectedMember && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            setSelectedMember(
              null
            )
          }
        >

          <div
            className="admin-modal members-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* =============================================
                MODAL HEADER
            ============================================= */}

            <div className="admin-modal-header">

              <div>

                <h2>
                  Detail Anggota
                </h2>

                <p>
                  Informasi anggota dan
                  riwayat absensi.
                </p>

              </div>


              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setSelectedMember(
                    null
                  )
                }
              >
                ×
              </button>

            </div>


            {/* =============================================
                PROFILE
            ============================================= */}

            <div className="member-detail-profile">


              {/* FOTO */}

              <div className="member-detail-avatar">

                {selectedMember.photo ? (

                  <img
                    src={
                      selectedMember.photo
                    }
                    alt={
                      getMemberName(
                        selectedMember
                      )
                    }
                  />

                ) : (

                  getMemberInitial(
                    selectedMember
                  )

                )}

              </div>


              {/* INFO */}

              <div>

                <h3>

                  {
                    getMemberName(
                      selectedMember
                    )
                  }

                </h3>


                <span>

                  {
                    getMemberPosition(
                      selectedMember
                    )
                  }

                </span>


                {selectedMember.email && (

                  <small>

                    {
                      selectedMember.email
                    }

                  </small>

                )}

              </div>


            </div>


            {/* =============================================
                ATTENDANCE STATS
            ============================================= */}

            <div className="member-detail-stats">


              <div>

                <span>
                  Total
                </span>

                <strong>

                  {
                    selectedMember.attendanceTotal ||
                    0
                  }

                </strong>

              </div>


              <div>

                <span>
                  Hadir
                </span>

                <strong>

                  {
                    selectedMember.hadir ||
                    0
                  }

                </strong>

              </div>


              <div>

                <span>
                  Izin
                </span>

                <strong>

                  {
                    selectedMember.izin ||
                    0
                  }

                </strong>

              </div>


              <div>

                <span>
                  Sakit
                </span>

                <strong>

                  {
                    selectedMember.sakit ||
                    0
                  }

                </strong>

              </div>


            </div>


            {/* =============================================
                HISTORY
            ============================================= */}

            <div className="member-history">

              <div className="member-history-title">

                <h3>
                  Riwayat Absensi
                </h3>

              </div>


              {selectedMember
                .attendanceHistory
                ?.length ===
                0 ? (


                <div className="member-history-empty">

                  Belum ada riwayat
                  absensi.

                </div>


              ) : (


                <div className="member-history-table-wrapper">

                  <table className="member-history-table">

                    <thead>

                      <tr>

                        <th>
                          Tanggal
                        </th>

                        <th>
                          Kegiatan
                        </th>

                        <th>
                          Jenis
                        </th>

                        <th>
                          Status
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {selectedMember
                        .attendanceHistory
                        ?.map(
                          (item) => (

                            <tr
                              key={
                                item.id
                              }
                            >


                              <td>

                                {
                                  formatDate(
                                    item.date
                                  )
                                }

                              </td>


                              <td>

                                {
                                  item.activity ||
                                  "-"
                                }

                              </td>


                              <td>

                                <span
                                  className={`member-history-type ${item.type}`}
                                >

                                  {item.type ===
                                  "hadir"

                                    ? "Hadir"

                                    : item.type ===
                                      "izin"

                                    ? "Izin"

                                    : "Sakit"}

                                </span>

                              </td>


                              <td>

                                <span
                                  className={`attendance-status ${item.status}`}
                                >

                                  {item.status ===
                                  "approved"

                                    ? "Disetujui"

                                    : item.status ===
                                      "rejected"

                                    ? "Ditolak"

                                    : "Pending"}

                                </span>

                              </td>


                            </tr>

                          )
                        )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>


            {/* =============================================
                FOOTER
            ============================================= */}

            <div className="admin-modal-footer">

              <button
                type="button"
                className="admin-close-button"
                onClick={() =>
                  setSelectedMember(
                    null
                  )
                }
              >
                Tutup
              </button>

            </div>


          </div>

        </div>

      )}

    </div>

  );

}


export default Members;