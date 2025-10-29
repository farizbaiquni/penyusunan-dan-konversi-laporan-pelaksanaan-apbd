import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  DokumenLaporanFirestore,
  StatusDokumenLaporan,
} from "@/app/_types/types";
import { getJenisLaporanfromString } from "@/app/_utils/general";

// ✅ ENUMS — sesuaikan dengan tipe kamu
type JenisLaporan = "raperda" | "raperbup" | "perda" | "perbup";

export async function generateDummyDokumenLaporan() {
  const tahunMulai = 2019;
  const tahunAkhir = 2023;
  const jenisList: JenisLaporan[] = ["raperda", "perda", "raperbup", "perbup"];

  for (let tahun = tahunMulai; tahun <= tahunAkhir; tahun++) {
    console.log(`🗓️ Memproses tahun ${tahun}...`);

    // === 0. Buat/update rangkuman tahunan ===
    const rangkumanRef = doc(
      db,
      "rangkumanDokumenLaporanTahunan",
      `tahun-${tahun}`
    );
    await setDoc(rangkumanRef, {
      id: `tahun-${tahun}`,
      tahun,
      statusRaperda: StatusDokumenLaporan.DIBUAT,
      statusPerda: StatusDokumenLaporan.DIBUAT,
      statusRaperbup: StatusDokumenLaporan.DIBUAT,
      statusPerbup: StatusDokumenLaporan.DIBUAT,
      lastUpdated: Timestamp.now(),
    });
    console.log(`📊 Rangkuman tahunan tahun ${tahun} dibuat/diupdate.`);

    // === 1. Buat dokumen laporan ===
    for (const jenis of jenisList) {
      const docRef = doc(collection(db, "dokumenLaporan"));

      const documentLaporan: DokumenLaporanFirestore = {
        id: docRef.id,
        jenisLaporan: getJenisLaporanfromString(jenis.toLowerCase()),
        tahun: tahun,
        nomor: null,
        tanggalPengesahan: null,
        status: StatusDokumenLaporan.DIBUAT,
        batangTubuh: null,
        lastUpdated: Timestamp.now(),
      };

      await setDoc(docRef, documentLaporan);
      console.log(`📄 Dokumen ${jenis.toUpperCase()} (${tahun}) dibuat.`);

      // === 2. Subcollection lampirans (Lampiran Utama) ===
      const lampiransCol = collection(docRef, "lampirans");

      // === 3. Subcollection lampiransPendukung ===
      const lampiranPendukungCol = collection(docRef, "lampiransPendukung");

      console.log(
        `📎 Lampiran dan pendukung untuk ${jenis.toUpperCase()} (${tahun}) selesai.`
      );
    }
  }

  console.log(
    "🎉 Semua dummy data dokumen laporan & rangkuman tahunan berhasil dibuat!"
  );
}
/**
 * 🔥 Menghapus semua dokumen dari collection 'dokumenLaporan' dan subcollection-nya.
 */
async function deleteAllDokumenLaporan() {
  const dokumenSnapshot = await getDocs(collection(db, "dokumenLaporan"));
  console.log(`🧹 Menghapus ${dokumenSnapshot.size} dokumenLaporan...`);

  for (const dokumen of dokumenSnapshot.docs) {
    const docRef = doc(db, "dokumenLaporan", dokumen.id);

    // Hapus subcollection lampirans
    const lampiranSnapshot = await getDocs(collection(docRef, "lampirans"));
    for (const lamp of lampiranSnapshot.docs) {
      await deleteDoc(doc(collection(docRef, "lampirans"), lamp.id));
    }

    // Hapus subcollection lampiransPendukung
    const lampPendukungSnapshot = await getDocs(
      collection(docRef, "lampiransPendukung")
    );
    for (const lamp of lampPendukungSnapshot.docs) {
      await deleteDoc(doc(collection(docRef, "lampiransPendukung"), lamp.id));
    }

    // Hapus dokumen utama
    await deleteDoc(docRef);
    console.log(`✅ Dokumen ${dokumen.id} + subcollection terhapus.`);
  }

  console.log("🗑️ Semua dokumenLaporan berhasil dihapus.");
}

/**
 * 🧾 Menghapus semua dokumen dari collection 'rangkumanDokumenLaporanTahunan'.
 */
async function deleteAllRangkumanTahunan() {
  const rangkumanSnapshot = await getDocs(
    collection(db, "rangkumanDokumenLaporanTahunan")
  );
  console.log(`🧹 Menghapus ${rangkumanSnapshot.size} rangkuman tahunan...`);

  for (const rangkuman of rangkumanSnapshot.docs) {
    await deleteDoc(doc(db, "rangkumanDokumenLaporanTahunan", rangkuman.id));
  }

  console.log("🗑️ Semua rangkumanDokumenLaporanTahunan berhasil dihapus.");
}

/**
 * 🚀 Menghapus kedua collection utama: dokumenLaporan & rangkumanDokumenLaporanTahunan
 */
export async function deleteAllData() {
  console.log("⚠️ Mulai menghapus semua data Firestore...");
  await deleteAllDokumenLaporan();
  await deleteAllRangkumanTahunan();
  console.log("🎉 Semua data Firestore berhasil dihapus!");
}
