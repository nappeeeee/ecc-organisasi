import {
  doc,
  getDoc,
  setDoc,
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
// FIRESTORE
// =========================================================

const aboutRef = doc(
  db,
  "organization_info",
  "main"
);

// =========================================================
// VALIDASI FOTO
// =========================================================

const validateOrganizationPhoto = (file) => {
  if (!file) {
    throw new Error(
      "File foto tidak ditemukan."
    );
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

// =========================================================
// GET DATA TENTANG
// =========================================================

export const getAbout = async () => {
  const snapshot =
    await getDoc(aboutRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// =========================================================
// UPLOAD FOTO ORGANISASI
// =========================================================

export const uploadOrganizationPhoto =
  async (file) => {
    validateOrganizationPhoto(file);

    const formData =
      new FormData();

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
      "website-organisasi/about"
    );

    const uploadURL =
      `https://api.cloudinary.com/v1_1/` +
      `${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response =
      await fetch(
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
        "Cloudinary organization photo error:",
        result
      );

      throw new Error(
        result?.error?.message ||
          "Gagal mengupload foto organisasi."
      );
    }

    return {
      url: result.secure_url,
      publicId:
        result.public_id,
    };
  };

// =========================================================
// SIMPAN DATA TENTANG
// =========================================================

export const saveAbout =
  async (data) => {
    const aboutData = {
      name:
        data.name?.trim() || "",

      photo:
        data.photo || "",

      photoPublicId:
        data.photoPublicId || "",

      vision:
        data.vision?.trim() || "",

      missions:
        Array.isArray(
          data.missions
        )
          ? data.missions
              .map((mission) =>
                mission.trim()
              )
              .filter(Boolean)
          : [],

      updatedAt:
        new Date(),
    };

    await setDoc(
      aboutRef,
      aboutData,
      {
        merge: true,
      }
    );

    return {
      id: "main",
      ...aboutData,
    };
  };