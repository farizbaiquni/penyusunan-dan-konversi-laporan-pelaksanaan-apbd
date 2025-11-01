"use client";

import { v4 as uuidv4 } from "uuid";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import UploadLampiran from "../UploadLampiran";
import {
  JenisLaporan,
  LampiranDataPendukung,
  MenuOption,
} from "@/app/_types/types";
import { generateTextJenisLaporan } from "@/app/_utils/jenis-laporan";
import { addLampiranPendukungFirestore } from "@/app/_lib/_queries/lampiran-pendukung";

interface TambahLampiranProps {
  dokumenId: string;
  tahun: number;
  jenisLaporan: JenisLaporan;
  setActiveMenu: (menu: MenuOption) => void;
  onAddLampiran: (data: LampiranDataPendukung) => void;
  urutanLampiran: number;
}

export default function MenuTambahLampiranPendukung({
  dokumenId,
  tahun,
  jenisLaporan,
  setActiveMenu,
  onAddLampiran,
  urutanLampiran,
}: TambahLampiranProps) {
  const [judul, setJudul] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileDataRef = useRef<ArrayBuffer | null>(null);

  // Generate PDF preview dengan footer
  const handleAddFooter = async (existingPdfBytes: ArrayBuffer) => {
    try {
      // setIsGenerating(true);
      // const blobUrl = await addFooterLampiranCALK(
      //     footer.width,
      //     footer.x,
      //     footer.y,
      //     footer.height,
      //     footer.fontSize,
      //     existingPdfBytes,
      //     halamanTerakhirCALK
      //   );
      const blob = new Blob([existingPdfBytes], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error("An error occurred:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileLoad = async (arrayBuffer: ArrayBuffer) => {
    fileDataRef.current = arrayBuffer;
    await handleAddFooter(arrayBuffer);
  };

  const regeneratePdf = async () => {
    if (!fileDataRef.current) return alert("Silakan unggah file PDF dulu!");
    await handleAddFooter(fileDataRef.current);
  };

  const handleSimpan = async () => {
    if (!file || !fileDataRef.current)
      return alert("Unggah file PDF terlebih dahulu!");

    try {
      const namaFile = uuidv4();
      const pdfDoc = await PDFDocument.load(fileDataRef.current);
      const jumlahHalaman = pdfDoc.getPageCount();

      const newLampiran: LampiranDataPendukung = {
        id: namaFile,
        namaFileAsli: file.name,
        namaFileDiStorageLokal: namaFile,
        urutan: urutanLampiran + 1,
        file,
        judul,
        jumlahTotalLembar: jumlahHalaman,
      };

      const { success, lampiranId } = await addLampiranPendukungFirestore(
        dokumenId,
        newLampiran,
        file.name,
        namaFile
      );

      newLampiran.id =
        lampiranId !== undefined ? lampiranId : namaFile.toString();

      if (!success) {
        alert("Gagal menyimpan lampiran pendukung.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("tahun", tahun.toString());
      formData.append("jenisLaporan", jenisLaporan);
      formData.append("namaFile", namaFile);

      const res = await fetch(
        "/api/lampiran-pendukung/add-lampiran-pendukung",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!data.success) {
        alert("Gagal menyimpan lampiran pendukung.");
        return;
      }

      onAddLampiran(newLampiran);
      alert(`Lampiran "${file.name}" berhasil ditambahkan!`);
      setActiveMenu(MenuOption.LAMPIRAN_PENDUKUNG);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan lampiran pendukung.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold text-gray-800 mb-2 ml-6 capitalize">
        Tambah Lampiran Pendukung {generateTextJenisLaporan(jenisLaporan)}
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        {/* Upload Area */}
        <UploadLampiran
          file={file}
          setFile={setFile}
          setPreviewUrl={setPreviewUrl}
          onFileLoad={handleFileLoad}
        />

        {/* Form Footer */}
        {file && (
          <div className="flex flex-col mt-5">
            <fieldset className="border p-5 border-blue-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <legend className="px-2 font-semibold">INFORMASI LAMPIRAN</legend>

              {/* Judul Pembatas */}
              <div className="col-span-5">
                <label className="font-medium mb-1 block">
                  Judul Lampiran Pendukung
                </label>
                <input
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="p-2 border rounded-sm w-full"
                />
              </div>
            </fieldset>

            {/* Tombol Aksi */}
            <div className="flex gap-x-2 flex-wrap">
              <button
                onClick={regeneratePdf}
                disabled={!fileDataRef.current || isGenerating}
                className={`px-4 py-2 rounded-md w-full sm:w-auto ${
                  fileDataRef.current
                    ? "bg-blue-700 hover:bg-blue-800 text-white"
                    : "bg-gray-500 text-white cursor-not-allowed"
                }`}
              >
                {isGenerating ? "Memproses..." : "Preview Lampiran"}
              </button>

              <button
                onClick={handleSimpan}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Simpan Lampiran
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview PDF */}
      {previewUrl && (
        <div className="w-full h-[600px] shadow-lg rounded-xl overflow-hidden border border-gray-300">
          <iframe src={previewUrl} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
