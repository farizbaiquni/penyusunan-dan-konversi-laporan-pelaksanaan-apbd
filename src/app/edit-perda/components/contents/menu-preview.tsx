import { useState } from "react";
import { LampiranData } from "../../page";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface PreviewProps {
  batangTubuh: File | null;
  lampirans: LampiranData[];
}

function Preview({ batangTubuh, lampirans }: PreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateFinalPDF() {
    // Ukuran halaman dalam poin (21 cm x 33 cm)
    const width = 21 * 28.35;
    const height = 33 * 28.35;

    if (!batangTubuh) return alert("Upload batang tubuh terlebih dahulu!");
    if (lampirans.length === 0)
      return alert("Tambahkan minimal satu lampiran!");

    setIsGenerating(true);

    const finalPdf = await PDFDocument.create();
    const font = await finalPdf.embedFont(StandardFonts.TimesRomanBold);
    const fontRegular = await finalPdf.embedFont(StandardFonts.TimesRoman);

    // ✅ 1. COVER PAGE
    const coverPage = finalPdf.addPage([width, height]);
    coverPage.drawText("DOKUMEN PERDA", {
      x: 200,
      y: 500,
      size: 24,
      font,
      color: rgb(0, 0.4, 0.8),
    });

    // ✅ 2. BUKA BATANG TUBUH
    const batangBytes = await batangTubuh.arrayBuffer();
    const batangDoc = await PDFDocument.load(batangBytes);
    const batangPages = await finalPdf.copyPages(
      batangDoc,
      batangDoc.getPageIndices()
    );
    batangPages.forEach((p) => finalPdf.addPage(p));

    // ✅ 3. LOOP LAMPIRAN
    for (const lampiran of lampirans) {
      // --- 3a. Halaman pembatas ---
      const pembatasPage = finalPdf.addPage([width, height]);
      const { width: pageWidth, height: pageHeight } = pembatasPage.getSize();
      const centerX = pageWidth / 2;

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
        pembatasPage.drawText(text, {
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
      drawCenteredText(`TAHUN ANGGARAN ${2025}`, currentY, 16);

      // --- 3b. Halaman lampiran dari file PDF ---
      const lampiranBytes = await lampiran.file.arrayBuffer();
      const lampiranDoc = await PDFDocument.load(lampiranBytes);
      const lampiranPages = await finalPdf.copyPages(
        lampiranDoc,
        lampiranDoc.getPageIndices()
      );

      lampiranPages.forEach((p, idx) => {
        // Tambahkan halaman ke dokumen utama
        const page = finalPdf.addPage(p);

        // --- 3c. Tambah footer di halaman terakhir ---
        if (idx === lampiranPages.length - 1 && lampiran.footerText) {
          page.drawText(lampiran.footerText, {
            x: lampiran.footerX,
            y: lampiran.footerY,
            size: lampiran.fontSize,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
        }
      });
    }

    // ✅ 4. EXPORT KE BLOB (VERSI AMAN)
    const mergedBytes = await finalPdf.save();
    const blob = new Blob([new Uint8Array(mergedBytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);

    // ✅ 5. DOWNLOAD OTOMATIS
    const a = document.createElement("a");
    a.href = url;
    a.download = "Dokumen_Perda_Final.pdf";
    a.click();

    setIsGenerating(false);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">🧩 PDF Compiler Otomatis</h1>

      <button
        onClick={generateFinalPDF}
        disabled={isGenerating}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isGenerating ? "Menggabungkan..." : "Generate PDF Utuh"}
      </button>
    </div>
  );
}

export default Preview;
