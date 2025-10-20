"use client";

import { useState, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { generateCoverRaperda } from "@/app/_utils/generate-cover";
import { generateDaftarIsi } from "@/app/_utils/generate-daftar-isi";
import { addFooterToPages } from "@/app/_utils/add-footers";
import { DaftarIsiLampiran, LampiranData } from "@/app/_types/types";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface PreviewProps {
  batangTubuh: File | null;
  lampirans: LampiranData[];
  onBack?: () => void; // untuk tombol kembali
}

async function generateEntriesFromLampiran(
  lampirans: LampiranData[]
): Promise<DaftarIsiLampiran[]> {
  const entries: DaftarIsiLampiran[] = [];
  let currentPage = 1;

  for (const lampiran of lampirans) {
    const lampiranBytes = await lampiran.file.arrayBuffer();
    const lampiranDoc = await PDFDocument.load(lampiranBytes);
    const jumlahHalaman = lampiranDoc.getPageCount();

    entries.push({
      id: crypto.randomUUID(),
      romawi: lampiran.romawiLampiran,
      judul: lampiran.footerText || lampiran.file.name.replace(/\.pdf$/i, ""), // 🔹 judul lebih rapi
      nomorHalaman: currentPage,
      isCALK: lampiran.isCALK,
      babs: lampiran.babs,
    });

    currentPage += jumlahHalaman;
  }

  return entries;
}

export default function MenuPreview({
  batangTubuh,
  lampirans,
  onBack,
}: PreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // fungsi utama untuk generate PDF final
  async function generateFinalPDF() {
    try {
      setIsGenerating(true);

      const width = 21 * 28.35;
      const height = 33 * 28.35;
      const finalPdf = await PDFDocument.create();
      const fontBold = await finalPdf.embedFont(StandardFonts.TimesRomanBold);
      const fontRegular = await finalPdf.embedFont(StandardFonts.TimesRoman);

      // 1️⃣ Tambahkan cover
      await generateCoverRaperda(2025, finalPdf);

      // 2️⃣ Tambahkan batang tubuh jika ada
      if (batangTubuh) {
        const batangBytes = await batangTubuh.arrayBuffer();
        const batangDoc = await PDFDocument.load(batangBytes);
        const batangPages = await finalPdf.copyPages(
          batangDoc,
          batangDoc.getPageIndices()
        );
        batangPages.forEach((p) => finalPdf.addPage(p));
      }

      // 3️⃣ Tambahkan daftar isi dan lampiran
      if (lampirans.length > 0) {
        const entries: DaftarIsiLampiran[] = await generateEntriesFromLampiran(
          lampirans
        );
        generateDaftarIsi(2025, entries, finalPdf);

        let currentPageNumber = 1;
        for (const lampiran of lampirans) {
          const pembatasPage = finalPdf.addPage([width, height]);
          const { width: pageWidth } = pembatasPage.getSize();
          const centerX = pageWidth / 2;

          function drawCenteredText(
            text: string,
            y: number,
            size = 16,
            bold = false
          ) {
            const textWidth = (bold ? fontBold : fontRegular).widthOfTextAtSize(
              text,
              size
            );
            pembatasPage.drawText(text, {
              x: centerX - textWidth / 2,
              y,
              size,
              font: bold ? fontBold : fontRegular,
              color: rgb(0, 0, 0),
            });
          }

          let currentY = height - 90;
          drawCenteredText(`LAMPIRAN ${lampiran.romawiLampiran}`, currentY, 15);
          currentY -= 50;
          drawCenteredText(
            "RANCANGAN PERATURAN DAERAH KABUPATEN KENDAL",
            currentY,
            15
          );
          currentY -= 20;
          drawCenteredText("NOMOR 1 TAHUN 2025", currentY, 15);
          currentY -= 120;
          drawCenteredText("RINGKASAN LAPORAN REALISASI", currentY, 22, true);
          currentY -= 30;
          drawCenteredText("ANGGARAN MENURUT URUSAN", currentY, 22, true);
          currentY -= 30;
          drawCenteredText("PEMERINTAHAN DAERAH DAN", currentY, 22, true);
          currentY -= 30;
          drawCenteredText("ORGANISASI", currentY, 22, true);
          currentY = 60;
          drawCenteredText(`TAHUN ANGGARAN ${2025}`, currentY, 16);

          const lampiranBytes = await lampiran.file.arrayBuffer();
          const lampiranDoc = await PDFDocument.load(lampiranBytes);
          currentPageNumber = await addFooterToPages(
            lampiranDoc,
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
            lampiranDoc,
            lampiranDoc.getPageIndices()
          );
          lampiranPages.forEach((p) => finalPdf.addPage(p));
        }
      }

      // 4️⃣ Simpan hasil PDF ke blob URL
      const pdfBytes = await finalPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      // hapus URL lama biar tidak numpuk
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Terjadi kesalahan saat membuat preview PDF!");
    } finally {
      setIsGenerating(false);
    }
  }

  // Auto generate saat komponen di-load
  useEffect(() => {
    generateFinalPDF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batangTubuh, lampirans]);

  // bersihkan URL saat komponen unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header dengan tombol kembali */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
          📄 Preview Dokumen
        </h1>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Kembali</span>
          </button>
        )}
      </div>

      {/* Tombol Generate */}
      <button
        onClick={generateFinalPDF}
        disabled={isGenerating}
        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition text-white ${
          isGenerating
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Memproses...</span>
          </>
        ) : (
          <>
            🔄 <span>Perbarui Preview</span>
          </>
        )}
      </button>

      {/* Preview PDF */}
      {previewUrl ? (
        <iframe
          src={previewUrl}
          className="w-full h-[800px] border rounded-md shadow-sm"
          title="PDF Preview"
        />
      ) : (
        <div className="text-center text-gray-500 py-20 border border-dashed rounded-lg">
          Belum ada dokumen untuk ditampilkan.
        </div>
      )}
    </div>
  );
}
