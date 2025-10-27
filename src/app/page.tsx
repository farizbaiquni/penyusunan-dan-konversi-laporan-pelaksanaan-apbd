"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Header from "./_components/header";
import Footer from "./_components/footer";
import {
  JenisLaporan,
  StatusDokumenLaporan,
  RangkumanDokumenLaporanTahunan,
} from "./_types/types";
import { useEffect, useState } from "react";
import TambahDokumenModal from "./_components/modals/TambahDokumenModal";
import { getLast5YearsRangkuman } from "./_lib/_queries/rangkuman-tahunan";

export default function HomePage() {
  const [rangkumanTahunanList, setRangkumanTahunanList] = useState<
    RangkumanDokumenLaporanTahunan[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tahunTerbaru = rangkumanTahunanList.length
    ? Math.max(...rangkumanTahunanList.map((d) => d.tahun))
    : new Date().getFullYear();

  const dokumenTerbaru = rangkumanTahunanList.find(
    (d) => d.tahun === tahunTerbaru
  );

  const addRangkumanTahunanList = (
    rangkuman: RangkumanDokumenLaporanTahunan
  ) => {
    setRangkumanTahunanList((prev) => {
      const updated = [
        ...prev.filter((d) => d.tahun !== rangkuman.tahun),
        rangkuman,
      ];
      updated.sort((a, b) => b.tahun - a.tahun);
      return updated;
    });
  };

  const renderStatusBadge = (status: StatusDokumenLaporan) => {
    switch (status) {
      case StatusDokumenLaporan.DIBUAT:
        return "✅ dibuat";
      case StatusDokumenLaporan.BELUM_DIBUAT:
        return "❌  belum dibuat";
      default:
        return "❌ belum dibuat";
    }
  };

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getLast5YearsRangkuman(2023);
        setRangkumanTahunanList(data);
        setError(null);
      } catch (err) {
        console.error("Gagal mengambil data Firestore:", err);
        setError("Gagal memuat data dari Firestore.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const ringkasanDokumenTerbaru = [
    {
      jenisLaporan: JenisLaporan.RAPERDA,
      status:
        dokumenTerbaru?.statusRaperda ?? StatusDokumenLaporan.BELUM_DIBUAT,
      href: "/raperda",
      desc: "Usulan pertanggungjawaban APBD oleh Kepala Daerah kepada DPRD.",
    },
    {
      jenisLaporan: JenisLaporan.PERDA,
      status: dokumenTerbaru?.statusPerda ?? StatusDokumenLaporan.BELUM_DIBUAT,
      href: "/perda",
      desc: "Perda adalah penetapan resmi atas rancangan yang disetujui bersama DPRD.",
    },
    {
      jenisLaporan: JenisLaporan.RAPERBUP,
      status:
        dokumenTerbaru?.statusRaperbup ?? StatusDokumenLaporan.BELUM_DIBUAT,
      href: "/raperbup",
      desc: "Draf rinci Perbup yang menjabarkan substansi teknis Perda.",
    },
    {
      jenisLaporan: JenisLaporan.PERBUP,
      status: dokumenTerbaru?.statusPerbup ?? StatusDokumenLaporan.BELUM_DIBUAT,
      href: "/perbup",
      desc: "Penjabaran Perda APBD, atau dapat ditetapkan langsung oleh Kepala Daerah.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b flex flex-col">
      <Header
        rightContent={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Tambah Dokumen
          </button>
        }
      />

      <div className="flex-1 max-w-7xl mx-auto px-16 py-10 w-full">
        {loading ? (
          // 💠 Skeleton Loading
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
        ) : error ? (
          // ❌ Error State
          <div className="text-center py-10 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        ) : rangkumanTahunanList.length === 0 ? (
          // 🟡 Empty State
          <div className="text-center py-20 text-gray-500">
            <DocumentTextIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p>Belum ada data dokumen laporan.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
            >
              <PlusCircleIcon className="w-5 h-5" /> Tambah Dokumen
            </button>
          </div>
        ) : (
          <>
            {/* Ringkasan Dokumen */}
            <section className="mb-5 mx-auto px-1">
              <div className="flex flex-col bg-blue-100 p-3 rounded-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Ringkasan Dokumen Tahun {tahunTerbaru}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {ringkasanDokumenTerbaru.map((item) => (
                    <Link
                      key={item.jenisLaporan}
                      href={item.href}
                      className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 relative flex flex-col justify-between"
                    >
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full w-max ${
                          item.status === StatusDokumenLaporan.DIBUAT
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {renderStatusBadge(item.status)}
                      </span>

                      <div className="flex items-center gap-3 mt-3 mb-2">
                        <DocumentTextIcon className="w-7 h-7 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.jenisLaporan.toUpperCase()}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.desc}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-600 hover:underline">
                          Lihat Daftar Dokumen
                        </span>
                        <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* Tabel Tahun */}
            <section className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-800 flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-100">
                  Status Dokumen Beberapa Tahun Terakhir
                </h3>
              </div>

              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-300 border-b shadow-sm">
                  <tr className="text-left">
                    <th className="py-3 px-6">Tahun</th>
                    <th className="py-3 px-6">Raperda</th>
                    <th className="py-3 px-6">Perda</th>
                    <th className="py-3 px-6">Raperbup</th>
                    <th className="py-3 px-6">Perbup</th>
                    <th className="py-3 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rangkumanTahunanList.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b hover:bg-blue-50/60 transition-colors"
                    >
                      <td className="py-3 px-6 font-semibold">{r.tahun}</td>
                      <td className="py-3 px-6">
                        {renderStatusBadge(r.statusRaperda)}
                      </td>
                      <td className="py-3 px-6">
                        {renderStatusBadge(r.statusPerda)}
                      </td>
                      <td className="py-3 px-6">
                        {renderStatusBadge(r.statusRaperbup)}
                      </td>
                      <td className="py-3 px-6">
                        {renderStatusBadge(r.statusPerbup)}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <Link
                          href={`/dashboard/${r.tahun}?tahun=${r.tahun}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-all"
                        >
                          <EyeIcon className="w-4 h-4" /> Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>

      {isModalOpen && (
        <TambahDokumenModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          addRangkumanTahunanList={addRangkumanTahunanList}
        />
      )}

      <Footer />
    </main>
  );
}
