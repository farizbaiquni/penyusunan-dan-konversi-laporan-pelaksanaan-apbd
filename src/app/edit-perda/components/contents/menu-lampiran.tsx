"use client";

import { useState } from "react";

interface LampiranManagerProps {
  setActiveMenu: (menu: string) => void;
}

interface Lampiran {
  id: number;
  romawi: string;
  judul: string;
  fileName: string;
}

export default function LampiranManager({
  setActiveMenu,
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLampiran, setEditLampiran] = useState<Lampiran | null>(null);

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

  // Tambah lampiran
  function addLampiran(judul: string, fileName: string) {
    const nextRomawi = toRoman(lampiran.length + 1);
    const newLampiran: Lampiran = {
      id: Date.now(),
      romawi: nextRomawi,
      judul,
      fileName,
    };
    setLampiran([...lampiran, newLampiran]);
    setShowAddModal(false);
  }

  // Edit lampiran
  function updateLampiran(updated: Lampiran) {
    setLampiran((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setEditLampiran(null);
    setShowEditModal(false);
  }

  // Hapus lampiran
  function deleteLampiran(id: number) {
    if (confirm("Yakin ingin menghapus lampiran ini?")) {
      setLampiran((prev) => prev.filter((l) => l.id !== id));
    }
  }

  function toRoman(num: number): string {
    const romans = [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
    ];
    return romans[num - 1] || num.toString();
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
      <table className="w-full border border-gray-200 rounded-lg text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border">Urut</th>
            <th className="p-2 border">Romawi</th>
            <th className="p-2 border text-left">Judul Lampiran</th>
            <th className="p-2 border text-left">File</th>
            <th className="p-2 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {lampiran.map((item, index) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="text-center border">{index + 1}</td>
              <td className="text-center border font-semibold">
                {item.romawi}
              </td>
              <td className="border px-2">{item.judul}</td>
              <td className="border px-2 text-gray-500 truncate">
                {item.fileName}
              </td>
              <td className="border text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditLampiran(item);
                      setShowEditModal(true);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteLampiran(item.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Hapus"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL: Tambah Lampiran ================= */}
      {showAddModal && (
        <LampiranModal
          title="Tambah Lampiran Baru"
          onClose={() => setShowAddModal(false)}
          onSubmit={addLampiran}
        />
      )}

      {/* ================= MODAL: Edit Lampiran ================= */}
      {showEditModal && editLampiran && (
        <LampiranModal
          title="Edit Lampiran"
          onClose={() => setShowEditModal(false)}
          onSubmit={(judul, fileName) =>
            updateLampiran({ ...editLampiran, judul, fileName })
          }
          defaultValues={editLampiran}
        />
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

/* ========= MODAL: Tambah / Edit Lampiran ========= */
function LampiranModal({
  title,
  onClose,
  onSubmit,
  defaultValues,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (judul: string, fileName: string) => void;
  defaultValues?: { judul: string; fileName: string };
}) {
  const [judul, setJudul] = useState(defaultValues?.judul || "");
  const [fileName, setFileName] = useState(defaultValues?.fileName || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 animate-fadeIn">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        <label className="block text-sm mb-2">Judul Lampiran</label>
        <input
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          className="w-full border rounded-lg p-2 mb-3"
          placeholder="Contoh: Laporan Realisasi"
        />

        <label className="block text-sm mb-2">Nama File</label>
        <input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="Contoh: lampiran3.pdf"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onSubmit(judul, fileName);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Simpan
          </button>
        </div>
      </div>
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
