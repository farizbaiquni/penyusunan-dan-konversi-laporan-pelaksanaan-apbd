/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DownloadPDF() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!contentRef.current) return;

    const canvas = await html2canvas(contentRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    // Ukuran Legal: 21 cm x 33 cm = 210 mm x 330 mm
    const pdfWidth = 210;
    const pdfHeight = 330;

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [pdfWidth, pdfHeight],
    });

    // Hitung tinggi gambar proporsional
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("cover perda-perbup ukuran kertas legal.pdf");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafb] p-6">
      {/* Area yang akan di-convert ke PDF */}
      <div
        ref={contentRef}
        className="bg-[#ffffff]  shadow-lg text-xl font-bold text-center rounded-lg p-8 w-[793px] h-[1248px] flex flex-col items-center justify-center"
      >
        <img
          src="/images/logo-garuda.png"
          alt="Logo Garuda"
          width={120}
          height={120}
          className="mb-5"
        />

        <p>BUPATI KENDAL</p>
        <span className="text-2xl">
          <p className="mt-42">PERATURAN DAERAH KABUPATEN KENDAL</p>
          <p>NOMOR 1 TAHUN 2025</p>
        </span>
        <p className="my-24 text-2xl">TENTANG</p>
        <span>
          <p>PENJABARAN PERTANGGUNGJAWABAN PELAKSANAAN</p>
          <p>ANGGARAN PENDAPATAN DAN BELANJA DAERAH</p>
          <p>TAHUN ANGGARAN 2024</p>
        </span>
        <span className="mt-42">
          <p>PEMERINTAH KABUPATEN KENDAL</p>
          <p>TAHUN 2025</p>
        </span>
      </div>

      {/* Tombol Download */}
      <button
        onClick={handleDownload}
        className="mt-6 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200"
      >
        Download PDF (Legal)
      </button>
    </div>
  );
}
