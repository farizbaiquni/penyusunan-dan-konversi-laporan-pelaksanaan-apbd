import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { LampiranDataUtamaFirestore } from "@/app/_types/types";
import { db } from "../firebase";

export async function addLampiranUtamaFirestore(
  dokumenId: string,
  newLampiran: LampiranDataUtamaFirestore,
  isCALK: boolean
) {
  try {
    // Tentukan subcollection
    const subcollectionName = "lampirans";

    // Buat dokumen baru di subcollection
    const lampiranRef = doc(
      collection(db, "dokumenLaporan", dokumenId, subcollectionName)
    );

    // Data yang akan disimpan
    let dataToSave: LampiranDataUtamaFirestore;

    if (isCALK) {
      dataToSave = {
        id: lampiranRef.id,
        urutan: newLampiran.urutan,
        namaFileAsli: newLampiran.namaFileAsli,
        namaFileDiStorageLokal: newLampiran.namaFileDiStorageLokal,
        romawiLampiran: newLampiran.romawiLampiran,
        judulPembatasLampiran: newLampiran.judulPembatasLampiran,
        footerText: newLampiran.footerText,
        footerWidth: newLampiran.footerWidth,
        footerX: newLampiran.footerX,
        footerY: newLampiran.footerY,
        fontSize: newLampiran.fontSize,
        footerHeight: newLampiran.footerHeight,
        jumlahHalaman: newLampiran.jumlahHalaman,
        jumlahTotalLembar: newLampiran.jumlahTotalLembar,
        isCALK: newLampiran.isCALK,
        babs: newLampiran.babs || [],
      };
    } else {
      dataToSave = {
        id: lampiranRef.id,
        urutan: newLampiran.urutan,
        namaFileAsli: newLampiran.namaFileAsli,
        namaFileDiStorageLokal: newLampiran.namaFileDiStorageLokal,
        romawiLampiran: newLampiran.romawiLampiran,
        judulPembatasLampiran: newLampiran.judulPembatasLampiran,
        footerText: newLampiran.footerText,
        footerWidth: newLampiran.footerWidth,
        footerX: newLampiran.footerX,
        footerY: newLampiran.footerY,
        fontSize: newLampiran.fontSize,
        footerHeight: newLampiran.footerHeight,
        jumlahHalaman: newLampiran.jumlahHalaman,
        jumlahTotalLembar: newLampiran.jumlahTotalLembar,
        isCALK: false,
        babs: [],
      };
    }

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

/**
 * Menghapus satu dokumen Lampiran Utama dari Firestore
 * @param dokumenId ID dokumen laporan induk
 * @param lampiranId ID lampiran yang ingin dihapus
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export async function deleteLampiranUtamaFirestore(
  dokumenId: string,
  lampiranId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const lampiranRef = doc(
      db,
      "dokumenLaporan",
      dokumenId,
      "lampirans",
      lampiranId
    );
    await deleteDoc(lampiranRef);

    return {
      success: true,
      message: "Lampiran utama berhasil dihapus dari Firestore",
    };
  } catch (err) {
    console.error("Gagal menghapus lampiran utama:", err);
    return { success: false, message: String(err) };
  }
}

export async function editLampiranUtamaFirestore(
  dokumenId: string,
  lampiranId: string,
  updatedData: LampiranDataUtamaFirestore
) {
  try {
    const lampiranRef = doc(
      db,
      "dokumenLaporan",
      dokumenId,
      "lampirans",
      lampiranId
    );

    const newUpdatedLampiran = {
      ...updatedData,
      lastUpdated: new Date(),
    };

    await updateDoc(lampiranRef, newUpdatedLampiran);

    return { success: true };
  } catch (error) {
    console.error("Gagal mengedit lampiran utama:", error);
    return { success: false, error };
  }
}
