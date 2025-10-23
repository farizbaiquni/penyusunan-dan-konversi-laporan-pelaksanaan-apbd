"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { generateCoverRaperda } from "@/app/_utils/generate-cover";
import { generateDaftarIsi } from "@/app/_utils/generate-daftar-isi";
import {
  addFooterToPages,
  addFooterToPagesCALK,
} from "@/app/_utils/add-footers";
import { DaftarIsiLampiran, LampiranData } from "@/app/_types/types";

interface GenerateProps {
  batangTubuh: File | null;
  lampirans: LampiranData[];
}

export default function MenuGenerate({
  batangTubuh,
  lampirans,
}: GenerateProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);

    const width = 21 * 28.35;
    const height = 33 * 28.35;
    const finalPdf = await PDFDocument.create();
    const fontBold = await finalPdf.embedFont(StandardFonts.TimesRomanBold);
    const fontRegular = await finalPdf.embedFont(StandardFonts.TimesRoman);

    await generateCoverRaperda(2025, finalPdf);

    if (batangTubuh) {
      const batangBytes = await batangTubuh.arrayBuffer();
      const batangDoc = await PDFDocument.load(batangBytes);
      const pages = await finalPdf.copyPages(
        batangDoc,
        batangDoc.getPageIndices()
      );
      pages.forEach((p) => finalPdf.addPage(p));
    }

    if (lampirans.length > 0) {
      const entries: DaftarIsiLampiran[] = [];
      let currentPage = 1;

      for (const lampiran of lampirans) {
        const lampiranBytes = await lampiran.file.arrayBuffer();
        const lampiranDoc = await PDFDocument.load(lampiranBytes);
        const jumlahHalaman = lampiranDoc.getPageCount();

        entries.push({
          id: crypto.randomUUID(),
          romawi: lampiran.romawiLampiran,
          judul: lampiran.footerText || lampiran.file.name,
          nomorHalaman: currentPage,
          isCALK: lampiran.isCALK,
        });

        currentPage += jumlahHalaman;
      }

      generateDaftarIsi(2025, entries, finalPdf);

      let currentPageNumber = 1;
      for (const lampiran of lampirans) {
        const pembatasPage = finalPdf.addPage([width, height]);
        const { width: pageWidth } = pembatasPage.getSize();
        const centerX = pageWidth / 2;

        const drawCenteredText = (
          text: string,
          y: number,
          size = 16,
          bold = false
        ) => {
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
        };

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
        if (lampiran.isCALK) {
          currentPageNumber = await addFooterToPagesCALK(
            lampiranDoc,
            currentPageNumber,
            lampiran.footerX,
            lampiran.footerY,
            lampiran.fontSize,
            lampiran.jumlahHalaman + currentPageNumber - 1
          );
        } else {
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
        }

        const lampiranPages = await finalPdf.copyPages(
          lampiranDoc,
          lampiranDoc.getPageIndices()
        );
        lampiranPages.forEach((p) => finalPdf.addPage(p));
      }
    }

    const pdfBytes = await finalPdf.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "hasil_gabungan.pdf";
    link.click();
    URL.revokeObjectURL(url);

    setIsGenerating(false);
  }

  return (
    <div className="p-6">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="bg-blue-800 text-white px-5 py-2 rounded hover:bg-blue-900"
      >
        {isGenerating ? "Mengunduh..." : "💾 Download PDF Final"}
      </button>
    </div>
  );
}
