"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";

// === Komponen konten ===
import MenuInformasiLaporan from "./components/contents/MenuInformasiLaporan";
import MenuBatangTubuh from "./components/contents/MenuBatangTubuh";
import Lampiran from "./components/contents/MenuLampiran";
import MenuPreview from "./components/contents/MenuPreview";
import MenuGenerate from "./components/contents/MenuGenerate";
import MenuTambahLampiran from "./components/contents/MenuTambahLampiran";
import MenuEditLampiranUtama from "./components/contents/MenuEditLaporanUtama";
import {
  JenisLaporan,
  LampiranDataPendukung,
  LampiranDataUtama,
  MenuOption,
} from "../_types/types";
import MenuLampiranPendukung from "./components/contents/MenuLampiranPendukung";
import MenuTambahLampiranPendukung from "./components/contents/MenuTambahLampiranPendukung";
import MenuEditLampiranPendukung from "./components/contents/MenuEditLampiranPendukung";

interface SidebarLink {
  label: MenuOption;
  icon: string;
  badge?: number;
}

// === CUSTOM HOOK UNTUK LAMPIRAN ===
function useLampiranManager() {
  const [lampirans, setLampirans] = useState<LampiranDataUtama[]>([]);
  const [editedLampiran, setEditedLampiran] =
    useState<LampiranDataUtama | null>(null);

  const addLampiran = async (newLampiran: LampiranDataUtama) => {
    setLampirans((prev) =>
      [...prev, newLampiran].sort((a, b) => a.urutan - b.urutan)
    );
  };

  const updateLampiran = (updated: LampiranDataUtama) => {
    setLampirans((prev) =>
      prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
    );
  };

  const deleteLampiran = (id: string) => {
    setLampirans((prev) => prev.filter((l) => l.id !== id));
  };

  const reorderLampiran = (newOrder: LampiranDataUtama[]) => {
    setLampirans(newOrder);
  };

  return {
    lampirans,
    editedLampiran,
    setEditedLampiran,
    addLampiran,
    updateLampiran,
    deleteLampiran,
    reorderLampiran,
  };
}

// === SIDEBAR ===
const Sidebar: React.FC<{
  activeMenu: MenuOption;
  setActiveMenu: (menu: MenuOption) => void;
  items: SidebarLink[];
}> = React.memo(({ activeMenu, setActiveMenu, items }) => (
  <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md">
    <div className="flex items-center justify-center px-6 border-b border-gray-200 py-2 mt-2">
      <Image src="/images/bank.png" alt="Logo" width={40} height={40} />
      <span className="ml-3 mt-2 text-2xl font-bold text-gray-700">TUNTAS</span>
    </div>

    <nav className="mt-6 space-y-1 px-4">
      {items.map((item) => (
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
          <span className="ml-3 flex-1 truncate text-md text-left">
            {item.label}
          </span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 rounded-full">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  </aside>
));
Sidebar.displayName = "Sidebar";

// === KOMPONEN UTAMA ===
export default function Home() {
  const [jenisLaporan, setJenisLaporan] = useState<JenisLaporan>(
    JenisLaporan.RAPERDA
  );
  const [editedLampiranPendukung, setEditedLampiranPendukung] =
    useState<LampiranDataPendukung | null>(null);
  const [activeMenu, setActiveMenu] = useState<MenuOption>(
    MenuOption.INFORMASI_LAPORAN
  );
  const [batangTubuhFile, setBatangTubuhFile] = useState<File | null>(null);
  const [isUploadBatangTubuh, setIsUploadBatangTubuh] = useState(false);
  const [lampiransPendukung, setLampiransPendukung] = useState<
    LampiranDataPendukung[]
  >([]);

  const [tahun, setTahun] = useState(2025);
  const [nomorPerdaPerbup, setNomorPerdaPerbup] = useState<number | null>(null);
  const [namaBupati, setNamaBupati] = useState("Dyah Kartika Permanasari");

  const {
    lampirans,
    editedLampiran,
    setEditedLampiran,
    addLampiran,
    updateLampiran,
    deleteLampiran,
    reorderLampiran,
  } = useLampiranManager();

  const jumlahLampiranUtama = lampirans.length;
  const jumlahLampiranPendukung = 0;

  const deleteLampiranPendukung = (id: string) => {
    setLampiransPendukung((prev) => prev.filter((l) => l.id !== id));
  };

  const addLampiranPendukung = async (newLampiran: LampiranDataPendukung) => {
    setLampiransPendukung((prev) =>
      [...prev, newLampiran].sort((a, b) => a.urutan - b.urutan)
    );
  };

  const updateLampiranPendukung = (updated: LampiranDataPendukung) => {
    setLampiransPendukung((prev) =>
      prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
    );
  };

  useEffect(() => {
    setIsUploadBatangTubuh(batangTubuhFile !== null);
  }, [batangTubuhFile]);

  const menuItems = useMemo<SidebarLink[]>(
    () => [
      {
        label: MenuOption.INFORMASI_LAPORAN,
        icon: "/images/edit/informasi.png",
      },
      { label: MenuOption.BATANG_TUBUH, icon: "/images/edit/batang-tubuh.png" },
      {
        label: MenuOption.LAMPIRAN_UTAMA,
        icon: "/images/edit/lampiran-utama.png",
        badge: jumlahLampiranUtama,
      },
      {
        label: MenuOption.LAMPIRAN_PENDUKUNG,
        icon: "/images/edit/lampiran-pendukung.png",
        badge: jumlahLampiranPendukung,
      },
      { label: MenuOption.PREVIEW, icon: "/images/edit/preview.png" },
      { label: MenuOption.GENERATE, icon: "/images/edit/generate.png" },
    ],
    [jumlahLampiranUtama, jumlahLampiranPendukung]
  );

  const getMenuComponent = () => {
    switch (activeMenu) {
      case MenuOption.INFORMASI_LAPORAN:
        return (
          <MenuInformasiLaporan
            jenisLaporan={jenisLaporan}
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
          <MenuBatangTubuh
            jenisLaporan={jenisLaporan}
            batangTubuhFile={batangTubuhFile}
            setBatangTubuh={(file) => setBatangTubuhFile(file)}
          />
        );

      case MenuOption.LAMPIRAN_UTAMA:
        return (
          <Lampiran
            jenisLaporan={jenisLaporan}
            setActiveMenu={setActiveMenu}
            lampirans={lampirans}
            onDeleteLampiran={deleteLampiran}
            updateLampiranOrder={reorderLampiran}
            handleOnClickEditLampiran={(lampiran) => {
              setEditedLampiran(lampiran);
              setActiveMenu(MenuOption.EDIT_LAMPIRAN_UTAMA);
            }}
          />
        );

      case MenuOption.TAMBAH_LAMPIRAN_UTAMA:
        return (
          <MenuTambahLampiran
            jenisLaporan={jenisLaporan}
            setActiveMenu={setActiveMenu}
            onAddLampiran={addLampiran}
            urutanLampiran={lampirans.length + 1}
          />
        );

      case MenuOption.EDIT_LAMPIRAN_UTAMA:
        return editedLampiran ? (
          <MenuEditLampiranUtama
            setActiveMenu={setActiveMenu}
            lampiran={editedLampiran}
            onEditLampiranUtama={updateLampiran}
          />
        ) : (
          <p>File belum dipilih</p>
        );

      case MenuOption.LAMPIRAN_PENDUKUNG:
        return (
          <MenuLampiranPendukung
            jenisLaporan={jenisLaporan}
            setActiveMenu={setActiveMenu}
            lampirans={lampiransPendukung}
            onDeleteLampiran={deleteLampiranPendukung}
            updateLampiranOrder={setLampiransPendukung}
            handleOnClickEditLampiran={(lampiran) => {
              setEditedLampiranPendukung(lampiran);
              setActiveMenu(MenuOption.EDIT_LAMPIRAN_PENDUKUNG);
            }}
          />
        );

      case MenuOption.TAMBAH_LAMPIRAN_PENDUKUNG:
        return (
          <MenuTambahLampiranPendukung
            jenisLaporan={jenisLaporan}
            setActiveMenu={setActiveMenu}
            onAddLampiran={addLampiranPendukung}
            urutanLampiran={lampiransPendukung.length + 1}
          />
        );

      case MenuOption.EDIT_LAMPIRAN_PENDUKUNG:
        return (
          editedLampiranPendukung && (
            <MenuEditLampiranPendukung
              jenisLaporan={jenisLaporan}
              setActiveMenu={setActiveMenu}
              lampiran={editedLampiranPendukung}
              onEditLampiranPendukung={updateLampiranPendukung}
            />
          )
        );

      case MenuOption.PREVIEW:
        return (
          <MenuPreview
            batangTubuh={batangTubuhFile}
            lampirans={lampirans}
            lampiransPendukung={lampiransPendukung}
          />
        );

      case MenuOption.GENERATE:
        return (
          <MenuGenerate batangTubuh={batangTubuhFile} lampirans={lampirans} />
        );

      default:
        return <div className="p-6 text-gray-500">Konten belum tersedia.</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-100">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        items={menuItems}
      />
      <main className="ml-64 flex-1 bg-blue-50 p-6 overflow-y-auto">
        {getMenuComponent()}
      </main>
    </div>
  );
}
