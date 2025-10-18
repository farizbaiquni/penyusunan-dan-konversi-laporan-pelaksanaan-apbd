"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

interface InformasiLaporanProps {
  tahun: number;
  jumlahLampiranUtama: number;
  jumlahLampiranPendukung: number;
  isUploadBatangTubuh: boolean;
  jumlahHalaman: number;
  nomorPerdaPerbup: number | null;
  namaBupati: string;
  setTahun: (tahun: number) => void;
}

export default function InformasiLaporan({
  tahun,
  jumlahLampiranUtama,
  jumlahLampiranPendukung,
  isUploadBatangTubuh,
  jumlahHalaman,
  nomorPerdaPerbup,
  namaBupati,
  setTahun,
}: InformasiLaporanProps) {
  const [saved, setSaved] = useState(false);

  // Simulasi umpan balik penyimpanan setelah input diubah
  const handleTahunChange = (value: number) => {
    setTahun(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000); // icon check hilang setelah 2 detik
  };

  return (
    <div className="w-full min-h-full bg-gray-50 py-8 px-6 rounded-2xl shadow-inner">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            🗂️ Informasi Laporan Perda / Perbup
          </h2>
        </div>

        {/* BAGIAN EDITABLE */}
        <section className="bg-white border-t-4 border-blue-500 rounded-xl p-5 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            📝 Data yang Dapat Diedit
          </h3>
          <div className="flex items-center gap-3">
            <label className="text-gray-600 text-sm w-32">Tahun Perda</label>
            <div className="relative w-32">
              <input
                type="number"
                min="1900"
                max="2099"
                value={tahun}
                onChange={(e) => handleTahunChange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {saved && (
                <CheckIcon className="h-5 w-5 text-green-500 absolute right-2 top-2 animate-bounce" />
              )}
            </div>
          </div>
        </section>

        {/* BAGIAN INFORMASI STATIS */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            📘 Informasi Umum
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard
              label="Jumlah Lampiran Utama"
              value={`${jumlahLampiranUtama} dokumen`}
              icon="📄"
              highlight
            />
            <InfoCard
              label="Jumlah Lampiran Pendukung"
              value={`${jumlahLampiranPendukung} dokumen`}
              icon="📎"
            />
            <StatusCard isUpload={isUploadBatangTubuh} />
            <InfoCard
              label="Jumlah Halaman"
              value={`${jumlahHalaman} lembar`}
              icon="📘"
            />
            <InfoCard
              label="Nomor Perda / Perbup"
              value={
                nomorPerdaPerbup
                  ? `No. ${nomorPerdaPerbup}`
                  : "Belum ditentukan"
              }
              icon="🧾"
              muted={!nomorPerdaPerbup}
            />
            <InfoCard label="Nama Bupati" value={namaBupati} icon="🏛️" />
          </div>
        </section>
      </div>
    </div>
  );
}

/* 🔹 Kartu Informasi Umum */
interface InfoCardProps {
  label: string;
  value: string;
  icon?: string;
  muted?: boolean;
  highlight?: boolean;
}

function InfoCard({ label, value, icon, muted, highlight }: InfoCardProps) {
  return (
    <div
      className={`flex flex-col bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition ${
        highlight ? "border-blue-300" : "border-gray-100"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-gray-600 text-sm font-medium">{label}</span>
      </div>
      <span
        className={`text-base font-semibold ${
          muted ? "text-gray-400 italic" : "text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* 🔹 Kartu Status Upload */
function StatusCard({ isUpload }: { isUpload: boolean }) {
  return (
    <div className="flex flex-col bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📤</span>
        <span className="text-gray-600 text-sm font-medium">
          Status Upload Batang Tubuh
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        {isUpload ? (
          <>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="text-green-700 font-semibold text-sm">
              Sudah Upload
            </span>
          </>
        ) : (
          <>
            <XCircleIcon className="h-5 w-5 text-red-500" />
            <span className="text-red-700 font-semibold text-sm">
              Belum Upload
            </span>
          </>
        )}
      </div>
    </div>
  );
}
