"use client";

import { useState, useEffect, DragEvent } from "react";
import { LampiranData, MenuOption } from "../../page";
import {
  XMarkIcon,
  CheckIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { addFooter } from "@/app/_utils/add-footers";

interface EditLampiranUtamaProps {
  setActiveMenu: (menu: MenuOption) => void;
  lampiran: LampiranData;
  onEditLampiranUtama: (updated: LampiranData) => void;
}

export default function EditLampiranUtama({
  setActiveMenu,
  lampiran,
  onEditLampiranUtama,
}: EditLampiranUtamaProps) {
  const [romawiLampiran, setRomawiLampiran] = useState(lampiran.romawiLampiran);
  const [judulLampiran, setJudulLampiran] = useState(
    lampiran.judulPembatasLampiran
  );
  const [footerText, setFooterText] = useState(lampiran.footerText);
  const [fontSize, setFontSize] = useState(lampiran.fontSize);
  const [footerX, setFooterX] = useState(lampiran.footerX);
  const [footerY, setFooterY] = useState(lampiran.footerY);
  const [footerWidth, setFooterWidth] = useState(lampiran.footerWidth);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewURL, setPreviewURL] = useState<string>("");

  // Live preview dengan footer setiap ada perubahan input atau file baru
  useEffect(() => {
    const file = newFile ?? lampiran.file;

    const updatePreview = async () => {
      const arrayBuffer = await file.arrayBuffer();
      const url = await addFooter(
        footerWidth,
        footerX,
        footerY,
        lampiran.footerHeight,
        fontSize,
        romawiLampiran,
        footerText,
        arrayBuffer
      );
      setPreviewURL(url);
    };

    updatePreview();
  }, [
    newFile,
    footerWidth,
    footerX,
    footerY,
    fontSize,
    romawiLampiran,
    footerText,
    lampiran.file,
    lampiran.footerHeight,
  ]);

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
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleSave = () => {
    if (!romawiLampiran || !judulLampiran || !footerText) {
      alert("Silakan lengkapi semua field!");
      return;
    }

    onEditLampiranUtama({
      ...lampiran,
      file: newFile ?? lampiran.file,
      romawiLampiran,
      judulPembatasLampiran: judulLampiran,
      footerText,
      fontSize,
      footerX,
      footerY,
      footerWidth,
    });

    setActiveMenu(MenuOption.LAMPIRAN_UTAMA);
  };

  const handleRerender = () => {
    // manual rerender, tetap panggil useEffect otomatis juga
    if (!previewURL) return;
    setPreviewURL("");
    setTimeout(() => {
      const file = newFile ?? lampiran.file;
      file
        .arrayBuffer()
        .then((arrayBuffer) =>
          addFooter(
            footerWidth,
            footerX,
            footerY,
            lampiran.footerHeight,
            fontSize,
            romawiLampiran,
            footerText,
            arrayBuffer
          ).then((url) => setPreviewURL(url))
        );
    }, 50);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          ✏️ Edit Lampiran Utama
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
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Romawi Lampiran
          </label>
          <input
            type="text"
            value={romawiLampiran}
            onChange={(e) => setRomawiLampiran(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Judul Lampiran
          </label>
          <input
            type="text"
            value={judulLampiran}
            onChange={(e) => setJudulLampiran(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Footer Text
          </label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Footer Width
            </label>
            <input
              type="number"
              value={footerWidth}
              onChange={(e) => setFooterWidth(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Font Size
            </label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Footer X
            </label>
            <input
              type="number"
              value={footerX}
              onChange={(e) => setFooterX(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Footer Y
            </label>
            <input
              type="number"
              value={footerY}
              onChange={(e) => setFooterY(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Upload */}
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

        {/* Tombol Rerender + Batal + Simpan */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleRerender}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
          >
            Rerender
          </button>
          <button
            onClick={() => setActiveMenu(MenuOption.LAMPIRAN_UTAMA)}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
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
