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

// ✅ Data ringkasan tahunan (tabel & ringkasan)
const rangkumanTahunanTemplate: RangkumanDokumenLaporanTahunan[] = [
  {
    id: "tahun-2023",
    tahun: 2023,
    statusRaperda: StatusDokumenLaporan.PROSES,
    statusPerda: StatusDokumenLaporan.BELUM_DIBUAT,
    statusRaperbup: StatusDokumenLaporan.PROSES,
    statusPerbup: StatusDokumenLaporan.BELUM_DIBUAT,
  },
  {
    id: "tahun-2022",
    tahun: 2022,
    statusRaperda: StatusDokumenLaporan.SELESAI,
    statusPerda: StatusDokumenLaporan.SELESAI,
    statusRaperbup: StatusDokumenLaporan.SELESAI,
    statusPerbup: StatusDokumenLaporan.SELESAI,
  },
  {
    id: "tahun-2021",
    tahun: 2021,
    statusRaperda: StatusDokumenLaporan.SELESAI,
    statusPerda: StatusDokumenLaporan.SELESAI,
    statusRaperbup: StatusDokumenLaporan.SELESAI,
    statusPerbup: StatusDokumenLaporan.SELESAI,
  },
];

export default function HomePage() {
  // Ambil tahun terbaru
  const [rangkumanTahunanList, setRangkumanTahunanList] = useState<
    RangkumanDokumenLaporanTahunan[]
  >([]);
  const tahunTerbaru = Math.max(...rangkumanTahunanList.map((d) => d.tahun));
  const dokumenTerbaru = rangkumanTahunanList.find(
    (d) => d.tahun === tahunTerbaru
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const addRangkumanTahunanList = (
    rangkumanTahunan: RangkumanDokumenLaporanTahunan
  ) => {
    alert(rangkumanTahunan.tahun);
    setRangkumanTahunanList((prev) =>
      prev.filter((d) => d.tahun !== rangkumanTahunan.tahun)
    );
  };

  // Ringkasan dokumen berdasarkan tahun terbaru
  const ringkasanDokumenTerbaru = [
    {
      jenisLaporan: JenisLaporan.RAPERDA,
      status:
        dokumenTerbaru?.statusRaperda ?? StatusDokumenLaporan.BELUM_DIBUAT,
      href: "/raperda",
      desc: "Usulan pertanggungjawaban APBD yang diajukan Kepala Daerah kepada DPRD untuk mendapat persetujuan bersama.",
    },
    {
      jenisLaporan: JenisLaporan.PERDA,
      status: dokumenTerbaru?.statusPerda ?? StatusDokumenLaporan.BELUM_DIBUAT,
      href: "/perda",
      desc: "Perda adalah penetapan resmi Kepala Daerah atas rancangan yang telah disetujui bersama oleh DPRD dan gubernur.",
    },
    {
      jenisLaporan: JenisLaporan.RAPERBUP,
      status:
        dokumenTerbaru?.statusRaperbup ?? StatusDokumenLaporan.BELUM_DIBUAT,
      href: "/raperbup",
      desc: "Draf rinci yang disiapkan Kepala Daerah untuk menjabarkan secara teknis substansi Perda pertanggungjawaban pelaksanaan APBD.",
    },
    {
      jenisLaporan: JenisLaporan.PERBUP,
      status: dokumenTerbaru?.statusPerbup ?? StatusDokumenLaporan.BELUM_DIBUAT,
      href: "/perbup",
      desc: "Dokumen penetapan rinci (penjabaran) Perda pertanggungjawaban APBD, atau dapat ditetapkan langsung oleh Kepala Daerah jika tidak tercapai persetujuan bersama dengan DPRD dalam batas waktu yang ditentukan.",
    },
  ];

  // Helper badge
  const renderStatusBadge = (status: StatusDokumenLaporan) => {
    switch (status) {
      case StatusDokumenLaporan.SELESAI:
        return "✅ selesai";
      case StatusDokumenLaporan.PROSES:
        return "🕓 proses";
      case StatusDokumenLaporan.BELUM_DIBUAT:
        return "❌ belum dibuat";
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: RangkumanDokumenLaporanTahunan[] =
          await getLast5YearsRangkuman(2023);
        console.log(data);
        setRangkumanTahunanList(data);
      } catch (err) {
        console.error("Gagal mengambil data Firestore:", err);
      } finally {
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b flex flex-col">
      <Header
        rightContent={
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex cursor-pointer items-center text-sm gap-2 bg-blue-600 text-white font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Tambah Dokumen
          </div>
        }
      />

      <div className="flex-1 max-w-7xl mx-auto px-16 py-10 w-full">
        {/* Ringkasan dokumen */}
        <section className="mb-5 mx-auto px-1">
          <div className="flex flex-col bg-blue-100 p-3 rounded-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Ringkasan Dokumen Tahun {tahunTerbaru}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ringkasanDokumenTerbaru.map((item) => (
                <div key={item.jenisLaporan} className="relative group">
                  <Link
                    href={item.href}
                    className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden border border-gray-100 relative"
                  >
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full w-max ${
                        item.status === StatusDokumenLaporan.SELESAI
                          ? "bg-green-100 text-green-700"
                          : item.status === StatusDokumenLaporan.PROSES
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {renderStatusBadge(item.status)}
                    </span>

                    {/* Icon & Title */}
                    <div className="flex items-center gap-3 mt-3 mb-2">
                      <DocumentTextIcon className="w-7 h-7 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.jenisLaporan.toUpperCase()}
                      </h3>
                    </div>

                    {/* Description (2 baris, ellipsis) */}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2 group-hover:cursor-pointer">
                      {item.desc}
                    </p>

                    {/* Link */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 group-hover:underline">
                        Lihat Daftar Dokumen
                      </span>
                      <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-all" />
                    </div>
                  </Link>

                  {/* Tooltip di bawah card */}
                  <div className="absolute z-50 hidden group-hover:block top-full left-1/2 mt-2 -translate-x-1/2 w-64 bg-white border border-gray-200 text-gray-700 text-sm p-3 rounded-md shadow-lg">
                    {item.desc}
                    {/* Segitiga kecil di atas tooltip */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tabel tahunan */}
        <section className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-800 flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-100">
              Status Dokumen Beberapa Tahun Terakhir
            </h3>
            <Link
              href="#"
              className="text-sm font-semibold text-blue-100 hover:underline transition-colors"
            >
              Lihat Semua
            </Link>
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
                  <td className="py-3 px-6 font-medium">
                    {renderStatusBadge(r.statusRaperda)}
                  </td>
                  <td className="py-3 px-6 font-medium">
                    {renderStatusBadge(r.statusPerda)}
                  </td>
                  <td className="py-3 px-6 font-medium">
                    {renderStatusBadge(r.statusRaperbup)}
                  </td>
                  <td className="py-3 px-6 font-medium">
                    {renderStatusBadge(r.statusPerbup)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <Link
                      href={`/dashboard/${r.tahun}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-all"
                      aria-label={`Lihat dokumen tahun ${r.tahun}`}
                    >
                      <EyeIcon className="w-4 h-4" />
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Modal */}
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
