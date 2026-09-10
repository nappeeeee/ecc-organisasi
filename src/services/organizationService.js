import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase/config";

// =========================================================
// CLOUDINARY
// =========================================================

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// =========================================================
// COLLECTION
// =========================================================

const sectionsCollection = collection(
  db,
  "organization_sections"
);

const membersCollection = collection(
  db,
  "organization_members"
);

// =========================================================
// UPLOAD FOTO ANGGOTA
// =========================================================

const validateMemberPhoto = (file) => {
  if (!file) {
    throw new Error("File foto tidak ditemukan.");
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

export const uploadMemberPhoto = async (file) => {
  validateMemberPhoto(file);

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );

  formData.append(
    "folder",
    "website-organisasi/members"
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

  const result = await response.json();

  if (!response.ok) {
    console.error(
      "Cloudinary member photo error:",
      result
    );

    throw new Error(
      result?.error?.message ||
        "Gagal mengupload foto anggota."
    );
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

// =========================================================
// BAGIAN / DIVISI
// =========================================================

export const getSections = async () => {
  const sectionQuery = query(
    sectionsCollection,
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(sectionQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
};

export const getSectionById = async (id) => {
  const sectionRef = doc(
    db,
    "organization_sections",
    id
  );

  const snapshot = await getDoc(sectionRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

export const createSection = async (data) => {
  const sectionData = {
    name: data.name.trim(),
    order: Number(data.order) || 1,
    active: data.active ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const document = await addDoc(
    sectionsCollection,
    sectionData
  );

  return {
    id: document.id,
    ...sectionData,
  };
};

export const updateSection = async (id, data) => {
  const sectionRef = doc(
    db,
    "organization_sections",
    id
  );

  await updateDoc(sectionRef, {
    name: data.name.trim(),
    order: Number(data.order) || 1,
    active: data.active ?? true,
    updatedAt: new Date(),
  });
};

export const deleteSection = async (id) => {
  const sectionRef = doc(
    db,
    "organization_sections",
    id
  );

  await deleteDoc(sectionRef);
};

// =========================================================
// ANGGOTA
// =========================================================

export const getMembers = async () => {
  const memberQuery = query(
    membersCollection,
    orderBy("order", "asc")
  );

  const snapshot =
    await getDocs(memberQuery);

  const members =
    snapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data(),
      })
    );

  // ==========================================
  // AMBIL FOTO DARI API
  // SUMBER DATA:
  // users/{uid}.photo
  // ==========================================

  let photos = {};

  try {
    const response =
      await fetch(
        "/api/public-member-photos"
      );

    if (response.ok) {
      const result =
        await response.json();

      if (
        result.success &&
        result.photos
      ) {
        photos =
          result.photos;
      }
    }
  } catch (error) {
    console.error(
      "Gagal mengambil foto anggota:",
      error
    );
  }

  // ==========================================
  // GABUNGKAN DATA MEMBER + FOTO
  // ==========================================

  return members.map(
    (member) => ({
      ...member,

      // FOTO PRIORITAS DARI users/{uid}.photo
      photo:
        member.uid &&
        photos[member.uid]
          ? photos[member.uid]
          : "",
    })
  );
};

export const getMemberById = async (id) => {
  const memberRef = doc(
    db,
    "organization_members",
    id
  );

  const snapshot = await getDoc(memberRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// =========================================================
// CREATE ANGGOTA
// =========================================================

export const createMember = async (data) => {
  const memberData = {
    uid: data.uid || "",
    name: data.name.trim(),
    email: data.email || "",
    position: data.position.trim(),
    sectionId: data.sectionId,
    photo: data.photo || "",
    photoPublicId: data.photoPublicId || "",
    order: Number(data.order) || 1,
    active: data.active ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const document = await addDoc(
    membersCollection,
    memberData
  );

  return {
    id: document.id,
    ...memberData,
  };
};

// =========================================================
// UPDATE ANGGOTA
// =========================================================

export const updateMember = async (id, data) => {
  const memberRef = doc(
    db,
    "organization_members",
    id
  );

  await updateDoc(memberRef, {
    uid: data.uid || "",
    name: data.name.trim(),
    email: data.email || "",
    position: data.position.trim(),
    sectionId: data.sectionId,
    photo: data.photo || "",
    photoPublicId: data.photoPublicId || "",
    order: Number(data.order) || 1,
    active: data.active ?? true,
    updatedAt: new Date(),
  });
};

// =========================================================
// DELETE ANGGOTA
// =========================================================

export const deleteMember = async (id) => {
  const memberRef = doc(
    db,
    "organization_members",
    id
  );

  await deleteDoc(memberRef);
};