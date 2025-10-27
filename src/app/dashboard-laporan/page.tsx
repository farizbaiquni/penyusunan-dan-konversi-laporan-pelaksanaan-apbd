"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// === Komponen konten ===
import MenuInformasiLaporan from "./components/contents/MenuInformasiLaporan";
import MenuBatangTubuh from "./components/contents/MenuBatangTubuh";
import Lampiran from "./components/contents/MenuLampiran";
import MenuPreview from "./components/contents/MenuPreview";
import MenuGenerate from "./components/contents/MenuGenerate";
import MenuTambahLampiran from "./components/contents/MenuTambahLampiran";
import MenuEditLampiranUtama from "./components/contents/MenuEditLaporanUtama";
import MenuLampiranPendukung from "./components/contents/MenuLampiranPendukung";
import MenuTambahLampiranPendukung from "./components/contents/MenuTambahLampiranPendukung";
import MenuEditLampiranPendukung from "./components/contents/MenuEditLampiranPendukung";

import {
  JenisLaporan,
  LampiranDataPendukung,
  LampiranDataUtama,
  MenuOption,
} from "../_types/types";
import { getDokumenLaporanByTahunAndJenisLaporanWithLampirans } from "../_lib/_queries/dokument-laporan";
import { useRouter } from "next/navigation";
import { deleteLampiranUtamaFirestore } from "../_lib/_queries/lampiran";
import { getJenisLaporanfromString } from "../_utils/general";
import LoadingProcessing from "../_components/LoadingProcessing";

// === CUSTOM HOOK GENERIK UNTUK LAMPIRAN ===
function useLampiranManager<T extends { id: string; urutan: number }>(
  onLoadingChange?: (isLoading: boolean) => void
) {
  const [lampirans, setLampirans] = useState<T[]>([]);
  const [editedLampiran, setEditedLampiran] = useState<T | null>(null);

  // Tambah lampiran baru
  const addLampiran = (newLampiran: T) => {
    setLampirans((prev) =>
      [...prev, newLampiran].sort((a, b) => a.urutan - b.urutan)
    );
  };

  // Update lampiran di state
  const updateLampiran = (updated: T) => {
    setLampirans((prev) =>
      prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
    );
  };

  // Hapus lampiran
  const deleteLampiran = async (
    lampiranId: string,
    dokumenIdFirestore: string,
    tahun: number,
    jenisLaporan: string
  ) => {
    try {
      onLoadingChange?.(true); // ⬅️ aktifkan loading sebelum mulai delete
      const { success } = await deleteLampiranUtamaFirestore(
        dokumenIdFirestore,
        lampiranId
      );
      if (!success) {
        alert("Gagal menghapus lampiran di database");
      } else {
        const url = `/api/delete-lampiran-utama?tahun=${tahun}&jenisLaporan=${jenisLaporan}&namaFile=${lampiranId}`;
        await fetch(url, { method: "DELETE" });
        setLampirans((prev) => prev.filter((l) => l.id !== lampiranId));
        alert(`Lampiran berhasil dihapus!`);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus lampiran.");
    } finally {
      onLoadingChange?.(false); // ⬅️ matikan loading setelah selesai
    }
  };

  // Reorder lampiran
  const reorderLampiran = (newOrder: T[]) => {
    setLampirans(newOrder);
  };

  // Set lampiran sekaligus dengan urutan
  const setLampiransWithOrder = (lampirans: T[]) => {
    setLampirans(lampirans.sort((a, b) => a.urutan - b.urutan));
  };

  return {
    lampirans,
    editedLampiran,
    setEditedLampiran,
    addLampiran,
    updateLampiran,
    deleteLampiran,
    reorderLampiran,
    setLampiransWithOrder,
  };
}

// === SIDEBAR ===
interface SidebarLink {
  label: MenuOption;
  icon: string;
  badge?: number;
}

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const jenisLaporanParam = searchParams.get("jenisLaporan");
  const tahunParam = searchParams.get("tahun");

  const [jenisLaporan, setJenisLaporan] = useState<JenisLaporan>(
    getJenisLaporanfromString(jenisLaporanParam || "raperda")
  );
  const [activeMenu, setActiveMenu] = useState<MenuOption>(
    MenuOption.INFORMASI_LAPORAN
  );
  const [dokumenIdFirestore, setDokumenIdFirestore] = useState("");
  const [batangTubuhFile, setBatangTubuhFile] = useState<File | null>(null);
  const [batangTubuhUrl, setBatangTubuhUrl] = useState<string | null>(null);
  const [tahun, setTahun] = useState(
    tahunParam ? parseInt(tahunParam, 10) : new Date().getFullYear()
  );
  const [nomorPerdaPerbup, setNomorPerdaPerbup] = useState<number | null>(null);
  const [namaBupati, setNamaBupati] = useState("Dyah Kartika Permanasari");

  // Lampiran utama
  const lampiranUtamaManager =
    useLampiranManager<LampiranDataUtama>(setIsLoadingDelete);
  // Lampiran pendukung
  const lampiranPendukungManager = useLampiranManager<LampiranDataPendukung>();

  const isUploadBatangTubuh = !!batangTubuhFile;

  const menuItems: SidebarLink[] = useMemo(
    () => [
      {
        label: MenuOption.INFORMASI_LAPORAN,
        icon: "/images/edit/informasi.png",
      },
      { label: MenuOption.BATANG_TUBUH, icon: "/images/edit/batang-tubuh.png" },
      {
        label: MenuOption.LAMPIRAN_UTAMA,
        icon: "/images/edit/lampiran-utama.png",
        badge: lampiranUtamaManager.lampirans.length,
      },
      {
        label: MenuOption.LAMPIRAN_PENDUKUNG,
        icon: "/images/edit/lampiran-pendukung.png",
        badge: lampiranPendukungManager.lampirans.length,
      },
      { label: MenuOption.PREVIEW, icon: "/images/edit/preview.png" },
      { label: MenuOption.GENERATE, icon: "/images/edit/generate.png" },
    ],
    [
      lampiranUtamaManager.lampirans.length,
      lampiranPendukungManager.lampirans.length,
    ]
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await getDokumenLaporanByTahunAndJenisLaporanWithLampirans(
        tahun,
        jenisLaporan
      ).then((dokumenLaporan) => {
        if (dokumenLaporan.length > 0) {
          const dokumenLaporanData = dokumenLaporan[0];
          setDokumenIdFirestore(dokumenLaporanData.id);
          setJenisLaporan(dokumenLaporanData.jenisLaporan);
          setBatangTubuhUrl(dokumenLaporanData.batangTubuh);
          setNomorPerdaPerbup(dokumenLaporanData.nomor);
          lampiranUtamaManager.setLampiransWithOrder(
            dokumenLaporanData.lampirans
          );
          lampiranPendukungManager.setLampiransWithOrder(
            dokumenLaporanData.lampiransPendukung
          );
        } else {
          const message = "Dokumen laporan " + tahun + " tidak ditemukan.";
          router.push(`/`);
          alert(message);
        }
        setLoading(false);
      });
    }
    fetchData();
  }, []);

  const menuComponents: Partial<Record<MenuOption, React.ReactNode>> = {
    [MenuOption.INFORMASI_LAPORAN]: (
      <MenuInformasiLaporan
        jenisLaporan={jenisLaporan}
        tahun={tahun}
        jumlahLampiranUtama={lampiranUtamaManager.lampirans.length}
        jumlahLampiranPendukung={lampiranPendukungManager.lampirans.length}
        isUploadBatangTubuh={isUploadBatangTubuh}
        nomorPerdaPerbup={nomorPerdaPerbup}
        namaBupati={namaBupati}
        setTahun={setTahun}
        setNomorPerdaPerbup={setNomorPerdaPerbup}
        setNamaBupati={setNamaBupati}
      />
    ),
    [MenuOption.BATANG_TUBUH]: (
      <MenuBatangTubuh
        jenisLaporan={jenisLaporan}
        batangTubuhFile={batangTubuhFile}
        setBatangTubuh={setBatangTubuhFile}
      />
    ),
    [MenuOption.LAMPIRAN_UTAMA]: (
      <Lampiran
        jenisLaporan={jenisLaporan}
        setActiveMenu={setActiveMenu}
        lampirans={lampiranUtamaManager.lampirans}
        onDeleteLampiran={(lampiranId) =>
          lampiranUtamaManager.deleteLampiran(
            lampiranId,
            dokumenIdFirestore,
            tahun,
            jenisLaporan
          )
        }
        updateLampiranOrder={lampiranUtamaManager.reorderLampiran}
        handleOnClickEditLampiran={(lampiran) => {
          lampiranUtamaManager.setEditedLampiran(lampiran);
          setActiveMenu(MenuOption.EDIT_LAMPIRAN_UTAMA);
        }}
      />
    ),
    [MenuOption.TAMBAH_LAMPIRAN_UTAMA]: (
      <MenuTambahLampiran
        jenisLaporan={jenisLaporan}
        setActiveMenu={setActiveMenu}
        onAddLampiran={lampiranUtamaManager.addLampiran}
        urutanLampiran={lampiranUtamaManager.lampirans.length + 1}
        tahun={tahun}
        dokumenIdFirestore={dokumenIdFirestore}
      />
    ),
    [MenuOption.EDIT_LAMPIRAN_UTAMA]: lampiranUtamaManager.editedLampiran ? (
      <MenuEditLampiranUtama
        dokumenId={dokumenIdFirestore}
        setActiveMenu={setActiveMenu}
        lampiran={lampiranUtamaManager.editedLampiran}
        onEditLampiranUtama={lampiranUtamaManager.updateLampiran}
      />
    ) : (
      <p>File belum dipilih</p>
    ),
    [MenuOption.LAMPIRAN_PENDUKUNG]: (
      <MenuLampiranPendukung
        jenisLaporan={jenisLaporan}
        setActiveMenu={setActiveMenu}
        lampirans={lampiranPendukungManager.lampirans}
        onDeleteLampiran={(lampiranId) =>
          lampiranUtamaManager.deleteLampiran(
            lampiranId,
            dokumenIdFirestore,
            tahun,
            jenisLaporan
          )
        }
        updateLampiranOrder={lampiranPendukungManager.reorderLampiran}
        handleOnClickEditLampiran={(lampiran) => {
          lampiranPendukungManager.setEditedLampiran(lampiran);
          setActiveMenu(MenuOption.EDIT_LAMPIRAN_PENDUKUNG);
        }}
      />
    ),
    [MenuOption.TAMBAH_LAMPIRAN_PENDUKUNG]: (
      <MenuTambahLampiranPendukung
        jenisLaporan={jenisLaporan}
        setActiveMenu={setActiveMenu}
        onAddLampiran={lampiranPendukungManager.addLampiran}
        urutanLampiran={lampiranPendukungManager.lampirans.length + 1}
      />
    ),
    [MenuOption.EDIT_LAMPIRAN_PENDUKUNG]:
      lampiranPendukungManager.editedLampiran ? (
        <MenuEditLampiranPendukung
          jenisLaporan={jenisLaporan}
          setActiveMenu={setActiveMenu}
          lampiran={lampiranPendukungManager.editedLampiran}
          onEditLampiranPendukung={lampiranPendukungManager.updateLampiran}
        />
      ) : (
        <p>File belum dipilih</p>
      ),
    [MenuOption.PREVIEW]: (
      <MenuPreview
        batangTubuh={batangTubuhFile}
        lampirans={lampiranUtamaManager.lampirans}
        lampiransPendukung={lampiranPendukungManager.lampirans}
      />
    ),
    [MenuOption.GENERATE]: (
      <MenuGenerate
        batangTubuh={batangTubuhFile}
        lampirans={lampiranUtamaManager.lampirans}
      />
    ),
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
      </div>
      <div className="h-5 bg-gray-300 rounded w-1/2 mt-6"></div>
      <div className="h-64 bg-gray-200 rounded-md mt-3"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-yellow-100">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        items={menuItems}
      />
      <main className="ml-64 flex-1 bg-blue-50 p-6 overflow-y-auto">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          menuComponents[activeMenu] ?? (
            <div className="p-6 text-gray-500">Konten belum tersedia.</div>
          )
        )}
      </main>
      {isLoadingDelete && <LoadingProcessing message="Menghapus lampiran..." />}
    </div>
  );
}
