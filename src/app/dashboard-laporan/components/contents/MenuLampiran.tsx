"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrashIcon,
  EyeIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import OrderLampiranUtamaModal from "../../modals/OrderLampiranUtamaModal";
import { JenisLaporan, LampiranData, MenuOption } from "@/app/_types/types";
import { generateTextJenisLaporan } from "@/app/_utils/jenis-laporan";

/* ============================================================
   INTERFACE
============================================================ */
interface LampiranManagerProps {
  jenisLaporan: JenisLaporan;
  setActiveMenu: (menu: MenuOption) => void;
  lampirans: LampiranData[];
  onDeleteLampiran: (id: number) => void;
  updateLampiranOrder: (newOrder: LampiranData[]) => void;
  handleOnClickEditLampiran: (editedLampiran: LampiranData) => void;
}

/* ============================================================
   KOMPONEN UTAMA
============================================================ */
export default function MenuLampiran({
  jenisLaporan,
  setActiveMenu,
  lampirans,
  onDeleteLampiran,
  updateLampiranOrder,
  handleOnClickEditLampiran,
}: LampiranManagerProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<LampiranData[]>([]);

  // Sinkronisasi order lokal dengan props
  useEffect(() => {
    setLocalOrder([...lampirans]);
  }, [lampirans]);

  // Fungsi untuk mengubah urutan lampiran
  const moveItem = useCallback((index: number, direction: "up" | "down") => {
    setLocalOrder((prev) => {
      const updated = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated.map((l, i) => ({ ...l, urutan: i + 1 }));
    });
  }, []);

  // Preview PDF
  const handlePreview = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewURL(url);
  }, []);

  // Simpan perubahan urutan lampiran
  const handleSaveOrder = useCallback(() => {
    updateLampiranOrder(localOrder);
    setShowOrderModal(false);
  }, [localOrder, updateLampiranOrder]);

  // Format ukuran file
  const formatFileSize = (size: number) =>
    size < 1024
      ? `${size} B`
      : size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / 1024 / 1024).toFixed(1)} MB`;

  // Bersihkan URL preview saat unmount
  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 capitalize">
          📎 Daftar Lampiran Utama {generateTextJenisLaporan(jenisLaporan)}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveMenu(MenuOption.TAMBAH_LAMPIRAN_UTAMA)}
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

      {/* TABEL LAMPIRAN */}
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
                <tr
                  key={l.id}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-2 text-center">{i + 1}</td>
                  <td
                    className="px-4 py-2 truncate max-w-[180px]"
                    title={l.file.name}
                  >
                    {l.file.name}
                  </td>
                  <td className="px-4 py-2 text-center font-semibold text-blue-600">
                    {l.romawiLampiran}
                  </td>
                  <td className="px-4 py-2">{l.judulPembatasLampiran}</td>
                  <td className="px-4 py-2 text-center">{l.jumlahHalaman}</td>
                  <td className="px-4 py-2 text-center">
                    {formatFileSize(l.file.size)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      {/* Preview */}
                      <button
                        onClick={() => handlePreview(l.file)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition font-medium"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Preview</span>
                      </button>

                      {/* Edit */}
                      <button
                        title="Edit Lampiran"
                        onClick={() => handleOnClickEditLampiran(l)}
                        className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 transition font-medium"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Edit</span>
                      </button>

                      {/* Hapus */}
                      <button
                        onClick={() => onDeleteLampiran(l.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition font-medium"
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

      {/* MODAL: Urutan Lampiran */}
      {showOrderModal && (
        <OrderLampiranUtamaModal
          lampiran={localOrder}
          moveItem={moveItem}
          onClose={() => setShowOrderModal(false)}
          onSave={handleSaveOrder}
        />
      )}

      {/* MODAL: Preview PDF */}
      {previewURL && (
        <PreviewModal pdfURL={previewURL} onClose={() => setPreviewURL(null)} />
      )}
    </div>
  );
}

/* ============================================================
   KOMPONEN MODAL PREVIEW PDF
============================================================ */
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
          className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow hover:bg-gray-200 transition"
          title="Tutup"
        >
          <XMarkIcon className="w-6 h-6 text-gray-700" />
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
