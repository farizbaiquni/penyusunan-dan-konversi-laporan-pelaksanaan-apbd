"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import InformasiLaporan from "./components/contents/menu-informasi-laporan";
import BatangTubuh from "./components/contents/menu-batang-tubuh";
import Lampiran from "./components/contents/menu-lampiran";
import Preview from "./components/contents/menu-preview";
import Generate from "./components/contents/menu-generate";
import TambahLampiran from "./components/contents/menu-lampiran-tambah";
import { PDFDocument } from "pdf-lib";
import EditLampiranUtama from "./components/contents/menu-edit-lampiran-utama";

export enum MenuOption {
  INFORMASI_LAPORAN = "informasi-laporan",
  BATANG_TUBUH = "batang-tubuh",
  LAMPIRAN_UTAMA = "lampiran-utama",
  TAMBAH_LAMPIRAN_UTAMA = "Tambah-lampiran-utama",
  EDIT_LAMPIRAN_UTAMA = "Edit-lampiran-utama",
  LAMPIRAN_PENDUKUNG = "lampiran-pendukung",
  PREVIEW = "preview",
  GENERATE = "generate",
}

export interface InformasiDokumenType {
  tahun: number;
  jumlahLampiranUtama: number;
  jumlahLampiranPendukung: number;
  sudahUploadBatangTubuh: boolean;
  jumlahHalaman: number;
  nomorPerdaPerbup: string;
  tanggalPerdaPerbup: string;
  namaBupati: string;
}

interface SidebarLink {
  label: MenuOption;
  href: string;
  icon: string;
  badge?: number;
}

export interface LampiranData {
  id: number;
  urutan: number;
  file: File;
  romawiLampiran: string;
  judulPembatasLampiran: string;
  footerText: string;
  footerWidth: number;
  footerX: number;
  footerY: number;
  fontSize: number;
  footerHeight: number;
  jumlahHalaman: number;
}

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>(
    MenuOption.INFORMASI_LAPORAN
  );

  const [batangTubuhFile, setBatangTubuhFile] = useState<File | null>(null);
  const [batangTubuhURL, setBatangTubuhURL] = useState<string | null>(null);
  const [lampirans, setLampirans] = useState<LampiranData[]>([]);
  const [editedLampiran, setEditedLampiran] = useState<LampiranData | null>(
    null
  );

  const [tahun, setTahun] = useState<number>(2025);
  const [jumlahLampiranUtama, setJumlahLampiranUtama] = useState(0);
  const [jumlahLampiranPendukung, setJumlahLampiranPendukung] = useState(0);
  const [isUploadBatangTubuh, setIsUploadBatangTubuh] = useState<boolean>(
    batangTubuhFile !== null
  );
  const [nomorPerdaPerbup, setNomorPerdaPerbup] = useState<number | null>(null);
  const [namaBupati, setNamaBupati] = useState<string>(
    "Dyah Kartika Permanasari"
  );

  const menuItems: SidebarLink[] = [
    {
      label: MenuOption.INFORMASI_LAPORAN,
      href: "#",
      icon: "/images/edit/informasi.png",
    },
    {
      label: MenuOption.BATANG_TUBUH,
      href: "#",
      icon: "/images/edit/batang-tubuh.png",
    },
    {
      label: MenuOption.LAMPIRAN_UTAMA,
      href: "#",
      icon: "/images/edit/lampiran-utama.png",
      badge: jumlahLampiranUtama,
    },
    {
      label: MenuOption.LAMPIRAN_PENDUKUNG,
      href: "#",
      icon: "/images/edit/lampiran-pendukung.png",
      badge: jumlahLampiranPendukung,
    },
    { label: MenuOption.PREVIEW, href: "#", icon: "/images/edit/preview.png" },
    {
      label: MenuOption.GENERATE,
      href: "#",
      icon: "/images/edit/generate.png",
    },
  ];

  const updateLampiranOrder = (newOrder: LampiranData[]) => {
    setLampirans(newOrder);
  };

  const handleAddLampiran = async (
    data: Omit<LampiranData, "id" | "jumlahHalaman">
  ) => {
    const pages = await getPdfPageCount(data.file);
    const newLampiran: LampiranData = {
      ...data,
      id: Date.now(),
      urutan: lampirans.length + 1,
      jumlahHalaman: pages,
    };
    setLampirans((prev) =>
      [...prev, newLampiran].sort((a, b) => a.urutan - b.urutan)
    );
  };

  const getPdfPageCount = async (file: File): Promise<number> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  };

  const handleDeleteLampiran = (id: number) => {
    setLampirans((prev) => prev.filter((l) => l.id !== id));
  };

  const onEditLampiranUtama = (updatedLampiran: LampiranData) => {
    setLampirans((prev) =>
      prev.map((l) =>
        l.id === updatedLampiran.id ? { ...l, ...updatedLampiran } : l
      )
    );
  };

  const handleOnClickEditLampiran = (lampiran: LampiranData) => {
    setEditedLampiran(lampiran);
    setActiveMenu(MenuOption.EDIT_LAMPIRAN_UTAMA);
  };

  useEffect(() => {
    setIsUploadBatangTubuh(batangTubuhFile !== null);
  }, [batangTubuhFile]);

  const renderContent = () => {
    switch (activeMenu) {
      case MenuOption.INFORMASI_LAPORAN:
        return (
          <InformasiLaporan
            tahun={tahun}
            jumlahLampiranUtama={jumlahLampiranUtama}
            jumlahLampiranPendukung={jumlahLampiranPendukung}
            isUploadBatangTubuh={isUploadBatangTubuh}
            nomorPerdaPerbup={nomorPerdaPerbup}
            namaBupati={namaBupati}
            setTahun={setTahun}
            setNomorPerdaPerbup={setNomorPerdaPerbup}
            setNamaBupati={setNamaBupati}
          />
        );
      case MenuOption.BATANG_TUBUH:
        return (
          <BatangTubuh
            batangTubuhFile={batangTubuhFile}
            setBatangTubuh={(file: File | null) => {
              setBatangTubuhFile(file);
              !file
                ? setBatangTubuhURL(null)
                : setBatangTubuhURL(URL.createObjectURL(file));
            }}
          />
        );

      case MenuOption.LAMPIRAN_UTAMA:
        return (
          <Lampiran
            setActiveMenu={setActiveMenu}
            lampirans={lampirans}
            onDeleteLampiran={handleDeleteLampiran}
            updateLampiranOrder={updateLampiranOrder}
            handleOnClickEditLampiran={handleOnClickEditLampiran}
          />
        );
      case MenuOption.TAMBAH_LAMPIRAN_UTAMA:
        return (
          <TambahLampiran
            setActiveMenu={setActiveMenu}
            onAddLampiran={handleAddLampiran}
          />
        );
      case MenuOption.EDIT_LAMPIRAN_UTAMA:
        if (!editedLampiran) return null;
        return (
          <EditLampiranUtama
            setActiveMenu={setActiveMenu}
            lampiran={editedLampiran}
            onEditLampiranUtama={onEditLampiranUtama}
          />
        );
      case MenuOption.PREVIEW:
        return <Preview batangTubuh={batangTubuhFile} lampirans={lampirans} />;
      case MenuOption.GENERATE:
        // ✅ Pindahkan logika download ke sini
        return <Generate batangTubuh={batangTubuhFile} lampirans={lampirans} />;
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
        <div className="flex items-center justify-center px-6 border-b border-gray-200 py-2">
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
              <span className="ml-3 text-medium flex-1 truncate text-md text-left">
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
