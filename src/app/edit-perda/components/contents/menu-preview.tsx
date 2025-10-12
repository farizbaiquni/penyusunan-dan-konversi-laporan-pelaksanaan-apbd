"use client";

import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { LampiranData } from "../../page";

interface PreviewProps {
  batangTubuh: File | null;
  lampirans: LampiranData[];
}

/**
 * Menambahkan footer halaman hanya pada lampiran.
 */
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
  let currentPage = startPageNumber;

  for (const page of pages) {
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
    });

    // Nomor halaman kanan
    const pageNumberText = `Halaman ${currentPage}`;
    const textWidth = helveticaFont.widthOfTextAtSize(pageNumberText, fontSize);
    page.drawText(pageNumberText, {
      x: xPos + boxWidth - textWidth - 10,
      y: yPos + footerHeight / 2 - fontSize / 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    currentPage++;
  }

  return currentPage;
}

export default function Preview({ batangTubuh, lampirans }: PreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function generateFinalPDF(previewMode: boolean) {
    if (!batangTubuh) return alert("Upload batang tubuh terlebih dahulu!");
    if (lampirans.length === 0)
      return alert("Tambahkan minimal satu lampiran!");

    setIsGenerating(true);

    const width = 21 * 28.35; // 21 cm
    const height = 33 * 28.35; // 33 cm
    const finalPdf = await PDFDocument.create();
    const fontBold = await finalPdf.embedFont(StandardFonts.TimesRomanBold);
    const fontRegular = await finalPdf.embedFont(StandardFonts.TimesRoman);

    // =========================
    // 1️⃣ COVER PAGE
    // =========================
    const coverPage = finalPdf.addPage([width, height]);
    coverPage.drawText("DOKUMEN PERDA", {
      x: 200,
      y: 500,
      size: 24,
      font: fontBold,
      color: rgb(0, 0.4, 0.8),
    });

    // =========================
    // 2️⃣ BATANG TUBUH (tanpa footer)
    // =========================
    const batangBytes = await batangTubuh.arrayBuffer();
    const batangDoc = await PDFDocument.load(batangBytes);
    const batangPages = await finalPdf.copyPages(
      batangDoc,
      batangDoc.getPageIndices()
    );
    batangPages.forEach((p) => finalPdf.addPage(p));

    // =========================
    // 3️⃣ LAMPIRAN DENGAN PEMBATAS + FOOTER
    // =========================
    let currentPageNumber = 1; // penomoran lampiran mulai dari 1

    for (const lampiran of lampirans) {
      // --- 3a. PEMBATAS LAMPIRAN (tanpa footer)
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

      // --- SUSUNAN TEKS SESUAI FORMAT CONTOH ---
      let currentY = height - 90;
      drawCenteredText(
        `LAMPIRAN ${lampiran.romawiLampiran}`,
        currentY,
        15,
        false
      );

      currentY -= 50;
      drawCenteredText(
        "RANCANGAN PERATURAN DAERAH KABUPATEN KENDAL",
        currentY,
        15,
        false
      );

      currentY -= 20;
      drawCenteredText("NOMOR 1 TAHUN 2025", currentY, 15, false);

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

      // --- 3b. LAMPIRAN PDF (dengan footer halaman)
      const lampiranBytes = await lampiran.file.arrayBuffer();
      const lampiranDoc = await PDFDocument.load(lampiranBytes);

      // Tambahkan footer ke halaman lampiran
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

      // Gabungkan ke dokumen utama
      const lampiranPages = await finalPdf.copyPages(
        lampiranDoc,
        lampiranDoc.getPageIndices()
      );
      lampiranPages.forEach((p) => finalPdf.addPage(p));
    }

    // =========================
    // 4️⃣ EXPORT PDF
    // =========================
    const pdfBytes = await finalPdf.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);

    if (previewMode) {
      setPreviewUrl(url);
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = "hasil_gabungan.pdf";
      link.click();
      URL.revokeObjectURL(url);
    }

    setIsGenerating(false);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">
        📘 PDF Compiler Otomatis + Footer
      </h1>

      <div className="flex gap-x-3">
        <button
          onClick={() => generateFinalPDF(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Preview
        </button>

        <button
          onClick={() => generateFinalPDF(false)}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isGenerating ? "Sedang memproses..." : "Generate PDF Utuh"}
        </button>
      </div>

      {previewUrl && (
        <iframe
          src={previewUrl}
          className="w-full h-[800px] border mt-4"
          title="PDF Preview"
        />
      )}
    </div>
  );
}
