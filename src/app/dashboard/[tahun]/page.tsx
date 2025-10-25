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
import { use } from "react"; // ✅ pakai hook 'use' dari React 19
import Header from "@/app/dashboard-laporan/components/header";
import Footer from "@/app/dashboard-laporan/components/footer";

const dokumenSummary = [
  { jenis: "Raperda", status: "Selesai", icon: DocumentTextIcon },
  { jenis: "Perda", status: "Proses", icon: DocumentTextIcon },
  { jenis: "Salinan", status: "Belum dibuat", icon: DocumentTextIcon },
] as const;

const files = [
  {
    name: "Raperda",
    type: "Raperda",
    updated: "20 Okt 2025",
    status: "Selesai",
  },
  { name: "Perda", type: "Perda", updated: "-", status: "Proses" },
  {
    name: "Salinan Perda",
    type: "Salinan Perda",
    updated: "-",
    status: "Belum dibuat",
  },
] as const;

export default function DashboardPage({
  params,
}: {
  params: Promise<{ tahun: string }>;
}) {
  // ✅ unwrapping params promise dengan use()
  const { tahun } = use(params);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header rightContent={null} />

      <div className="flex flex-col w-full px-9">
        <nav className="w-full mx-6 px-6 py-1 text-sm text-gray-600 flex items-center gap-1 bg-white rounded-sm shadow-sm mt-2">
          <HomeIcon className="w-4 h-4" />
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-800">{tahun}</span>
        </nav>

        <div className="w-full mx-auto px-6 flex flex-col gap-x-8 py-6">
          <h1 className="font-semibold text-lg mb-3">
            DOKUMEN LAPORAN PERTANGGUNG JAWABAN PELAKSANAAN APBD TAHUN {tahun}
          </h1>

          {/* Ringkasan Dokumen */}
          <section className="w-full mx-auto pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dokumenSummary.map((doc) => {
              const statusColors = {
                Selesai: "bg-green-100 text-green-700 border-green-200",
                Proses: "bg-yellow-100 text-yellow-700 border-yellow-200",
                "Belum dibuat": "bg-red-100 text-red-600 border-red-200",
              } as const;

              const statusColorClass =
                statusColors[doc.status as keyof typeof statusColors] ??
                "bg-gray-100 text-gray-700 border-gray-200";

              return (
                <div
                  key={doc.jenis}
                  className="group relative bg-white border border-gray-100 rounded-md px-6 py-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors duration-300">
                      <doc.icon className="w-8 h-8 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                        {doc.jenis}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColorClass}`}
                      >
                        {doc.status === "Selesai" && "✅"}
                        {doc.status === "Proses" && "🕓"}
                        {doc.status === "Belum dibuat" && "❌"}
                        {doc.status}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/${doc.jenis.toLowerCase()}`}
                    className="mt-auto inline-flex items-center justify-between text-sm font-semibold text-blue-700 hover:text-blue-700 transition-colors duration-200"
                  >
                    <span>Lihat Dokumen</span>
                    <DocumentTextIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              );
            })}
          </section>

          {/* Tabel File */}
          <section className="bg-white border border-gray-100 rounded-md shadow-md overflow-x-auto p-6">
            <h3 className="font-semibold text-gray-800 mb-6">
              File Dokumen Detail
            </h3>
            <table className="min-w-full text-sm text-gray-700 border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-4 text-left font-semibold">
                    Jenis Dokumen
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Update Terakhir
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const statusColor =
                    file.status === "Selesai"
                      ? "text-green-700"
                      : file.status === "Proses"
                      ? "text-yellow-700"
                      : "text-red-600";

                  return (
                    <tr
                      key={file.name}
                      className="border-b hover:bg-blue-50 transition"
                    >
                      <td className="py-3 px-4 font-medium">{file.name}</td>
                      <td className={`py-3 px-4 ${statusColor}`}>
                        {file.status}
                      </td>
                      <td className="py-3 px-4">{file.updated}</td>
                      <td className="py-3 px-4 text-center flex justify-center gap-2">
                        <Link
                          href={`/${file.type.toLowerCase()}/${tahun}/view`}
                          className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                          aria-label={`Lihat ${file.name}`}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/${file.type.toLowerCase()}/${tahun}/edit`}
                          className="p-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition"
                          aria-label={`Edit ${file.name}`}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                          aria-label={`Unduh ${file.name}`}
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
