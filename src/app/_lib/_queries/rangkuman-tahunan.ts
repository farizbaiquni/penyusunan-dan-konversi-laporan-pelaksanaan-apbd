import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { RangkumanDokumenLaporanTahunan } from "@/app/_types/types";

export async function getLast5YearsRangkuman(
  currentYear: number
): Promise<RangkumanDokumenLaporanTahunan[]> {
  const colRef = collection(db, "rangkumanDokumenLaporanTahunan");

  // Ambil dokumen 5 tahun terakhir (misal: 2025 → ambil 2021–2025)
  const q = query(colRef, orderBy("tahun", "desc"), limit(5));

  const querySnap = await getDocs(q);

  return querySnap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      tahun: data.tahun,
      statusRaperda: data.statusRaperda,
      statusPerda: data.statusPerda,
      statusRaperbup: data.statusRaperbup,
      statusPerbup: data.statusPerbup,
      lastUpdated: data.lastUpdated?.toDate?.() ?? null, // ✅ aman kalau undefined
    } as RangkumanDokumenLaporanTahunan;
  });
}

export async function addRangkuman(
  rangkuman: Omit<RangkumanDokumenLaporanTahunan, "id" | "lastUpdated">
) {
  const docRef = doc(
    db,
    "rangkumanDokumenLaporanTahunan",
    `${rangkuman.tahun}`
  );
  const data = {
    ...rangkuman,
    id: `${rangkuman.tahun}`,
    lastUpdated: Timestamp.now(),
  };
  await setDoc(docRef, data);
  return {
    ...data,
    lastUpdated: data.lastUpdated.toDate(), // convert Timestamp -> Date
  };
}

export async function getRangkumanByTahun(tahun: number) {
  const docRef = doc(db, "rangkumanDokumenLaporanTahunan", `${tahun}`);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const d = docSnap.data();
  return {
    id: d.id,
    tahun: d.tahun,
    statusRaperda: d.statusRaperda,
    statusPerda: d.statusPerda,
    statusRaperbup: d.statusRaperbup,
    statusPerbup: d.statusPerbup,
    lastUpdated: d.lastUpdated.toDate(),
  } as RangkumanDokumenLaporanTahunan;
}

export async function deleteRangkuman(tahun: number) {
  const docRef = doc(db, "rangkumanDokumenLaporanTahunan", `${tahun}`);
  await deleteDoc(docRef);
}
