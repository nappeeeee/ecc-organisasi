import { initializeApp, getApps } from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

import {
  firebaseConfig,
  db,
  auth,
} from "../firebase/config";


// ======================================================
// SECONDARY FIREBASE APP
// Digunakan untuk membuat akun baru tanpa logout
// admin yang sedang login
// ======================================================

const secondaryApp =
  getApps().find(
    (app) => app.name === "Secondary"
  ) ||
  initializeApp(
    firebaseConfig,
    "Secondary"
  );

const secondaryAuth = getAuth(
  secondaryApp
);


// ======================================================
// MENGAMBIL ID TOKEN ADMIN
// Token ini digunakan untuk mengakses API server
// ======================================================

const getAdminToken = async () => {
  if (!auth.currentUser) {
    throw new Error(
      "Anda belum login."
    );
  }

  return await auth.currentUser.getIdToken();
};


// ======================================================
// MEMBUAT AKUN BARU
// ======================================================

export const createAccount = async ({
  name,
  email,
  password,
  role,
  className,
}) => {

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );


    const user =
      userCredential.user;


    await setDoc(
      doc(
        db,
        "users",
        user.uid
      ),
      {

        uid:
          user.uid,

        name:
          name,

        email:
          email,

        role:
          role,

        className:
          role === "anggota"
            ? className || ""
            : "",

        createdAt:
          new Date(),

      }
    );


    await signOut(
      secondaryAuth
    );


    return {

      success:
        true,

      uid:
        user.uid,

    };


  } catch (error) {

    console.error(
      "Gagal membuat akun:",
      error
    );


    try {

      await signOut(
        secondaryAuth
      );

    } catch (logoutError) {

      console.error(
        "Gagal logout secondary auth:",
        logoutError
      );

    }


    throw error;

  }

};


// ======================================================
// MENGAMBIL SEMUA AKUN
// ======================================================

export const getAccounts = async () => {
  const snapshot =
    await getDocs(
      collection(
        db,
        "users"
      )
    );

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data(),
    })
  );
};


// ======================================================
// MENGAMBIL SEMUA AKUN ANGGOTA
//
// Digunakan oleh:
// Admin > Struktur Organisasi
//
// Hanya akun dengan:
// role === "anggota"
//
// Yang dikembalikan:
// - uid
// - name
// - email
// - role
// - data lainnya
// ======================================================

export const getMemberAccounts = async () => {
  const accounts =
    await getAccounts();

  return accounts.filter(
    (account) =>
      account.role === "anggota"
  );
};


// ======================================================
// MENGAMBIL AKUN BERDASARKAN UID
//
// Berguna jika nanti kita perlu mengambil
// data akun tertentu berdasarkan UID.
// ======================================================

export const getAccountByUid = async (
  uid
) => {
  if (!uid) {
    return null;
  }

  const accounts =
    await getAccounts();

  return (
    accounts.find(
      (account) =>
        account.uid === uid ||
        account.id === uid
    ) || null
  );
};


// ======================================================
// UPDATE AKUN
//
// Update dilakukan melalui API server
// supaya Firebase Authentication juga bisa diperbarui.
//
// Yang bisa diperbarui:
// - Nama
// - Email
// - Role
// ======================================================

export const updateAccount = async (
  uid,
  data
) => {

  const token =
    await getAdminToken();


  const response =
    await fetch(
      `/api/admin/accounts/${uid}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
          className:
            data.role === "anggota"
              ? data.className || ""
              : "",
        }),
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    const error =
      new Error(
        result.message ||
        "Gagal memperbarui akun."
      );

    error.code =
      "api/update-account";

    throw error;
  }


  return result;
};


// ======================================================
// DELETE AKUN
//
// Menghapus akun melalui API server.
//
// API server akan menghapus:
// 1. Firebase Authentication
// 2. Firestore users/{uid}
// ======================================================

export const deleteAccount = async (
  uid
) => {

  const token =
    await getAdminToken();


  const response =
    await fetch(
      `/api/admin/accounts/${uid}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    const error =
      new Error(
        result.message ||
        "Gagal menghapus akun."
      );

    error.code =
      "api/delete-account";

    throw error;
  }


  return result;
};


// ======================================================
// DELETE DATA FIRESTORE SAJA
//
// Fungsi lama.
//
// Untuk penghapusan akun secara penuh,
// gunakan deleteAccount() di atas.
//
// Jangan gunakan fungsi ini untuk tombol Hapus
// karena Firebase Authentication tidak ikut terhapus.
// ======================================================

export const deleteAccountData = async (
  uid
) => {

  await deleteDoc(
    doc(
      db,
      "users",
      uid
    )
  );
};