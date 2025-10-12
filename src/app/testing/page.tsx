"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default function PDFAssembler() {
  const [batangTubuh, setBatangTubuh] = useState<File | null>(null);
  const [lampiranFiles, setLampiranFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateFinalPDF() {
    if (!batangTubuh) return alert("Upload batang tubuh terlebih dahulu!");

    setIsGenerating(true);

    const finalPdf = await PDFDocument.create();

    // ✅ 1. Tambah cover
    const coverPage = finalPdf.addPage();
    const font = await finalPdf.embedFont(StandardFonts.HelveticaBold);
    coverPage.drawText("DOKUMEN PERDA", {
      x: 200,
      y: 500,
      size: 24,
      font,
      color: rgb(0, 0.4, 0.8),
    });

    // ✅ 2. Import Batang Tubuh
    const batangBytes = await batangTubuh.arrayBuffer();
    const batangDoc = await PDFDocument.load(batangBytes);
    const batangPages = await finalPdf.copyPages(
      batangDoc,
      batangDoc.getPageIndices()
    );
    batangPages.forEach((p) => finalPdf.addPage(p));

    // ✅ 3. Loop setiap lampiran
    for (let i = 0; i < lampiranFiles.length; i++) {
      const roman = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
      ][i];
      const pembatasPage = finalPdf.addPage();
      pembatasPage.drawText(`LAMPIRAN ${roman}`, {
        x: 220,
        y: 500,
        size: 20,
        font,
        color: rgb(0.1, 0.2, 0.6),
      });

      const lampiranBytes = await lampiranFiles[i].arrayBuffer();
      const lampiranDoc = await PDFDocument.load(lampiranBytes);
      const lampiranPages = await finalPdf.copyPages(
        lampiranDoc,
        lampiranDoc.getPageIndices()
      );
      lampiranPages.forEach((p) => finalPdf.addPage(p));
    }

    // ✅ 4. Export dan download
    const mergedBytes = await finalPdf.save();
    const blob = new Blob([new Uint8Array(mergedBytes)], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Dokumen_Perda_Utuh.pdf";
    a.click();

    setIsGenerating(false);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">🔗 PDF Compiler Otomatis</h1>

      {/* Upload batang tubuh */}
      <div>
        <label className="block mb-1 font-medium">Batang Tubuh (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setBatangTubuh(e.target.files?.[0] || null)}
        />
      </div>

      {/* Upload lampiran */}
      <div>
        <label className="block mb-1 font-medium">
          Lampiran-lampiran (PDF)
        </label>
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={(e) => setLampiranFiles(Array.from(e.target.files || []))}
        />
      </div>

      {/* Tombol Generate */}
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
