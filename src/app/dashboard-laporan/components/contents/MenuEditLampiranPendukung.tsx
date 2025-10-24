"use client";

import { useState, useEffect, DragEvent } from "react";
import {
  XMarkIcon,
  CheckIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import {
  JenisLaporan,
  LampiranDataPendukung,
  MenuOption,
} from "@/app/_types/types";
import { PDFDocument } from "pdf-lib";
import { generateTextJenisLaporan } from "@/app/_utils/jenis-laporan";

interface EditLampiranPendukungProps {
  jenisLaporan: JenisLaporan;
  setActiveMenu: (menu: MenuOption) => void;
  lampiran: LampiranDataPendukung;
  onEditLampiranPendukung: (updated: LampiranDataPendukung) => void;
}

export default function MenuEditLampiranPendukung({
  jenisLaporan,
  setActiveMenu,
  lampiran,
  onEditLampiranPendukung,
}: EditLampiranPendukungProps) {
  const [judulLampiran, setJudulLampiran] = useState<string>(lampiran.judul);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewURL, setPreviewURL] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePreview = async () => {
    const file = newFile ?? lampiran.file;
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const url = URL.createObjectURL(new Blob([buffer]));
    setIsGenerating(true);
    // url = await addFooterLampiranCALK(
    //     lampiran.footerWidth,
    //     lampiran.footerX,
    //     lampiran.footerY,
    //     lampiran.footerHeight,
    //     lampiran.fontSize,
    //     buffer,
    //     lampiran.jumlahHalaman
    //   );

    if (previewURL) URL.revokeObjectURL(previewURL);
    setPreviewURL(URL.createObjectURL(file));
    setIsGenerating(false);
  };

  useEffect(() => {
    generatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFile]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan!");
      return;
    }
    setNewFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0] ?? null);
  };

  const handleSave = async (pdfFile: File) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    onEditLampiranPendukung({
      ...lampiran,
      file: newFile ?? lampiran.file,
      judul: judulLampiran,
      jumlahTotalLembar: pageCount,
    });

    setActiveMenu(MenuOption.LAMPIRAN_UTAMA);
  };

  return (
    <div className="p-6 w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">
          ✏️ Edit Lampiran Pendukung {generateTextJenisLaporan(jenisLaporan)}
        </h2>
        <button
          onClick={() => setActiveMenu(MenuOption.LAMPIRAN_UTAMA)}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        {/* Upload File PDF */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Ganti File PDF
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">
              {newFile ? newFile.name : lampiran.file.name}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Klik atau tarik file PDF ke sini
            </p>
            <input
              type="file"
              id="fileInput"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {/* Romawi Lampiran */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Judul Lampiran Pendukung
          </label>
          <input
            type="text"
            value={judulLampiran}
            onChange={(e) => setJudulLampiran(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tombol */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={generatePreview}
            disabled={isGenerating}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
          >
            {isGenerating ? "Memproses..." : "Preview"}
          </button>
          <button
            onClick={() => setActiveMenu(MenuOption.LAMPIRAN_UTAMA)}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium transition"
          >
            Batal
          </button>
          <button
            onClick={() => handleSave(newFile ?? lampiran.file)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center gap-1"
          >
            <CheckIcon className="w-5 h-5" /> Simpan
          </button>
        </div>
      </div>

      {/* Preview PDF */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden h-[500px] mt-6">
        {previewURL ? (
          <iframe
            src={previewURL}
            className="w-full h-full"
            title="Preview PDF"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <DocumentIcon className="w-12 h-12 mr-2" />
            Preview PDF akan muncul di sini
          </div>
        )}
      </div>
    </div>
  );
}
