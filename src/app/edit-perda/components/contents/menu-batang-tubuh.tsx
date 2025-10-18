"use client";

import React, { useState, useEffect, DragEvent } from "react";
import { XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface BatangTubuhProps {
  batangTubuhFile: File | null;
  setBatangTubuh: (file: File | null) => void;
}

export default function BatangTubuh({
  batangTubuhFile,
  setBatangTubuh,
}: BatangTubuhProps) {
  const [batangTubuhURL, setBatangTubuhURL] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(
    batangTubuhFile ? `✅ File "${batangTubuhFile.name}" siap digunakan.` : null
  );

  // Update URL preview setiap kali file berubah
  useEffect(() => {
    if (batangTubuhFile) {
      const url = URL.createObjectURL(batangTubuhFile);
      setBatangTubuhURL(url);
      setMessage(`✅ File "${batangTubuhFile.name}" siap digunakan.`);
      return () => URL.revokeObjectURL(url); // cleanup URL lama
    } else {
      setBatangTubuhURL(null);
      setMessage(null);
    }
  }, [batangTubuhFile]);

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

  const validateAndSetFile = (file?: File) => {
    if (!file) {
      setMessage("⚠️ Silakan pilih file PDF terlebih dahulu.");
      return;
    }
    if (file.type !== "application/pdf") {
      setMessage("❌ Hanya file PDF yang diperbolehkan.");
      return;
    }
    setBatangTubuh(file);
  };

  const handleClear = () => {
    setBatangTubuh(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Unggah Batang Tubuh Peraturan Daerah
        </h1>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          Unggah berkas <span className="font-medium">Batang Tubuh Perda</span>{" "}
          dalam format <b>PDF</b>. Pastikan dokumen sesuai ketentuan penyusunan.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-3xl p-8 border border-gray-200">
        {!batangTubuhFile ? (
          <label
            htmlFor="fileInput"
            className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg transition-all duration-300
              ${
                isDragging
                  ? "border-blue-600 bg-blue-50"
                  : "border-blue-300 bg-white"
              }`}
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
              <DocumentTextIcon className="w-10 h-10 mb-4 text-gray-500" />
              <p className="mb-2 text-gray-500">
                <span className="font-semibold">Klik untuk unggah</span> atau
                tarik dan lepaskan
              </p>
              <p className="text-sm text-gray-500">Format PDF</p>
            </div>
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex flex-col items-center text-center animate-fadeIn">
            <DocumentTextIcon className="w-14 h-14 text-green-500 mb-2 animate-bounce" />
            <p className="text-gray-800 font-semibold text-lg">
              {batangTubuhFile.name}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {(batangTubuhFile.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setMessage("✅ File siap digunakan.")}
                className="bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white font-semibold px-5 py-2 rounded-lg shadow transition transform"
              >
                Simpan
              </button>
              <button
                onClick={handleClear}
                className="flex items-center bg-gray-200 hover:bg-gray-300 hover:scale-105 text-gray-700 font-medium px-4 py-2 rounded-lg transition transform"
              >
                <XMarkIcon className="w-5 h-5 mr-1" />
                Hapus
              </button>
            </div>

            {message && (
              <p className="mt-4 text-center text-sm text-gray-700">
                {message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Preview PDF */}
      {batangTubuhURL && (
        <div className="mt-10 w-full max-w-5xl bg-white shadow-lg border rounded-lg overflow-hidden">
          <div className="bg-blue-800 text-white font-semibold py-4 px-4">
            PREVIEW BATANG TUBUH
          </div>
          <iframe
            src={batangTubuhURL}
            className="w-full h-[600px] border-none"
            title="Preview Batang Tubuh"
          />
        </div>
      )}
    </div>
  );
}
