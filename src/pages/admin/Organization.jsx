import { useEffect, useState } from "react";

import {
  getSections,
  getMembers,
  createSection,
  updateSection,
  deleteSection,
  createMember,
  updateMember,
  deleteMember,
} from "../../services/organizationService";

import {
  getMemberAccounts,
} from "../../services/accountService";


function Organization() {

  // =========================================================
  // DATA
  // =========================================================

  const [sections, setSections] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberAccounts, setMemberAccounts] = useState([]);


  // =========================================================
  // STATUS
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // =========================================================
  // FORM STATE
  // =========================================================

  const [showSectionForm, setShowSectionForm] =
    useState(false);

  const [showMemberForm, setShowMemberForm] =
    useState(false);

  const [editingSection, setEditingSection] =
    useState(null);

  const [editingMember, setEditingMember] =
    useState(null);


  // =========================================================
  // SECTION FORM
  // =========================================================

  const [sectionForm, setSectionForm] = useState({
    name: "",
    order: 1,
    active: true,
  });


  // =========================================================
  // MEMBER FORM
  // =========================================================

  const [memberForm, setMemberForm] = useState({
    uid: "",
    name: "",
    email: "",
    position: "",
    sectionId: "",
    order: 1,
    active: true,
  });


  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        sectionData,
        memberData,
        accountData,
      ] = await Promise.all([
        getSections(),
        getMembers(),
        getMemberAccounts(),
      ]);

      setSections(sectionData);
      setMembers(memberData);
      setMemberAccounts(accountData);

    } catch (error) {

      console.error(
        "Gagal mengambil struktur organisasi:",
        error
      );

      setError(
        error.message ||
          "Gagal memuat struktur organisasi."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // =========================================================
  // SECTION FORM
  // =========================================================

  const resetSectionForm = () => {

    setSectionForm({
      name: "",
      order: sections.length + 1,
      active: true,
    });

    setEditingSection(null);
    setShowSectionForm(false);

  };


  const handleAddSection = () => {

    setEditingSection(null);

    setSectionForm({
      name: "",
      order: sections.length + 1,
      active: true,
    });

    setError("");
    setSuccess("");

    setShowSectionForm(true);

  };


  const handleEditSection = (section) => {

    setEditingSection(section);

    setSectionForm({
      name: section.name || "",
      order: section.order || 1,
      active: section.active ?? true,
    });

    setError("");
    setSuccess("");

    setShowSectionForm(true);

  };


  const handleSectionSubmit = async (event) => {

    event.preventDefault();

    if (!sectionForm.name.trim()) {

      setError(
        "Nama bagian wajib diisi."
      );

      return;
    }


    try {

      setSaving(true);
      setError("");
      setSuccess("");

      const data = {
        ...sectionForm,
        order:
          Number(sectionForm.order) || 1,
      };


      if (editingSection) {

        await updateSection(
          editingSection.id,
          data
        );

        setSuccess(
          "Bagian organisasi berhasil diperbarui."
        );

      } else {

        await createSection(data);

        setSuccess(
          "Bagian organisasi berhasil ditambahkan."
        );

      }


      await loadData();

      resetSectionForm();

    } catch (error) {

      console.error(
        "Gagal menyimpan bagian:",
        error
      );

      setError(
        error.message ||
          "Gagal menyimpan bagian organisasi."
      );

    } finally {

      setSaving(false);

    }

  };


  const handleDeleteSection = async (section) => {

    const sectionMembers =
      members.filter(
        (member) =>
          member.sectionId ===
          section.id
      );


    if (sectionMembers.length > 0) {

      setError(
        `Bagian "${section.name}" masih memiliki ${sectionMembers.length} anggota. Hapus atau pindahkan anggota terlebih dahulu.`
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Apakah Anda yakin ingin menghapus bagian "${section.name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setSaving(true);
      setError("");
      setSuccess("");

      await deleteSection(
        section.id
      );

      setSuccess(
        "Bagian organisasi berhasil dihapus."
      );

      await loadData();

    } catch (error) {

      console.error(
        "Gagal menghapus bagian:",
        error
      );

      setError(
        error.message ||
          "Gagal menghapus bagian organisasi."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // MEMBER FORM
  // =========================================================

  const resetMemberForm = () => {

    setMemberForm({
      uid: "",
      name: "",
      email: "",
      position: "",
      sectionId:
        sections[0]?.id || "",
      order: 1,
      active: true,
    });

    setEditingMember(null);
    setShowMemberForm(false);

  };


  const handleAddMember = (
    sectionId = ""
  ) => {

    setEditingMember(null);

    setMemberForm({
      uid: "",
      name: "",
      email: "",
      position: "",
      sectionId:
        sectionId ||
        sections[0]?.id ||
        "",
      order: 1,
      active: true,
    });

    setError("");
    setSuccess("");

    setShowMemberForm(true);

  };


  const handleEditMember = (member) => {

    setEditingMember(member);

    setMemberForm({
      uid: member.uid || "",
      name: member.name || "",
      email: member.email || "",
      position: member.position || "",
      sectionId:
        member.sectionId || "",
      order:
        member.order || 1,
      active:
        member.active ?? true,
    });

    setError("");
    setSuccess("");

    setShowMemberForm(true);

  };


  // =========================================================
  // SELECT ACCOUNT
  // =========================================================

  const handleAccountChange = (
    event
  ) => {

    const uid =
      event.target.value;


    const selectedAccount =
      memberAccounts.find(
        (account) =>
          account.uid === uid
      );


    if (!selectedAccount) {

      setMemberForm({
        ...memberForm,

        uid: "",
        name: "",
        email: "",
      });

      return;
    }


    setMemberForm({
      ...memberForm,

      uid:
        selectedAccount.uid,

      name:
        selectedAccount.name ||
        selectedAccount.displayName ||
        "",

      email:
        selectedAccount.email ||
        "",
    });

  };


  // =========================================================
  // MEMBER SUBMIT
  // =========================================================

  const handleMemberSubmit =
    async (event) => {

      event.preventDefault();


      if (!memberForm.uid) {

        setError(
          "Akun anggota wajib dipilih."
        );

        return;
      }


      if (!memberForm.name.trim()) {

        setError(
          "Nama anggota dari akun tidak ditemukan."
        );

        return;
      }


      if (!memberForm.position.trim()) {

        setError(
          "Jabatan wajib diisi."
        );

        return;
      }


      if (!memberForm.sectionId) {

        setError(
          "Bagian organisasi wajib dipilih."
        );

        return;
      }


      // =====================================================
      // CEK AKUN SUDAH DIGUNAKAN
      // =====================================================

      const accountAlreadyUsed =
        members.some(
          (member) =>
            member.uid ===
              memberForm.uid &&
            member.id !==
              editingMember?.id
        );


      if (accountAlreadyUsed) {

        setError(
          "Akun tersebut sudah digunakan dalam struktur organisasi."
        );

        return;
      }


      try {

        setSaving(true);
        setError("");
        setSuccess("");


        // ===================================================
        // DATA MEMBER
        // ===================================================

        const memberData = {

          uid:
            memberForm.uid,

          name:
            memberForm.name,

          email:
            memberForm.email || "",

          position:
            memberForm.position,

          sectionId:
            memberForm.sectionId,

          order:
            Number(memberForm.order) || 1,

          active:
            memberForm.active ?? true,

        };


        // ===================================================
        // EDIT
        // ===================================================

        if (editingMember) {

          await updateMember(
            editingMember.id,
            memberData
          );

          setSuccess(
            "Data anggota berhasil diperbarui."
          );

        }


        // ===================================================
        // TAMBAH
        // ===================================================

        else {

          await createMember(
            memberData
          );

          setSuccess(
            "Anggota berhasil ditambahkan."
          );

        }


        await loadData();

        resetMemberForm();

      } catch (error) {

        console.error(
          "Gagal menyimpan anggota:",
          error
        );

        setError(
          error.message ||
            "Gagal menyimpan anggota."
        );

      } finally {

        setSaving(false);

      }

    };


  // =========================================================
  // DELETE MEMBER
  // =========================================================

  const handleDeleteMember =
    async (member) => {

      const confirmed =
        window.confirm(
          `Apakah Anda yakin ingin menghapus "${member.name}" dari struktur organisasi?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setSaving(true);
        setError("");
        setSuccess("");

        await deleteMember(
          member.id
        );

        setSuccess(
          "Anggota berhasil dihapus dari struktur organisasi."
        );

        await loadData();

      } catch (error) {

        console.error(
          "Gagal menghapus anggota:",
          error
        );

        setError(
          error.message ||
            "Gagal menghapus anggota."
        );

      } finally {

        setSaving(false);

      }

    };


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
      .filter(
        (member) =>
          member.active !== false
      )
      .sort(
        (a, b) =>
          (Number(a.order) || 0) -
          (Number(b.order) || 0)
      );

  };


  // =========================================================
  // GET ACCOUNT BY UID
  // =========================================================

  const getAccountByUid = (
    uid
  ) => {

    if (!uid) {
      return null;
    }

    return (
      memberAccounts.find(
        (account) =>
          account.uid === uid
      ) || null
    );

  };


  // =========================================================
  // GET PHOTO MEMBER
  // =========================================================

  const getMemberPhoto = (
    member
  ) => {

    const account =
      getAccountByUid(
        member.uid
      );

    /*
     * FOTO UTAMA SEKARANG DIAMBIL
     * DARI USERS/{UID}
     *
     * BUKAN DARI
     * organization_members
     */

    return account?.photo || "";

  };


  // =========================================================
  // GET AVAILABLE ACCOUNTS
  // =========================================================

  const getAvailableAccounts =
    () => {

      return memberAccounts.filter(
        (account) => {

          const alreadyUsed =
            members.some(
              (member) =>
                member.uid ===
                  account.uid &&
                member.id !==
                  editingMember?.id
            );

          return !alreadyUsed;

        }
      );

    };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="admin-page">

        <div className="admin-page-header">

          <div>

            <h1>
              Struktur Organisasi
            </h1>

            <p>
              Kelola bagian dan anggota
              organisasi.
            </p>

          </div>

        </div>


        <div
          style={{
            padding:
              "60px 20px",
            textAlign:
              "center",
          }}
        >
          Memuat struktur
          organisasi...
        </div>

      </div>

    );

  }


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

          <h1>
            Struktur Organisasi
          </h1>

          <p>
            Kelola susunan bagian dan
            anggota organisasi.
          </p>

        </div>


        <button
          type="button"
          className="admin-primary-button"
          onClick={
            handleAddSection
          }
        >
          + Tambah Bagian
        </button>

      </div>


      {/* ===================================================
          ALERT
      =================================================== */}

      {error && (

        <div className="admin-alert admin-alert-error">
          {error}
        </div>

      )}


      {success && (

        <div className="admin-alert admin-alert-success">
          {success}
        </div>

      )}


      {/* ===================================================
          POPUP TAMBAH / EDIT BAGIAN
      =================================================== */}

      {showSectionForm && (

        <div
          className="organization-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              resetSectionForm();

            }

          }}
        >

          <div className="organization-modal">


            {/* HEADER */}

            <div className="organization-modal-header">

              <div>

                <span className="organization-modal-label">
                  STRUKTUR ORGANISASI
                </span>

                <h2>

                  {editingSection
                    ? "Edit Bagian"
                    : "Tambah Bagian"}

                </h2>

                <p>

                  {editingSection
                    ? "Perbarui informasi bagian organisasi."
                    : "Tambahkan bagian baru ke struktur organisasi."}

                </p>

              </div>


              <button
                type="button"
                className="organization-modal-close"
                onClick={
                  resetSectionForm
                }
                disabled={
                  saving
                }
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="admin-form"
              onSubmit={
                handleSectionSubmit
              }
            >

              <div className="admin-form-grid">


                <div className="admin-form-group">

                  <label>
                    Nama Bagian
                  </label>

                  <input
                    type="text"
                    placeholder="Contoh: Ketua"
                    value={
                      sectionForm.name
                    }
                    onChange={(event) =>
                      setSectionForm({
                        ...sectionForm,

                        name:
                          event.target
                            .value,
                      })
                    }
                    autoFocus
                  />

                </div>


                <div className="admin-form-group">

                  <label>
                    Urutan
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      sectionForm.order
                    }
                    onChange={(event) =>
                      setSectionForm({
                        ...sectionForm,

                        order:
                          event.target
                            .value,
                      })
                    }
                  />

                </div>


              </div>


              <div className="admin-form-group">

                <label className="admin-checkbox-label">

                  <input
                    type="checkbox"
                    checked={
                      sectionForm.active
                    }
                    onChange={(event) =>
                      setSectionForm({
                        ...sectionForm,

                        active:
                          event.target
                            .checked,
                      })
                    }
                  />

                  Bagian aktif

                </label>

              </div>


              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={
                    resetSectionForm
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
                    : editingSection
                    ? "Simpan Perubahan"
                    : "Tambah Bagian"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ===================================================
          POPUP TAMBAH / EDIT ANGGOTA
      =================================================== */}

      {showMemberForm && (

        <div
          className="organization-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              resetMemberForm();

            }

          }}
        >

          <div className="organization-modal organization-member-modal">


            {/* HEADER */}

            <div className="organization-modal-header">

              <div>

                <span className="organization-modal-label">
                  ANGGOTA ORGANISASI
                </span>

                <h2>

                  {editingMember
                    ? "Edit Anggota"
                    : "Tambah Anggota"}

                </h2>

                <p>

                  {editingMember
                    ? "Perbarui informasi dan akun anggota."
                    : "Hubungkan anggota dengan akun yang sudah terdaftar."}

                </p>

              </div>


              <button
                type="button"
                className="organization-modal-close"
                onClick={
                  resetMemberForm
                }
                disabled={
                  saving
                }
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="admin-form"
              onSubmit={
                handleMemberSubmit
              }
            >


              {/* =========================================
                  AKUN
              ========================================= */}

              <div className="admin-form-group">

                <label>
                  Akun Anggota
                </label>


                <select
                  value={
                    memberForm.uid
                  }
                  onChange={
                    handleAccountChange
                  }
                >

                  <option value="">
                    Pilih Akun Anggota
                  </option>


                  {/*
                    SAAT EDIT:
                    akun yang sedang dipakai
                    juga harus tetap muncul.
                  */}

                  {editingMember &&
                    memberForm.uid &&
                    !memberAccounts.some(
                      (account) =>
                        account.uid ===
                        memberForm.uid
                    ) && (

                      <option
                        value={
                          memberForm.uid
                        }
                      >
                        {memberForm.name ||
                          "Akun Anggota"}
                        {" — "}
                        {memberForm.email ||
                          "Email tidak tersedia"}
                      </option>

                  )}


                  {getAvailableAccounts()
                    .map(
                      (account) => (

                        <option
                          key={
                            account.uid
                          }
                          value={
                            account.uid
                          }
                        >

                          {account.name ||
                            account.displayName ||
                            "Tanpa Nama"}

                          {" — "}

                          {account.email ||
                            "Tanpa Email"}

                        </option>

                      )
                    )}

                </select>


                {getAvailableAccounts()
                  .length === 0 &&
                  !editingMember && (

                    <small
                      style={{
                        display:
                          "block",

                        marginTop:
                          "7px",

                        color:
                          "#8a909d",
                      }}
                    >
                      Semua akun anggota
                      sudah digunakan
                      dalam struktur
                      organisasi.
                    </small>

                  )}

              </div>


              {/* =========================================
                  ACCOUNT INFO
              ========================================= */}

              {memberForm.uid && (

                <div className="organization-account-info">


                  {/* FOTO AKUN */}

                  <div
                    style={{
                      gridColumn:
                        "1 / -1",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap:
                        "12px",

                      paddingBottom:
                        "4px",
                    }}
                  >

                    <div
                      className="organization-member-avatar"
                      style={{
                        width:
                          "46px",

                        height:
                          "46px",

                        minWidth:
                          "46px",
                      }}
                    >

                      {getMemberPhoto({
                        uid:
                          memberForm.uid,
                      }) ? (

                        <img
                          src={
                            getMemberPhoto({
                              uid:
                                memberForm.uid,
                            })
                          }
                          alt={
                            memberForm.name
                          }
                        />

                      ) : (

                        <span>

                          {memberForm.name
                            ?.charAt(
                              0
                            )
                            ?.toUpperCase() ||
                            "?"}

                        </span>

                      )}

                    </div>


                    <div>

                      <span>
                        Foto Profil
                      </span>

                      <strong>

                        {getMemberPhoto({
                          uid:
                            memberForm.uid,
                        })
                          ? "Sudah tersedia"
                          : "Belum ada foto"}

                      </strong>

                    </div>

                  </div>


                  <div>

                    <span>
                      Akun
                    </span>

                    <strong>
                      {memberForm.name ||
                        "Tanpa Nama"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {memberForm.email ||
                        "Tanpa Email"}
                    </strong>

                  </div>


                </div>

              )}


              {/* =========================================
                  DATA MEMBER
              ========================================= */}

              <div className="admin-form-grid">


                <div className="admin-form-group">

                  <label>
                    Jabatan
                  </label>

                  <input
                    type="text"
                    placeholder="Contoh: Ketua"
                    value={
                      memberForm.position
                    }
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,

                        position:
                          event.target
                            .value,
                      })
                    }
                  />

                </div>


                <div className="admin-form-group">

                  <label>
                    Bagian
                  </label>

                  <select
                    value={
                      memberForm.sectionId
                    }
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,

                        sectionId:
                          event.target
                            .value,
                      })
                    }
                  >

                    <option value="">
                      Pilih Bagian
                    </option>


                    {sections
                      .filter(
                        (section) =>
                          section.active !==
                          false
                      )
                      .slice()
                      .sort(
                        (a, b) =>
                          (Number(
                            a.order
                          ) || 0) -
                          (Number(
                            b.order
                          ) || 0)
                      )
                      .map(
                        (section) => (

                          <option
                            key={
                              section.id
                            }
                            value={
                              section.id
                            }
                          >
                            {
                              section.name
                            }
                          </option>

                        )
                      )}

                  </select>

                </div>


                <div className="admin-form-group">

                  <label>
                    Urutan Anggota
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      memberForm.order
                    }
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,

                        order:
                          event.target
                            .value,
                      })
                    }
                  />

                </div>


              </div>


              {/* =========================================
                  INFO FOTO
              ========================================= */}

              <div
                style={{
                  padding:
                    "12px 14px",

                  border:
                    "1px solid #e5e7eb",

                  borderRadius:
                    "10px",

                  background:
                    "#f8f9fb",

                  fontSize:
                    "12px",

                  lineHeight:
                    "1.6",

                  color:
                    "#6b7280",
                }}
              >

                <strong
                  style={{
                    display:
                      "block",

                    color:
                      "#374151",

                    marginBottom:
                      "3px",
                  }}
                >
                  📷 Foto Anggota
                </strong>

                Foto anggota dikelola
                oleh anggota melalui
                halaman <strong>Profil
                Saya</strong>. Admin tidak
                perlu mengupload foto
                secara manual.

              </div>


              {/* =========================================
                  ACTIVE
              ========================================= */}

              <div className="admin-form-group">

                <label className="admin-checkbox-label">

                  <input
                    type="checkbox"
                    checked={
                      memberForm.active
                    }
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,

                        active:
                          event.target
                            .checked,
                      })
                    }
                  />

                  Anggota aktif

                </label>

              </div>


              {/* =========================================
                  ACTION
              ========================================= */}

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={
                    resetMemberForm
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
                    saving ||
                    (
                      getAvailableAccounts()
                        .length === 0 &&
                      !editingMember
                    )
                  }
                >

                  {saving
                    ? "Menyimpan..."
                    : editingMember
                    ? "Simpan Perubahan"
                    : "Tambah Anggota"}

                </button>

              </div>


            </form>

          </div>

        </div>

      )}


      {/* ===================================================
          ORGANIZATION LIST
      =================================================== */}

      <div className="organization-admin-list">


        {sections.length === 0 ? (

          <div className="admin-card">

            <div
              style={{
                textAlign:
                  "center",

                padding:
                  "50px 20px",
              }}
            >

              <div
                style={{
                  fontSize:
                    "50px",

                  marginBottom:
                    "15px",
                }}
              >
                🏢
              </div>


              <h2>
                Belum Ada Struktur
              </h2>


              <p>
                Tambahkan bagian pertama
                untuk membuat struktur
                organisasi.
              </p>


              <button
                type="button"
                className="admin-primary-button"
                onClick={
                  handleAddSection
                }
                style={{
                  marginTop:
                    "20px",
                }}
              >
                + Tambah Bagian
              </button>

            </div>

          </div>

        ) : (

          sections
            .slice()
            .sort(
              (a, b) =>
                (Number(a.order) ||
                  0) -
                (Number(b.order) ||
                  0)
            )
            .map(
              (section) => {

                const sectionMembers =
                  getMembersBySection(
                    section.id
                  );


                return (

                  <div
                    className="admin-card organization-section-card"
                    key={
                      section.id
                    }
                  >


                    {/* ======================================
                        SECTION HEADER
                    ====================================== */}

                    <div className="organization-section-header">


                      <div>

                        <span className="organization-order">

                          #
                          {
                            section.order
                          }

                        </span>


                        <h2>
                          {
                            section.name
                          }
                        </h2>


                        <span
                          className={
                            section.active
                              ? "admin-status active"
                              : "admin-status inactive"
                          }
                        >

                          {section.active
                            ? "Aktif"
                            : "Nonaktif"}

                        </span>

                      </div>


                      <div className="organization-section-actions">


                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() =>
                            handleEditSection(
                              section
                            )
                          }
                        >
                          Edit Bagian
                        </button>


                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() =>
                            handleDeleteSection(
                              section
                            )
                          }
                          disabled={
                            saving
                          }
                        >
                          Hapus
                        </button>


                      </div>

                    </div>


                    {/* ======================================
                        MEMBERS
                    ====================================== */}

                    <div className="organization-members">


                      {sectionMembers.length ===
                      0 ? (

                        <div className="organization-empty">

                          <span>
                            Belum ada anggota
                            di bagian ini.
                          </span>

                        </div>

                      ) : (

                        sectionMembers.map(
                          (member) => {

                            /*
                             * FOTO DIAMBIL DARI
                             * users/{uid}
                             */

                            const memberPhoto =
                              getMemberPhoto(
                                member
                              );


                            return (

                              <div
                                className="organization-member-row"
                                key={
                                  member.id
                                }
                              >


                                {/* AVATAR */}

                                <div className="organization-member-avatar">

                                  {memberPhoto ? (

                                    <img
                                      src={
                                        memberPhoto
                                      }
                                      alt={
                                        member.name
                                      }
                                    />

                                  ) : (

                                    <span>

                                      {member.name
                                        ?.charAt(
                                          0
                                        )
                                        ?.toUpperCase() ||
                                        "?"}

                                    </span>

                                  )}

                                </div>


                                {/* INFO */}

                                <div className="organization-member-info">

                                  <strong>
                                    {
                                      member.name
                                    }
                                  </strong>


                                  <span>
                                    {
                                      member.position
                                    }
                                  </span>


                                  {member.email && (

                                    <small
                                      style={{
                                        color:
                                          "#8a909d",

                                        fontSize:
                                          "12px",

                                        marginTop:
                                          "3px",
                                      }}
                                    >
                                      {
                                        member.email
                                      }
                                    </small>

                                  )}

                                </div>


                                {/* ACCOUNT */}

                                <div
                                  style={{
                                    minWidth:
                                      "80px",

                                    textAlign:
                                      "center",
                                  }}
                                >

                                  <small
                                    style={{
                                      display:
                                        "block",

                                      color:
                                        "#8a909d",

                                      fontSize:
                                        "11px",
                                    }}
                                  >
                                    AKUN
                                  </small>


                                  <span
                                    style={{
                                      color:
                                        member.uid
                                          ? "#168044"
                                          : "#c43b3b",

                                      fontSize:
                                        "12px",

                                      fontWeight:
                                        600,
                                    }}
                                  >

                                    {member.uid
                                      ? "Terhubung"
                                      : "Tidak ada"}

                                  </span>

                                </div>


                                {/* FOTO STATUS */}

                                <div
                                  style={{
                                    minWidth:
                                      "80px",

                                    textAlign:
                                      "center",
                                  }}
                                >

                                  <small
                                    style={{
                                      display:
                                        "block",

                                      color:
                                        "#8a909d",

                                      fontSize:
                                        "11px",
                                    }}
                                  >
                                    FOTO
                                  </small>


                                  <span
                                    style={{
                                      color:
                                        memberPhoto
                                          ? "#168044"
                                          : "#8a909d",

                                      fontSize:
                                        "12px",

                                      fontWeight:
                                        600,
                                    }}
                                  >

                                    {memberPhoto
                                      ? "Ada"
                                      : "Belum ada"}

                                  </span>

                                </div>


                                {/* ORDER */}

                                <div className="organization-member-order">

                                  #
                                  {
                                    member.order
                                  }

                                </div>


                                {/* ACTION */}

                                <div className="organization-member-actions">


                                  <button
                                    type="button"
                                    className="admin-edit-button"
                                    onClick={() =>
                                      handleEditMember(
                                        member
                                      )
                                    }
                                  >
                                    Edit
                                  </button>


                                  <button
                                    type="button"
                                    className="admin-delete-button"
                                    onClick={() =>
                                      handleDeleteMember(
                                        member
                                      )
                                    }
                                    disabled={
                                      saving
                                    }
                                  >
                                    Hapus
                                  </button>


                                </div>


                              </div>

                            );

                          }
                        )

                      )}

                    </div>


                    {/* ======================================
                        ADD MEMBER
                    ====================================== */}

                    <button
                      type="button"
                      className="organization-add-member"
                      onClick={() =>
                        handleAddMember(
                          section.id
                        )
                      }
                    >

                      + Tambah Anggota ke{" "}
                      {
                        section.name
                      }

                    </button>


                  </div>

                );

              }
            )

        )}

      </div>

    </div>

  );

}


export default Organization;