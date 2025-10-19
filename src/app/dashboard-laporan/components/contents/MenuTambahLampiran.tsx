"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { addFooter } from "@/app/_utils/add-footers";
import UploadLampiran from "../UploadLampiran";
import { LampiranData, MenuOption } from "@/app/_types/types";

interface TambahLampiranProps {
  setActiveMenu: (menu: MenuOption) => void;
  onAddLampiran: (data: Omit<LampiranData, "id">) => void;
}

export default function MenuTambahLampiran({
  setActiveMenu,
  onAddLampiran,
}: TambahLampiranProps) {
  const [romawiLampiran, setRomawiLampiran] = useState("");
  const [judulPembatasLampiran, setJudulPembatasLampiran] = useState("");
  const [footerText, setFooterText] = useState("");
  const [footer, setFooter] = useState({
    width: 91,
    x: 0,
    y: 27,
    height: 27,
    fontSize: 8,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileDataRef = useRef<ArrayBuffer | null>(null);

  // Generate PDF preview dengan footer
  const handleAddFooter = async (existingPdfBytes: ArrayBuffer) => {
    try {
      setIsGenerating(true);
      const blobUrl = await addFooter(
        footer.width,
        footer.x,
        footer.y,
        footer.height,
        footer.fontSize,
        romawiLampiran,
        footerText,
        existingPdfBytes
      );
      setPreviewUrl(blobUrl);
    } catch (err) {
      console.error("Gagal generate preview:", err);
      alert("Gagal generate preview PDF.");
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

  const downloadPdf = () => {
    if (!previewUrl) return alert("Silakan generate preview dulu!");
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = "pdf_with_footer.pdf";
    link.click();
    URL.revokeObjectURL(previewUrl); // cleanup
  };

  const handleSimpan = async () => {
    if (!romawiLampiran) return alert("Isi romawi lampiran!");
    if (!footerText) return alert("Isi footer text!");
    if (!file || !fileDataRef.current)
      return alert("Unggah file PDF terlebih dahulu!");

    try {
      const pdfDoc = await PDFDocument.load(fileDataRef.current);
      const jumlahHalaman = pdfDoc.getPageCount();

      onAddLampiran({
        urutan: 1, // bisa disesuaikan dari parent
        file,
        romawiLampiran,
        judulPembatasLampiran,
        footerText,
        footerWidth: footer.width,
        footerX: footer.x,
        footerY: footer.y,
        fontSize: footer.fontSize,
        footerHeight: footer.height,
        jumlahHalaman,
      });

      alert(`Lampiran "${file.name}" berhasil ditambahkan!`);
      setActiveMenu(MenuOption.LAMPIRAN_UTAMA);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan lampiran.");
    }
  };

  const footerSettings = [
    { label: "Lebar Footer (%)", key: "width" },
    { label: "Offset X", key: "x" },
    { label: "Posisi Y", key: "y" },
    { label: "Font Size", key: "fontSize" },
    { label: "Tinggi Footer", key: "height" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold text-gray-800 mb-2 ml-6">
        Tambah Lampiran Perda
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

              {/* Romawi Lampiran */}
              <div className="col-span-5">
                <label className="font-medium mb-1 block">
                  Romawi Lampiran
                </label>
                <input
                  value={romawiLampiran}
                  onChange={(e) => setRomawiLampiran(e.target.value)}
                  className="p-2 border rounded-sm w-full"
                />
              </div>

              {/* Judul Pembatas */}
              <div className="col-span-5">
                <label className="font-medium mb-1 block">
                  Judul Pembatas Lampiran
                </label>
                <input
                  value={judulPembatasLampiran}
                  onChange={(e) => setJudulPembatasLampiran(e.target.value)}
                  className="p-2 border rounded-sm w-full"
                />
              </div>

              {/* Footer Text */}
              <div className="col-span-5">
                <label className="font-medium mb-1 block">
                  Keterangan Footer Halaman
                </label>
                <input
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="p-2 border rounded-sm w-full"
                />
              </div>

              {/* Footer Settings */}
              {footerSettings.map(({ label, key }, idx) => (
                <div key={idx} className="flex flex-col">
                  <label className="font-medium mb-1">{label}</label>
                  <input
                    type="number"
                    value={footer[key as keyof typeof footer]}
                    onChange={(e) =>
                      setFooter((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="p-2 border rounded-sm"
                  />
                </div>
              ))}
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
                onClick={downloadPdf}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Download PDF
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
