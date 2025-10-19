"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import { XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface UploadLampiranProps {
  file: File | null;
  setFile: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  onFileLoad: (arrayBuffer: ArrayBuffer) => Promise<void>;
}

export default function UploadLampiran({
  file,
  setFile,
  setPreviewUrl,
  onFileLoad,
}: UploadLampiranProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = async (selectedFile?: File) => {
    if (!selectedFile) {
      alert("⚠️ Silakan pilih file PDF terlebih dahulu.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      alert("❌ Hanya file PDF yang diperbolehkan.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    setPreviewUrl(URL.createObjectURL(selectedFile));
    await onFileLoad(arrayBuffer);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) await validateAndSetFile(selectedFile);
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="fileInput"
            className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg transition ${
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
              <svg
                className="w-10 h-10 mb-4 text-gray-500"
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
        <div className="flex py-3 flex-col rounded-lg items-center text-center border border-gray-800">
          <DocumentTextIcon className="w-12 h-12 text-green-500 mb-2" />
          <div className="flex gap-x-5 items-center">
            <p className="text-gray-700 font-semibold">{file.name}</p>
            <XMarkIcon
              onClick={handleClear}
              className="w-5 h-5 mr-1 font-extrabold text-white bg-red-500 rounded-full cursor-pointer"
            />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
}
