import { useEffect, useMemo, useState } from "react";

import {
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
} from "../../services/accountService";

import { auth } from "../../firebase/config";


function Accounts() {

  // =========================================================
  // ACCOUNTS
  // =========================================================

  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);


  // =========================================================
  // FORM
  // =========================================================

  const [showForm, setShowForm] = useState(false);

  const [editingAccount, setEditingAccount] = useState(null);

  const [saving, setSaving] = useState(false);


  // =========================================================
  // MESSAGE
  // =========================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // =========================================================
  // SEARCH
  // =========================================================

  const [search, setSearch] = useState("");


  // =========================================================
  // PAGINATION
  // =========================================================

  const [currentPage, setCurrentPage] = useState(1);

  const accountsPerPage = 10;


  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "anggota",
    className: "",
  });


  // =========================================================
  // LOAD ACCOUNTS
  // =========================================================

  const loadAccounts = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getAccounts();

      setAccounts(data);

    } catch (error) {

      console.error(
        "Gagal mengambil akun:",
        error
      );

      setError(
        "Gagal mengambil data akun."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadAccounts();

  }, []);


  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData({
      ...formData,
      [name]: value,
    });

  };


  // =========================================================
  // SEARCH FILTER
  // =========================================================

  const filteredAccounts = useMemo(() => {

    const keyword =
      search
        .trim()
        .toLowerCase();


    if (!keyword) {

      return accounts;

    }


    return accounts.filter(
      (account) =>
        (account.name || "")
          .toLowerCase()
          .includes(keyword)
    );

  }, [accounts, search]);


  // =========================================================
  // PAGINATION DATA
  // =========================================================

  const totalPages =
    Math.ceil(
      filteredAccounts.length /
        accountsPerPage
    );


  const startIndex =
    (currentPage - 1) *
    accountsPerPage;


  const endIndex =
    startIndex +
    accountsPerPage;


  const currentAccounts =
    filteredAccounts.slice(
      startIndex,
      endIndex
    );


  // =========================================================
  // RESET PAGE SAAT SEARCH
  // =========================================================

  useEffect(() => {

    setCurrentPage(1);

  }, [search]);


  // =========================================================
  // JAGA CURRENT PAGE
  // =========================================================

  useEffect(() => {

    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {

      setCurrentPage(totalPages);

    }

  }, [
    totalPages,
    currentPage,
  ]);


  // =========================================================
  // PAGINATION
  // =========================================================

  const handlePreviousPage = () => {

    if (currentPage > 1) {

      setCurrentPage(
        currentPage - 1
      );

    }

  };


  const handleNextPage = () => {

    if (
      currentPage <
      totalPages
    ) {

      setCurrentPage(
        currentPage + 1
      );

    }

  };


  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {

    setFormData({

      name: "",

      email: "",

      password: "",

      role: "anggota",

      className: "",

    });

  };


  // =========================================================
  // CLOSE FORM
  // =========================================================

  const handleCloseForm = () => {

    setShowForm(false);

    setEditingAccount(null);

    setError("");

    resetForm();

  };


  // =========================================================
  // EDIT ACCOUNT
  // =========================================================

  const handleEdit = (account) => {

    setEditingAccount(account);


    setFormData({

      name:
        account.name || "",

      email:
        account.email || "",

      password:
        "",

      role:
        account.role ||
        "anggota",

      className:
        account.className ||
        "",

    });


    setError("");

    setSuccess("");

    setShowForm(true);

  };


  // =========================================================
  // DELETE ACCOUNT
  // =========================================================

  const handleDelete = async (account) => {

    const currentUser =
      auth.currentUser;


    // Tidak boleh menghapus akun sendiri

    if (
      currentUser?.uid ===
      account.id
    ) {

      setError(
        "Anda tidak dapat menghapus akun yang sedang digunakan."
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Apakah Anda yakin ingin menghapus akun "${account.name || account.email}"?\n\nAkun akan dihapus secara permanen.`
      );


    if (!confirmed) {

      return;

    }


    try {

      setError("");

      setSuccess("");

      setSaving(true);


      await deleteAccount(
        account.id
      );


      setSuccess(
        `Akun ${
          account.name ||
          account.email
        } berhasil dihapus.`
      );


      await loadAccounts();

    } catch (error) {

      console.error(
        "Gagal menghapus akun:",
        error
      );


      setError(
        error.message ||
        "Gagal menghapus akun. Silakan coba lagi."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // SUBMIT FORM
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setSuccess("");

    setSaving(true);


    try {

      // ================================================
      // VALIDASI KELAS
      // ================================================

      if (
        formData.role ===
          "anggota" &&
        !formData.className
      ) {

        setError(
          "Kelas anggota wajib dipilih."
        );

        setSaving(false);

        return;

      }


      // ================================================
      // EDIT AKUN
      // ================================================

      if (editingAccount) {

        await updateAccount(
          editingAccount.id,
          formData
        );


        setSuccess(
          "Data akun berhasil diperbarui."
        );

      }


      // ================================================
      // BUAT AKUN BARU
      // ================================================

      else {

        await createAccount(
          formData
        );


        setSuccess(
          `Akun ${
            formData.role ===
            "admin"
              ? "Admin"
              : "Anggota"
          } berhasil dibuat.`
        );

      }


      setShowForm(false);

      setEditingAccount(null);

      resetForm();

      await loadAccounts();

    } catch (error) {

      console.error(
        "Gagal menyimpan akun:",
        error
      );


      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        setError(
          "Email tersebut sudah digunakan."
        );

      }

      else if (
        error.code ===
        "auth/invalid-email"
      ) {

        setError(
          "Format email tidak valid."
        );

      }

      else if (
        error.code ===
        "auth/weak-password"
      ) {

        setError(
          "Password terlalu lemah. Gunakan minimal 6 karakter."
        );

      }

      else {

        setError(
          error.message ||
          "Gagal menyimpan akun. Silakan coba lagi."
        );

      }

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="admin-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="admin-page-header">

        <div>

          <h2>
            Kelola Akun
          </h2>

          <p>
            Kelola akun administrator
            dan anggota organisasi.
          </p>

        </div>


        <button
          type="button"
          className="admin-primary-button"
          onClick={() => {

            setEditingAccount(null);

            resetForm();

            setShowForm(true);

            setError("");

            setSuccess("");

          }}
        >

          + Tambah Akun

        </button>

      </div>


      {/* ===================================================
          SUCCESS
      =================================================== */}

      {success && (

        <div className="admin-success-message">

          ✓ {success}

        </div>

      )}


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && !showForm && (

        <div className="admin-error-message">

          {error}

        </div>

      )}


      {/* ===================================================
          FORM
      =================================================== */}

      {showForm && (

        <div className="admin-form-card">


          {/* FORM HEADER */}

          <div className="admin-form-header">

            <div>

              <h3>

                {editingAccount
                  ? "Edit Akun"
                  : "Tambah Akun"}

              </h3>

              <p>

                {editingAccount
                  ? "Perbarui informasi akun."
                  : "Buat akun administrator atau anggota baru."}

              </p>

            </div>


            <button
              type="button"
              className="admin-close-button"
              onClick={
                handleCloseForm
              }
            >

              ×

            </button>

          </div>


          {/* FORM ERROR */}

          {error && (

            <div className="admin-error-message form-error">

              {error}

            </div>

          )}


          {/* FORM */}

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="admin-form-grid">


              {/* NAMA */}

              <div className="admin-form-group">

                <label htmlFor="name">
                  Nama Lengkap
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Masukkan nama lengkap"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="admin-form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="contoh@email.com"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ROLE */}

              <div className="admin-form-group">

                <label htmlFor="role">
                  Role
                </label>

                <select
                  id="role"
                  name="role"
                  value={
                    formData.role
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="anggota">
                    Anggota
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                </select>

              </div>


              {/* KELAS */}

              {formData.role ===
                "anggota" && (

                <div className="admin-form-group">

                  <label htmlFor="className">
                    Kelas
                  </label>

                  <select
                    id="className"
                    name="className"
                    value={
                      formData.className
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Pilih Kelas
                    </option>

                    <option value="X">
                      X
                    </option>

                    <option value="XI">
                      XI
                    </option>

                    <option value="XII">
                      XII
                    </option>

                  </select>

                </div>

              )}


              {/* PASSWORD */}

              {!editingAccount && (

                <div className="admin-form-group">

                  <label htmlFor="password">
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Minimal 6 karakter"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    minLength={6}
                    required
                  />

                </div>

              )}

            </div>


            {/* FORM ACTION */}

            <div className="admin-form-actions">

              <button
                type="button"
                className="admin-secondary-button"
                onClick={
                  handleCloseForm
                }
                disabled={
                  saving
                }
              >

                Batal

              </button>


              <button
                type="submit"
                className="admin-primary-button"
                disabled={
                  saving
                }
              >

                {saving
                  ? "Menyimpan..."
                  : editingAccount
                  ? "Simpan Perubahan"
                  : "Simpan Akun"}

              </button>

            </div>

          </form>

        </div>

      )}


      {/* ===================================================
          TABLE CARD
      =================================================== */}

      <div className="admin-table-card">


        {/* =================================================
            TABLE HEADER
        ================================================= */}

        <div className="admin-table-header">

          <div>

            <h3>
              Daftar Akun
            </h3>

            <p>

              {filteredAccounts.length} akun
              {search
                ? " ditemukan"
                : " terdaftar"}

            </p>

          </div>


          {/* SEARCH */}

          <div className="admin-search-box">

            <span className="admin-search-icon">
              🔎
            </span>

            <input
              type="text"
              placeholder="Cari nama akun..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />


            {search && (

              <button
                type="button"
                className="admin-search-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Hapus pencarian"
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

            Memuat data akun...

          </div>

        ) : filteredAccounts.length ===
          0 ? (


          /* ===============================================
             EMPTY
          =============================================== */

          <div className="admin-empty">

            <div>
              👥
            </div>

            <h4>

              {search
                ? "Akun tidak ditemukan"
                : "Belum ada akun"}

            </h4>

            <p>

              {search
                ? `Tidak ada akun dengan nama "${search}".`
                : "Belum ada data akun yang tersimpan."}

            </p>

          </div>


        ) : (


          /* ===============================================
             TABLE
          =============================================== */

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Nama
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Kelas
                  </th>

                  <th>
                    Role
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

                {currentAccounts.map(
                  (account) => (

                    <tr
                      key={
                        account.id
                      }
                    >


                      {/* NAMA */}

                      <td>

                        <strong>

                          {
                            account.name ||
                            "-"
                          }

                        </strong>

                      </td>


                      {/* EMAIL */}

                      <td>

                        {
                          account.email ||
                          "-"
                        }

                      </td>


                      {/* KELAS */}

                      <td>

                        {account.role ===
                        "anggota" ? (

                          <span className="class-badge">

                            {
                              account.className ||
                              "-"
                            }

                          </span>

                        ) : (

                          <span
                            style={{
                              color:
                                "#8a909d",
                            }}
                          >

                            -

                          </span>

                        )}

                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={`role-badge ${
                            account.role ===
                            "admin"
                              ? "role-admin"
                              : "role-anggota"
                          }`}
                        >

                          {account.role ===
                          "admin"
                            ? "Admin"
                            : "Anggota"}

                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span className="status-badge">

                          Aktif

                        </span>

                      </td>


                      {/* AKSI */}

                      <td>

                        <div className="table-actions">


                          <button
                            type="button"
                            className="action-edit"
                            onClick={() =>
                              handleEdit(
                                account
                              )
                            }
                          >

                            Edit

                          </button>


                          <button
                            type="button"
                            className="action-delete"
                            onClick={() =>
                              handleDelete(
                                account
                              )
                            }
                            disabled={
                              saving
                            }
                          >

                            Hapus

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


        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          filteredAccounts.length >
            0 && (

          <div className="admin-pagination">


            {/* INFO */}

            <div className="admin-pagination-info">

              Menampilkan{" "}

              <strong>
                {startIndex + 1}
              </strong>

              {" - "}

              <strong>
                {Math.min(
                  endIndex,
                  filteredAccounts.length
                )}
              </strong>

              {" dari "}

              <strong>
                {filteredAccounts.length}
              </strong>

              {" akun"}

            </div>


            {/* BUTTON */}

            <div className="admin-pagination-buttons">

              <button
                type="button"
                className="admin-pagination-button"
                onClick={
                  handlePreviousPage
                }
                disabled={
                  currentPage === 1
                }
              >

                ← Sebelumnya

              </button>


              {/* NOMOR HALAMAN */}

              <div className="admin-page-number">

                Halaman{" "}

                <strong>
                  {currentPage}
                </strong>

                {" dari "}

                <strong>
                  {totalPages}
                </strong>

              </div>


              <button
                type="button"
                className="admin-pagination-button"
                onClick={
                  handleNextPage
                }
                disabled={
                  currentPage ===
                  totalPages
                }
              >

                Berikutnya →

              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}


export default Accounts;