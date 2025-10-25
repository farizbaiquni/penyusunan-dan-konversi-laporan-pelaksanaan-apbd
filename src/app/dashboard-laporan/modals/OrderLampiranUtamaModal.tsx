"use client";

import {
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface OrderModalProps {
  lampiran: {
    id: string;
    romawiLampiran: string;
    judulPembatasLampiran: string;
    file: File;
  }[];
  moveItem: (index: number, direction: "up" | "down") => void;
  onClose: () => void;
  onSave: () => void;
}

export default function OrderLampiranUtamaModal({
  lampiran,
  moveItem,
  onClose,
  onSave,
}: OrderModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6 flex flex-col transition-opacity duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
          <h3 className="text-xl font-semibold text-gray-800">
            Ubah Urutan Lampiran
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] border border-gray-200">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-3 border font-medium text-center">Urut</th>
                <th className="p-3 border font-medium text-center">Romawi</th>
                <th className="p-3 border font-medium text-left">Judul</th>
                <th className="p-3 border font-medium text-left">File</th>
                <th className="p-3 border font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lampiran.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition cursor-default"
                >
                  <td className="text-center border">{index + 1}</td>
                  <td className="text-center border font-semibold text-blue-600">
                    {item.romawiLampiran}
                  </td>
                  <td className="border px-3">{item.judulPembatasLampiran}</td>
                  <td className="border px-3 text-gray-500">
                    {item.file.name}
                  </td>
                  <td className="border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ArrowUpIcon className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === lampiran.length - 1}
                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ArrowDownIcon className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Tutup
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition font-medium"
          >
            Simpan Urutan
          </button>
        </div>
      </div>
    </div>
  );
}
