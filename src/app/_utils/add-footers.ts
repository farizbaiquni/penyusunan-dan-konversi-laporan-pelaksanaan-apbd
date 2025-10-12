import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { LampiranData } from "../edit-perda/page";

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

// Fungsi penambahan footer (kamu sudah punya versi ini)
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
  let currentPageNumber = startPageNumber;

  pages.forEach((page) => {
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
      maxWidth: boxWidth - 100,
    });

    // Nomor halaman kanan
    const pageNumberText = `Halaman ${currentPageNumber}`;
    const textWidth = helveticaFont.widthOfTextAtSize(pageNumberText, fontSize);
    page.drawText(pageNumberText, {
      x: xPos + boxWidth - textWidth - 10,
      y: yPos + footerHeight / 2 - fontSize / 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    currentPageNumber++;
  });

  return currentPageNumber; // untuk melanjutkan nomor ke lampiran berikutnya
}

// Fungsi utama gabung dokumen dan beri footer hanya di lampiran
export async function generateDokumenFinal(
  batangTubuh: File, // PDF batang tubuh (tidak diberi footer)
  pembatasList: File[], // PDF pembatas tiap lampiran (tanpa footer)
  lampirans: LampiranData[]
): Promise<string> {
  const finalPdf = await PDFDocument.create();
  let currentPageNumber = 1;

  // 1️⃣ Tambah batang tubuh (tanpa footer)
  const batangBytes = await batangTubuh.arrayBuffer();
  const batangPdf = await PDFDocument.load(batangBytes);
  const batangPages = await finalPdf.copyPages(
    batangPdf,
    batangPdf.getPageIndices()
  );
  batangPages.forEach((p) => finalPdf.addPage(p));

  // 2️⃣ Loop setiap lampiran
  for (let i = 0; i < lampirans.length; i++) {
    const lampiran = lampirans[i];
    const pembatasFile = pembatasList[i];

    // Tambah pembatas (tanpa footer)
    const pembatasBytes = await pembatasFile.arrayBuffer();
    const pembatasPdf = await PDFDocument.load(pembatasBytes);
    const pembatasPages = await finalPdf.copyPages(
      pembatasPdf,
      pembatasPdf.getPageIndices()
    );
    pembatasPages.forEach((p) => finalPdf.addPage(p));

    // Tambah lampiran (dengan footer)
    const lampiranBytes = await lampiran.file.arrayBuffer();
    const lampiranPdf = await PDFDocument.load(lampiranBytes);

    // Tambahkan footer ke setiap halaman lampiran
    await addFooterToPages(
      lampiranPdf,
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
      lampiranPdf,
      lampiranPdf.getPageIndices()
    );
    lampiranPages.forEach((p) => finalPdf.addPage(p));

    // Update nomor halaman untuk lampiran berikutnya
    currentPageNumber += lampiranPages.length;
  }

  // 3️⃣ Simpan PDF final
  const pdfBytes = await finalPdf.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);

  return url;
}
