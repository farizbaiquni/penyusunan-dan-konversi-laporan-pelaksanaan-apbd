"use client";

import Image from "next/image";
import { ReactNode } from "react";

interface HeaderProps {
  /** Elemen custom di sisi kanan header (opsional) */
  rightContent?: ReactNode;
}

/**
 * Komponen Header dengan area kanan yang fleksibel (bisa passing elemen apa pun).
 */
export default function Header({ rightContent }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-16 py-2 flex justify-between items-center">
        {/* Kiri: Logo dan judul */}
        <div className="flex items-center gap-3">
          <Image src="/images/bank.png" alt="Logo" width={40} height={40} />
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Tuntas</h1>
            <p className="text-sm text-gray-500">
              Tata Kelola Naskah Pertanggungjawaban Pelaksanaan Terotomatisasi
              dan Sistematis
            </p>
          </div>
        </div>

        {/* Kanan: Bisa tombol, search bar, dll */}
        {rightContent && (
          <div className="flex items-center gap-3">{rightContent}</div>
        )}
      </div>
    </header>
  );
}
