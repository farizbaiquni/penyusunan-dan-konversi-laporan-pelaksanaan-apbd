"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  DokumenLaporanFirestore,
  JenisLaporan,
  RangkumanDokumenLaporanTahunan,
  StatusDokumenLaporan,
} from "@/app/_types/types";
import { db } from "@/app/_lib/firebase";
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { getJenisLaporanfromString } from "@/app/_utils/general";

interface TambahDokumenModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  addRangkumanTahunanList: (v: RangkumanDokumenLaporanTahunan) => void;
}

export default function TambahDokumenModal({
  isModalOpen,
  setIsModalOpen,
  addRangkumanTahunanList,
}: TambahDokumenModalProps) {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const [jenisLaporan, setJenisLaporan] = useState<JenisLaporan>(
    JenisLaporan.RAPERDA
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear) return;

    const year = selectedYear.getFullYear();

    setIsSubmitting(true);

    try {
      // 1️⃣ Cek apakah dokumen sudah ada
      const q = query(
        collection(db, "dokumenLaporan"),
        where("tahun", "==", year),
        where("jenisLaporan", "==", jenisLaporan.toLowerCase())
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        alert(`Dokumen ${jenisLaporan} untuk tahun ${year} sudah ada.`);
        setIsSubmitting(false);
        return;
      }

      // 2️⃣ Buat dokumen baru
      const docRef = doc(collection(db, "dokumenLaporan"));
      const documentLaporan: DokumenLaporanFirestore = {
        id: docRef.id,
        jenisLaporan: getJenisLaporanfromString(jenisLaporan.toLowerCase()),
        tahun: year,
        nomor: null,
        tanggalPengesahan: null,
        status: StatusDokumenLaporan.DIBUAT,
        batangTubuh: null,
        lastUpdated: Timestamp.now(),
      };

      await setDoc(docRef, documentLaporan);

      // 3️⃣ Update atau buat rangkuman tahunan
      const rangkumanRef = doc(
        db,
        "rangkumanDokumenLaporanTahunan",
        `tahun-${year}`
      );

      // Ambil rangkuman tahun jika ada
      const rangkumanSnap = await getDocs(
        query(
          collection(db, "rangkumanDokumenLaporanTahunan"),
          where("tahun", "==", year)
        )
      );

      let newRangkuman: RangkumanDokumenLaporanTahunan = {
        id: `tahun-${year}`,
        tahun: year,
        statusRaperda: StatusDokumenLaporan.BELUM_DIBUAT,
        statusPerda: StatusDokumenLaporan.BELUM_DIBUAT,
        statusRaperbup: StatusDokumenLaporan.BELUM_DIBUAT,
        statusPerbup: StatusDokumenLaporan.BELUM_DIBUAT,
      };

      if (!rangkumanSnap.empty) {
        // Jika rangkuman sudah ada, ambil datanya dan update status sesuai jenis laporan
        const data = rangkumanSnap.docs[0].data();
        newRangkuman = {
          ...newRangkuman,
          ...data,
        };
      }

      if (jenisLaporan === JenisLaporan.RAPERDA)
        newRangkuman.statusRaperda = StatusDokumenLaporan.DIBUAT;
      if (jenisLaporan === JenisLaporan.RAPERBUP)
        newRangkuman.statusRaperbup = StatusDokumenLaporan.DIBUAT;

      // Simpan rangkuman ke Firestore (merge supaya tidak menimpa field lain)
      await setDoc(rangkumanRef, newRangkuman, { merge: true });

      // 4️⃣ Update state parent agar tabel langsung berubah
      addRangkumanTahunanList(newRangkuman);

      alert(`Dokumen ${jenisLaporan} untuk tahun ${year} berhasil dibuat!`);

      // Navigasi dengan data dikirim via query string
      router.push(`/dashboard/${year}?&tahun=${year}`);
    } catch (err) {
      console.error(err);
      alert("Gagal membuat dokumen. Cek console untuk detail.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsModalOpen(false)}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative transform transition-all scale-95 animate-fade-in">
          {/* Tombol Tutup */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Tambah Dokumen Baru
          </h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Year Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <div className="relative">
                <DatePicker
                  selected={selectedYear}
                  onChange={(date) => setSelectedYear(date)}
                  showYearPicker
                  dateFormat="yyyy"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={isSubmitting}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  📅
                </span>
              </div>
            </div>

            {/* Jenis Laporan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Laporan
              </label>
              <select
                value={jenisLaporan}
                onChange={(e) =>
                  setJenisLaporan(e.target.value as JenisLaporan)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={isSubmitting}
              >
                <option value={JenisLaporan.RAPERDA}>Raperda</option>
                <option value={JenisLaporan.RAPERBUP}>Raperbup</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <PlusCircleIcon className="w-5 h-5" />
              {isSubmitting ? "Menyimpan..." : "Tambah Dokumen"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
