"use client";

import { useState, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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
  BabCalk,
  DaftarIsiLampiran,
  JenisLaporan,
  LampiranDataPendukung,
  LampiranDataUtama,
} from "@/app/_types/types";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { generateTextJenisLaporan } from "@/app/_utils/jenis-laporan";

interface PreviewProps {
  jenisLaporan: JenisLaporan;
  tahun: number;
  batangTubuh: File | null;
  lampirans: LampiranDataUtama[];
  lampiransPendukung: LampiranDataPendukung[];
  onBack?: () => void;
}

async function generateEntriesFromLampiran(
  lampirans: LampiranDataUtama[]
): Promise<DaftarIsiLampiran[]> {
  const entries: DaftarIsiLampiran[] = [];
  let currentPage = 1; // nomor halaman PDF final saat ini

  for (const lampiran of lampirans) {
    const jumlahHalaman = lampiran.jumlahHalaman;

    // Jika lampiran CALK, sesuaikan halamanMulai bab/subbab
    let adjustedBabs: BabCalk[] | undefined = undefined;
    if (lampiran.isCALK && lampiran.babs) {
      const offset = currentPage - 1; // halaman awal lampiran di PDF final
      adjustedBabs = lampiran.babs.map((bab) => {
        const newBab = { ...bab };
        newBab.halamanMulai = (newBab.halamanMulai || 1) + offset;

        if (newBab.subbabs) {
          newBab.subbabs = newBab.subbabs.map((sub) => ({
            ...sub,
            halamanMulai: (sub.halamanMulai || 1) + offset,
          }));
        }
        return newBab;
      });
    }

    entries.push({
      id: crypto.randomUUID(),
      romawi: lampiran.romawiLampiran,
      judul: lampiran.judulPembatasLampiran,
      nomorHalaman: currentPage,
      jamlahPenomoranHalaman: jumlahHalaman,
      isCALK: lampiran.isCALK,
      babs: adjustedBabs || lampiran.babs,
    });

    currentPage += jumlahHalaman;
  }

  return entries;
}

export default function MenuPreview({
  jenisLaporan,
  tahun,
  batangTubuh,
  lampirans,
  lampiransPendukung,
  onBack,
}: PreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // fungsi utama untuk generate PDF final
  async function generateFinalPDF() {
    try {
      setIsGenerating(true);

      const width = 21 * 28.35;
      const height = 33 * 28.35;
      const finalPdf = await PDFDocument.create();
      const fontBold = await finalPdf.embedFont(StandardFonts.TimesRomanBold);
      const fontRegular = await finalPdf.embedFont(StandardFonts.TimesRoman);

      // 1️⃣ Tambahkan cover
      if (jenisLaporan === JenisLaporan.RAPERDA) {
        await generateCoverRaperda(2025, finalPdf);
      } else if (jenisLaporan === JenisLaporan.RAPERBUP) {
        await generateCoverRaperbup(2025, finalPdf);
      }

      // 2️⃣ Tambahkan batang tubuh jika ada
      if (batangTubuh) {
        const batangBytes = await batangTubuh.arrayBuffer();
        const batangDoc = await PDFDocument.load(batangBytes);
        const batangPages = await finalPdf.copyPages(
          batangDoc,
          batangDoc.getPageIndices()
        );
        batangPages.forEach((p) => finalPdf.addPage(p));
      }

      // 3️⃣ Tambahkan daftar isi dan lampiran
      if (lampirans.length > 0) {
        const entries: DaftarIsiLampiran[] = await generateEntriesFromLampiran(
          lampirans
        );
        generateDaftarIsi(jenisLaporan, 2025, entries, finalPdf);

        let currentPageNumber = 1;
        for (const lampiran of lampirans) {
          const pembatasPage = finalPdf.addPage([width, height]);
          const { width: pageWidth } = pembatasPage.getSize();
          const centerX = pageWidth / 2;

          function drawCenteredText(
            text: string,
            y: number,
            size = 16,
            bold = false
          ) {
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
          }

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
          drawCenteredText("NOMOR 1 TAHUN 2025", currentY, 15);
          // 🔹 Setelah bagian NOMOR 1 TAHUN 2025
          currentY -= 120;

          // Ambil teks dari pengguna (misal dari form input textarea)
          const judulLampiranText = lampiran.judulPembatasLampiran || "";

          // Pisahkan per baris (split berdasarkan newline)
          const judulLines = judulLampiranText
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          // Tampilkan tiap baris teks dengan jarak antarbaris
          const lineSpacing = 30;
          judulLines.forEach((line) => {
            drawCenteredText(line, currentY, 22, true);
            currentY -= lineSpacing;
          });
          currentY = 60;
          drawCenteredText(`TAHUN ANGGARAN ${2025}`, currentY, 16);

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

      for (const pendukung of lampiransPendukung) {
        const pendukungBytes = await pendukung.file.arrayBuffer();
        const pendukungDoc = await PDFDocument.load(pendukungBytes);
        const pendukungPages = await finalPdf.copyPages(
          pendukungDoc,
          pendukungDoc.getPageIndices()
        );
        pendukungPages.forEach((p) => finalPdf.addPage(p));
      }

      // 4️⃣ Simpan hasil PDF ke blob URL
      const pdfBytes = await finalPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      // hapus URL lama biar tidak numpuk
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Terjadi kesalahan saat membuat preview PDF!");
    } finally {
      setIsGenerating(false);
    }
  }

  // Auto generate saat komponen di-load
  useEffect(() => {
    generateFinalPDF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batangTubuh, lampirans]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="px-2 py-3 max-w-5xl mx-auto space-y-3 bg-white rounded-sm shadow-sm border border-gray-200">
      {/* Header dengan tombol kembali */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-blue-800 flex items-center gap-2 capitalize">
          📄 Preview Dokumen {generateTextJenisLaporan(jenisLaporan)} {tahun}
        </h1>
        {onBack && (
          <button
            onClick={onBack}
            className="flex  items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Kembali</span>
          </button>
        )}
        {/* Tombol Generate */}
        <button
          onClick={generateFinalPDF}
          disabled={isGenerating}
          className={`flex items-center text-sm justify-center gap-2 px-3 py-2 rounded-md font-medium transition text-white ${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-800 hover:bg-blue-900"
          }`}
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Memproses...</span>
            </>
          ) : (
            <>
              ⟳ <span>Perbarui Preview</span>
            </>
          )}
        </button>
      </div>

      {/* Preview PDF */}
      <div className="border rounded-md shadow-sm h-[550px] overflow-auto ">
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full"
            title="PDF Preview"
          />
        ) : (
          <div className="text-center text-gray-500 py-20 border-dashed border h-full flex items-center justify-center">
            <div className="flex flex-col justify-center items-center">
              <Image
                width={20}
                height={20}
                src="/animations/loading-animation.gif"
                alt="Loading animation"
                className="w-20 h-20 object-contain"
              />
              <p>Memuat Preview...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
