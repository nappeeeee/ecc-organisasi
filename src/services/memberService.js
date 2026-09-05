import {
  collection,
  getDocs,
  query,
  orderBy,
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
// =========================================================

export const getMembersWithAttendance =
  async () => {

    const [
      members,
      attendance,
      users,
    ] = await Promise.all([

      getOrganizationMembers(),

      getAllMemberAttendance(),

      getAllUsers(),

    ]);


    // =====================================================
    // USER MAP
    // =====================================================

    const userMap =
      new Map();


    users.forEach(
      (user) => {

        if (user.uid) {

          userMap.set(
            user.uid,
            user
          );

        } else if (user.id) {

          userMap.set(
            user.id,
            user
          );

        }

      }
    );


    // =====================================================
    // GABUNG MEMBER + USER
    // =====================================================

    const membersWithUserData =
      members.map(
        (member) => {

          const user =
            member.uid
              ? userMap.get(
                  member.uid
                )
              : null;


          /*
           * FOTO SEKARANG DIAMBIL
           * DARI users/{uid}.photo
           *
           * BUKAN DARI
           * organization_members.photo
           */

          const photo =
            user?.photo || "";


          const name =
            member.name ||
            user?.name ||
            user?.displayName ||
            "Tanpa Nama";


          const email =
            member.email ||
            user?.email ||
            "";


          return {

            ...member,

            name,

            email,

            photo,

            photoPublicId:
              user?.photoPublicId ||
              "",

          };

        }
      );


    // =====================================================
    // GABUNG DATA ABSENSI
    // =====================================================

    return membersWithUserData.map(
      (member) => {

        const memberAttendance =
          member.uid
            ? attendance.filter(
                (item) =>
                  item.uid ===
                  member.uid
              )
            : [];


        const hadir =
          memberAttendance.filter(
            (item) =>
              item.type ===
                "hadir" &&
              item.status ===
                "approved"
          ).length;


        const izin =
          memberAttendance.filter(
            (item) =>
              item.type ===
                "izin" &&
              item.status ===
                "approved"
          ).length;


        const sakit =
          memberAttendance.filter(
            (item) =>
              item.type ===
                "sakit" &&
              item.status ===
                "approved"
          ).length;


        const pending =
          memberAttendance.filter(
            (item) =>
              item.status ===
              "pending"
          ).length;


        return {

          ...member,

          attendanceTotal:
            hadir +
            izin +
            sakit,

          hadir,

          izin,

          sakit,

          pending,

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


    return {
      success:
        true,
    };

  };