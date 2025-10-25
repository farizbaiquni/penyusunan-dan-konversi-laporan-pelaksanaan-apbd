"use client";

import Link from "next/link";
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
import { useState } from "react";

export default function DashboardPage() {
  const dokumenLaporanList: DokumenLaporan[] = [
    {
      id: "1",
      jenisLaporan: JenisLaporan.RAPERDA,
      tahun: 2025,
      nomor: 12,
      tanggalPengesahan: "2025-03-01",
      status: StatusDokumenLaporan.PROSES,
      batangTubuh: null,
      lampirans: [],
      lampiransPendukung: [],
      lastUpdated: "2025-10-20",
    },
    {
      id: "2",
      jenisLaporan: JenisLaporan.RAPERBUP,
      tahun: 2025,
      nomor: null,
      tanggalPengesahan: "-",
      status: StatusDokumenLaporan.BELUM_DIBUAT,
      batangTubuh: null,
      lampirans: [],
      lampiransPendukung: [],
      lastUpdated: null,
    },
    {
      id: "3",
      jenisLaporan: JenisLaporan.PERDA,
      tahun: 2025,
      nomor: null,
      tanggalPengesahan: "-",
      status: StatusDokumenLaporan.BELUM_DIBUAT,
      batangTubuh: null,
      lampirans: [],
      lampiransPendukung: [],
      lastUpdated: null,
    },
  ];

  const [tahun, setTahun] = useState(2025);

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

          {/* Ringkasan Dokumen */}
          <section className="w-full mx-auto pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dokumenLaporanList.map((doc) => {
              const statusColors = {
                [StatusDokumenLaporan.SELESAI]:
                  "bg-green-100 text-green-700 border-green-200",
                [StatusDokumenLaporan.PROSES]:
                  "bg-yellow-100 text-yellow-700 border-yellow-200",
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
                        {doc.status === StatusDokumenLaporan.SELESAI && "✅"}
                        {doc.status === StatusDokumenLaporan.PROSES && "🕓"}
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
                  <th className="py-3 px-4 text-left font-semibold">Jenis</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Update Terakhir
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dokumenLaporanList.map((doc) => {
                  const statusColor =
                    doc.status === StatusDokumenLaporan.SELESAI
                      ? "text-green-700"
                      : doc.status === StatusDokumenLaporan.PROSES
                      ? "text-yellow-700"
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
                        {doc.lastUpdated ? doc.lastUpdated : "-"}
                      </td>
                      <td className="py-3 px-4 text-center flex justify-center gap-2">
                        <Link
                          href={
                            !isDisabled
                              ? `/${doc.jenisLaporan.toLowerCase()}/${tahun}/view`
                              : "#"
                          }
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
                          href={
                            !isDisabled
                              ? `/${doc.jenisLaporan.toLowerCase()}/${tahun}/edit`
                              : "#"
                          }
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
        </div>
      </div>

      <Footer />
    </main>
  );
}
