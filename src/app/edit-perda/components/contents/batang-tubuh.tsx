"use client";

import React, { useState } from "react";
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function BatangTubuh() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfURL, setPdfURL] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setMessage("⚠️ Silakan pilih file PDF terlebih dahulu.");
      setFile(null);
      setPdfURL(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setMessage("❌ Hanya file PDF yang diperbolehkan.");
      setFile(null);
      setPdfURL(null);
      return;
    }

    // Simpan ke variabel (state)
    setFile(selectedFile);
    setPdfURL(URL.createObjectURL(selectedFile));
    setMessage(`✅ File "${selectedFile.name}" siap diunggah.`);
  };

  const handleClear = () => {
    setFile(null);
    setPdfURL(null);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Unggah Batang Tubuh Peraturan Daerah
        </h1>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          Silakan unggah berkas{" "}
          <span className="font-medium">Batang Tubuh Perda</span> dalam format{" "}
          <b>PDF</b>. Pastikan isi dokumen telah sesuai ketentuan penyusunan.
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-8 border border-gray-200">
        {!file ? (
          <label
            htmlFor="fileInput"
            className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-xl p-10 cursor-pointer hover:bg-blue-50 transition"
          >
            <ArrowUpTrayIcon className="w-14 h-14 text-blue-500 mb-3" />
            <p className="text-gray-700 font-medium">
              Klik untuk memilih atau seret file PDF ke sini
            </p>
            <p className="text-sm text-gray-500 mt-1">Maksimal 10 MB</p>
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex flex-col items-center text-center">
            <DocumentTextIcon className="w-12 h-12 text-green-500 mb-2" />
            <p className="text-gray-700 font-semibold">{file.name}</p>
            <p className="text-sm text-gray-500 mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setMessage("✅ File siap digunakan.")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
              >
                Gunakan Dokumen
              </button>
              <button
                onClick={handleClear}
                className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-3 py-2 rounded-lg transition"
              >
                <XMarkIcon className="w-5 h-5 mr-1" />
                Hapus
              </button>
            </div>
          </div>
        )}

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>

      {/* Preview PDF */}
      {pdfURL && (
        <div className="mt-10 w-full max-w-5xl bg-white shadow-lg border rounded-xl overflow-hidden">
          <div className="bg-blue-600 text-white text-sm font-semibold py-2 px-4">
            Pratinjau Batang Tubuh Perda
          </div>
          <iframe
            src={pdfURL}
            className="w-full h-[600px] border-none"
          ></iframe>
        </div>
      )}
    </div>
  );
}
