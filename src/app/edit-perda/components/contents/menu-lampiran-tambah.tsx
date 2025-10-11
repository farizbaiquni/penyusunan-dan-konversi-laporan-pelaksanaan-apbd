"use client";

import { useState, useRef, ChangeEvent } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { LampiranData } from "../../page";

interface TambahLampiranProps {
  setActiveMenu: (menu: string) => void;
  onAddLampiran: (data: Omit<LampiranData, "id">) => void;
}

export default function TambahLampiran({
  setActiveMenu,
  onAddLampiran,
}: TambahLampiranProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [romawiLampiran, setRomawiLampiran] = useState<string>("");
  const [footerWidth, setFooterWidth] = useState<number>(80);
  const [footerX, setFooterX] = useState<number>(0);
  const [footerY, setFooterY] = useState<number>(20);
  const [fontSize, setFontSize] = useState<number>(9);
  const [footerHeight, setFooterHeight] = useState<number>(30);
  const [footerText, setFooterText] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDataRef = useRef<ArrayBuffer | null>(null); // menyimpan file agar bisa regenerate footer

  // Ketika file dipilih
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    const finalFooterText =
      `PERDA ${romawiLampiran}. ${footerText}`.toUpperCase();

    const arrayBuffer = await file.arrayBuffer();
    fileDataRef.current = arrayBuffer; // simpan file agar bisa regenerate
    if (inputRef.current) inputRef.current.value = "";
    await addFooter(arrayBuffer, finalFooterText);
  };

  const handleSimpan = () => {
    if (romawiLampiran.length === 0)
      return alert("Silakan isi romawi lampiran!");
    if (footerText.length === 0) return alert("Silakan isi footer text!");
    if (!file)
      return alert("Silakan unggah file lampiran PDF terlebih dahulu!");
    onAddLampiran({
      file,
      romawiLampiran,
      footerWidth,
      footerX,
      footerY,
      fontSize,
      footerHeight,
      footerText,
    });

    alert(`Lampiran "${file.name}" berhasil ditambahkan!`);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setActiveMenu("Lampiran");
  };

  // Fungsi untuk menambahkan footer ke PDF
  const addFooter = async (existingPdfBytes: ArrayBuffer, text: string) => {
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    pages.forEach((page, index) => {
      const { width } = page.getSize();
      const boxWidth = (width * footerWidth) / 100;
      const xPos = (width - boxWidth) / 2 + footerX;
      const yPos = footerY;

      // Kotak footer
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: boxWidth,
        height: footerHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Teks footer kiri (judul/keterangan)
      page.drawText(text, {
        x: xPos + 10,
        y: yPos + footerHeight / 2 - fontSize / 2,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
        maxWidth: boxWidth - 100,
      });

      // Nomor halaman di kanan
      const pageNumber = `Halaman ${index + 1}`;
      const textWidth = helveticaFont.widthOfTextAtSize(pageNumber, fontSize);
      page.drawText(pageNumber, {
        x: xPos + boxWidth - textWidth - 10,
        y: yPos + footerHeight / 2 - fontSize / 2,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();

    const safeBytes = Uint8Array.from(pdfBytes);
    const blob = new Blob([safeBytes.buffer], { type: "application/pdf" });

    const blobUrl = URL.createObjectURL(blob);
    setPreviewUrl(blobUrl);
  };

  // Fungsi regenerate PDF
  const regeneratePdf = async () => {
    if (!fileDataRef.current) {
      alert("Silakan unggah file PDF terlebih dahulu!");
      return;
    }
    const finalFooterText =
      `PERDA ${romawiLampiran}. ${footerText}`.toUpperCase();
    await addFooter(fileDataRef.current, finalFooterText);
  };

  // Fungsi download PDF
  const downloadPdf = () => {
    if (!previewUrl) {
      alert("Silakan generate preview dulu!");
      return;
    }
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = "pdf_with_footer_box.pdf";
    link.click();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-xs">
      <h1 className="text-xl font-bold text-gray-800 mb-2 ml-6">
        Tambah Lampiran Perda
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          {/* Romawi Lampiran */}
          <div className="flex flex-col col-span-1 sm:col-span-2 lg:col-span-5">
            <label htmlFor="romawiLampiran" className="font-medium mb-1">
              Romawi Lampiran
            </label>
            <input
              id="romawiLampiran"
              type="text"
              value={romawiLampiran}
              onChange={(e) => setRomawiLampiran(e.target.value)}
              className="p-2 border rounded-md w-full"
            />
          </div>

          {/* Keterangan Footer */}
          <div className="flex flex-col col-span-1 sm:col-span-2 lg:col-span-5">
            <label htmlFor="footerText" className="font-medium mb-1">
              Keterangan Footer Halaman
            </label>
            <input
              id="footerText"
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="p-2 border rounded-md w-full"
            />
          </div>

          {/* Lebar Footer */}
          <div className="flex flex-col">
            <label htmlFor="footerWidth" className="font-medium mb-1">
              Lebar Footer (%)
            </label>
            <input
              id="footerWidth"
              type="number"
              value={footerWidth}
              min={10}
              max={100}
              onChange={(e) => setFooterWidth(Number(e.target.value))}
              className="p-2 border rounded-md"
            />
          </div>

          {/* Offset X */}
          <div className="flex flex-col">
            <label htmlFor="footerX" className="font-medium mb-1">
              Offset X
            </label>
            <input
              id="footerX"
              type="number"
              value={footerX}
              onChange={(e) => setFooterX(Number(e.target.value))}
              className="p-2 border rounded-md"
            />
          </div>

          {/* Posisi Y */}
          <div className="flex flex-col">
            <label htmlFor="footerY" className="font-medium mb-1">
              Posisi Y
            </label>
            <input
              id="footerY"
              type="number"
              value={footerY}
              onChange={(e) => setFooterY(Number(e.target.value))}
              className="p-2 border rounded-md"
            />
          </div>

          {/* Font Size */}
          <div className="flex flex-col">
            <label htmlFor="fontSize" className="font-medium mb-1">
              Font Size
            </label>
            <input
              id="fontSize"
              type="number"
              value={fontSize}
              min={5}
              max={30}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="p-2 border rounded-md"
            />
          </div>

          {/* Tinggi Footer */}
          <div className="flex flex-col">
            <label htmlFor="footerHeight" className="font-medium mb-1">
              Tinggi Footer
            </label>
            <input
              id="footerHeight"
              type="number"
              value={footerHeight}
              min={10}
              max={100}
              onChange={(e) => setFooterHeight(Number(e.target.value))}
              className="p-2 border rounded-md"
            />
          </div>
        </div>

        {/* File Input & Tombol Aksi */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="p-2 border rounded-md w-full sm:w-auto"
          />

          <button
            onClick={regeneratePdf}
            disabled={!fileDataRef.current}
            className={`px-4 py-2 rounded-md w-full sm:w-auto ${
              fileDataRef.current
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            🔁 Regenerate PDF
          </button>

          <button
            onClick={downloadPdf}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full sm:w-auto"
          >
            ⬇️ Download PDF
          </button>

          <button
            onClick={handleSimpan}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full sm:w-auto"
          >
            Simpan Lampiran
          </button>
        </div>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="w-full h-[600px] shadow-lg rounded-xl overflow-hidden border border-gray-300">
          <iframe src={previewUrl} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
