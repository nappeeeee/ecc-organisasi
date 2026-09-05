import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import {
  db,
  auth,
} from "../../firebase/config";

import {
  uploadProfilePhoto,
  updateProfilePhoto,
} from "../../services/memberService";


function Profile() {

  const {
    user,
    userData,
  } = useAuth();


  const fileInputRef =
    useRef(null);


  /* =========================================================
     PROFILE STATE
     ========================================================= */

  const [profileData, setProfileData] =
    useState(userData);


  const [selectedFile, setSelectedFile] =
    useState(null);


  const [preview, setPreview] =
    useState("");


  const [uploading, setUploading] =
    useState(false);


  const [message, setMessage] =
    useState("");


  const [error, setError] =
    useState("");


  /* =========================================================
     PASSWORD STATE
     ========================================================= */

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);


  const [currentPassword, setCurrentPassword] =
    useState("");


  const [newPassword, setNewPassword] =
    useState("");


  const [confirmPassword, setConfirmPassword] =
    useState("");


  const [changingPassword, setChangingPassword] =
    useState(false);


  /* =========================================================
     PASSWORD VISIBILITY
     ========================================================= */

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);


  const [showNewPassword, setShowNewPassword] =
    useState(false);


  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  /* =========================================================
     LOAD USER DATA
     ========================================================= */

  useEffect(() => {

    const loadProfile = async () => {

      if (!user?.uid) {
        return;
      }


      try {

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );


        const snapshot =
          await getDoc(userRef);


        if (snapshot.exists()) {

          setProfileData(
            snapshot.data()
          );

        }

      } catch (err) {

        console.error(
          "Gagal mengambil profil:",
          err
        );

      }

    };


    loadProfile();

  }, [user?.uid]);


  /* =========================================================
     DATA PROFIL
     ========================================================= */

  const name =
    profileData?.name ||
    userData?.name ||
    "Nama Anggota";


  const email =
    profileData?.email ||
    userData?.email ||
    user?.email ||
    "-";


  const className =
    profileData?.className ||
    userData?.className ||
    "-";


  const photo =
    profileData?.photo ||
    "";


  /* =========================================================
     PILIH FOTO
     ========================================================= */

  const handleSelectPhoto = (
    event
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    setMessage("");
    setError("");


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "File harus berupa gambar."
      );

      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      setError(
        "Ukuran foto maksimal 5 MB."
      );

      return;
    }


    setSelectedFile(file);


    const previewUrl =
      URL.createObjectURL(
        file
      );


    setPreview(
      previewUrl
    );

  };


  /* =========================================================
     UPLOAD FOTO
     ========================================================= */

  const handleUploadPhoto =
    async () => {

      if (!selectedFile) {
        return;
      }


      if (!user?.uid) {

        setError(
          "Akun tidak ditemukan."
        );

        return;
      }


      try {

        setUploading(true);

        setMessage("");
        setError("");


        const uploaded =
          await uploadProfilePhoto(
            selectedFile
          );


        await updateProfilePhoto(
          user.uid,
          uploaded.url,
          uploaded.publicId
        );


        setProfileData(
          (previous) => ({
            ...previous,
            photo:
              uploaded.url,
            photoPublicId:
              uploaded.publicId,
          })
        );


        setSelectedFile(
          null
        );


        setPreview(
          ""
        );


        setMessage(
          "Foto profil berhasil diperbarui."
        );


        if (
          fileInputRef.current
        ) {

          fileInputRef.current.value =
            "";

        }

      } catch (err) {

        console.error(
          "Gagal upload foto:",
          err
        );


        setError(
          err.message ||
          "Gagal mengupload foto."
        );

      } finally {

        setUploading(false);

      }

    };


  /* =========================================================
     BATAL PILIH FOTO
     ========================================================= */

  const handleCancelPhoto =
    () => {

      setSelectedFile(
        null
      );


      setPreview(
        ""
      );


      setMessage("");
      setError("");


      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          "";

      }

    };


  /* =========================================================
     BUKA MODAL PASSWORD
     ========================================================= */

  const handleOpenPasswordModal =
    () => {

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");


      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);


      setError("");
      setMessage("");


      setShowPasswordModal(true);

    };


  /* =========================================================
     TUTUP MODAL PASSWORD
     ========================================================= */

  const handleClosePasswordModal =
    () => {

      if (changingPassword) {
        return;
      }


      setShowPasswordModal(false);


      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");


      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);


      setError("");

    };


  /* =========================================================
     GANTI PASSWORD
     ========================================================= */

  const handleChangePassword =
    async () => {

      setError("");
      setMessage("");


      /* Cek user */

      if (!auth.currentUser) {

        setError(
          "Akun tidak ditemukan. Silakan login kembali."
        );

        return;
      }


      /* Password lama */

      if (!currentPassword) {

        setError(
          "Password lama wajib diisi."
        );

        return;
      }


      /* Password baru */

      if (!newPassword) {

        setError(
          "Password baru wajib diisi."
        );

        return;
      }


      /* Minimal 6 karakter */

      if (
        newPassword.length < 6
      ) {

        setError(
          "Password baru minimal 6 karakter."
        );

        return;
      }


      /* Konfirmasi */

      if (!confirmPassword) {

        setError(
          "Konfirmasi password wajib diisi."
        );

        return;
      }


      /* Password tidak sama */

      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "Password baru dan konfirmasi password tidak sama."
        );

        return;
      }


      /* Password baru tidak boleh sama
         dengan password lama */

      if (
        currentPassword ===
        newPassword
      ) {

        setError(
          "Password baru harus berbeda dengan password lama."
        );

        return;
      }


      try {

        setChangingPassword(true);


        /* ===================================================
           RE-AUTHENTICATION
           =================================================== */

        const credential =
          EmailAuthProvider.credential(
            auth.currentUser.email,
            currentPassword
          );


        await reauthenticateWithCredential(
          auth.currentUser,
          credential
        );


        /* ===================================================
           UPDATE PASSWORD
           =================================================== */

        await updatePassword(
          auth.currentUser,
          newPassword
        );


        /* ===================================================
           BERHASIL
           =================================================== */

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");


        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);


        setShowPasswordModal(false);


        setMessage(
          "Password berhasil diperbarui."
        );

      } catch (err) {

        console.error(
          "Gagal mengganti password:",
          err
        );


        if (
          err.code ===
          "auth/invalid-credential"
        ) {

          setError(
            "Password lama salah."
          );

        }

        else if (
          err.code ===
          "auth/wrong-password"
        ) {

          setError(
            "Password lama salah."
          );

        }

        else if (
          err.code ===
          "auth/invalid-email"
        ) {

          setError(
            "Email akun tidak valid."
          );

        }

        else if (
          err.code ===
          "auth/weak-password"
        ) {

          setError(
            "Password baru terlalu lemah. Gunakan minimal 6 karakter."
          );

        }

        else if (
          err.code ===
          "auth/requires-recent-login"
        ) {

          setError(
            "Sesi login sudah terlalu lama. Silakan logout dan login kembali, lalu coba lagi."
          );

        }

        else {

          setError(
            err.message ||
            "Gagal mengganti password."
          );

        }

      } finally {

        setChangingPassword(false);

      }

    };


  /* =========================================================
     AVATAR
     ========================================================= */

  const avatarImage =
    preview ||
    photo;


  return (

    <div className="member-page">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="member-page-header">

        <div>

          <h1>
            Profil Saya
          </h1>

          <p>
            Informasi akun dan data anggota
            organisasi.
          </p>

        </div>

      </div>


      {/* =====================================================
          PROFILE CARD
          ===================================================== */}

      <div className="member-profile-card">


        {/* ===================================================
            PROFILE HEADER
            =================================================== */}

        <div className="member-profile-header">


          {/* FOTO */}

          <div className="member-profile-photo-wrapper">

            {avatarImage ? (

              <img
                src={avatarImage}
                alt={"Foto " + name}
                className="member-profile-photo"
              />

            ) : (

              <div className="member-profile-avatar">

                {name
                  .charAt(0)
                  .toUpperCase()}

              </div>

            )}


            {/* CAMERA */}

            <button
              type="button"
              className="member-profile-photo-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading}
              title="Pilih foto"
            >
              📷
            </button>


            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={
                handleSelectPhoto
              }
              hidden
            />

          </div>


          {/* NAMA */}

          <div>

            <h2>
              {name}
            </h2>

            <span>
              Anggota Organisasi
            </span>

          </div>

        </div>


        {/* ===================================================
            FOTO ACTION
            =================================================== */}

        {selectedFile && (

          <div className="member-profile-photo-actions">

            <div>

              <strong>
                Foto baru dipilih
              </strong>

              <span>
                {selectedFile.name}
              </span>

            </div>


            <div className="member-profile-photo-buttons">

              <button
                type="button"
                className="member-profile-upload-button"
                onClick={
                  handleUploadPhoto
                }
                disabled={uploading}
              >

                {uploading
                  ? "Mengupload..."
                  : "Simpan Foto"}

              </button>


              <button
                type="button"
                className="member-profile-cancel-button"
                onClick={
                  handleCancelPhoto
                }
                disabled={uploading}
              >

                Batal

              </button>

            </div>

          </div>

        )}


        {/* ===================================================
            MESSAGE
            =================================================== */}

        {message && (

          <div className="member-profile-success">
            {message}
          </div>

        )}


        {error && !showPasswordModal && (

          <div className="member-profile-error">
            {error}
          </div>

        )}


        {/* ===================================================
            DATA PROFIL
            =================================================== */}

        <div className="member-profile-body">


          {/* NAMA */}

          <div className="member-profile-field">

            <label>
              Nama Lengkap
            </label>

            <div>
              {name}
            </div>

          </div>


          {/* EMAIL */}

          <div className="member-profile-field">

            <label>
              Email
            </label>

            <div>
              {email}
            </div>

          </div>


          {/* KELAS */}

          <div className="member-profile-field">

            <label>
              Kelas
            </label>

            <div>
              {className}
            </div>

          </div>


          {/* ROLE */}

          <div className="member-profile-field">

            <label>
              Role
            </label>

            <div>
              Anggota
            </div>

          </div>


          {/* STATUS */}

          <div className="member-profile-field">

            <label>
              Status
            </label>

            <div>

              <span className="member-status-active">
                Aktif
              </span>

            </div>

          </div>


        </div>


        {/* ===================================================
            PASSWORD
            =================================================== */}

        <div className="member-profile-password-section">


          <div className="member-profile-password-card">

            <div className="member-profile-password-icon">
              🔐
            </div>


            <div className="member-profile-password-text">

              <h3>
                Password
              </h3>

              <p>
                Ubah password akun Anda secara
                langsung dan aman.
              </p>

            </div>


            <button
              type="button"
              className="member-profile-password-open-button"
              onClick={
                handleOpenPasswordModal
              }
            >
              Ganti Password
            </button>

          </div>

        </div>


      </div>


      {/* =====================================================
          PASSWORD MODAL
          ===================================================== */}

      {showPasswordModal && (

        <div
          className="member-password-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              handleClosePasswordModal();

            }

          }}
        >

          <div
            className="member-password-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="member-password-modal-header">

              <div>

                <h2>
                  Ganti Password
                </h2>

                <p>
                  Masukkan password lama dan
                  password baru Anda.
                </p>

              </div>


              <button
                type="button"
                className="member-password-modal-close"
                onClick={
                  handleClosePasswordModal
                }
                disabled={
                  changingPassword
                }
                title="Tutup"
              >
                ×
              </button>

            </div>


            {/* ERROR */}

            {error && (

              <div className="member-profile-error">

                {error}

              </div>

            )}


            {/* =================================================
                PASSWORD LAMA
                ================================================= */}

            <div className="member-password-input-group">

              <label>
                Password Lama
              </label>


              <div className="member-password-input-wrapper">

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    currentPassword
                  }
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value
                    )
                  }
                  placeholder="Masukkan password lama"
                  disabled={
                    changingPassword
                  }
                  autoComplete="current-password"
                />


                <button
                  type="button"
                  className="member-password-eye-button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                  disabled={
                    changingPassword
                  }
                  title={
                    showCurrentPassword
                      ? "Sembunyikan password"
                      : "Lihat password"
                  }
                >

                  {showCurrentPassword
                    ? "🙈"
                    : "👁️"}

                </button>

              </div>

            </div>


            {/* =================================================
                PASSWORD BARU
                ================================================= */}

            <div className="member-password-input-group">

              <label>
                Password Baru
              </label>


              <div className="member-password-input-wrapper">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    newPassword
                  }
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="Masukkan password baru"
                  disabled={
                    changingPassword
                  }
                  autoComplete="new-password"
                />


                <button
                  type="button"
                  className="member-password-eye-button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  disabled={
                    changingPassword
                  }
                  title={
                    showNewPassword
                      ? "Sembunyikan password"
                      : "Lihat password"
                  }
                >

                  {showNewPassword
                    ? "🙈"
                    : "👁️"}

                </button>

              </div>


              <small>
                Minimal 6 karakter.
              </small>

            </div>


            {/* =================================================
                KONFIRMASI
                ================================================= */}

            <div className="member-password-input-group">

              <label>
                Konfirmasi Password Baru
              </label>


              <div className="member-password-input-wrapper">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Ulangi password baru"
                  disabled={
                    changingPassword
                  }
                  autoComplete="new-password"
                />


                <button
                  type="button"
                  className="member-password-eye-button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={
                    changingPassword
                  }
                  title={
                    showConfirmPassword
                      ? "Sembunyikan password"
                      : "Lihat password"
                  }
                >

                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}

                </button>

              </div>

            </div>


            {/* =================================================
                ACTION
                ================================================= */}

            <div className="member-password-modal-actions">

              <button
                type="button"
                className="member-password-modal-cancel"
                onClick={
                  handleClosePasswordModal
                }
                disabled={
                  changingPassword
                }
              >
                Batal
              </button>


              <button
                type="button"
                className="member-password-modal-save"
                onClick={
                  handleChangePassword
                }
                disabled={
                  changingPassword
                }
              >

                {changingPassword
                  ? "Menyimpan..."
                  : "Simpan Password"}

              </button>

            </div>


            {/* INFO */}

            <div className="member-password-modal-info">

              <span>
                🔒
              </span>

              <p>
                Password baru hanya diketahui
                oleh Anda dan tidak dapat dilihat
                oleh admin.
              </p>

            </div>


          </div>

        </div>

      )}

    </div>

  );

}


export default Profile;

