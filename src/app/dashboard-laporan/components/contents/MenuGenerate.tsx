"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  generateCoverRaperbup,
  generateCoverRaperda,
} from "@/app/_utils/generate-cover";
import { generateDaftarIsi } from "@/app/_utils/generate-daftar-isi";
import {
  addFooterToPages,
  addFooterToPagesCALK,
} from "@/app/_utils/add-footers";
import {
  DaftarIsiLampiran,
  JenisLaporan,
  LampiranDataUtama,
} from "@/app/_types/types";

interface GenerateProps {
  tahun: number;
  jenisLaporan: JenisLaporan;
  batangTubuh: File | null;
  lampirans: LampiranDataUtama[];
}

export default function MenuGenerate({
  tahun,
  jenisLaporan,
  batangTubuh,
  lampirans,
}: GenerateProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    try {
      setIsGenerating(true);

      const width = 21 * 28.35;
      const height = 33 * 28.35;
      const finalPdf = await PDFDocument.create();
      const fontBold = await finalPdf.embedFont(StandardFonts.TimesRomanBold);
      const fontRegular = await finalPdf.embedFont(StandardFonts.TimesRoman);

      // === 1️⃣ Tambahkan cover ===
      if (jenisLaporan === JenisLaporan.RAPERDA) {
        await generateCoverRaperda(tahun, finalPdf);
      } else if (jenisLaporan === JenisLaporan.RAPERBUP) {
        await generateCoverRaperbup(tahun, finalPdf);
      }

      // === 2️⃣ Tambahkan batang tubuh jika ada ===
      if (batangTubuh) {
        const batangBytes = await batangTubuh.arrayBuffer();
        const batangDoc = await PDFDocument.load(batangBytes);
        const pages = await finalPdf.copyPages(
          batangDoc,
          batangDoc.getPageIndices()
        );
        pages.forEach((p) => finalPdf.addPage(p));
      }

      // === 3️⃣ Tambahkan daftar isi dan lampiran ===
      if (lampirans.length > 0) {
        const entries: DaftarIsiLampiran[] = [];
        let currentPage = 1;

        // Generate entries untuk daftar isi
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

        generateDaftarIsi(jenisLaporan, tahun, entries, finalPdf);

        // Tambahkan tiap lampiran
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

          // === Bagian pembatas lampiran ===
          let currentY = height - 90;
          drawCenteredText(`LAMPIRAN ${lampiran.romawiLampiran}`, currentY, 15);
          currentY -= 50;

          if (jenisLaporan === JenisLaporan.RAPERDA) {
            drawCenteredText(
              "RANCANGAN PERATURAN DAERAH KABUPATEN KENDAL",
              currentY,
              15
            );
          } else if (jenisLaporan === JenisLaporan.RAPERBUP) {
            drawCenteredText("RANCANGAN PERATURAN BUPATI KENDAL", currentY, 15);
          }

          currentY -= 20;
          drawCenteredText(`NOMOR   TAHUN ${tahun}`, currentY, 15);
          currentY -= 120;

          // 🔹 Judul lampiran dari input user, split otomatis per baris
          const judulLampiranText = lampiran.judulPembatasLampiran || "";
          const judulLines = judulLampiranText
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          const lineSpacing = 30;
          judulLines.forEach((line) => {
            drawCenteredText(line, currentY, 22, true);
            currentY -= lineSpacing;
          });

          currentY = 60;
          drawCenteredText(`TAHUN ANGGARAN ${tahun}`, currentY, 16);

          // === Tambahkan isi lampiran & footer ===
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

      // === 4️⃣ Simpan dan download PDF ===
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
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF!");
    } finally {
      setIsGenerating(false);
    }
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
