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

const newsCollection = collection(db, "news");

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/*
|--------------------------------------------------------------------------
| GET ALL NEWS
|--------------------------------------------------------------------------
*/

export const getNews = async () => {
  const newsQuery = query(
    newsCollection,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(newsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
};

/*
|--------------------------------------------------------------------------
| GET NEWS BY ID
|--------------------------------------------------------------------------
*/

export const getNewsById = async (id) => {
  const newsRef = doc(db, "news", id);

  const snapshot = await getDoc(newsRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

/*
|--------------------------------------------------------------------------
| VALIDATE IMAGE
|--------------------------------------------------------------------------
*/

const validateImage = (file) => {
  if (!file) {
    throw new Error("File gambar tidak ditemukan.");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Format gambar harus JPG, PNG, atau WEBP."
    );
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Ukuran gambar maksimal 5 MB."
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

/*
|--------------------------------------------------------------------------
| UPLOAD IMAGE TO CLOUDINARY
|--------------------------------------------------------------------------
*/

export const uploadNewsImage = async (file) => {
  validateImage(file);

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );

  /*
   * Folder tempat gambar berita disimpan.
   */

  formData.append(
    "folder",
    "website-organisasi/news"
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
      "Cloudinary upload error:",
      result
    );

    throw new Error(
      result?.error?.message ||
        "Gagal mengupload gambar ke Cloudinary."
    );
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE NEWS
|--------------------------------------------------------------------------
*/

export const createNews = async (data) => {
  const newsData = {
    title: data.title,
    content: data.content,

    image: data.image || "",
    imagePublicId: data.imagePublicId || "",

    category: data.category || "Umum",

    author: data.author || "Admin",

    published: data.published ?? true,

    createdAt: new Date(),

    updatedAt: new Date(),
  };

  const document = await addDoc(
    newsCollection,
    newsData
  );

  return {
    id: document.id,
    ...newsData,
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE NEWS
|--------------------------------------------------------------------------
*/

export const updateNews = async (id, data) => {
  const newsRef = doc(db, "news", id);

  await updateDoc(newsRef, {
    title: data.title,

    content: data.content,

    image: data.image || "",

    imagePublicId:
      data.imagePublicId || "",

    category:
      data.category || "Umum",

    author:
      data.author || "Admin",

    published:
      data.published ?? true,

    updatedAt: new Date(),
  });
};

/*
|--------------------------------------------------------------------------
| DELETE NEWS
|--------------------------------------------------------------------------
*/

export const deleteNews = async (id) => {
  const newsRef = doc(db, "news", id);

  const snapshot = await getDoc(newsRef);

  if (!snapshot.exists()) {
    throw new Error(
      "Berita tidak ditemukan."
    );
  }

  /*
   * Cloudinary image tidak dihapus
   * dari frontend karena penghapusan
   * membutuhkan API Secret.
   *
   * Data Firestore tetap akan dihapus.
   */

  await deleteDoc(newsRef);
};