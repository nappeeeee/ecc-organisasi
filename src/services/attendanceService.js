import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

const attendanceCollection = collection(
  db,
  "attendance"
);

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


// =====================================================
// VALIDASI FOTO
// =====================================================

const validateProofImage = (file) => {
  if (!file) {
    throw new Error("Foto bukti belum dipilih.");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Format foto harus JPG, PNG, atau WEBP."
    );
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Ukuran foto maksimal 5 MB."
    );
  }

  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "Cloudinary Cloud Name belum dikonfigurasi."
    );
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary Upload Preset belum dikonfigurasi."
    );
  }
};


// =====================================================
// UPLOAD FOTO BUKTI SAKIT
// =====================================================

export const uploadAttendanceProof = async (file) => {
  validateProofImage(file);

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );

  formData.append(
    "folder",
    "website-organisasi/attendance"
  );

  const uploadURL =
    `https://api.cloudinary.com/v1_1/` +
    `${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const response = await fetch(
    uploadURL,
    {
      method: "POST",
      body: formData,
    }
  );

  const result =
    await response.json();

  if (!response.ok) {
    console.error(
      "Cloudinary attendance error:",
      result
    );

    throw new Error(
      result?.error?.message ||
        "Gagal mengupload bukti sakit."
    );
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};


// =====================================================
// CEK APAKAH ANGGOTA SUDAH MENGAJUKAN ABSEN
// =====================================================

export const checkAttendanceExists = async (
  uid,
  date,
  activity
) => {
  const attendanceQuery = query(
    attendanceCollection,
    where("uid", "==", uid),
    where("date", "==", date),
    where("activity", "==", activity)
  );

  const snapshot =
    await getDocs(attendanceQuery);

  return !snapshot.empty;
};


// =====================================================
// BUAT PENGAJUAN ABSENSI
// =====================================================

export const createAttendance = async (data) => {

  if (!data.uid) {
    throw new Error(
      "Data anggota tidak ditemukan."
    );
  }

  if (!data.name) {
    throw new Error(
      "Nama anggota tidak ditemukan."
    );
  }

  if (!data.activity) {
    throw new Error(
      "Kegiatan belum dipilih."
    );
  }

  if (!data.date) {
    throw new Error(
      "Tanggal belum dipilih."
    );
  }

  if (!data.type) {
    throw new Error(
      "Jenis absensi belum dipilih."
    );
  }


  // Cek apakah sudah pernah mengajukan
  const exists =
    await checkAttendanceExists(
      data.uid,
      data.date,
      data.activity
    );

  if (exists) {
    throw new Error(
      "Kamu sudah mengajukan absensi untuk kegiatan dan tanggal tersebut."
    );
  }


  const attendanceData = {

    uid: data.uid,

    name: data.name,

    activity: data.activity,

    date: data.date,

    type: data.type,

    description:
      data.description || "",

    proofImage:
      data.proofImage || "",

    proofImagePublicId:
      data.proofImagePublicId || "",

    status: "pending",

    adminNote: "",

    approvedBy: "",

    approvedAt: null,

    createdAt:
      serverTimestamp(),

  };


  const document =
    await addDoc(
      attendanceCollection,
      attendanceData
    );


  return {
    id: document.id,
    ...attendanceData,
  };
};


// =====================================================
// AMBIL ABSENSI MILIK ANGGOTA
// =====================================================

export const getMemberAttendance = async (uid) => {
  if (!uid) {
    return [];
  }

  const attendanceQuery = query(
    attendanceCollection,
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(attendanceQuery);

  const data = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

  data.sort((a, b) => {
    const aTime = a.createdAt?.toMillis
      ? a.createdAt.toMillis()
      : 0;

    const bTime = b.createdAt?.toMillis
      ? b.createdAt.toMillis()
      : 0;

    return bTime - aTime;
  });

  return data;
};


// =====================================================
// AMBIL SEMUA ABSENSI UNTUK ADMIN
// =====================================================

export const getAllAttendance = async () => {

  const attendanceQuery =
    query(
      attendanceCollection,
      orderBy(
        "createdAt",
        "desc"
      )
    );

  const snapshot =
    await getDocs(
      attendanceQuery
    );

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data(),
    })
  );
};


// =====================================================
// AMBIL SATU DATA ABSENSI
// =====================================================

export const getAttendanceById =
  async (id) => {

    const attendanceRef =
      doc(
        db,
        "attendance",
        id
      );

    const snapshot =
      await getDoc(
        attendanceRef
      );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  };


// =====================================================
// UPDATE STATUS ABSENSI OLEH ADMIN
// =====================================================

export const updateAttendanceStatus =
  async (
    id,
    status,
    adminNote,
    approvedBy
  ) => {

    const attendanceRef =
      doc(
        db,
        "attendance",
        id
      );

    const updateData = {
      status,
      adminNote:
        adminNote || "",
    };


    if (
      status === "approved"
    ) {

      updateData.approvedBy =
        approvedBy || "";

      updateData.approvedAt =
        serverTimestamp();

    } else {

      updateData.approvedBy =
        "";

      updateData.approvedAt =
        null;

    }


    await updateDoc(
      attendanceRef,
      updateData
    );
  };