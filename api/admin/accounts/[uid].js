import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);


// ==========================================
// VERIFIKASI ADMIN
// ==========================================

const verifyAdmin = async (req) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new Error("UNAUTHORIZED");
  }

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const token = authorization.split("Bearer ")[1];

  const decodedToken = await adminAuth.verifyIdToken(token);

  const adminDoc = await adminDb
    .collection("users")
    .doc(decodedToken.uid)
    .get();

  if (!adminDoc.exists) {
    throw new Error("FORBIDDEN");
  }

  const adminData = adminDoc.data();

  if (adminData.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return decodedToken;
};


// ==========================================
// API HANDLER
// ==========================================

export default async function handler(req, res) {
  try {
    // Hanya izinkan PATCH dan DELETE
    if (req.method !== "PATCH" && req.method !== "DELETE") {
      return res.status(405).json({
        success: false,
        message: "Method tidak diperbolehkan.",
      });
    }

    // Pastikan yang melakukan operasi adalah admin
    const currentAdmin = await verifyAdmin(req);

    const uid = req.query.uid;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "UID akun tidak ditemukan.",
      });
    }


    // ======================================
    // DELETE ACCOUNT
    // ======================================

    if (req.method === "DELETE") {

      // Jangan izinkan admin menghapus dirinya sendiri
      if (currentAdmin.uid === uid) {
        return res.status(400).json({
          success: false,
          message: "Anda tidak dapat menghapus akun sendiri.",
        });
      }

      // Hapus Firebase Authentication
      try {
        await adminAuth.deleteUser(uid);
      } catch (error) {

        // Kalau user Authentication sudah tidak ada,
        // kita tetap lanjut menghapus Firestore
        if (error.code !== "auth/user-not-found") {
          throw error;
        }
      }

      // Hapus data Firestore
      await adminDb
        .collection("users")
        .doc(uid)
        .delete();

      return res.status(200).json({
        success: true,
        message: "Akun berhasil dihapus.",
      });
    }


    // ======================================
    // UPDATE ACCOUNT
    // ======================================

    if (req.method === "PATCH") {

      const {
        name,
        email,
        role,
      } = req.body || {};

      // Validasi nama
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Nama wajib diisi.",
        });
      }

      // Validasi role
      if (role !== "admin" && role !== "anggota") {
        return res.status(400).json({
          success: false,
          message: "Role tidak valid.",
        });
      }

      // Ambil data user dari Authentication
      const userRecord = await adminAuth.getUser(uid);

      const updateAuthData = {};

      // Update email jika berbeda
      if (
        email &&
        email.trim().toLowerCase() !==
          userRecord.email?.toLowerCase()
      ) {
        updateAuthData.email = email.trim();
      }

      // Update Firebase Authentication
      if (Object.keys(updateAuthData).length > 0) {
        await adminAuth.updateUser(
          uid,
          updateAuthData
        );
      }

      // Update Firestore
      await adminDb
        .collection("users")
        .doc(uid)
        .set(
          {
            name: name.trim(),
            email: email
              ? email.trim()
              : userRecord.email,
            role: role,
          },
          {
            merge: true,
          }
        );

      return res.status(200).json({
        success: true,
        message: "Data akun berhasil diperbarui.",
      });
    }

  } catch (error) {

    console.error(
      "Admin account API error:",
      error
    );

    if (error.message === "UNAUTHORIZED") {
      return res.status(401).json({
        success: false,
        message: "Anda belum login.",
      });
    }

    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses admin.",
      });
    }

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        message: "Sesi login sudah kedaluwarsa.",
      });
    }

    if (error.code === "auth/user-not-found") {
      return res.status(404).json({
        success: false,
        message: "Akun tidak ditemukan.",
      });
    }

    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({
        success: false,
        message: "Email tersebut sudah digunakan.",
      });
    }

    if (error.code === "auth/invalid-email") {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
}