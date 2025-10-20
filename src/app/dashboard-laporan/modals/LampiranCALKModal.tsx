/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PDFDocument } from "pdf-lib";
import { BabCalk, SubbabCalk } from "@/app/_types/types";
import { generateDaftarIsiCALK } from "@/app/_utils/generate-daftar-isi-calk";

interface CalkStructureModalProps {
  onClose: () => void;
  initialData?: BabCalk[];
  onAddLampiranUtamaCALK: (data: BabCalk[]) => void;
}

/* ====================== MODAL ====================== */
export default function CalkStructureModal({
  onClose,
  initialData = [],
  onAddLampiranUtamaCALK,
}: CalkStructureModalProps) {
  const [babs, setBabs] = useState<BabCalk[]>(initialData);
  const [isDownloading, setIsDownloading] = useState(false);

  /* 🔢 Konversi angka ke romawi */
  function romanize(num: number): string {
    if (!+num) return "";
    const digits = String(+num).split("");
    const key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ];
    let roman = "",
      i = 3;
    while (i--) roman = (key[+digits.pop()! + i * 10] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
  }

  /* 🧩 Tambah Bab */
  const addBab = () => {
    setBabs((prev) => {
      const nextIndex = prev.length + 1;
      const newBab: BabCalk = {
        id: crypto.randomUUID(),
        bab: romanize(nextIndex),
        judul: "",
        halamanMulai: 1,
        subbabs: [],
      };
      return [...prev, newBab];
    });
  };

  /* ❌ Hapus Bab */
  const deleteBab = (index: number) => {
    setBabs((prev) => prev.filter((_, i) => i !== index));
  };

  /* ➕ Tambah Subbab */
  const addSubbab = (babIndex: number) => {
    setBabs((prev) =>
      prev.map((b, idx) => {
        if (idx !== babIndex) return b;
        const nextNumber = (b.subbabs?.length || 0) + 1;
        const newSub: SubbabCalk = {
          id: crypto.randomUUID(),
          subbab: nextNumber.toString(),
          judul: "",
          halamanMulai: 1,
        };
        return { ...b, subbabs: [...(b.subbabs || []), newSub] };
      })
    );
  };

  /* ✏️ Update Bab */
  const updateBabField = (index: number, field: keyof BabCalk, value: any) => {
    setBabs((prev) =>
      prev.map((b, i) =>
        i === index
          ? {
              ...b,
              [field]: field === "halamanMulai" && value > 206 ? 206 : value,
            }
          : b
      )
    );
  };

  /* ✏️ Update Subbab */
  const updateSubbabField = (
    babIndex: number,
    subIndex: number,
    field: keyof SubbabCalk,
    value: any
  ) => {
    setBabs((prev) =>
      prev.map((b, i) =>
        i !== babIndex
          ? b
          : {
              ...b,
              subbabs: b.subbabs?.map((s, j) =>
                j === subIndex
                  ? {
                      ...s,
                      [field]:
                        field === "halamanMulai" && value > 206 ? 206 : value,
                    }
                  : s
              ),
            }
      )
    );
  };

  /* ❌ Hapus Subbab */
  const deleteSubbab = (babIndex: number, subIndex: number) => {
    setBabs((prev) =>
      prev.map((b, i) =>
        i === babIndex
          ? { ...b, subbabs: b.subbabs?.filter((_, j) => j !== subIndex) }
          : b
      )
    );
  };

  /* ✅ Simpan Struktur */
  const handleSave = (data: BabCalk[]) => {
    onAddLampiranUtamaCALK(data);
    onClose();
  };

  /* 📥 Download Daftar Isi */
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      await generateDaftarIsiCALK(new Date().getFullYear(), babs, pdfDoc);
      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DaftarIsiCALK_${new Date().getFullYear()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal membuat daftar isi:", err);
      alert("Terjadi kesalahan saat membuat PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6 relative">
        {/* 🔹 Header Modal */}
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h2 className="text-xl font-bold text-blue-800">
            Struktur CALK (Catatan atas Laporan Keuangan)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 🔹 Tombol Download */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
              isDownloading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {isDownloading ? "Membuat PDF..." : "Download Daftar Isi"}
          </button>
        </div>

        {/* 🔹 Isi Modal */}
        <div className="space-y-5">
          {babs.map((bab, i) => (
            <div
              key={bab.id}
              className="border border-gray-300 rounded-lg p-5 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700 text-lg">
                  BAB {bab.bab || romanize(i + 1)}
                </h3>
                <button
                  onClick={() => deleteBab(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Judul Bab"
                  value={bab.judul}
                  onChange={(e) => updateBabField(i, "judul", e.target.value)}
                  className="col-span-2 border rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  min={1}
                  max={206}
                  value={bab.halamanMulai}
                  onChange={(e) =>
                    updateBabField(i, "halamanMulai", Number(e.target.value))
                  }
                  className="border rounded-md px-3 py-2 w-full"
                />
              </div>

              <div className="ml-4 space-y-2">
                {bab.subbabs?.map((sub, j) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2"
                  >
                    <span className="font-semibold text-gray-600 w-6">
                      {bab.bab}.{sub.subbab}
                    </span>
                    <input
                      type="text"
                      placeholder="Judul Subbab"
                      value={sub.judul}
                      onChange={(e) =>
                        updateSubbabField(i, j, "judul", e.target.value)
                      }
                      className="flex-1 border rounded-md px-2 py-1"
                    />
                    <input
                      type="number"
                      min={1}
                      max={206}
                      value={sub.halamanMulai}
                      onChange={(e) =>
                        updateSubbabField(
                          i,
                          j,
                          "halamanMulai",
                          Number(e.target.value)
                        )
                      }
                      className="w-20 border rounded-md px-2 py-1 text-right"
                    />
                    <button
                      onClick={() => deleteSubbab(i, j)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addSubbab(i)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Tambah Subbab
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addBab}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Bab
          </button>
        </div>

        {/* 🔹 Footer */}
        <div className="flex justify-end mt-6 border-t pt-4">
          <button
            onClick={() => handleSave(babs)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow"
          >
            Simpan Struktur
          </button>
        </div>
      </div>
    </div>
  );
}
