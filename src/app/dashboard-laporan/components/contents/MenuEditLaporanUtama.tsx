"use client";

import { useState, useEffect, DragEvent } from "react";
import {
  XMarkIcon,
  CheckIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { addFooter, addFooterLampiranCALK } from "@/app/_utils/add-footers";
import {
  BabCalk,
  LampiranDataUtama,
  LampiranDataUtamaFirestore,
  MenuOption,
} from "@/app/_types/types";
import CalkStructureModal from "../../modals/LampiranCALKModal";
import { editLampiranUtamaFirestore } from "@/app/_lib/_queries/lampiran";

interface EditLampiranUtamaProps {
  dokumenId: string;
  setActiveMenu: (menu: MenuOption) => void;
  lampiran: LampiranDataUtama;
  onEditLampiranUtama: (updated: LampiranDataUtama) => void;
}

export default function MenuEditLampiranUtama({
  dokumenId,
  setActiveMenu,
  lampiran,
  onEditLampiranUtama,
}: EditLampiranUtamaProps) {
  const [romawiLampiran, setRomawiLampiran] = useState(lampiran.romawiLampiran);
  const [judulLampiran, setJudulLampiran] = useState(
    lampiran.judulPembatasLampiran
  );
  const [footerText, setFooterText] = useState(lampiran.footerText);
  const [footer, setFooter] = useState({
    width: lampiran.footerWidth,
    height: lampiran.footerHeight,
    x: lampiran.footerX,
    y: lampiran.footerY,
    fontSize: lampiran.fontSize,
  });
  const [newFile, setNewFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewURL, setPreviewURL] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [openCALKModal, setOpenCALKModal] = useState(false);
  const [babCALK, setBabCALK] = useState<BabCalk[]>(
    lampiran.isCALK && lampiran.babs ? lampiran.babs : []
  );

  const onAddLampiranUtamaCALK = (data: BabCalk[]) => {
    setBabCALK(data);
  };

  const generatePreview = async () => {
    const file = newFile ?? lampiran.file;
    if (!file) return;
    const buffer = await file.arrayBuffer();
    let url = URL.createObjectURL(new Blob([buffer]));

    setIsGenerating(true);
    if (lampiran.isCALK) {
      url = await addFooterLampiranCALK(
        lampiran.footerWidth,
        lampiran.footerX,
        lampiran.footerY,
        lampiran.footerHeight,
        lampiran.fontSize,
        buffer,
        lampiran.jumlahHalaman
      );
    } else {
      url = await addFooter(
        footer.width,
        footer.x,
        footer.y,
        footer.height,
        footer.fontSize,
        romawiLampiran,
        footerText,
        buffer
      );
    }

    if (previewURL) URL.revokeObjectURL(previewURL);
    setPreviewURL(url);
    setIsGenerating(false);
  };

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

  const handleSave = async () => {
    const docFile = newFile ?? lampiran.file;
    interface TipeLampiran {
      id: string;
      file?: File;
      urutan: number;
      namaFileAsli: string;
      namaFileDiStorageLokal: string;
      romawiLampiran: string;
      judulPembatasLampiran: string;
      footerText: string;
      footerWidth: number;
      footerX: number;
      footerY: number;
      fontSize: number;
      footerHeight: number;
      jumlahHalaman: number;
      isCALK: boolean;
      babs?: BabCalk[];
      jumlahTotalLembar: number;
    }

    if (lampiran.isCALK) {
      if (!romawiLampiran || !judulLampiran) {
        alert("Silakan lengkapi semua field!");
        return;
      }
    } else {
      if (!romawiLampiran || !judulLampiran || !footerText) {
        alert("Silakan lengkapi semua field!");
        return;
      }
    }

    const newTipeLampiran: TipeLampiran = lampiran as unknown as TipeLampiran;

    delete newTipeLampiran.file;

    const newLampiranUtamaFirestore: LampiranDataUtamaFirestore = {
      ...newTipeLampiran,
      romawiLampiran,
      judulPembatasLampiran: judulLampiran,
      footerText,
      footerWidth: footer.width,
      footerHeight: footer.height,
      footerX: footer.x,
      footerY: footer.y,
      fontSize: footer.fontSize,
      babs: lampiran.isCALK ? babCALK : [],
    };

    const { success, error } = await editLampiranUtamaFirestore(
      dokumenId,
      newLampiranUtamaFirestore.id,
      newLampiranUtamaFirestore
    );

    if (!success) {
      alert("Terjadi kesalahan saat mengedit data lampiran " + error);
      return;
    }

    onEditLampiranUtama({
      ...lampiran,
      file: docFile,
      romawiLampiran,
      judulPembatasLampiran: judulLampiran,
      footerText,
      footerWidth: footer.width,
      footerHeight: footer.height,
      footerX: footer.x,
      footerY: footer.y,
      fontSize: footer.fontSize,
      babs: lampiran.isCALK ? babCALK : [],
    });

    setActiveMenu(MenuOption.LAMPIRAN_UTAMA);
  };

  useEffect(() => {
    generatePreview();
  }, []);

  return (
    <div className="p-6 w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          ✏️ Edit Lampiran Utama {lampiran.isCALK ? "CALK" : ""}
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
            Romawi Lampiran
          </label>
          <input
            type="text"
            value={romawiLampiran}
            onChange={(e) => setRomawiLampiran(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Judul Lampiran */}
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

        {/* Footer Text */}
        <div className={`${lampiran.isCALK ? "hidden" : "block "}`}>
          <label className="text-gray-700 font-medium mb-1">Footer Text</label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer Settings (satu baris) */}
        <div
          className={`${lampiran.isCALK ? "hidden" : "flex flex-wrap gap-4"}`}
        >
          <div className="flex-1 min-w-[120px]">
            <label className="block text-gray-700 font-medium mb-1">
              Lebar Footer
            </label>
            <input
              type="number"
              value={footer.width}
              onChange={(e) =>
                setFooter({ ...footer, width: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-gray-700 font-medium mb-1">
              Tinggi Footer
            </label>
            <input
              type="number"
              value={footer.height}
              onChange={(e) =>
                setFooter({ ...footer, height: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-gray-700 font-medium mb-1">
              Posisi X Footer
            </label>
            <input
              type="number"
              value={footer.x}
              onChange={(e) =>
                setFooter({ ...footer, x: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-gray-700 font-medium mb-1">
              Posisi Y Footer
            </label>
            <input
              type="number"
              value={footer.y}
              onChange={(e) =>
                setFooter({ ...footer, y: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-gray-700 font-medium mb-1">
              Ukuran Font Footer
            </label>
            <input
              type="number"
              value={footer.fontSize}
              onChange={(e) =>
                setFooter({ ...footer, fontSize: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
            onClick={() => setOpenCALKModal(!openCALKModal)}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium transition"
          >
            Edit Calk
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

      {openCALKModal && (
        <CalkStructureModal
          onClose={() => setOpenCALKModal(false)}
          initialData={babCALK}
          onAddLampiranUtamaCALK={onAddLampiranUtamaCALK}
        />
      )}
    </div>
  );
}
