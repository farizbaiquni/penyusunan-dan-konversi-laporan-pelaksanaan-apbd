import {
  LampiranDataPendukung,
  LampiranDataPendukungFirestore,
} from "@/app/_types/types";
import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export async function addLampiranPendukungFirestore(
  dokumenId: string,
  newLampiran: LampiranDataPendukung,
  namaFileAsli: string,
  namaFileDiStorageLokal: string
) {
  try {
    // Tentukan subcollection
    const subcollectionName = "lampiransPendukung";

    // Buat dokumen baru di subcollection
    const lampiranRef = doc(
      collection(db, "dokumenLaporan", dokumenId, subcollectionName)
    );

    // Data yang akan disimpan
    const dataToSave: LampiranDataPendukungFirestore = {
      id: lampiranRef.id,
      urutan: newLampiran.urutan,
      namaFileAsli: namaFileAsli,
      namaFileDiStorageLokal: namaFileDiStorageLokal,
      judul: newLampiran.judul,
      jumlahTotalLembar: newLampiran.jumlahTotalLembar,
    };

    await setDoc(lampiranRef, dataToSave);

    // Update lastUpdated dokumenLaporan
    const dokumenRef = doc(db, "dokumenLaporan", dokumenId);
    await setDoc(dokumenRef, { lastUpdated: Timestamp.now() }, { merge: true });

    return { success: true, lampiranId: lampiranRef.id.toString() };
  } catch (err) {
    console.error("Gagal menambahkan lampiran:", err);
    return { success: false, error: err };
  }
}

export async function deleteLampiranPendukungFirestore(
  dokumenId: string,
  lampiranId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const lampiranRef = doc(
      db,
      "dokumenLaporan",
      dokumenId,
      "lampiransPendukung",
      lampiranId
    );
    await deleteDoc(lampiranRef);

    return {
      success: true,
      message: "Lampiran Pendukung berhasil dihapus",
    };
  } catch (err) {
    console.error("Gagal menghapus lampiran Pendukung:", err);
    return { success: false, message: String(err) };
  }
}
