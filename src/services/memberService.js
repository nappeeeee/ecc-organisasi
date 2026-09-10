import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";


// =========================================================
// COLLECTION
// =========================================================

const membersCollection =
  collection(
    db,
    "organization_members"
  );

const attendanceCollection =
  collection(
    db,
    "attendance"
  );

const usersCollection =
  collection(
    db,
    "users"
  );


// =========================================================
// GET ORGANIZATION MEMBERS
// =========================================================

export const getOrganizationMembers =
  async () => {

    const membersQuery =
      query(
        membersCollection,
        orderBy(
          "order",
          "asc"
        )
      );

    const snapshot =
      await getDocs(
        membersQuery
      );

    return snapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data(),
      })
    );

  };


// =========================================================
// GET ALL USERS
// =========================================================

export const getAllUsers =
  async () => {

    const snapshot =
      await getDocs(
        usersCollection
      );

    return snapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data(),
      })
    );

  };


// =========================================================
// GET ALL MEMBER ATTENDANCE
// =========================================================

export const getAllMemberAttendance =
  async () => {

    const snapshot =
      await getDocs(
        attendanceCollection
      );

    return snapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data(),
      })
    );

  };


// =========================================================
// GET MEMBERS WITH ATTENDANCE
// SUMBER DATA ANGGOTA = USERS / KELOLA AKUN
// =========================================================

export const getMembersWithAttendance =
  async () => {

    const [
      users,
      attendance,
    ] = await Promise.all([

      getAllUsers(),

      getAllMemberAttendance(),

    ]);


    // =====================================================
    // HANYA AMBIL AKUN DENGAN ROLE ANGGOTA
    // =====================================================

    const memberUsers =
      users.filter(
        (user) =>
          user.role ===
          "anggota"
      );


    // =====================================================
    // GABUNG DATA ANGGOTA + ABSENSI
    // =====================================================

    return memberUsers.map(
      (user) => {

        /*
         * UID
         *
         * Biasanya ID document users sama dengan UID.
         * Tetapi kita tetap mendukung field uid jika tersedia.
         */

        const uid =
          user.uid ||
          user.id ||
          "";


        // =================================================
        // CARI ABSENSI BERDASARKAN UID
        // =================================================

        const memberAttendance =
          attendance.filter(
            (item) =>
              item.uid === uid
          );


        // =================================================
        // HITUNG HADIR
        // =================================================

        const hadir =
          memberAttendance.filter(
            (item) =>
              item.type ===
                "hadir" &&
              item.status ===
                "approved"
          ).length;


        // =================================================
        // HITUNG IZIN
        // =================================================

        const izin =
          memberAttendance.filter(
            (item) =>
              item.type ===
                "izin" &&
              item.status ===
                "approved"
          ).length;


        // =================================================
        // HITUNG SAKIT
        // =================================================

        const sakit =
          memberAttendance.filter(
            (item) =>
              item.type ===
                "sakit" &&
              item.status ===
                "approved"
          ).length;


        // =================================================
        // HITUNG PENDING
        // =================================================

        const pending =
          memberAttendance.filter(
            (item) =>
              item.status ===
              "pending"
          ).length;


        // =================================================
        // RETURN DATA ANGGOTA
        // =================================================

        return {

          /*
           * ID
           */

          id:
            user.id,


          /*
           * UID
           */

          uid:


            user.uid ||
            user.id,


          /*
           * NAMA
           */

          name:
            user.name ||
            user.displayName ||
            "Tanpa Nama",


          /*
           * EMAIL
           */

          email:
            user.email ||
            "",


          /*
           * FOTO
           */

          photo:
            user.photo ||
            "",


          /*
           * CLOUDINARY PUBLIC ID
           */

          photoPublicId:
            user.photoPublicId ||
            "",


          /*
           * KELAS
           */

          className:
            user.className ||
            "",


          /*
           * ROLE
           */

          role:
            user.role ||
            "anggota",


          /*
           * JABATAN
           *
           * Jika akun belum memiliki jabatan,
           * tampilkan default.
           */

          position:
            user.position ||
            user.jabatan ||
            user.role ||
            "Belum ada jabatan",


          /*
           * DATA ABSENSI
           */

          attendanceTotal:
            hadir +
            izin +
            sakit,


          hadir,

          izin,

          sakit,

          pending,


          /*
           * RIWAYAT ABSENSI
           */

          attendanceHistory:
            memberAttendance,

        };

      }
    );

  };


// =========================================================
// UPLOAD PROFILE PHOTO
// =========================================================

export const uploadProfilePhoto =
  async (file) => {

    if (!file) {

      throw new Error(
        "File foto tidak ditemukan."
      );

    }


    // =====================================================
    // CLOUDINARY CONFIG
    // =====================================================

    const cloudName =
      import.meta.env
        .VITE_CLOUDINARY_CLOUD_NAME;


    const uploadPreset =
      import.meta.env
        .VITE_CLOUDINARY_UPLOAD_PRESET;


    if (
      !cloudName ||
      !uploadPreset
    ) {

      throw new Error(
        "Konfigurasi Cloudinary belum tersedia."
      );

    }


    // =====================================================
    // FORM DATA
    // =====================================================

    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );


    formData.append(
      "upload_preset",
      uploadPreset
    );


    formData.append(
      "folder",
      "organisasi/profile"
    );


    // =====================================================
    // UPLOAD CLOUDINARY
    // =====================================================

    const response =
      await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method:
            "POST",

          body:
            formData,
        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.error?.message ||
        "Gagal mengupload foto."
      );

    }


    return {

      url:
        result.secure_url,

      publicId:
        result.public_id,

    };

  };


// =========================================================
// UPDATE PROFILE PHOTO
// =========================================================

export const updateProfilePhoto =
  async (
    uid,
    photo,
    photoPublicId = ""
  ) => {

    if (!uid) {

      throw new Error(
        "UID anggota tidak ditemukan."
      );

    }


    // =====================================================
    // 1. UPDATE USERS/{UID}
    // =====================================================

    const userRef =
      doc(
        db,
        "users",
        uid
      );


    await updateDoc(
      userRef,
      {

        photo:
          photo || "",

        photoPublicId:
          photoPublicId || "",

        updatedAt:
          new Date(),

      }
    );


    // =====================================================
    // 2. CARI DATA MEMBER BERDASARKAN UID
    // =====================================================

    const memberQuery =
      query(
        membersCollection,
        where(
          "uid",
          "==",
          uid
        )
      );


    const memberSnapshot =
      await getDocs(
        memberQuery
      );


    // =====================================================
    // 3. UPDATE FOTO DI ORGANIZATION_MEMBERS
    // =====================================================

    if (
      !memberSnapshot.empty
    ) {

      const updatePromises =
        memberSnapshot.docs.map(
          async (memberDocument) => {

            const memberRef =
              doc(
                db,
                "organization_members",
                memberDocument.id
              );


            await updateDoc(
              memberRef,
              {

                photo:
                  photo || "",

                photoPublicId:
                  photoPublicId || "",

                updatedAt:
                  new Date(),

              }
            );

          }
        );


      await Promise.all(
        updatePromises
      );

    }


    // =====================================================
    // SELESAI
    // =====================================================

    return {

      success:
        true,

    };

  };