"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { LampiranData, MenuOption } from "../../page";
import { XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { addFooter } from "@/app/_utils/add-footers";

interface TambahLampiranProps {
  setActiveMenu: (menu: MenuOption) => void;
  onAddLampiran: (data: Omit<LampiranData, "id">) => void;
}

// Fungsi penambahan footer (kamu sudah punya versi ini)
async function addFooterToPages(
  pdfDoc: PDFDocument,
  startPageNumber: number,
  footerWidth: number,
  footerX: number,
  footerY: number,
  footerHeight: number,
  fontSize: number,
  romawiLampiran: string,
  footerText: string
): Promise<number> {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  let currentPageNumber = startPageNumber;

  pages.forEach((page) => {
    const { width } = page.getSize();
    const boxWidth = (width * footerWidth) / 100;
    const xPos = (width - boxWidth) / 2 + footerX;
    const yPos = footerY;
    const text = `PERDA ${romawiLampiran}. ${footerText}`.toUpperCase();

    // Kotak footer
    page.drawRectangle({
      x: xPos,
      y: yPos,
      width: boxWidth,
      height: footerHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Teks footer kiri
    page.drawText(text, {
      x: xPos + 10,
      y: yPos + footerHeight / 2 - fontSize / 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
      maxWidth: boxWidth - 100,
    });

    // Nomor halaman kanan
    const pageNumberText = `Halaman ${currentPageNumber}`;
    const textWidth = helveticaFont.widthOfTextAtSize(pageNumberText, fontSize);
    page.drawText(pageNumberText, {
      x: xPos + boxWidth - textWidth - 10,
      y: yPos + footerHeight / 2 - fontSize / 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    currentPageNumber++;
  });

  return currentPageNumber; // untuk melanjutkan nomor ke lampiran berikutnya
}

// Fungsi utama gabung dokumen dan beri footer hanya di lampiran
export async function generateDokumenFinal(
  batangTubuh: File, // PDF batang tubuh (tidak diberi footer)
  pembatasList: File[], // PDF pembatas tiap lampiran (tanpa footer)
  lampirans: LampiranData[]
): Promise<string> {
  const finalPdf = await PDFDocument.create();
  let currentPageNumber = 1;

  // 1️⃣ Tambah batang tubuh (tanpa footer)
  const batangBytes = await batangTubuh.arrayBuffer();
  const batangPdf = await PDFDocument.load(batangBytes);
  const batangPages = await finalPdf.copyPages(
    batangPdf,
    batangPdf.getPageIndices()
  );
  batangPages.forEach((p) => finalPdf.addPage(p));

  // 2️⃣ Loop setiap lampiran
  for (let i = 0; i < lampirans.length; i++) {
    const lampiran = lampirans[i];
    const pembatasFile = pembatasList[i];

    // Tambah pembatas (tanpa footer)
    const pembatasBytes = await pembatasFile.arrayBuffer();
    const pembatasPdf = await PDFDocument.load(pembatasBytes);
    const pembatasPages = await finalPdf.copyPages(
      pembatasPdf,
      pembatasPdf.getPageIndices()
    );
    pembatasPages.forEach((p) => finalPdf.addPage(p));

    // Tambah lampiran (dengan footer)
    const lampiranBytes = await lampiran.file.arrayBuffer();
    const lampiranPdf = await PDFDocument.load(lampiranBytes);

    // Tambahkan footer ke setiap halaman lampiran
    await addFooterToPages(
      lampiranPdf,
      currentPageNumber,
      lampiran.footerWidth,
      lampiran.footerX,
      lampiran.footerY,
      lampiran.footerHeight,
      lampiran.fontSize,
      lampiran.romawiLampiran,
      lampiran.footerText
    );

    const lampiranPages = await finalPdf.copyPages(
      lampiranPdf,
      lampiranPdf.getPageIndices()
    );
    lampiranPages.forEach((p) => finalPdf.addPage(p));

    // Update nomor halaman untuk lampiran berikutnya
    currentPageNumber += lampiranPages.length;
  }

  // 3️⃣ Simpan PDF final
  const pdfBytes = await finalPdf.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);

  return url;
}

export default function TambahLampiran({
  setActiveMenu,
  onAddLampiran,
}: TambahLampiranProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [romawiLampiran, setRomawiLampiran] = useState<string>("");
  const [judulPembatasLampiran, setJudulPembatasLampiran] = useState("");
  const [footerText, setFooterText] = useState<string>("");
  const [footerWidth, setFooterWidth] = useState<number>(91);
  const [footerX, setFooterX] = useState<number>(0);
  const [footerY, setFooterY] = useState<number>(27);
  const [fontSize, setFontSize] = useState<number>(8);
  const [footerHeight, setFooterHeight] = useState<number>(27);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDataRef = useRef<ArrayBuffer | null>(null); // menyimpan file agar bisa regenerate footer

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (selectedFile?: File) => {
    if (!selectedFile) {
      alert("⚠️ Silakan pilih file PDF terlebih dahulu.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      alert("❌ Hanya file PDF yang diperbolehkan.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // Ketika file dipilih
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    const arrayBuffer = await file.arrayBuffer();
    fileDataRef.current = arrayBuffer;
    if (inputRef.current) inputRef.current.value = "";
    await handleAddFooter(
      footerWidth,
      footerX,
      footerY,
      footerHeight,
      fontSize,
      romawiLampiran,
      footerText,
      arrayBuffer
    );
  };

  const handleSimpan = async () => {
    if (romawiLampiran.length === 0)
      return alert("Silakan isi romawi lampiran!");
    if (footerText.length === 0) return alert("Silakan isi footer text!");
    if (!file)
      return alert("Silakan unggah file lampiran PDF terlebih dahulu!");

    // Hitung jumlah halaman PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const jumlahHalaman = pdfDoc.getPageCount();

    // Urutan lampiran
    const urutan = 1; // bisa disesuaikan dengan lampirans.length + 1 di parent

    onAddLampiran({
      urutan,
      file,
      romawiLampiran,
      judulPembatasLampiran,
      footerText,
      footerWidth,
      footerX,
      footerY,
      fontSize,
      footerHeight,
      jumlahHalaman, // baru
    });

    alert(`Lampiran "${file.name}" berhasil ditambahkan!`);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setActiveMenu(MenuOption.LAMPIRAN_UTAMA);
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  // Fungsi untuk menambahkan footer ke PDF
  const handleAddFooter = async (
    footerWidth: number,
    footerX: number,
    footerY: number,
    footerHeight: number,
    fontSize: number,
    romawiLampiran: string,
    footerText: string,
    existingPdfBytes: ArrayBuffer
  ) => {
    const blobUrl = await addFooter(
      footerWidth,
      footerX,
      footerY,
      footerHeight,
      fontSize,
      romawiLampiran,
      footerText,
      existingPdfBytes
    );
    setPreviewUrl(blobUrl);
  };

  // Fungsi regenerate PDF
  const regeneratePdf = async () => {
    if (!fileDataRef.current) {
      alert("Silakan unggah file PDF terlebih dahulu!");
      return;
    }
    await handleAddFooter(
      footerWidth,
      footerX,
      footerY,
      footerHeight,
      fontSize,
      romawiLampiran,
      footerText,
      fileDataRef.current
    );
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold text-gray-800 mb-2 ml-6">
        Tambah Lampiran Perda
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        {!file ? (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="fileInput"
              className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg transition
                ${
                  isDragging
                    ? "border-blue-600 bg-blue-50"
                    : "border-blue-300 bg-white"
                }
              `}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-4 pb-6 pointer-events-none">
                <svg
                  className="w-10 h-10 mb-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5
                       5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4
                       4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-gray-500">
                  <span className="font-semibold">Klik untuk unggah</span> atau
                  tarik dan lepaskan
                </p>
                <p className="text-sm text-gray-500">Format File PDF</p>
              </div>
              <input
                id="fileInput"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="flex py-3 flex-col rounded-lg items-center text-center border border-gray-800">
            <DocumentTextIcon className="w-12 h-12 text-green-500 mb-2" />
            <div className="flex gap-x-5 items-center">
              <p className="text-gray-700 font-semibold">{file.name}</p>
              <XMarkIcon
                onClick={handleClear}
                className="w-5 h-5 mr-1 font-extrabold text-white bg-red-500 rounded-full cursor-pointer"
              />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {file ? (
          <div className="flex flex-col">
            <fieldset className="border p-5 border-blue-800 grid grid-cols-1 mt-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <legend className="px-2 font-semibold">INFORMASI LAMPIRAN</legend>
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
                  className="p-2 border rounded-sm w-full"
                />
              </div>

              {/* Judul Pembatas Lampiran */}
              <div className="flex flex-col col-span-1 sm:col-span-2 lg:col-span-5">
                <label htmlFor="pembatasLampiran" className="font-medium mb-1">
                  Judul Pembatas Lampiran
                </label>
                <input
                  id="pembatasLampiran"
                  type="text"
                  value={judulPembatasLampiran}
                  onChange={(e) => setJudulPembatasLampiran(e.target.value)}
                  className="p-2 border rounded-sm w-full"
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
                  className="p-2 border rounded-sm w-full"
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
                  className="p-2 border rounded-sm"
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
                  className="p-2 border rounded-sm"
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
                  className="p-2 border rounded-sm"
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
                  className="p-2 border rounded-sm"
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
                  className="p-2 border rounded-sm"
                />
              </div>
            </fieldset>
            <div className="flex gap-x-2">
              <button
                onClick={regeneratePdf}
                disabled={!fileDataRef.current}
                className={`px-4 py-2 rounded-md w-full sm:w-auto ${
                  fileDataRef.current
                    ? "bg-blue-700 cursor-pointer hover:bg-blue-800 text-white"
                    : "bg-gray-500 text-white cursor-not-allowed"
                }`}
              >
                Preview Lampiran
              </button>

              <button
                onClick={downloadPdf}
                className="bg-blue-700 cursor-pointer hover:bg-blue-800 text-white px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Download PDF
              </button>

              <button
                onClick={handleSimpan}
                className="bg-blue-700 cursor-pointer hover:bg-blue-800 text-white px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Simpan Lampiran
              </button>
            </div>
          </div>
        ) : (
          <div></div>
        )}
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
