import {
  getApps,
  initializeApp,
  cert,
} from "firebase-admin/app";

import {
  getFirestore,
} from "firebase-admin/firestore";

// ==========================================
// FIREBASE ADMIN
// ==========================================

const privateKey =
  process.env.FIREBASE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId:
            process.env.FIREBASE_PROJECT_ID,

          clientEmail:
            process.env.FIREBASE_CLIENT_EMAIL,

          privateKey:
            privateKey,
        }),
      });

const adminDb =
  getFirestore(adminApp);

// ==========================================
// API HANDLER
// ==========================================

export default async function handler(
  req,
  res
) {
  try {
    // Hanya izinkan GET
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        message:
          "Method tidak diperbolehkan.",
      });
    }

    // ======================================
    // AMBIL DATA ANGGOTA ORGANISASI
    // ======================================

    const membersSnapshot =
      await adminDb
        .collection(
          "organization_members"
        )
        .where(
          "active",
          "==",
          true
        )
        .get();

    // ======================================
    // AMBIL FOTO DARI users/{uid}
    // ======================================

    const members =
      membersSnapshot.docs;

    const photoResults =
      await Promise.all(
        members.map(
          async (memberDoc) => {
            const memberData =
              memberDoc.data();

            const uid =
              memberData.uid;

            // Tidak punya UID
            if (!uid) {
              return {
                uid: "",
                photo: "",
              };
            }

            const userDoc =
              await adminDb
                .collection("users")
                .doc(uid)
                .get();

            if (!userDoc.exists) {
              return {
                uid,
                photo: "",
              };
            }

            const userData =
              userDoc.data();

            return {
              uid,
              photo:
                userData.photo ||
                "",
            };
          }
        )
      );

    // ======================================
    // UBAH MENJADI OBJECT
    // uid -> photo
    // ======================================

    const photos = {};

    photoResults.forEach(
      (item) => {
        if (item.uid) {
          photos[item.uid] =
            item.photo || "";
        }
      }
    );

    return res.status(200).json({
      success: true,
      photos,
    });
  } catch (error) {
    console.error(
      "Public member photos API error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil foto anggota.",
    });
  }
}