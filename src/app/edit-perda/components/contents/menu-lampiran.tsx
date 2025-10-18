"use client";

import { useState, useEffect, memo } from "react";
import { LampiranData, MenuOption } from "../../page";
import {
  TrashIcon,
  EyeIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import OrderLampiranUtamaModal from "../../modals/OrderLampiranUtamaModal";

interface LampiranManagerProps {
  setActiveMenu: (menu: MenuOption) => void;
  lampirans: LampiranData[];
  onDeleteLampiran: (id: number) => void;
  updateLampiranOrder: (newOrder: LampiranData[]) => void;
}

export default function LampiranManager({
  setActiveMenu,
  lampirans,
  onDeleteLampiran,
  updateLampiranOrder,
}: LampiranManagerProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<LampiranData[]>([]);

  // Sinkronisasi lampirans dari props ke state lokal
  useEffect(() => {
    setLocalOrder([...lampirans]);
  }, [lampirans]);

  // Cleanup URL object saat preview ditutup
  const closePreview = () => {
    if (previewURL) URL.revokeObjectURL(previewURL);
    setPreviewURL(null);
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewURL(url);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    setLocalOrder((prev) => {
      const updated = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      updated.forEach((l, i) => (l.urutan = i + 1));
      return updated;
    });
  };

  const handleSaveOrder = () => {
    updateLampiranOrder(localOrder);
    setShowOrderModal(false);
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          📎 Daftar Lampiran Utama
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveMenu(MenuOption.TAMBAH_LAMPIRAN_UTAMA)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
            title="Tambah lampiran baru"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Tambah Lampiran
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
            title="Ubah urutan lampiran"
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
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-center">No.</th>
                <th className="px-4 py-2 text-left">Nama File</th>
                <th className="px-4 py-2 text-center">Romawi</th>
                <th className="px-4 py-2 text-left">Judul Lampiran</th>
                <th className="px-4 py-2 text-center">Jumlah Halaman</th>
                <th className="px-4 py-2 text-center">Ukuran</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lampirans.map((l, i) => (
                <LampiranRow
                  key={l.id}
                  lampiran={l}
                  index={i}
                  onPreview={handlePreview}
                  onDelete={onDeleteLampiran}
                  formatFileSize={formatFileSize}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Urutan */}
      {showOrderModal && (
        <OrderLampiranUtamaModal
          lampiran={localOrder}
          moveItem={moveItem}
          onClose={() => setShowOrderModal(false)}
          onSave={handleSaveOrder}
        />
      )}

      {/* Modal Preview PDF */}
      {previewURL && (
        <PreviewModal pdfURL={previewURL} onClose={closePreview} />
      )}
    </div>
  );
}

/* ====== Row Lampiran (memoized) ====== */
interface LampiranRowProps {
  lampiran: LampiranData;
  index: number;
  onPreview: (file: File) => void;
  onDelete: (id: number) => void;
  formatFileSize: (size: number) => string;
}

const LampiranRow = memo(function LampiranRow({
  lampiran: l,
  index,
  onPreview,
  onDelete,
  formatFileSize,
}: LampiranRowProps) {
  return (
    <tr
      className={`${
        index % 2 === 0 ? "bg-white" : "bg-gray-50"
      } hover:bg-blue-50 transition`}
    >
      <td className="px-4 py-2 text-center">{index + 1}</td>
      <td className="px-4 py-2">{l.file.name}</td>
      <td className="px-4 py-2 text-center font-semibold text-blue-600">
        {l.romawiLampiran}
      </td>
      <td className="px-4 py-2">{l.judulPembatasLampiran}</td>
      <td className="px-4 py-2 text-center">{l.jumlahHalaman}</td>
      <td className="px-4 py-2 text-center">{formatFileSize(l.file.size)}</td>
      <td className="px-4 py-2 text-center">
        <div className="flex justify-center gap-2">
          <button
            title="Preview PDF"
            onClick={() => onPreview(l.file)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition font-medium"
          >
            <EyeIcon className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            title="Hapus Lampiran"
            onClick={() => onDelete(l.id)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 transition font-medium"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Hapus</span>
          </button>
        </div>
      </td>
    </tr>
  );
});

/* ====== Modal Preview PDF ====== */
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
          title="Tutup Preview"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <iframe
          src={pdfURL}
          className="w-full h-full rounded-lg border"
          title="Preview PDF"
        />
      </div>
    </div>
  );
}
