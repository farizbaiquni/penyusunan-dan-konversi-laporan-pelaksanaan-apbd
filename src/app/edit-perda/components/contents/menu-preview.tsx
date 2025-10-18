"use client";

import { useState, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { LampiranData } from "../../page";
import { DaftarIsiLampiran } from "@/app/testing-daftar-isi/page";
import { generateCover } from "@/app/_utils/generate-cover";
import { generateDaftarIsi } from "@/app/_utils/generate-daftar-isi";
import { addFooterToPages } from "@/app/_utils/add-footers";

interface PreviewProps {
  batangTubuh: File | null;
  lampirans: LampiranData[];
}

async function generateEntriesFromLampiran(
  lampirans: LampiranData[]
): Promise<{ romawi: string; judul: string; nomorHalaman: number }[]> {
  const entries: DaftarIsiLampiran[] = [];
  let currentPage = 1;

  for (const lampiran of lampirans) {
    const lampiranBytes = await lampiran.file.arrayBuffer();
    const lampiranDoc = await PDFDocument.load(lampiranBytes);
    const jumlahHalaman = lampiranDoc.getPageCount();

    entries.push({
      romawi: lampiran.romawiLampiran,
      judul: lampiran.footerText || lampiran.file.name,
      nomorHalaman: currentPage,
    });

    currentPage += jumlahHalaman;
  }

  return entries;
}

export default function Preview({ batangTubuh, lampirans }: PreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function generateFinalPDF() {
    setIsGenerating(true);

    const width = 21 * 28.35;
    const height = 33 * 28.35;
    const finalPdf = await PDFDocument.create();
    const fontBold = await finalPdf.embedFont(StandardFonts.TimesRomanBold);
    const fontRegular = await finalPdf.embedFont(StandardFonts.TimesRoman);

    // ✅ 1️⃣ Cover selalu dibuat
    await generateCover(2025, finalPdf);

    // ✅ 2️⃣ Tambahkan batang tubuh jika ada
    if (batangTubuh) {
      const batangBytes = await batangTubuh.arrayBuffer();
      const batangDoc = await PDFDocument.load(batangBytes);
      const batangPages = await finalPdf.copyPages(
        batangDoc,
        batangDoc.getPageIndices()
      );
      batangPages.forEach((p) => finalPdf.addPage(p));
    }

    // ✅ 3️⃣ Tambahkan daftar isi & lampiran jika ada
    if (lampirans.length > 0) {
      const entries = await generateEntriesFromLampiran(lampirans);
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

    // ✅ 4️⃣ Buat blob URL untuk preview
    const pdfBytes = await finalPdf.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setIsGenerating(false);
  }

  // ✅ 5️⃣ Auto preview meski tanpa batang tubuh/lampiran
  useEffect(() => {
    generateFinalPDF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batangTubuh, lampirans]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-blue-700">
        📄 Preview Dokumen
      </h1>

      <button
        onClick={generateFinalPDF}
        disabled={isGenerating}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isGenerating ? "Memproses..." : "Perbarui Preview"}
      </button>

      {previewUrl && (
        <iframe
          src={previewUrl}
          className="w-full h-[800px] border mt-4 rounded-md shadow-sm"
          title="PDF Preview"
        />
      )}
    </div>
  );
}
