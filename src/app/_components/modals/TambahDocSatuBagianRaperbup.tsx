"use client";

import { useEffect, useRef, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { Fragment } from "react";

export interface DaftarOPDAndFileType {
  id: number;
  nama: string;
  file: File | null;
}

interface UploadModalProps {
  daftarOPDAndFile: DaftarOPDAndFileType[];
  updateOPDBLampiranById: (
    id: number,
    updatedData: Partial<DaftarOPDAndFileType>
  ) => void;
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File, arrayBuffer: ArrayBuffer) => void;
}

export default function UploadModalTambahLampiran({
  updateOPDBLampiranById,
  daftarOPDAndFile,
  isOpen,
  onClose,
  onFileSelected,
}: UploadModalProps) {
  const [selectedOPD, setSelectedOPD] = useState<DaftarOPDAndFileType | null>(
    null
  );
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diizinkan!");
      return;
    }
    const arrayBuffer = await file.arrayBuffer();
    setSelectedFile(file);
    onFileSelected(file, arrayBuffer);
  };

  const handleOnClickSimpan = () => {
    if (!selectedOPD) {
      alert("Silakan pilih OPD terlebih dahulu!");
      return;
    }
    updateOPDBLampiranById(selectedOPD.id, { file: selectedFile });
    setSelectedFile(null);
    onClose();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFiles(e.target.files);
  };

  // 🔹 Jika user memilih OPD yang punya file, tampilkan file tersebut
  useEffect(() => {
    if (selectedOPD?.file) {
      setSelectedFile(selectedOPD.file);
    } else {
      setSelectedFile(null);
    }
  }, [selectedOPD]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-full p-6 relative animate-[fadeIn_0.2s_ease-out,scaleIn_0.2s_ease-out]">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold mb-5 text-gray-800 text-center">
          Upload Lampiran PDF
        </h2>

        {/* 🔹 Custom Dropdown */}
        <div className="mb-5">
          <label className="block text-sm text-gray-600 mb-2 font-medium">
            Pilih OPD Tujuan
          </label>
          <Listbox value={selectedOPD} onChange={setSelectedOPD}>
            <div className="relative">
              <Listbox.Button className="w-full flex justify-between items-center border border-gray-300 bg-white rounded-lg px-4 py-2 text-left text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition">
                <span>{selectedOPD ? selectedOPD.nama : "— Pilih OPD —"}</span>
                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
              </Listbox.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Listbox.Options className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto focus:outline-none">
                  {daftarOPDAndFile.map((opd) => (
                    <Listbox.Option
                      key={opd.id}
                      value={opd}
                      className={({ active }) =>
                        `flex items-center justify-between px-4 py-2 cursor-pointer ${
                          active ? "bg-blue-50 text-blue-700" : "text-gray-700"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className="truncate">{opd.nama}</span>
                          {opd.file && (
                            <CheckIcon className="w-5 h-5 text-green-500" />
                          )}
                          {selected && !opd.file && (
                            <CheckIcon className="w-5 h-5 text-blue-500" />
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* 🔹 Area Upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer rounded-xl transition-all ${
            dragOver
              ? "border-blue-500 bg-blue-50 scale-[1.01]"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center space-y-2">
              <DocumentTextIcon className="w-8 h-8 text-blue-500" />
              <p className="text-gray-700 text-sm">
                File: <span className="font-semibold">{selectedFile.name}</span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              <span className="font-medium text-blue-600">Klik</span> atau{" "}
              <span className="font-medium">tarik PDF ke sini</span>
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="application/pdf"
          onChange={handleFileChange}
        />

        {/* 🔹 Tombol Aksi */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
          >
            Batal
          </button>
          <button
            onClick={handleOnClickSimpan}
            disabled={!selectedOPD || !selectedFile}
            className={`px-4 py-2 rounded-md font-medium text-white transition ${
              !selectedOPD || !selectedFile
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Simpan
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.97);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
