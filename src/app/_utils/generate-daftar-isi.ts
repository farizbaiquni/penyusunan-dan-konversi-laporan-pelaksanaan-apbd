import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { DaftarIsiLampiran, BabCalk, JenisLaporan } from "../_types/types";

export async function generateDaftarIsi(
  jenisLaporan: JenisLaporan,
  tahun: number,
  entries: DaftarIsiLampiran[],
  pdfDoc: PDFDocument
) {
  const width = 21 * 28.35; // A4 landscape (pt)
  const height = 33 * 28.35;
  const marginLeft = 70;
  const marginRight = 70;
  const bottomMargin = 80;

  let page = pdfDoc.addPage([width, height]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageWidth = page.getWidth();
  const usableWidth = pageWidth - marginLeft - marginRight;
  const centerX = pageWidth / 2;

  /* --- Utility: membungkus teks panjang --- */
  function wrapText(
    text: string,
    font: PDFFont,
    fontSize: number,
    maxWidth: number
  ) {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const test = current ? current + " " + word : word;
      const w = font.widthOfTextAtSize(test, fontSize);
      if (w > maxWidth) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  /* --- Fungsi menggambar 1 entri utama (Lampiran) --- */
  function drawEntry(page: PDFPage, entry: DaftarIsiLampiran, startY: number) {
    const fontSize = 11;
    const lineHeight = fontSize + 4;
    const rightColumnWidth = 40;
    const maxTextWidth = usableWidth - rightColumnWidth;

    const text = `LAMPIRAN ${entry.romawi} PERATURAN DAERAH KABUPATEN KENDAL`;
    const lines = wrapText(text, fontBold, fontSize, maxTextWidth);
    const uraianY = startY - lineHeight;

    for (let i = 0; i < lines.length; i++) {
      const y = uraianY - i * lineHeight;
      page.drawText(lines[i], {
        x: marginLeft,
        y,
        size: fontSize,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
    }

    const titleY = uraianY - lines.length * lineHeight;
    const titleLines = wrapText(
      entry.judul,
      fontRegular,
      fontSize,
      maxTextWidth
    );

    for (let i = 0; i < titleLines.length; i++) {
      const y = titleY - i * lineHeight;
      page.drawText(titleLines[i], {
        x: marginLeft,
        y,
        size: fontSize,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
    }

    const lastLineY = titleY - (titleLines.length - 1) * lineHeight;
    const pageNumWidth = fontRegular.widthOfTextAtSize(
      entry.nomorHalaman.toString(),
      fontSize
    );
    page.drawText(entry.nomorHalaman.toString(), {
      x: pageWidth - marginRight - pageNumWidth,
      y: lastLineY,
      size: fontSize,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });

    const lineY = lastLineY - 8;
    page.drawLine({
      start: { x: marginLeft, y: lineY },
      end: { x: pageWidth - marginRight, y: lineY },
      thickness: 0.5,
      color: rgb(0.3, 0.3, 0.3),
    });

    return lineY - 12;
  }

  /* --- Fungsi untuk menggambar isi CALK di bawah Lampiran --- */
  // tambahkan parameter halamanTerakhir (opsional)
  function drawCALKSection(
    page: PDFPage,
    babs: BabCalk[],
    startY: number,
    halamanTerakhir?: number
  ): number {
    let currentY = startY;
    const fontSize = 11;
    const babIndent = 10;
    const subIndent = 30;

    function drawCalkEntry(
      text: string,
      pageNum: number,
      font: PDFFont,
      indent: number
    ) {
      const lineHeight = fontSize + 1;
      const rightColumnWidth = 40;
      const maxTextWidth = usableWidth - rightColumnWidth - indent;
      const lines = wrapText(text, font, fontSize, maxTextWidth);

      for (let i = 0; i < lines.length; i++) {
        const y = currentY - lineHeight * (i + 1);
        page.drawText(lines[i], {
          x: marginLeft + indent,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }

      const lastY = currentY - lineHeight * lines.length;

      // Hanya gambar nomor halaman jika tidak ada pembatas atau pageNum <= halamanTerakhir
      const shouldDrawPageNum =
        typeof halamanTerakhir !== "number" || pageNum <= halamanTerakhir;

      if (shouldDrawPageNum) {
        const pageWidthNum = font.widthOfTextAtSize(
          pageNum.toString(),
          fontSize
        );
        page.drawText(pageNum.toString(), {
          x: pageWidth - marginRight - pageWidthNum,
          y: lastY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      } else {
        // Jika ingin menampilkan placeholder (mis. dash) bisa diganti di sini.
        // contoh: uncomment baris di bawah untuk menampilkan tanda '—'
        // const dashW = font.widthOfTextAtSize("—", fontSize);
        // page.drawText("—", { x: pageWidth - marginRight - dashW, y: lastY, size: fontSize, font, color: rgb(0,0,0) });
      }

      // Garis horizontal penuh dari margin kiri ke margin kanan
      page.drawLine({
        start: { x: marginLeft, y: lastY - 5 },
        end: { x: pageWidth - marginRight, y: lastY - 5 },
        thickness: 0.5,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Kurangi jarak antar entry, agar lebih rapat
      currentY = lastY - 10;
    }

    for (const bab of babs) {
      if (
        jenisLaporan === JenisLaporan.RAPERDA ||
        jenisLaporan === JenisLaporan.PERDA
      ) {
        if (currentY < bottomMargin) {
          page = pdfDoc.addPage([width, height]);
          currentY = height;
        }
        const babText = ` BAB ${bab.bab}. ${bab.judul}`;
        drawCalkEntry(babText, bab.halamanMulai, fontRegular, babIndent);
      }

      if (bab.subbabs) {
        for (const sub of bab.subbabs) {
          if (currentY < bottomMargin) {
            page = pdfDoc.addPage([width, height]);
            currentY = height - 100;
          }

          const subText =
            (jenisLaporan === JenisLaporan.RAPERDA ||
            jenisLaporan === JenisLaporan.PERDA
              ? `${bab.bab}.${sub.subbab} `
              : "") + sub.judul;

          drawCalkEntry(subText, sub.halamanMulai, fontRegular, subIndent);
        }
      }
    }

    return currentY;
  }

  /* --- Header halaman pertama --- */
  function drawCentered(text: string, y: number, font: PDFFont, size = 12) {
    const w = font.widthOfTextAtSize(text, size);
    const x = centerX - w / 2;
    page.drawText(text, { x, y, font, size, color: rgb(0, 0, 0) });
    return y - size - 5;
  }

  let currentY = height - 100;
  currentY = drawCentered("PENUNJUK HALAMAN", currentY, fontBold);
  currentY = drawCentered(
    "LAMPIRAN RANCANGAN PERATURAN DAERAH KABUPATEN KENDAL",
    currentY,
    fontRegular
  );
  currentY = drawCentered(`NOMOR ..... TAHUN ${tahun}`, currentY, fontRegular);

  const headerLineY = currentY - 8;
  page.drawLine({
    start: { x: marginLeft, y: headerLineY },
    end: { x: pageWidth - marginRight, y: headerLineY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  currentY = headerLineY - 25;

  /* --- Loop semua entries (lampiran) --- */
  for (const entry of entries) {
    if (currentY < bottomMargin) {
      page = pdfDoc.addPage([width, height]);
      currentY = height - 100;
    }

    currentY = drawEntry(page, entry, currentY);

    // Jika lampiran ini adalah CALK
    if (entry.isCALK && entry.babs && entry.babs.length > 0) {
      currentY = drawCALKSection(page, entry.babs, currentY);
    }
  }
}
