"use client";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function PembatasLampiran() {
  async function generatePembatasLampiran(tahun: number) {
    // Ukuran halaman dalam poin (21 cm x 33 cm)
    const width = 21 * 28.35;
    const height = 33 * 28.35;

    // Buat dokumen PDF baru
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([width, height]);

    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const { width: pageWidth, height: pageHeight } = page.getSize();

    const centerX = pageWidth / 2;

    // Fungsi bantu untuk menulis teks terpusat
    function drawCenteredText(
      text: string,
      y: number,
      size = 16,
      bold = false
    ) {
      const textWidth = (bold ? font : fontRegular).widthOfTextAtSize(
        text,
        size
      );
      page.drawText(text, {
        x: centerX - textWidth / 2,
        y,
        size,
        font: bold ? font : fontRegular,
        color: rgb(0, 0, 0),
      });
    }

    // Susunan teks seperti di file contoh
    let currentY = height - 90;
    drawCenteredText("LAMPIRAN I.1", currentY, 15, false);

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
    drawCenteredText(`TAHUN ANGGARAN ${tahun - 1}`, currentY, 16);

    // Simpan PDF
    const pdfBytes = await pdfDoc.save();

    // Kembalikan dalam bentuk Blob untuk bisa diunduh di browser
    const blob = new Blob([new Uint8Array(pdfBytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);

    // Download otomatis (opsional)
    const link = document.createElement("a");
    link.href = url;
    link.download = `PEMBATAS_LAMPIRAN_I1_${tahun}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  }
  return (
    <div>
      <button onClick={() => generatePembatasLampiran(2025)}>Generate</button>
    </div>
  );
}

export default PembatasLampiran;
