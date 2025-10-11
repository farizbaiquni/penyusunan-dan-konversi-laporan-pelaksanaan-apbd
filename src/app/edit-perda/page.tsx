"use client";

import React, { useState } from "react";
import Image from "next/image";
import InformasiLaporan from "./components/contents/menu-informasi-laporan";
import BatangTubuh from "./components/contents/menu-batang-tubuh";
import Lampiran from "./components/contents/menu-lampiran";
import Preview from "./components/contents/menu-preview";
import Generate from "./components/contents/menu-generate";
import TambahLampiran from "./components/contents/menu-lampiran-tambah";

interface SidebarLink {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface LampiranData {
  id: number;
  file: File;
  romawiLampiran: string;
  footerWidth: number;
  footerX: number;
  footerY: number;
  fontSize: number;
  footerHeight: number;
  footerText: string;
}

const menuItems: SidebarLink[] = [
  { label: "Informasi Laporan", href: "#", icon: "/images/edit/informasi.png" },
  { label: "Batang Tubuh", href: "#", icon: "/images/edit/batang-tubuh.png" },
  { label: "Lampiran", href: "#", icon: "/images/edit/lampiran.png", badge: 7 },
  { label: "Preview", href: "#", icon: "/images/edit/preview.png" },
  { label: "Generate", href: "#", icon: "/images/edit/generate.png" },
];

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<string>("Tambah Lampiran");
  const [lampirans, setLampirans] = useState<LampiranData[]>([]);

  // Tambah file baru dari komponen TambahLampiran
  const handleAddLampiran = (data: Omit<LampiranData, "id">) => {
    const newLampiran: LampiranData = { ...data, id: Date.now() };
    setLampirans((prev) => [...prev, newLampiran]);
  };

  const handleDeleteLampiran = (id: number) => {
    setLampirans((prev) => prev.filter((l) => l.id !== id));
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "Informasi Laporan":
        return <InformasiLaporan />;
      case "Batang Tubuh":
        return <BatangTubuh />;
      case "Lampiran":
        return (
          <Lampiran
            setActiveMenu={setActiveMenu}
            lampirans={lampirans}
            onDeleteLampiran={handleDeleteLampiran}
          />
        );
      case "Tambah Lampiran":
        return (
          <TambahLampiran
            setActiveMenu={setActiveMenu}
            onAddLampiran={handleAddLampiran}
          />
        );
      case "Preview":
        return <Preview />;
      case "Generate":
        return <Generate />;
      default:
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">
              {activeMenu}
            </h1>
            <p className="text-gray-600">Konten belum tersedia.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-100">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md">
        <div className="flex items-center justify-center px-6 py-6 border-b border-gray-200">
          <Image src="/images/bank.png" alt="Logo" width={40} height={40} />
          <span className="ml-3 mt-2 text-2xl font-bold text-gray-700">
            TUNTAS
          </span>
        </div>

        <nav className="mt-6 space-y-1 px-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveMenu(item.label)}
              className={`w-full flex items-center p-2 rounded-lg transition ${
                activeMenu === item.label
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Image src={item.icon} alt={item.label} width={22} height={22} />
              <span className="ml-3 flex-1 truncate text-md font-medium text-left">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 bg-blue-50 p-6 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
