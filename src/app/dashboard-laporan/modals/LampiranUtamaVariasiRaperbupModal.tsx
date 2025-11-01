/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BabCalk, SubbabCalk } from "@/app/_types/types";

interface LampiranUtamaVariasiRaperbupModalProps {
  onClose: () => void;
  initialData?: BabCalk[];
  onAddLampiranUtamaCALK: (data: BabCalk[]) => void;
}

/* ====================== MODAL ====================== */
export default function LampiranUtamaVariasiRaperbupModal({
  onClose,
  initialData = [],
  onAddLampiranUtamaCALK,
}: LampiranUtamaVariasiRaperbupModalProps) {
  const [babs, setBabs] = useState<BabCalk[]>([]);

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

  /* 🧩 Set default Bab I ketika modal pertama kali dibuka */
  useEffect(() => {
    if (initialData.length > 0) {
      setBabs(initialData);
    } else {
      const babI: BabCalk = {
        id: crypto.randomUUID(),
        bab: romanize(1),
        judul: "",
        halamanMulai: 1,
        subbabs: [],
      };
      setBabs([babI]);
    }
  }, [initialData]);

  const generateLampiranUtamaunutk = () => {};

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-5xl max-h-[75vh] overflow-y-auto p-5 relative">
        {/* 🔹 Header Modal */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Penomoran Halaman Daftar Isi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 🔹 Isi Modal */}
        <div className="space-y-4">
          {babs.map((bab, i) => (
            <div
              key={bab.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-700">BAB</h3>
              </div>

              <div className="grid sm:grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Judul BAB"
                  value={bab.judul}
                  onChange={(e) => updateBabField(i, "judul", e.target.value)}
                  className="col-span-2 border rounded-md px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  min={1}
                  max={206}
                  value={bab.halamanMulai}
                  onChange={(e) =>
                    updateBabField(i, "halamanMulai", Number(e.target.value))
                  }
                  className="border rounded-md px-2 py-1 text-sm w-full"
                />
              </div>

              <div className="ml-4 space-y-1">
                {bab.subbabs?.map((sub, j) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-1 text-sm"
                  >
                    <input
                      type="text"
                      placeholder="Nama OPD"
                      value={sub.judul}
                      onChange={(e) =>
                        updateSubbabField(i, j, "judul", e.target.value)
                      }
                      className="flex-1 border rounded-md px-1 py-0.5 text-sm"
                    />
                    <input
                      type="number"
                      min={1}
                      max={100000}
                      value={sub.halamanMulai}
                      onChange={(e) =>
                        updateSubbabField(
                          i,
                          j,
                          "halamanMulai",
                          Number(e.target.value)
                        )
                      }
                      className="w-16 border rounded-md px-1 py-0.5 text-right text-sm"
                    />
                    <button
                      onClick={() => deleteSubbab(i, j)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addSubbab(i)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Tambah OPD
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 🔹 Footer */}
        <div className="flex justify-end mt-4 border-t border-gray-200 pt-3">
          <button
            onClick={() => handleSave(babs)}
            className="bg-green-600 hover:bg-green-700 font-bold text-white px-4 py-1.5 rounded-md shadow-sm text-sm"
          >
            Simpan Struktur
          </button>
        </div>
      </div>
    </div>
  );
}
