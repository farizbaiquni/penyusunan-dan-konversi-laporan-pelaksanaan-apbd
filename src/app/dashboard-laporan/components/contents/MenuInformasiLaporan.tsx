"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { JenisLaporan } from "@/app/_types/types";
import { generateTextJenisLaporan } from "@/app/_utils/jenis-laporan";

interface InformasiLaporanProps {
  jenisLaporan: JenisLaporan;
  tahun: number;
  jumlahLampiranUtama: number;
  jumlahLampiranPendukung: number;
  isUploadBatangTubuh: boolean;
  nomorPerdaPerbup: number | null;
  namaBupati: string;
  setTahun: (tahun: number) => void;
  setNomorPerdaPerbup: (nomor: number | null) => void;
  setNamaBupati: (nama: string) => void;
}

export default function MenuInformasiLaporan({
  jenisLaporan,
  tahun,
  jumlahLampiranUtama,
  jumlahLampiranPendukung,
  isUploadBatangTubuh,
  nomorPerdaPerbup,
  namaBupati,
  setTahun,
  setNomorPerdaPerbup,
  setNamaBupati,
}: InformasiLaporanProps) {
  const [inputTahun, setInputTahun] = useState<number>(tahun);
  const [inputNomor, setInputNomor] = useState<number | null>(nomorPerdaPerbup);
  const [inputNama, setInputNama] = useState<string>(namaBupati);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (inputTahun < 1900 || inputTahun > 2099) {
      alert("❌ Tahun harus antara 1900 dan 2099.");
      return;
    }
    if (!inputNama.trim()) {
      alert("❌ Nama Bupati tidak boleh kosong.");
      return;
    }
    if (inputNomor !== null && inputNomor <= 0) {
      alert("❌ Nomor Perda/Perbup harus lebih dari 0.");
      return;
    }

    setTahun(inputTahun);
    setNomorPerdaPerbup(inputNomor);
    setNamaBupati(inputNama);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full min-h-full bg-gray-50 py-8 px-6 rounded-2xl shadow-inner">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 capitalize">
            🗂️ Informasi Laporan {generateTextJenisLaporan(jenisLaporan)} Tahun{" "}
            {tahun}
          </h2>
        </div>

        {/* BAGIAN EDITABLE */}
        <section
          className={`${
            jenisLaporan === JenisLaporan.RAPERDA ||
            jenisLaporan === JenisLaporan.RAPERBUP
              ? "hidden"
              : "bg-white border-t-4 rounded-sm p-5 shadow-sm mb-6"
          }`}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            📝 Data yang Dapat Diedit
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <label className="text-gray-600 text-sm w-40">Tahun Perda</label>
            <input
              type="number"
              min={1900}
              max={2099}
              value={inputTahun}
              onChange={(e) => setInputTahun(Number(e.target.value))}
              className="w-full sm:w-32 border border-gray-300 rounded-lg py-2 px-3 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <label className="text-gray-600 text-sm w-40">
              Nomor {generateTextJenisLaporan(jenisLaporan)}
            </label>
            <input
              type="number"
              min={1}
              value={inputNomor ?? ""}
              onChange={(e) => setInputNomor(Number(e.target.value))}
              className="w-full sm:w-32 border border-gray-300 rounded-lg py-2 px-3 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <label className="text-gray-600 text-sm w-40">Nama Bupati</label>
            <input
              type="text"
              value={inputNama}
              onChange={(e) => setInputNama(e.target.value)}
              className="w-full sm:w-64 border border-gray-300 rounded-lg py-2 px-3 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
          >
            Simpan
            {saved && (
              <CheckIcon className="h-5 w-5 text-green-300 animate-bounce" />
            )}
          </button>
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
              icon="📋"
            />
            <>
              <StatusCard isUpload={isUploadBatangTubuh} />
              <InfoCard
                label={`Nomor ${generateTextJenisLaporan(jenisLaporan)}`}
                value={
                  jenisLaporan !== JenisLaporan.RAPERDA &&
                  jenisLaporan !== JenisLaporan.RAPERBUP
                    ? `No. ${inputNomor}`
                    : "Belum ditentukan"
                }
                icon="🧾"
                muted={!inputNomor}
              />
            </>
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
      className={`flex flex-col bg-white rounded-sm p-4 border shadow-sm hover:shadow-md transition ${
        highlight ? "border-blue-300" : "border-gray-100"
      }`}
    >
      <div className="flex items-center gap-2 mb-1 capitalize">
        <span className="text-lg">{icon}</span>
        <span className="text-gray-600 text-sm font-medium">{label}</span>
      </div>
      <span
        className={`text-base font-semibold ml-[4px] ${
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
    <div className="flex flex-col bg-white rounded-sm p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📑</span>
        <span className="text-gray-600 text-sm font-medium">
          Status Upload Batang Tubuh
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        {isUpload ? (
          <>
            <CheckCircleIcon className="ml-[2px] h-5 w-5 text-green-700" />
            <span className="text-green-700 font-semibold text-sm">
              Sudah Upload
            </span>
          </>
        ) : (
          <>
            <XCircleIcon className="ml-[2px] h-5 w-5 text-red-800" />
            <span className="text-red-700 font-semibold text-sm">
              Belum Upload
            </span>
          </>
        )}
      </div>
    </div>
  );
}
