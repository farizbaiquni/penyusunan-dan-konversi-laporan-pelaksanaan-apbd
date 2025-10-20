import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { BabCalk } from "../_types/types";

export async function generateDaftarIsiCALK(
  tahun: number,
  entries: BabCalk[],
  pdfDoc: PDFDocument
) {
  const width = 21 * 28.35; // A4 dalam pt
  const height = 33 * 28.35;
  const marginLeft = 100;
  const marginRight = 70;
  const bottomMargin = 80;

  let page = pdfDoc.addPage([width, height]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width: pageWidth } = page.getSize();
  const usableWidth = pageWidth - marginLeft - marginRight;

  // Fungsi untuk membungkus teks panjang ke beberapa baris
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
      if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // Gambar satu entri (bisa bab atau subbab)
  function drawEntry(
    page: PDFPage,
    text: string,
    halaman: number,
    startY: number,
    font: PDFFont,
    indent: number
  ) {
    const size = 11;
    const lineHeight = size + 2;
    const rightColumnWidth = 40;
    const maxTextWidth = usableWidth - rightColumnWidth - indent;

    const uraianStartY = startY - lineHeight;
    const lines = wrapText(text, font, size, maxTextWidth);

    for (let i = 0; i < lines.length; i++) {
      const y = uraianStartY - i * lineHeight;
      page.drawText(lines[i], {
        x: marginLeft + indent,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    }

    const lastLineY = uraianStartY - (lines.length - 1) * lineHeight;

    // Nomor halaman di kanan
    const halamanWidth = font.widthOfTextAtSize(halaman.toString(), size);
    page.drawText(halaman.toString(), {
      x: page.getWidth() - marginRight - halamanWidth,
      y: lastLineY,
      size,
      font,
      color: rgb(0, 0, 0),
    });

    // Garis bawah
    const lineY = lastLineY - 5;
    page.drawLine({
      start: { x: marginLeft + indent, y: lineY },
      end: { x: page.getWidth() - marginRight, y: lineY },
      thickness: 0.5,
      color: rgb(0.3, 0.3, 0.3),
    });

    return lineY - 8; // jarak antar entri
  }

  let currentY = height - 100;

  for (const bab of entries) {
    if (currentY < bottomMargin) {
      page = pdfDoc.addPage([width, height]);
      currentY = height - 100;
    }

    // Gambar BAB
    const babText = `BAB ${bab.bab}. ${bab.judul}`;
    currentY = drawEntry(
      page,
      babText,
      bab.halamanMulai,
      currentY,
      fontBold,
      0
    );

    // Gambar subbab (jika ada)
    if (bab.subbabs && bab.subbabs.length > 0) {
      for (const [index, sub] of bab.subbabs.entries()) {
        if (currentY < bottomMargin) {
          page = pdfDoc.addPage([width, height]);
          currentY = height - 100;
        }

        const subText = `${bab.bab}.${sub.subbab} ${sub.judul}`;
        currentY = drawEntry(
          page,
          subText,
          sub.halamanMulai,
          currentY,
          fontRegular,
          20
        );
      }
    }
  }
}
