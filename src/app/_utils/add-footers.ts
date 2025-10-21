import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const addFooter = async (
  footerWidth: number,
  footerX: number,
  footerY: number,
  footerHeight: number,
  fontSize: number,
  romawiLampiran: string,
  footerText: string,
  existingPdfBytes: ArrayBuffer
): Promise<string> => {
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const text = `PERDA ${romawiLampiran}. ${footerText}`.toUpperCase();

  pages.forEach((page, index) => {
    const { width } = page.getSize();
    const boxWidth = (width * footerWidth) / 100;
    const xPos = (width - boxWidth) / 2 + footerX;
    const yPos = footerY;

    // Kotak footer
    page.drawRectangle({
      x: xPos,
      y: yPos,
      width: boxWidth,
      height: footerHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Teks footer kiri (judul/keterangan)
    page.drawText(text, {
      x: xPos + 10,
      y: yPos + footerHeight / 2 - fontSize / 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
      maxWidth: boxWidth - 100,
    });

    // Nomor halaman di kanan
    const pageNumber = `Halaman ${index + 1}`;
    const textWidth = helveticaFont.widthOfTextAtSize(pageNumber, fontSize);
    page.drawText(pageNumber, {
      x: xPos + boxWidth - textWidth - 10,
      y: yPos + footerHeight / 2 - fontSize / 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  });

  const pdfBytes = await pdfDoc.save();

  const safeBytes = Uint8Array.from(pdfBytes);
  const blob = new Blob([safeBytes.buffer], { type: "application/pdf" });

  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
};

export async function addFooterToPages(
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

export const addFooterLampiranCALK = async (
  footerWidth: number,
  footerX: number,
  footerY: number,
  footerHeight: number,
  fontSize: number,
  existingPdfBytes: ArrayBuffer,
  halamanTerakhirCALK: number
): Promise<string> => {
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  // Layout dasar (bisa disesuaikan)
  const marginLeft = 128;
  const marginRight = 100;
  const lineY = footerY + 20; // posisi garis relatif terhadap footerY

  pages.forEach((page, index) => {
    if (index > halamanTerakhirCALK - 1) return;

    const { width } = page.getSize();

    // Nomor halaman sejajar dengan garis kanan
    const pageNumber = `Halaman ${index + 1}`;
    const textWidth = helveticaFont.widthOfTextAtSize(pageNumber, fontSize);
    const rightEdge = width - marginRight; // posisi ujung kanan garis
    const padding = 5; // jarak kecil agar teks tidak menempel garis

    page.drawText(pageNumber, {
      x: rightEdge - textWidth - padding,
      y: lineY,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], {
    type: "application/pdf",
  });
  return URL.createObjectURL(blob);
};

export async function addFooterToPagesCALK(
  pdfDoc: PDFDocument,
  startPageNumber: number,
  footerWidth: number,
  footerX: number,
  footerY: number,
  footerHeight: number,
  fontSize: number,
  romawiLampiran: string,
  footerText: string,
  halamanTerakhirCALK: number
): Promise<number> {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  let currentPage = startPageNumber;

  // Layout dasar (bisa disesuaikan)
  const marginLeft = 128;
  const marginRight = 100;
  const lineY = footerY + 20;

  // Hitung batas akhir lembar yang ingin diberi footer
  const endPage = startPageNumber + halamanTerakhirCALK - 1;

  for (const page of pages) {
    if (currentPage > endPage) break;

    const { width } = page.getSize();

    // Nomor halaman sejajar dengan garis kanan
    const pageNumber = `Halaman ${currentPage}`;
    const textWidth = helveticaFont.widthOfTextAtSize(pageNumber, fontSize);
    const rightEdge = width - marginRight;
    const padding = 5;

    page.drawText(pageNumber, {
      x: rightEdge - textWidth - padding,
      y: lineY,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    currentPage++;
  }

  return currentPage;
}

// export const addFooterLampiranCALK = async (
//   footerWidth: number,
//   footerX: number,
//   footerY: number,
//   footerHeight: number,
//   fontSize: number,
//   existingPdfBytes: ArrayBuffer,
//   halamanTerakhirCALK: number,
//   textLeft?: string // opsional ubah teks footer
// ): Promise<string> => {
//   const pdfDoc = await PDFDocument.load(existingPdfBytes);
//   const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const pages = pdfDoc.getPages();

//   // Layout dasar (bisa disesuaikan)
//   const marginLeft = 128;
//   const marginRight = 103;
//   const lineY = footerY + 40; // posisi garis relatif terhadap footerY
//   const lineSpacing = 9;

//   const footerText =
//     textLeft ||
//     "Laporan Keuangan Pemerintah Daerah Kabupaten Kendal Tahun 2024";

//   pages.forEach((page, index) => {
//     if (index > halamanTerakhirCALK - 1) return;

//     const { width } = page.getSize();
//     const boxWidth = (width * footerWidth) / 100;

//     // Garis horizontal penuh (kiri ke kanan)
//     page.drawLine({
//       start: { x: marginLeft, y: lineY },
//       end: { x: width - marginRight, y: lineY },
//       thickness: 0.5,
//       color: rgb(0.3, 0.3, 0.3),
//     });

//     // Teks footer kiri
//     page.drawText(footerText, {
//       x: marginLeft + 5,
//       y: lineY - lineSpacing,
//       size: fontSize,
//       font: helveticaFont,
//       color: rgb(0, 0, 0),
//     });

//     // Nomor halaman sejajar dengan garis kanan
//     const pageNumber = `Halaman ${index + 1}`;
//     const textWidth = helveticaFont.widthOfTextAtSize(pageNumber, fontSize);
//     const rightEdge = width - marginRight; // posisi ujung kanan garis
//     const padding = 5; // jarak kecil agar teks tidak menempel garis

//     page.drawText(pageNumber, {
//       x: rightEdge - textWidth - padding,
//       y: lineY - lineSpacing,
//       size: fontSize,
//       font: helveticaFont,
//       color: rgb(0, 0, 0),
//     });
//   });

//   const pdfBytes = await pdfDoc.save();
//   const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], {
//     type: "application/pdf",
//   });
//   return URL.createObjectURL(blob);
// };

// export async function addFooterToPagesCALK(
//   pdfDoc: PDFDocument,
//   startPageNumber: number,
//   footerWidth: number,
//   footerX: number,
//   footerY: number,
//   footerHeight: number,
//   fontSize: number,
//   romawiLampiran: string,
//   footerText: string,
//   halamanTerakhirCALK: number
// ): Promise<number> {
//   const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const pages = pdfDoc.getPages();
//   let currentPage = startPageNumber;

//   // Layout dasar (bisa disesuaikan)
//   const marginLeft = 128;
//   const marginRight = 103;
//   const lineY = footerY + 150; // posisi garis relatif terhadap footerY
//   const lineSpacing = 9;

//   // Hitung batas akhir lembar yang ingin diberi footer
//   const endPage = startPageNumber + halamanTerakhirCALK - 1;

//   for (const page of pages) {
//     if (currentPage > endPage) break;

//     const { width } = page.getSize();
//     const boxWidth = (width * footerWidth) / 100;

//     // Nomor halaman sejajar dengan garis kanan
//     const pageNumber = `Halaman ${currentPage}`;
//     const textWidth = helveticaFont.widthOfTextAtSize(pageNumber, fontSize);
//     const rightEdge = width - marginRight; // posisi ujung kanan garis
//     const padding = 5; // jarak kecil agar teks tidak menempel garis

//     page.drawText(pageNumber, {
//       x: rightEdge - textWidth - padding,
//       y: lineY - lineSpacing,
//       size: fontSize,
//       font: helveticaFont,
//       color: rgb(0, 0, 0),
//     });

//     currentPage++;
//   }

//   return currentPage;
// }
