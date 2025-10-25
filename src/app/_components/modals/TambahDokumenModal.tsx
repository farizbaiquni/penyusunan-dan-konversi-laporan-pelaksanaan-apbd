"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  JenisLaporan,
  RangkumanDokumenLaporanTahunan,
  StatusDokumenLaporan,
} from "@/app/_types/types";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear) return;

    const year = selectedYear.getFullYear();

    const newRangkumanTahunan: RangkumanDokumenLaporanTahunan = {
      id: `tahun-${year}`,
      tahun: year,
      statusRaperda:
        jenisLaporan === JenisLaporan.RAPERDA
          ? StatusDokumenLaporan.PROSES
          : StatusDokumenLaporan.BELUM_DIBUAT,
      statusPerda: StatusDokumenLaporan.BELUM_DIBUAT,
      statusRaperbup:
        jenisLaporan === JenisLaporan.RAPERBUP
          ? StatusDokumenLaporan.PROSES
          : StatusDokumenLaporan.BELUM_DIBUAT,
      statusPerbup: StatusDokumenLaporan.BELUM_DIBUAT,
    };

    addRangkumanTahunanList(newRangkumanTahunan);

    // Navigasi dengan data dikirim via query string
    router.push(
      `/dashboard/${year}?jenisLaporan=${jenisLaporan}&tahun=${year}`
    );

    setIsModalOpen(false);
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

          {/* Judul Modal */}
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Tambah Dokumen Baru
          </h2>

          {/* Form */}
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
                />
                {/* Icon di dalam border input */}
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
              >
                <option value={JenisLaporan.RAPERDA}>Raperda</option>
                <option value={JenisLaporan.RAPERBUP}>Raperbup</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md mt-2"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Tambah Dokumen
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
