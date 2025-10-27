"use client";

import { useState } from "react";
import {
  deleteAllData,
  generateDummyDokumenLaporan,
} from "../_lib/_queries/generate-dummy-data";

export default function DataToolsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 4000);
  };

  const handleGenerate = async () => {
    if (!confirm("Yakin ingin generate dummy data (2019–2023)?")) return;
    setLoading(true);
    setMessage(null);
    try {
      await generateDummyDokumenLaporan();
      showMessage(
        "✅ Berhasil generate dummy data untuk tahun 2019–2023.",
        "success"
      );
    } catch (error) {
      console.error(error);
      showMessage("❌ Gagal generate dummy data.", "error");
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
      showMessage("🗑️ Semua data Firestore berhasil dihapus.", "success");
    } catch (error) {
      console.error(error);
      showMessage("❌ Gagal menghapus data Firestore.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-red-600 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center relative">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          🔧 Firestore Data Tools
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Gunakan tombol di bawah untuk <b>generate</b> atau <b>hapus</b> data
          dummy dari Firestore. <br />
          <span className="text-red-500 font-semibold">
            ⚠️ Hanya untuk environment pengujian!
          </span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                🚀 <span>Generate Dummy Data</span>
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r bg from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition transform hover:scale-[1.02]"
          >
            🗑️ <span>Hapus Semua Data</span>
          </button>
        </div>

        {message && (
          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 mt-6 px-5 py-3 rounded-lg text-sm shadow-lg transition-all duration-300 ${
              messageType === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center text-white z-50">
          <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Memproses permintaan...</p>
        </div>
      )}
    </main>
  );
}
