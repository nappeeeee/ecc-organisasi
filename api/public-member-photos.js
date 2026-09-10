import {
  getApps,
  initializeApp,
  cert,
} from "firebase-admin/app";

import {
  getFirestore,
} from "firebase-admin/firestore";

// =========================================================
// FIREBASE ADMIN
// =========================================================

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


// =========================================================
// API
// =========================================================

export default async function handler(
  req,
  res
) {

  try {

    // =====================================================
    // METHOD
    // =====================================================

    if (req.method !== "GET") {

      return res.status(405).json({
        success: false,
        message:
          "Method tidak diperbolehkan.",
      });

    }


    // =====================================================
    // AMBIL SEMUA USERS
    // =====================================================

    const usersSnapshot =
      await adminDb
        .collection("users")
        .get();


    // =====================================================
    // HANYA AKUN ANGGOTA
    // =====================================================

    const users =
      usersSnapshot.docs
        .map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        )
        .filter(
          (user) =>
            user.role ===
            "anggota"
        );


    // =====================================================
    // AMBIL ORGANIZATION MEMBERS
    //
    // Digunakan untuk:
    // - jabatan
    // - section
    // - urutan
    // - status active
    // =====================================================

    const organizationSnapshot =
      await adminDb
        .collection(
          "organization_members"
        )
        .get();


    const organizationMembers =
      organizationSnapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );


    // =====================================================
    // MAP ORGANIZATION MEMBER BERDASARKAN UID
    // =====================================================

    const organizationMemberMap =
      new Map();


    organizationMembers.forEach(
      (member) => {

        if (member.uid) {

          organizationMemberMap.set(
            member.uid,
            member
          );

        }

      }
    );


    // =====================================================
    // GABUNG DATA PUBLIC
    // =====================================================

    const members =
      users.map(
        (user) => {

          const uid =
            user.uid ||
            user.id;


          const organizationMember =
            organizationMemberMap.get(
              uid
            );


          return {

            // =============================================
            // IDENTITAS YANG AMAN UNTUK PUBLIC
            // =============================================

            uid,

            name:
              user.name ||
              user.displayName ||
              "Belum diisi",

            photo:
              user.photo ||
              "",

            photoPublicId:
              user.photoPublicId ||
              "",

            className:
              user.className ||
              "",


            // =============================================
            // DATA STRUKTUR ORGANISASI
            // =============================================

            position:
              organizationMember?.position ||
              organizationMember?.jabatan ||
              "Anggota",

            jabatan:
              organizationMember?.jabatan ||
              organizationMember?.position ||
              "Anggota",

            sectionId:
              organizationMember?.sectionId ||
              "",

            order:
              organizationMember?.order ??
              9999,

            active:
              organizationMember?.active ??
              true,

          };

        }
      );


    // =====================================================
    // URUTKAN BERDASARKAN ORDER
    // =====================================================

    members.sort(
      (a, b) =>
        (a.order ?? 9999) -
        (b.order ?? 9999)
    );


    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({

      success:
        true,

      members,

    });

  } catch (error) {

    console.error(
      "Public member API error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Gagal mengambil data anggota.",

    });

  }

}