import {
  DokumenLaporan,
  JenisLaporan,
  LampiranDataPendukung,
  LampiranDataUtama,
  RangkumanDokumenLaporanTahunan,
  StatusDokumenLaporan,
} from "@/app/_types/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  getJenisLaporanfromString,
  getStatusDokumenLaporanfromString,
} from "@/app/_utils/general";

export async function getDokumenLaporanByTahunAndJenisLaporanWithLampirans(
  tahun: number,
  jenisLaporan: JenisLaporan
): Promise<DokumenLaporan[]> {
  const q = query(
    collection(db, "dokumenLaporan"),
    where("tahun", "==", tahun),
    where("jenisLaporan", "==", jenisLaporan.toLowerCase())
  );
  console.log(tahun, jenisLaporan);
  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  const result: DokumenLaporan[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    // === Fetch lampirans utama ===
    const lampiransCol = collection(
      db,
      `dokumenLaporan/${docSnap.id}/lampirans`
    );
    const lampiransSnapshot = await getDocs(lampiransCol);

    const url: string = `/api/lampiran-utama/get-lampiran-utama?tahun=${tahun}&jenisLaporan=${jenisLaporan.toLowerCase()}`;
    const res = await fetch(url);
    const dataFiles = await res.json();
    let files: File[] = [];

    if (dataFiles.success) {
      files = dataFiles.files.map((f: { name: string; data: string }) => {
        const byteString = atob(f.data);
        const arrayBuffer = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          arrayBuffer[i] = byteString.charCodeAt(i);
        }
        return new File([arrayBuffer], f.name, { type: "application/pdf" });
      });
    }

    const lampirans: LampiranDataUtama[] = lampiransSnapshot.docs.map((l) => {
      const lampiranData = l.data();
      const lampiranFile = files.find(
        (f) => f.name === lampiranData.namaFileDiStorageLokal + ".pdf"
      );

      const newLampiranUtama: LampiranDataUtama = {
        id: l.data().id,
        urutan: l.data().urutan,
        file: lampiranFile!,
        namaFileDiStorageLokal: l.data().namaFileDiStorageLokal,
        romawiLampiran: l.data().romawiLampiran,
        judulPembatasLampiran: l.data().judulPembatasLampiran,
        footerText: l.data().footerText,
        footerWidth: l.data().footerWidth,
        footerX: l.data().footerX,
        footerY: l.data().footerY,
        fontSize: l.data().fontSize,
        footerHeight: l.data().footerHeight,
        jumlahHalaman: l.data().jumlahHalaman,
        isCALK: l.data().isCALK,
        babs: l.data().babs ? l.data().babs : [],
        jumlahTotalLembar: l.data().jumlahTotalLembar,
      };

      // Hanya ubah nama kalau file ditemukan
      if (lampiranFile) {
        Object.defineProperty(lampiranFile, "name", {
          value: lampiranData.namaFileAsli,
          writable: false,
        });
      }

      return newLampiranUtama;
    });

    // === Fetch lampirans pendukung ===
    const lampiransPendukungCol = collection(
      db,
      `dokumenLaporan/${docSnap.id}/lampiransPendukung`
    );
    const lampiransPendukungSnapshot = await getDocs(lampiransPendukungCol);
    const lampiransPendukung: LampiranDataPendukung[] =
      lampiransPendukungSnapshot.docs.map(
        (l) =>
          ({
            id: l.id,
            ...l.data(),
          } as LampiranDataPendukung)
      );

    result.push({
      id: data.id || docSnap.id,
      jenisLaporan: getJenisLaporanfromString(data.jenisLaporan),
      tahun: data.tahun,
      nomor: data.nomor ?? null,
      tanggalPengesahan: data.tanggalPengesahan
        ? data.tanggalPengesahan.toDate?.() ?? new Date(data.tanggalPengesahan)
        : null,
      status: getStatusDokumenLaporanfromString(data.status),
      batangTubuh: data.batangTubuh ?? null,
      lampirans,
      lampiransPendukung,
      lastUpdated: data.lastUpdated ?? null,
    });
  }
  return result;
}

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

export async function getDokumenLaporanByTahun(
  tahun: number
): Promise<DokumenLaporan[]> {
  const q = query(
    collection(db, "dokumenLaporan"),
    where("tahun", "==", tahun)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return [];

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const dokumenLaporanData: DokumenLaporan = {
      id: data.id || doc.id,
      jenisLaporan: getJenisLaporanfromString(data.jenisLaporan),
      tahun: data.tahun,
      nomor: data.nomor ?? null,
      tanggalPengesahan: data.tanggalPengesahan
        ? new Date(data.tanggalPengesahan)
        : null,
      status: getStatusDokumenLaporanfromString(data.status),
      batangTubuh: data.batangTubuh ?? null,
      lampirans: [],
      lampiransPendukung: [],
      lastUpdated: data.lastUpdated ?? null,
    };
    return dokumenLaporanData;
  });
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
        newRangkuman.statusRaperda = StatusDokumenLaporan.DIBUAT;
        break;
      case JenisLaporan.PERDA:
        newRangkuman.statusPerda = StatusDokumenLaporan.DIBUAT;
        break;
      case JenisLaporan.RAPERBUP:
        newRangkuman.statusRaperbup = StatusDokumenLaporan.DIBUAT;
        break;
      case JenisLaporan.PERBUP:
        newRangkuman.statusPerbup = StatusDokumenLaporan.DIBUAT;
        break;
    }

    await setDoc(docRef, newRangkuman);
  } else {
    // Jika sudah ada, update status sesuai jenis laporan
    const updateData: Partial<RangkumanDokumenLaporanTahunan> = {};

    switch (jenisLaporan) {
      case JenisLaporan.RAPERDA:
        updateData.statusRaperda = StatusDokumenLaporan.DIBUAT;
        break;
      case JenisLaporan.PERDA:
        updateData.statusPerda = StatusDokumenLaporan.DIBUAT;
        break;
      case JenisLaporan.RAPERBUP:
        updateData.statusRaperbup = StatusDokumenLaporan.DIBUAT;
        break;
      case JenisLaporan.PERBUP:
        updateData.statusPerbup = StatusDokumenLaporan.DIBUAT;
        break;
    }

    await updateDoc(docRef, updateData);
  }
}
