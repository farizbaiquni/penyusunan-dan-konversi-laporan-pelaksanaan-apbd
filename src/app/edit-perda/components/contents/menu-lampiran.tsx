"use client";

import { useState } from "react";
import { LampiranData } from "../../page";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface Lampiran {
  id: number;
  romawi: string;
  judul: string;
  fileName: string;
}

interface LampiranManagerProps {
  setActiveMenu: (menu: string) => void;
  lampirans: LampiranData[];
  onDeleteLampiran: (id: number) => void;
}

export default function LampiranManager({
  setActiveMenu,
  lampirans,
  onDeleteLampiran,
}: LampiranManagerProps) {
  const [lampiran, setLampiran] = useState<Lampiran[]>([
    {
      id: 1,
      romawi: "I",
      judul: "Laporan Konsolidasi",
      fileName: "lampiran1.pdf",
    },
    { id: 2, romawi: "II", judul: "Neraca Daerah", fileName: "lampiran2.pdf" },
    {
      id: 3,
      romawi: "III",
      judul: "Laporan Realisasi",
      fileName: "lampiran3.pdf",
    },
  ]);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const moveItem = (index: number, direction: "up" | "down") => {
    setLampiran((prev) => {
      const updated = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated;
    });
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewURL(url);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          📎 Daftar Lampiran
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveMenu("Tambah Lampiran")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Tambah Lampiran
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            Ubah Urutan
          </button>
        </div>
      </div>

      {/* Tabel Daftar Lampiran */}
      {lampirans.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6 border rounded-lg">
          Belum ada lampiran yang ditambahkan.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Nama File</th>
                <th className="px-4 py-2">Romawi</th>
                <th className="px-4 py-2">Teks Footer</th>
                <th className="px-4 py-2">Lebar</th>
                <th className="px-4 py-2">Font</th>
                <th className="px-4 py-2">Posisi (X,Y)</th>
                <th className="px-4 py-2">Tinggi</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lampirans.map((l, i) => (
                <tr
                  key={l.id}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-2">{l.file.name}</td>
                  <td className="px-4 py-2 text-center">{l.romawiLampiran}</td>
                  <td className="px-4 py-2">{l.footerText}</td>
                  <td className="px-4 py-2 text-center">{l.footerWidth}%</td>
                  <td className="px-4 py-2 text-center">{l.fontSize}</td>
                  <td className="px-4 py-2 text-center">
                    ({l.footerX}, {l.footerY})
                  </td>
                  <td className="px-4 py-2 text-center">{l.footerHeight}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handlePreview(l.file)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => onDeleteLampiran(l.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Urutan */}
      {showOrderModal && (
        <OrderModal
          lampiran={lampiran}
          moveItem={moveItem}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {/* Modal Preview PDF */}
      {previewURL && (
        <PreviewModal pdfURL={previewURL} onClose={() => setPreviewURL(null)} />
      )}
    </div>
  );
}

/* ========= MODAL: Ubah Urutan Lampiran ========= */
function OrderModal({
  lampiran,
  moveItem,
  onClose,
}: {
  lampiran: Lampiran[];
  moveItem: (index: number, direction: "up" | "down") => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 p-6 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Ubah Urutan Lampiran
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border text-center">Urut</th>
                <th className="p-2 border">Romawi</th>
                <th className="p-2 border text-left">Judul</th>
                <th className="p-2 border text-left">File</th>
                <th className="p-2 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lampiran.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="text-center border">{index + 1}</td>
                  <td className="text-center border font-semibold text-blue-600">
                    {item.romawi}
                  </td>
                  <td className="border px-2">{item.judul}</td>
                  <td className="border px-2 text-gray-500">{item.fileName}</td>
                  <td className="border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === lampiran.length - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Tutup
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
          >
            Simpan Urutan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========= MODAL: Preview PDF ========= */
function PreviewModal({
  pdfURL,
  onClose,
}: {
  pdfURL: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-[-20px] cursor-pointer p-1 hover:bg-gray-300 transition rounded-full bg-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <iframe
          src={pdfURL}
          className="w-full h-full rounded-lg border"
          title="Preview PDF"
        ></iframe>
      </div>
    </div>
  );
}
