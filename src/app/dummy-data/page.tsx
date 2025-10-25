"use client";

import { useState } from "react";
import {
  deleteAllData,
  generateDummyDokumenLaporan,
} from "../_lib/_queries/generate-dummy-data";

export default function DataToolsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!confirm("Yakin ingin generate dummy data (2019–2023)?")) return;
    setLoading(true);
    setMessage(null);
    try {
      await generateDummyDokumenLaporan();
      setMessage("✅ Berhasil generate dummy data untuk tahun 2019–2023.");
    } catch (error) {
      console.error(error);
      setMessage("❌ Gagal generate dummy data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "⚠️ PERINGATAN: Ini akan menghapus SEMUA data Firestore.\nLanjutkan?"
      )
    )
      return;
    setLoading(true);
    setMessage(null);
    try {
      await deleteAllData();
      setMessage("🗑️ Semua data Firestore berhasil dihapus.");
    } catch (error) {
      console.error(error);
      setMessage("❌ Gagal menghapus data Firestore.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-6 py-12">
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          🔧 Firestore Data Tools
        </h1>
        <p className="text-gray-600 mb-8">
          Gunakan tombol di bawah untuk generate atau menghapus data dummy dari
          Firestore. <br />
          <span className="text-red-500 font-medium">
            ⚠️ Gunakan hanya di environment pengujian.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            🚀 Generate Dummy Data
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition"
          >
            🗑️ Hapus Semua Data
          </button>
        </div>

        {message && (
          <div
            className={`mt-6 p-3 rounded-lg text-sm ${
              message.startsWith("✅") || message.startsWith("🗑️")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-semibold">
          ⏳ Memproses...
        </div>
      )}
    </main>
  );
}
