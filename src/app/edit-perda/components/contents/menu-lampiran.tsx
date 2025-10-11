"use client";

import { useState } from "react";
import { LampiranData } from "../../page";

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

  // Fungsi pindah urutan (di modal urutan)
  function moveItem(index: number, direction: "up" | "down") {
    setLampiran((prev) => {
      const newList = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newList.length) return newList;
      [newList[index], newList[targetIndex]] = [
        newList[targetIndex],
        newList[index],
      ];
      return newList;
    });
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📎 Daftar Lampiran</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveMenu("Tambah Lampiran")}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            ➕ Tambah Lampiran
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            ⚙️ Ubah Urutan Lampiran
          </button>
        </div>
      </div>
      {/* Tabel Daftar Lampiran */}
      {lampirans.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada lampiran ditambahkan.</p>
      ) : (
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Nama File</th>
              <th className="border px-3 py-2">Romawi</th>
              <th className="border px-3 py-2">Teks Footer</th>
              <th className="border px-3 py-2">Lebar</th>
              <th className="border px-3 py-2">Font</th>
              <th className="border px-3 py-2">Posisi (X,Y)</th>
              <th className="border px-3 py-2">Tinggi</th>
              <th className="border px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {lampirans.map((l) => (
              <tr key={l.id}>
                <td className="border px-3 py-2">{l.file.name}</td>
                <td className="border px-3 py-2 text-center">
                  {l.romawiLampiran}
                </td>
                <td className="border px-3 py-2">{l.footerText}</td>
                <td className="border px-3 py-2 text-center">
                  {l.footerWidth}%
                </td>
                <td className="border px-3 py-2 text-center">{l.fontSize}</td>
                <td className="border px-3 py-2 text-center">
                  ({l.footerX}, {l.footerY})
                </td>
                <td className="border px-3 py-2 text-center">
                  {l.footerHeight}
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => onDeleteLampiran(l.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* ================= MODAL: Ubah Urutan Lampiran ================= */}
      {showOrderModal && (
        <OrderModal
          lampiran={lampiran}
          moveItem={moveItem}
          onClose={() => setShowOrderModal(false)}
        />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-4 p-6 animate-fadeIn">
        <h3 className="text-lg font-semibold mb-4">Ubah Urutan Lampiran</h3>

        <table className="w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">Urut</th>
              <th className="p-2 border">Romawi</th>
              <th className="p-2 border text-left">Judul</th>
              <th className="p-2 border text-left">File</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {lampiran.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="text-center border">{index + 1}</td>
                <td className="text-center border font-semibold">
                  {item.romawi}
                </td>
                <td className="border px-2">{item.judul}</td>
                <td className="border px-2 text-gray-500">{item.fileName}</td>
                <td className="border text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => moveItem(index, "up")}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                      disabled={index === 0}
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                      disabled={index === lampiran.length - 1}
                    >
                      ⬇️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Tutup
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Simpan Urutan
          </button>
        </div>
      </div>
    </div>
  );
}
