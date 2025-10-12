"use client";

import React, { useState, DragEvent } from "react";
import { XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface BatangTubuhProps {
  setBatangTubuh: (file: File) => void;
}

export default function BatangTubuh({ setBatangTubuh }: BatangTubuhProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfURL, setPdfURL] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (selectedFile?: File) => {
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

    setFile(selectedFile);
    setBatangTubuh(selectedFile);
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

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-3xl p-8 border border-gray-200">
        {!file ? (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="fileInput"
              className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg transition
                ${
                  isDragging
                    ? "border-blue-600 bg-blue-50"
                    : "border-blue-300 bg-white"
                }
              `}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-4 pb-6 pointer-events-none">
                <svg
                  className="w-10 h-10 mb-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5
                       5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4
                       4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-gray-500">
                  <span className="font-semibold">Klik untuk unggah</span> atau
                  tarik dan lepaskan
                </p>
                <p className="text-sm text-gray-500">Format File PDF</p>
              </div>
              <input
                id="fileInput"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
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
                Simpan
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
        <div className="mt-10 w-full max-w-5xl bg-white shadow-lg border rounded-lg overflow-hidden">
          <div className="bg-blue-800 text-white font-semibold py-4 px-4">
            PREVIEW BATANG TUBUH
          </div>
          <iframe src={pdfURL} className="w-full h-[600px] border-none" />
        </div>
      )}
    </div>
  );
}
