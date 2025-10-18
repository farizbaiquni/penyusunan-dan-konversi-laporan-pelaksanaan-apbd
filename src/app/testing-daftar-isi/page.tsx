"use client";

import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

export interface DaftarIsiLampiran {
  romawi: string;
  judul: string;
  nomorHalaman: number;
}

export default function GeneratedDaftarIsi() {
  async function generateDaftarIsi(
    tahun: number,
    entries: DaftarIsiLampiran[]
  ) {
    const width = 21 * 28.35;
    const height = 33 * 28.35;

    const marginLeft = 70;
    const marginRight = 70;
    const bottomMargin = 80;

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([width, height]);

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width: pageWidth } = page.getSize();
    const usableWidth = pageWidth - marginLeft - marginRight;
    const centerX = pageWidth / 2;

    // --- Utility: wrap text otomatis ---
    function wrapText(
      text: string,
      font: PDFFont,
      fontSize: number,
      maxWidth: number
    ) {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (textWidth > maxWidth) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    }

    // --- Draw header untuk tiap halaman ---
    function drawPageHeader(page: PDFPage, y: number) {
      const headerY = y;
      page.drawText("URAIAN", {
        x: marginLeft,
        y: headerY,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      const halamanHeader = "HALAMAN";
      const halamanHeaderWidth = fontBold.widthOfTextAtSize(halamanHeader, 12);
      page.drawText(halamanHeader, {
        x: pageWidth - marginRight - halamanHeaderWidth,
        y: headerY,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      // Garis horizontal di bawah header
      const columnLineY = headerY - 8;
      page.drawLine({
        start: { x: marginLeft, y: columnLineY },
        end: { x: pageWidth - marginRight, y: columnLineY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      return columnLineY - 20;
    }

    // --- Draw satu entri ---
    function drawEntry(
      page: PDFPage,
      entry: DaftarIsiLampiran,
      startY: number
    ) {
      const size = 11;
      const font = fontRegular;
      const lineHeight = size + 4;
      const rightColumnWidth = 40;
      const maxTextWidth = usableWidth - rightColumnWidth;

      // Lampiran dan Romawi
      page.drawText(`LAMPIRAN ${entry.romawi} PERATURAN BUPATI KENDAL`, {
        x: marginLeft,
        y: startY,
        size,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      const uraianStartY = startY - lineHeight;
      const lines = wrapText(entry.judul, font, size, maxTextWidth);

      for (let i = 0; i < lines.length; i++) {
        const y = uraianStartY - i * lineHeight;
        page.drawText(lines[i], {
          x: marginLeft,
          y,
          size,
          font,
          color: rgb(0, 0, 0),
        });
      }

      const lastLineY = uraianStartY - (lines.length - 1) * lineHeight;

      const halamanWidth = font.widthOfTextAtSize(
        entry.nomorHalaman.toString(),
        size
      );
      page.drawText(entry.nomorHalaman.toString(), {
        x: pageWidth - marginRight - halamanWidth,
        y: lastLineY,
        size,
        font,
        color: rgb(0, 0, 0),
      });

      // Garis bawah entri
      const lineY = lastLineY - 8;
      page.drawLine({
        start: { x: marginLeft, y: lineY },
        end: { x: pageWidth - marginRight, y: lineY },
        thickness: 0.5,
        color: rgb(0.3, 0.3, 0.3),
      });

      return lineY - 15;
    }

    // --- Header Halaman Pertama ---
    let currentY = height - 100;
    const drawCentered = (
      text: string,
      y: number,
      font: PDFFont,
      size = 12
    ) => {
      const w = font.widthOfTextAtSize(text, size);
      const x = centerX - w / 2;
      page.drawText(text, { x, y, font, size });
      return y - size;
    };

    currentY = drawCentered("PENUNJUK HALAMAN", currentY, fontBold);
    currentY = drawCentered(
      "LAMPIRAN RANCANGAN PERATURAN DAERAH KABUPATEN KENDAL",
      currentY - 8,
      fontRegular
    );
    currentY = drawCentered(
      `NOMOR ..... TAHUN ${tahun}`,
      currentY - 8,
      fontRegular
    );

    // Garis bawah header utama
    const headerLineY = currentY - 8;
    page.drawLine({
      start: { x: marginLeft, y: headerLineY },
      end: { x: pageWidth - marginRight, y: headerLineY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Header kolom pertama
    currentY = drawPageHeader(page, headerLineY - 20);

    // --- Loop entri dengan auto new page ---
    for (const e of entries) {
      if (currentY < bottomMargin) {
        page = pdfDoc.addPage([width, height]);
        currentY = height - 100;
        currentY = drawPageHeader(page, currentY);
      }

      currentY = drawEntry(page, e, currentY);
    }

    // --- Simpan PDF ---
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DAFTAR_ISI_${tahun}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // --- Contoh penggunaan ---
  const contohEntries: DaftarIsiLampiran[] = Array.from(
    { length: 25 },
    (_, i) => ({
      romawi: (i + 1).toString(),
      judul: `Contoh uraian entri nomor ${
        i + 1
      } yang mungkin cukup panjang untuk mengetes pembungkus teks otomatis.`,
      nomorHalaman: i + 1,
    })
  );

  return (
    <div className="p-4">
      <button
        onClick={() =>
          generateDaftarIsi(new Date().getFullYear(), contohEntries)
        }
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Generate PDF (Multi Page)
      </button>
    </div>
  );
}
