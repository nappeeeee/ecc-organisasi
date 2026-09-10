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
  // PAGINATION
  // =========================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const membersPerPage = 10;


  // =========================================================
  // SORTING
  // =========================================================

  const [sortConfig, setSortConfig] =
    useState({
      key: "name",
      direction: "asc",
    });


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
  // RESET PAGE SAAT SEARCH BERUBAH
  // =========================================================

  useEffect(() => {

    setCurrentPage(1);

  }, [search]);


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
            getMemberName(member)
              .toLowerCase();

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
  // SORT MEMBERS
  // =========================================================

  const sortedMembers =
    useMemo(() => {

      const sorted =
        [...filteredMembers];


      sorted.sort(
        (a, b) => {

          // ===============================================
          // SORT BERDASARKAN NAMA
          // ===============================================

          if (
            sortConfig.key ===
            "name"
          ) {

            const nameA =
              getMemberName(a)
                .toLowerCase();

            const nameB =
              getMemberName(b)
                .toLowerCase();


            if (
              sortConfig.direction ===
              "asc"
            ) {

              return nameA.localeCompare(
                nameB,
                "id",
                {
                  sensitivity:
                    "base",
                }
              );

            }


            return nameB.localeCompare(
              nameA,
              "id",
              {
                sensitivity:
                  "base",
              }
            );

          }


          // ===============================================
          // SORT DATA ANGKA
          // ===============================================

          const valueA =
            Number(
              a[
                sortConfig.key
              ] || 0
            );

          const valueB =
            Number(
              b[
                sortConfig.key
              ] || 0
            );


          if (
            sortConfig.direction ===
            "asc"
          ) {

            return valueA -
              valueB;

          }


          return valueB -
            valueA;

        }
      );


      return sorted;

    }, [
      filteredMembers,
      sortConfig,
    ]);


  // =========================================================
  // TOTAL PAGES
  // =========================================================

  const totalPages =
    Math.ceil(
      sortedMembers.length /
        membersPerPage
    );


  // =========================================================
  // PAGINATION INDEX
  // =========================================================

  const startIndex =
    (currentPage - 1) *
    membersPerPage;


  const endIndex =
    startIndex +
    membersPerPage;


  // =========================================================
  // DATA YANG DITAMPILKAN DI HALAMAN AKTIF
  // =========================================================

  const paginatedMembers =
    sortedMembers.slice(
      startIndex,
      endIndex
    );


  // =========================================================
  // HANDLE SORT
  // =========================================================

  const handleSort =
    (key) => {

      setCurrentPage(1);


      setSortConfig(
        (previous) => {

          if (
            previous.key ===
            key
          ) {

            return {
              key,
              direction:
                previous.direction ===
                "asc"
                  ? "desc"
                  : "asc",
            };

          }


          return {
            key,
            direction:
              key === "name"
                ? "asc"
                : "desc",
          };

        }
      );

    };


  // =========================================================
  // SORT ICON
  // =========================================================

  const getSortIcon =
    (key) => {

      if (
        sortConfig.key !==
        key
      ) {

        return (
          <span className="members-sort-icon">
            ↕
          </span>
        );

      }


      if (
        sortConfig.direction ===
        "asc"
      ) {

        return (
          <span className="members-sort-icon active">
            ↑
          </span>
        );

      }


      return (
        <span className="members-sort-icon active">
          ↓
        </span>
      );

    };


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
  // FORMAT DATE
  // =========================================================

  const formatDate =
    (date) => {

      if (!date) {

        return "-";

      }


      // ===============================================
      // FIRESTORE TIMESTAMP
      // ===============================================

      if (
        typeof date?.toDate ===
        "function"
      ) {

        const convertedDate =
          date.toDate();


        const day =
          String(
            convertedDate.getDate()
          ).padStart(
            2,
            "0"
          );


        const month =
          String(
            convertedDate.getMonth() +
              1
          ).padStart(
            2,
            "0"
          );


        const year =
          convertedDate.getFullYear();


        return `${day}-${month}-${year}`;

      }


      // ===============================================
      // DATE OBJECT
      // ===============================================

      if (
        date instanceof Date
      ) {

        const day =
          String(
            date.getDate()
          ).padStart(
            2,
            "0"
          );


        const month =
          String(
            date.getMonth() +
              1
          ).padStart(
            2,
            "0"
          );


        const year =
          date.getFullYear();


        return `${day}-${month}-${year}`;

      }


      // ===============================================
      // STRING YYYY-MM-DD
      // ===============================================

      if (
        typeof date ===
        "string"
      ) {

        const parts =
          date.split("-");


        if (
          parts.length ===
          3
        ) {

          return `${parts[2]}-${parts[1]}-${parts[0]}`;

        }

      }


      return date;

    };


  // =========================================================
  // GO TO PAGE
  // =========================================================

  const goToPage =
    (page) => {

      if (
        page < 1 ||
        page > totalPages
      ) {

        return;

      }


      setCurrentPage(
        page
      );

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


        {/* TOTAL ANGGOTA */}

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


        {/* TOTAL HADIR */}

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


        {/* TOTAL IZIN */}

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


        {/* TOTAL SAKIT */}

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


        {/* =================================================
            HEADER TABLE
        ================================================= */}

        <div className="admin-card-header">

          <div>

            <h2>
              Daftar Anggota
            </h2>

            <p>
              Klik judul kolom untuk
              mengurutkan data.
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
            HASIL PENCARIAN
        ================================================= */}

        {!loading &&
          filteredMembers.length >
            0 && (

            <div
              className="members-result-info"
            >

              Menampilkan{" "}

              <strong>
                {startIndex + 1}
              </strong>

              {" - "}

              <strong>
                {Math.min(
                  endIndex,
                  sortedMembers.length
                )}
              </strong>

              {" dari "}

              <strong>
                {sortedMembers.length}
              </strong>

              {" anggota"}

              {search && (
                <>
                  {" "}
                  hasil pencarian
                </>
              )}

            </div>

          )}


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
                : "Tambahkan anggota terlebih dahulu melalui Kelola Akun."}

            </p>

          </div>


        ) : (


          /* ===============================================
             TABLE
          =============================================== */

          <>

            <div className="members-table-wrapper">

              <table className="members-table">

                <thead>

                  <tr>

                    {/* NO */}

                    <th>
                      No
                    </th>


                    {/* ANGGOTA */}

                    <th>

                      <button
                        type="button"
                        className="members-sort-button"
                        onClick={() =>
                          handleSort(
                            "name"
                          )
                        }
                      >

                        <span>
                          Anggota
                        </span>

                        {getSortIcon(
                          "name"
                        )}

                      </button>

                    </th>


                    {/* JABATAN */}

                    <th>
                      Jabatan
                    </th>


                    {/* TOTAL KEHADIRAN */}

                    <th>

                      <button
                        type="button"
                        className="members-sort-button"
                        onClick={() =>
                          handleSort(
                            "attendanceTotal"
                          )
                        }
                      >

                        <span>
                          Total Kehadiran
                        </span>

                        {getSortIcon(
                          "attendanceTotal"
                        )}

                      </button>

                    </th>


                    {/* HADIR */}

                    <th>

                      <button
                        type="button"
                        className="members-sort-button"
                        onClick={() =>
                          handleSort(
                            "hadir"
                          )
                        }
                      >

                        <span>
                          Hadir
                        </span>

                        {getSortIcon(
                          "hadir"
                        )}

                      </button>

                    </th>


                    {/* IZIN */}

                    <th>

                      <button
                        type="button"
                        className="members-sort-button"
                        onClick={() =>
                          handleSort(
                            "izin"
                          )
                        }
                      >

                        <span>
                          Izin
                        </span>

                        {getSortIcon(
                          "izin"
                        )}

                      </button>

                    </th>


                    {/* SAKIT */}

                    <th>

                      <button
                        type="button"
                        className="members-sort-button"
                        onClick={() =>
                          handleSort(
                            "sakit"
                          )
                        }
                      >

                        <span>
                          Sakit
                        </span>

                        {getSortIcon(
                          "sakit"
                        )}

                      </button>

                    </th>


                    {/* DETAIL */}

                    <th>
                      Detail
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {paginatedMembers.map(
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
                            startIndex +
                            index +
                            1
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


            {/* =================================================
                PAGINATION
            ================================================= */}

            {totalPages > 1 && (

              <div className="members-pagination">


                {/* PREVIOUS */}

                <button
                  type="button"
                  className="members-pagination-button"
                  onClick={() =>
                    goToPage(
                      currentPage - 1
                    )
                  }
                  disabled={
                    currentPage === 1
                  }
                >
                  ← Prev
                </button>


                {/* PAGE NUMBERS */}

                <div className="members-pagination-pages">

                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, index) => {

                      const page =
                        index + 1;


                      return (

                        <button
                          key={
                            page
                          }
                          type="button"
                          className={`members-pagination-page ${
                            currentPage ===
                            page
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            goToPage(
                              page
                            )
                          }
                        >
                          {page}
                        </button>

                      );

                    }
                  )}

                </div>


                {/* NEXT */}

                <button
                  type="button"
                  className="members-pagination-button"
                  onClick={() =>
                    goToPage(
                      currentPage + 1
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                >
                  Next →
                </button>


              </div>

            )}

          </>

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