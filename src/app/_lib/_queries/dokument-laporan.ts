import {
  DokumenLaporan,
  JenisLaporan,
  RangkumanDokumenLaporanTahunan,
  StatusDokumenLaporan,
} from "@/app/_types/types";
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export async function getDokumenById(dokumenId: string) {
  const docRef = doc(db, "dokumenLaporan", dokumenId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    lastUpdated: data.lastUpdated.toDate(),
    id: docSnap.id,
  } as DokumenLaporan;
}

export async function addDokumen(
  dokumen: Omit<DokumenLaporan, "id" | "lastUpdated">
) {
  const docRef = doc(db, "dokumenLaporan");
  const data = {
    ...dokumen,
    lastUpdated: Timestamp.now(),
  };
  await setDoc(docRef, data);
  return {
    ...data,
    id: docRef.id,
    lastUpdated: data.lastUpdated.toDate(),
  } as DokumenLaporan;
}

export async function addDokumenAndUpdateRangkuman(
  dokumen: Omit<DokumenLaporan, "id" | "lastUpdated">
) {
  const newDokumen = await addDokumen(dokumen);
  await upsertRangkumanByDokumen(dokumen.jenisLaporan, dokumen.tahun);
  return newDokumen;
}

export async function updateDokumen(
  dokumenId: string,
  updateData: Partial<Omit<DokumenLaporan, "id" | "lastUpdated">>
) {
  const docRef = doc(db, "dokumenLaporan", dokumenId);
  await updateDoc(docRef, {
    ...updateData,
    lastUpdated: Timestamp.now(),
  });
}

export async function deleteDokumen(dokumenId: string) {
  const docRef = doc(db, "dokumenLaporan", dokumenId);
  await deleteDoc(docRef);
}

export async function upsertRangkumanByDokumen(
  jenisLaporan: JenisLaporan,
  tahun: number
) {
  const docRef = doc(db, "rangkumanDokumenLaporanTahunan", `${tahun}`);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Jika belum ada, buat dokumen baru
    const newRangkuman: RangkumanDokumenLaporanTahunan = {
      id: `${tahun}`,
      tahun,
      statusRaperda: StatusDokumenLaporan.BELUM_DIBUAT,
      statusPerda: StatusDokumenLaporan.BELUM_DIBUAT,
      statusRaperbup: StatusDokumenLaporan.BELUM_DIBUAT,
      statusPerbup: StatusDokumenLaporan.BELUM_DIBUAT,
    };

    // Set status sesuai jenis laporan
    switch (jenisLaporan) {
      case JenisLaporan.RAPERDA:
        newRangkuman.statusRaperda = StatusDokumenLaporan.PROSES;
        break;
      case JenisLaporan.PERDA:
        newRangkuman.statusPerda = StatusDokumenLaporan.PROSES;
        break;
      case JenisLaporan.RAPERBUP:
        newRangkuman.statusRaperbup = StatusDokumenLaporan.PROSES;
        break;
      case JenisLaporan.PERBUP:
        newRangkuman.statusPerbup = StatusDokumenLaporan.PROSES;
        break;
    }

    await setDoc(docRef, newRangkuman);
  } else {
    // Jika sudah ada, update status sesuai jenis laporan
    const updateData: Partial<RangkumanDokumenLaporanTahunan> = {};

    switch (jenisLaporan) {
      case JenisLaporan.RAPERDA:
        updateData.statusRaperda = StatusDokumenLaporan.PROSES;
        break;
      case JenisLaporan.PERDA:
        updateData.statusPerda = StatusDokumenLaporan.PROSES;
        break;
      case JenisLaporan.RAPERBUP:
        updateData.statusRaperbup = StatusDokumenLaporan.PROSES;
        break;
      case JenisLaporan.PERBUP:
        updateData.statusPerbup = StatusDokumenLaporan.PROSES;
        break;
    }

    await updateDoc(docRef, updateData);
  }
}
