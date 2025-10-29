"use client";

import React, { useState, useEffect, DragEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { JenisLaporan } from "@/app/_types/types";
import { generateTextJenisLaporan } from "@/app/_utils/jenis-laporan";
import Image from "next/image";
import {
  addBatangTubuh,
  deleteBatangTubuh,
} from "@/app/_lib/_queries/batang-tubuh";
import LoadingProcessing from "@/app/_components/LoadingProcessing";

interface BatangTubuhProps {
  dokumenIdFirestore: string;
  tahun: number;
  jenisLaporan: JenisLaporan;
  batangTubuhFile: File | null;
  setBatangTubuhFile: (file: File | null) => void;
}

export default function MenuBatangTubuh({
  dokumenIdFirestore,
  tahun,
  jenisLaporan,
  batangTubuhFile,
  setBatangTubuhFile,
}: BatangTubuhProps) {
  const [isLoadingAddBatangTubuh, setIsLoadingAddBatangTubuh] = useState(false);
  const [isLoadingDeleteBatangTubuh, setIsLoadingDeleteBatangTubuh] =
    useState(false);
  const [batangTubuhURL, setBatangTubuhURL] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(
    batangTubuhFile
      ? `✅ File "${batangTubuhFile.name}" siap digunakan, silakan klik "Simpan"`
      : null
  );

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
    setBatangTubuhFile(file);
  };

  const handleClear = async () => {
    setIsLoadingDeleteBatangTubuh(true);
    await deleteBatangTubuh(
      batangTubuhFile?.name || "",
      tahun,
      jenisLaporan,
      dokumenIdFirestore
    );
    setIsLoadingDeleteBatangTubuh(false);
    setBatangTubuhFile(null);
  };

  const handleSaveBatangTubuh = async () => {
    if (!batangTubuhFile) {
      alert("Unggah file PDF terlebih dahulu!");
      return;
    }
    setIsLoadingAddBatangTubuh(true);
    addBatangTubuh(batangTubuhFile, tahun, jenisLaporan, dokumenIdFirestore);

    setIsLoadingAddBatangTubuh(false);
  };

  // Update URL preview setiap kali file berubah
  useEffect(() => {
    if (batangTubuhFile) {
      const url = URL.createObjectURL(batangTubuhFile);
      setBatangTubuhURL(url);
      setMessage(`✅ File "${batangTubuhFile.name}" siap digunakan.`);
      return () => URL.revokeObjectURL(url);
    } else {
      setBatangTubuhURL(null);
      setMessage(null);
    }
  }, [batangTubuhFile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 capitalize">
          Unggah Batang Tubuh {generateTextJenisLaporan(jenisLaporan)}
        </h1>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          Unggah berkas{" "}
          <span className="font-medium">
            Batang Tubuh{" "}
            <span className="capitalize">
              {generateTextJenisLaporan(jenisLaporan)}
            </span>
          </span>{" "}
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
                  ? "border-blue-700 bg-blue-50"
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
              <Image
                src="/images/paper.png"
                alt="Upload Icon"
                width={55}
                height={55}
                className="animate-bounce"
              />
              <p className="mb-2 text-gray-500 mt-2">
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
            <Image
              src="/images/paper.png"
              alt="Upload Icon"
              width={55}
              height={55}
              className="animate-bounce"
            />
            <p className="text-gray-800 font-semibold text-lg">
              {batangTubuhFile.name}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {(batangTubuhFile.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleSaveBatangTubuh()}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 hover:scale-105 text-white font-semibold px-5 py-2 rounded-lg shadow transition transform"
              >
                Simpan
              </button>
              <button
                onClick={handleClear}
                className="flex items-center cursor-pointer bg-red-300 hover:bg-red-500 font-semibold hover:scale-105 text-gray-900  px-4 py-2 rounded-lg transition transform"
              >
                <XMarkIcon className="w-5 h-5 mr-1" />
                Hapus
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
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

      {/* Loading Add Batang Tubuh */}
      {isLoadingAddBatangTubuh && (
        <LoadingProcessing message="Menyimpan Batang Tubuh..." />
      )}

      {/* Loading Delete Batang Tubuh */}
      {isLoadingDeleteBatangTubuh && (
        <LoadingProcessing message="Menghapus Batang Tubuh..." />
      )}
    </div>
  );
}
