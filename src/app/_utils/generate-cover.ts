import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateCoverRaperda(
  tahun: number,
  finalPdf: PDFDocument
) {
  // Ukuran halaman dalam poin (21 cm x 33 cm)
  const width = 21 * 28.35;
  const height = 33 * 28.35;

  // Buat dokumen PDF baru
  const page = finalPdf.addPage([width, height]);

  const fontBold = await finalPdf.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await finalPdf.embedFont(StandardFonts.Helvetica);

  const { width: pageWidth, height: pageHeight } = page.getSize();
  const centerX = pageWidth / 2;

  // Fungsi bantu untuk menulis teks terpusat
  function drawCenteredText(text: string, y: number, size = 16, bold = false) {
    const textWidth = (bold ? fontBold : fontRegular).widthOfTextAtSize(
      text,
      size
    );

    page.drawText(text, {
      x: centerX - textWidth / 2,
      y,
      size,
      font: bold ? fontBold : fontRegular,
      color: rgb(0, 0, 0),
    });
  }

  // ✅ Tambah gambar di tengah horizontal
  const imageUrl = "/images/lambang-garuda-cover.png";
  const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
  const pngImage = await finalPdf.embedPng(imageBytes);

  const imageWidth = 110;
  const imageHeight = 110;

  // Posisi tengah horizontal
  const xCentered = (pageWidth - imageWidth) / 2;
  const yPosition = height - 200; // jarak dari atas (sesuaikan)

  page.drawImage(pngImage, {
    x: xCentered,
    y: yPosition,
    width: imageWidth,
    height: imageHeight,
  });

  // ✅ Susunan teks seperti sebelumnya
  let currentY = yPosition - 30;

  drawCenteredText("BUPATI KENDAL", currentY, 17, true);
  currentY -= 120;
  drawCenteredText("RANCANGAN PERATURAN DAERAH", currentY, 20, true);
  currentY -= 30;
  drawCenteredText("KABUPATEN KENDAL", currentY, 20, true);
  currentY -= 30;
  drawCenteredText(`NOMOR    TAHUN ${tahun}`, currentY, 20, true);

  currentY -= 90;
  drawCenteredText("TENTANG", currentY, 20, true);

  currentY -= 90;
  drawCenteredText("PERTANGGUNGJAWABAN PELAKSANAAN", currentY, 18, true);
  currentY -= 20;
  drawCenteredText(
    "ANGGARAN PENDAPATAN DAN BELANJA DAERAH",
    currentY,
    18,
    true
  );
  currentY -= 20;
  drawCenteredText("TAHUN ANGGARAN 2024", currentY, 18, true);

  currentY = 90;
  drawCenteredText("PEMERINTAH KABUPATEN KENDAL", currentY, 17, true);

  currentY = 70;
  drawCenteredText("TAHUN 2025", currentY, 17, true);
}

export async function generateCoverRaperbup(
  tahun: number,
  finalPdf: PDFDocument
) {
  // Ukuran halaman dalam poin (21 cm x 33 cm)
  const width = 21 * 28.35;
  const height = 33 * 28.35;

  // Buat dokumen PDF baru
  const page = finalPdf.addPage([width, height]);

  const fontBold = await finalPdf.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await finalPdf.embedFont(StandardFonts.Helvetica);

  const { width: pageWidth, height: pageHeight } = page.getSize();
  const centerX = pageWidth / 2;

  // Fungsi bantu untuk menulis teks terpusat
  function drawCenteredText(text: string, y: number, size = 16, bold = false) {
    const textWidth = (bold ? fontBold : fontRegular).widthOfTextAtSize(
      text,
      size
    );

    page.drawText(text, {
      x: centerX - textWidth / 2,
      y,
      size,
      font: bold ? fontBold : fontRegular,
      color: rgb(0, 0, 0),
    });
  }

  // ✅ Tambah gambar di tengah horizontal
  const imageUrl = "/images/lambang-garuda-cover.png";
  const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
  const pngImage = await finalPdf.embedPng(imageBytes);

  const imageWidth = 110;
  const imageHeight = 110;

  // Posisi tengah horizontal
  const xCentered = (pageWidth - imageWidth) / 2;
  const yPosition = height - 200; // jarak dari atas (sesuaikan)

  page.drawImage(pngImage, {
    x: xCentered,
    y: yPosition,
    width: imageWidth,
    height: imageHeight,
  });

  // ✅ Susunan teks seperti sebelumnya
  let currentY = yPosition - 30;

  drawCenteredText("BUPATI KENDAL", currentY, 17, true);
  currentY -= 120;
  drawCenteredText("RANCANGAN PERATURAN BUPATI KENDAL", currentY, 20, true);
  currentY -= 30;
  drawCenteredText(`NOMOR    TAHUN ${tahun}`, currentY, 20, true);

  currentY -= 100;
  drawCenteredText("TENTANG", currentY, 20, true);

  currentY -= 90;
  drawCenteredText("PENJABARAN PERTANGGUNGJAWABAN", currentY, 18, true);
  currentY -= 20;
  drawCenteredText("PELAKSANAAN ANGGARAN PENDAPATAN DAN", currentY, 18, true);
  currentY -= 20;
  drawCenteredText("BELANJA DAERAH", currentY, 18, true);
  currentY -= 20;
  drawCenteredText("TAHUN ANGGARAN 2024", currentY, 18, true);

  currentY = 90;
  drawCenteredText("PEMERINTAH KABUPATEN KENDAL", currentY, 17, true);

  currentY = 70;
  drawCenteredText("TAHUN 2025", currentY, 17, true);
}
