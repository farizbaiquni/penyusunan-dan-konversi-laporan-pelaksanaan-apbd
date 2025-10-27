"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  HomeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import {
  JenisLaporan,
  StatusDokumenLaporan,
  DokumenLaporan,
} from "@/app/_types/types";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import { getDokumenLaporanByTahun } from "@/app/_lib/_queries/dokument-laporan";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tahunParam = searchParams.get("tahun");
  const jenisLaporanParam = searchParams.get("jenis-laporan");

  const tahun = tahunParam
    ? parseInt(tahunParam, 10)
    : new Date().getFullYear();

  const [documents, setDocuments] = useState<DokumenLaporan[]>([]);
  const [loading, setLoading] = useState(true);

  const templateDokumenLaporanList: DokumenLaporan[] = [
    {
      id: v4(),
      jenisLaporan: JenisLaporan.RAPERDA,
      tahun,
      nomor: null,
      tanggalPengesahan: null,
      status: StatusDokumenLaporan.BELUM_DIBUAT,
      batangTubuh: null,
      lampirans: [],
      lampiransPendukung: [],
      lastUpdated: null,
    },
    {
      id: v4(),
      jenisLaporan: JenisLaporan.RAPERBUP,
      tahun,
      nomor: null,
      tanggalPengesahan: null,
      status: StatusDokumenLaporan.BELUM_DIBUAT,
      batangTubuh: null,
      lampirans: [],
      lampiransPendukung: [],
      lastUpdated: null,
    },
    {
      id: v4(),
      jenisLaporan: JenisLaporan.PERDA,
      tahun,
      nomor: null,
      tanggalPengesahan: null,
      status: StatusDokumenLaporan.BELUM_DIBUAT,
      batangTubuh: null,
      lampirans: [],
      lampiransPendukung: [],
      lastUpdated: null,
    },
    {
      id: v4(),
      jenisLaporan: JenisLaporan.PERBUP,
      tahun,
      nomor: null,
      tanggalPengesahan: null,
      status: StatusDokumenLaporan.BELUM_DIBUAT,
      batangTubuh: null,
      lampirans: [],
      lampiransPendukung: [],
      lastUpdated: null,
    },
  ];

  function formatTanggal(
    dateValue: Date | { toDate?: () => Date } | null
  ): string {
    if (!dateValue) return "-";

    // Jika Firestore Timestamp, ubah ke Date
    const dateObj =
      typeof (dateValue as { toDate?: () => Date }).toDate === "function"
        ? (dateValue as { toDate: () => Date }).toDate()
        : (dateValue as Date);

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const formattedString = dateObj.toLocaleString("id-ID", options);

    // sedikit rapikan agar hasilnya mirip format umum: "Senin, 26 Oktober 2025 14:33:21"
    const result = formattedString.replace(" pukul ", " ").replace(", ", ", ");
    return result;
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const fetchedDocs = await getDokumenLaporanByTahun(tahun);

        // Merge dengan template agar semua jenis laporan muncul
        const merged = templateDokumenLaporanList.map((tpl) => {
          const found = fetchedDocs.find(
            (f) =>
              f.jenisLaporan.toLowerCase() === tpl.jenisLaporan.toLowerCase()
          );
          return found || tpl;
        });

        setDocuments(merged);
      } catch (err) {
        console.error("🔥 Gagal memuat dokumen:", err);
        setDocuments(templateDokumenLaporanList);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tahun]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header rightContent={null} />

      <div className="flex flex-col w-full px-9">
        {/* Breadcrumb */}
        <nav className="w-full px-6 py-1 text-sm text-gray-600 flex items-center gap-1 rounded-sm mt-2">
          <HomeIcon className="w-4 h-4" />
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-800">{tahun}</span>
        </nav>

        <div className="w-full mx-auto px-6 flex flex-col gap-x-8 py-6">
          <h1 className="font-extrabold text-lg mb-5 text-blue-950">
            DOKUMEN LAPORAN PERTANGGUNGJAWABAN APBD TAHUN {tahun}
          </h1>

          {loading ? (
            <div className="text-gray-500 text-center py-10">
              🔄 Memuat data dari Firestore...
            </div>
          ) : (
            <>
              {/* Ringkasan Dokumen */}
              <section className="w-full mx-auto pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {documents.map((doc) => {
                  const statusColors = {
                    [StatusDokumenLaporan.DIBUAT]:
                      "bg-green-100 text-green-700 border-green-200",
                    [StatusDokumenLaporan.BELUM_DIBUAT]:
                      "bg-red-100 text-red-600 border-red-200",
                  } as const;

                  const Icon = DocumentTextIcon;
                  const statusClass = statusColors[doc.status];

                  return (
                    <div
                      key={doc.id}
                      className="group relative bg-white border border-gray-100 rounded-md px-6 py-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors duration-300">
                          <Icon className="w-8 h-8 text-blue-700" />
                        </div>
                        <div>
                          <h3 className="text-md font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                            {doc.jenisLaporan.toUpperCase()}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-2xl text-xs font-medium border ${statusClass}`}
                          >
                            {doc.status === StatusDokumenLaporan.DIBUAT && "✅"}
                            {doc.status === StatusDokumenLaporan.BELUM_DIBUAT &&
                              "❌"}
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Tabel File */}
              <section className="bg-white border border-gray-100 rounded-md shadow-md overflow-x-auto p-6">
                <h3 className="font-semibold text-gray-800 mb-6">
                  File Dokumen Detail
                </h3>
                <table className="min-w-full text-sm text-gray-700 border-collapse outline-1 outline-gray-500">
                  <thead>
                    <tr className="bg-gray-700 border-b border-gray-500 text-gray-200">
                      <th className="py-3 px-4 text-left font-semibold">
                        Jenis
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">
                        Update Terakhir
                      </th>
                      <th className="py-3 px-4 text-center font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => {
                      const statusColor =
                        doc.status === StatusDokumenLaporan.DIBUAT
                          ? "text-green-700"
                          : "text-red-600";

                      const isDisabled =
                        doc.status === StatusDokumenLaporan.BELUM_DIBUAT;

                      return (
                        <tr
                          key={doc.id}
                          className={`border-b ${
                            !isDisabled ? "hover:bg-blue-50" : "bg-gray-50/50"
                          } transition`}
                        >
                          <td className="py-3 px-4 font-medium">
                            {doc.jenisLaporan.toUpperCase()}
                          </td>
                          <td className={`py-3 px-4 ${statusColor}`}>
                            {doc.status}
                          </td>
                          <td className="py-3 px-4">
                            {formatTanggal(doc.lastUpdated)}
                          </td>
                          <td className="py-3 px-4 text-center flex justify-center gap-2">
                            <Link
                              href={"#"}
                              className={`p-2 rounded-lg transition ${
                                isDisabled
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              }`}
                              aria-disabled={isDisabled}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>

                            <Link
                              href={`/dashboard-laporan?tahun=${tahunParam}&jenis-laporan=${doc.jenisLaporan}`}
                              className={`p-2 rounded-lg transition ${
                                isDisabled
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                              }`}
                              aria-disabled={isDisabled}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </Link>

                            <button
                              disabled={isDisabled}
                              className={`p-2 rounded-lg transition ${
                                isDisabled
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
