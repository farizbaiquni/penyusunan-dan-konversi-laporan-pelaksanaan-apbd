"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { addFooter, addFooterLampiranCALK } from "@/app/_utils/add-footers";
import UploadLampiran from "../UploadLampiran";
import {
  BabCalk,
  JenisLaporan,
  LampiranDataUtama,
  LampiranDataUtamaFirestore,
  MenuOption,
} from "@/app/_types/types";
import CalkStructureModal from "../../modals/LampiranCALKModal";
import { generateTextJenisLaporan } from "@/app/_utils/jenis-laporan";
import { v4 } from "uuid";
import { addLampiranUtamaFirestore } from "@/app/_lib/_queries/lampiran";
import LoadingProcessing from "@/app/_components/LoadingProcessing";
import UploadModalTambahLampiran from "@/app/_components/modals/TambahDocSatuBagianRaperbup";
import LampiranUtamaVariasiRaperbupModal from "../../modals/LampiranUtamaVariasiRaperbupModal";

export interface DaftarOPDAndFileType {
  id: number;
  nama: string;
  file: File | null;
}
const daftarOPD: DaftarOPDAndFileType[] = [
  { id: 1, nama: "Dinas Pendidikan dan Kebudayaan", file: null },
  { id: 2, nama: "Dinas Kesehatan", file: null },
  { id: 3, nama: "PKM Plantungan", file: null },
  { id: 4, nama: "PKM Sukorejo 1", file: null },
  { id: 5, nama: "PKM Sukorejo 2", file: null },
  { id: 6, nama: "PKM Pageruyung", file: null },
  { id: 7, nama: "PKM Patean", file: null },
  { id: 8, nama: "PKM Singorojo 1", file: null },
  { id: 9, nama: "PKM Singorojo 2", file: null },
  { id: 10, nama: "PKM Limbangan", file: null },
  { id: 11, nama: "PKM Brangsong 1", file: null },
  { id: 12, nama: "PKM Brangsong 2", file: null },
  { id: 13, nama: "PKM Pegandon", file: null },
  { id: 14, nama: "PKM Ngampel", file: null },
  { id: 15, nama: "PKM Gemuh 1", file: null },
  { id: 16, nama: "PKM Gemuh 2", file: null },
  { id: 17, nama: "PKM Ringinarum", file: null },
  { id: 18, nama: "PKM Weleri 1", file: null },
  { id: 19, nama: "PKM Weleri 2", file: null },
  { id: 20, nama: "PKM Rowosari 1", file: null },
  { id: 21, nama: "PKM Rowosari 2", file: null },
  { id: 22, nama: "PKM Boja 1", file: null },
  { id: 23, nama: "PKM Boja 2", file: null },
  { id: 24, nama: "PKM Kaliwungu", file: null },
  { id: 25, nama: "PKM Kaliwungu Selatan", file: null },
  { id: 26, nama: "PKM Cepiring", file: null },
  { id: 27, nama: "PKM Kangkung 1", file: null },
  { id: 28, nama: "PKM Kangkung 2", file: null },
  { id: 29, nama: "PKM Patebon 1", file: null },
  { id: 30, nama: "PKM Patebon 2", file: null },
  { id: 31, nama: "PKM Kendal 1", file: null },
  { id: 32, nama: "PKM Kendal 2", file: null },
  { id: 33, nama: "RSUD Soewondo", file: null },
  { id: 34, nama: "Dinas Pekerjaan Umum dan Penataan Ruang", file: null },
  { id: 35, nama: "Dinas Perumahan Rakyat dan Kawasan Permukiman", file: null },
  {
    id: 36,
    nama: "Satuan Polisi Pamong Praja dan Pemadam Kebakaran",
    file: null,
  },
  { id: 37, nama: "Badan Penanggulangan Bencana Daerah", file: null },
  { id: 38, nama: "Dinas Sosial", file: null },
  { id: 39, nama: "Dinas Perindustrian dan Tenaga Kerja", file: null },
  { id: 40, nama: "Dinas Lingkungan Hidup", file: null },
  { id: 41, nama: "Dinas Kependudukan dan Pencatatan Sipil", file: null },
  { id: 42, nama: "Dinas Pemberdayaan Masyarakat dan Desa", file: null },
  {
    id: 43,
    nama: "Dinas Pengendalian Penduduk, Keluarga Berencana, Pemberdayaan Perempuan Dan Perlindungan Anak",
    file: null,
  },
  { id: 44, nama: "Dinas Perhubungan", file: null },
  { id: 45, nama: "Dinas Komunikasi Dan Informatika", file: null },
  {
    id: 46,
    nama: "Dinas Perdagangan, Koperasi, Usaha Kecil dan Menengah",
    file: null,
  },
  {
    id: 47,
    nama: "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu",
    file: null,
  },
  { id: 48, nama: "Dinas Kepemudaan, Olah Raga dan Pariwisata", file: null },
  { id: 49, nama: "Dinas Kearsipan dan Perpustakaan", file: null },
  { id: 50, nama: "Dinas Kelautan dan Perikanan", file: null },
  { id: 51, nama: "Dinas Pertanian dan Pangan", file: null },
  { id: 52, nama: "Sekretariat Daerah", file: null },
  { id: 53, nama: "Sekretariat DPRD", file: null },
  {
    id: 54,
    nama: "Badan Perencanaan, Penelitian dan Pengembangan",
    file: null,
  },
  { id: 55, nama: "Badan Pengelola Keuangan dan Aset Daerah", file: null },
];

interface TambahLampiranProps {
  jenisLaporan: JenisLaporan;
  setActiveMenu: (menu: MenuOption) => void;
  onAddLampiran: (data: LampiranDataUtama) => void;
  urutanLampiran: number;
  tahun: number;
  dokumenIdFirestore: string;
}

export default function MenuTambahLampiran({
  jenisLaporan,
  setActiveMenu,
  onAddLampiran,
  urutanLampiran,
  tahun,
  dokumenIdFirestore,
}: TambahLampiranProps) {
  const [isOpenVariasiLampiranRaperbup, setIsOpenVariasiLampiranRaperbup] =
    useState(false);
  const [daftarOPDAndFile, setDaftarOPDAndFile] =
    useState<DaftarOPDAndFileType[]>(daftarOPD);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [isLoadingSaving, setIsLoadingSaving] = useState(false);
  const [romawiLampiran, setRomawiLampiran] = useState("");
  const [judulPembatasLampiran, setJudulPembatasLampiran] = useState("");
  const [footerText, setFooterText] = useState("");
  const [isCALK, setIsCALK] = useState(false);
  const [babCALK, setBabCALK] = useState<BabCalk[]>([]);
  const [openCALKModal, setOpenCALKModal] = useState(false);
  const [halamanTerakhirCALK, setHalamanTerakhirCALK] = useState<number>(0);
  const [footer, setFooter] = useState({
    width: 91,
    x: 0,
    y: 27,
    height: 20,
    fontSize: 8,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileDataRef = useRef<ArrayBuffer | null>(null);

  const updateOPDBLampiranById = (
    id: number,
    updatedData: Partial<DaftarOPDAndFileType>
  ) => {
    setDaftarOPDAndFile((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
  };

  const onAddLampiranUtamaCALK = (data: BabCalk[]) => {
    setBabCALK(data);
  };

  // Generate PDF preview dengan footer
  const handleAddFooter = async (existingPdfBytes: ArrayBuffer) => {
    try {
      setIsGenerating(true);
      if (isCALK) {
        const blobUrl = await addFooterLampiranCALK(
          footer.width,
          footer.x,
          footer.y,
          footer.height,
          footer.fontSize,
          existingPdfBytes,
          halamanTerakhirCALK
        );
        setPreviewUrl(blobUrl);
      } else {
        const blobUrl = await addFooter(
          jenisLaporan,
          footer.width,
          footer.x,
          footer.y,
          footer.height,
          footer.fontSize,
          romawiLampiran,
          footerText,
          existingPdfBytes
        );
        setPreviewUrl(blobUrl);
      }
    } catch (err) {
      alert("Gagal generate preview PDF." + err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileLoad = async (arrayBuffer: ArrayBuffer) => {
    fileDataRef.current = arrayBuffer;
    await handleAddFooter(arrayBuffer);
  };

  const regeneratePdf = async () => {
    if (!fileDataRef.current) return alert("Silakan unggah file PDF dulu!");
    await handleAddFooter(fileDataRef.current);
  };

  const handleSimpan = async () => {
    if (!isCALK && !romawiLampiran) return alert("Isi romawi lampiran!");
    if (!isCALK && !footerText) return alert("Isi footer text!");
    if (!file || !fileDataRef.current)
      return alert("Unggah file PDF terlebih dahulu!");

    setIsLoadingSaving(true); // mulai loading

    try {
      const pdfDoc = await PDFDocument.load(fileDataRef.current);
      const jumlahHalaman = pdfDoc.getPageCount();

      if (
        jenisLaporan === JenisLaporan.RAPERDA ||
        jenisLaporan === JenisLaporan.PERDA
      ) {
        if (isCALK && (!halamanTerakhirCALK || halamanTerakhirCALK <= 0)) {
          return alert("Set jumlah halaman terakhir CALK terlebih dahulu!");
        }
        if (isCALK && halamanTerakhirCALK > jumlahHalaman) {
          return alert("Jumlah halaman CALK melebihi total halaman file PDF!");
        }
      } else {
        setHalamanTerakhirCALK(jumlahHalaman);
      }

      // ----- BAGIAN PENTING: KIRIM FILE KE API -----
      const namaFile = v4();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tahun", tahun.toString()); // atau dari state
      formData.append("jenisLaporan", jenisLaporan);
      formData.append("namaFile", namaFile);

      const res = await fetch("/api/lampiran-utama/save-lampiran-utama", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // ----- TAMBAHKAN KE STATE LAMPIRAN UTAMA -----
      const newLampiranFirestore: LampiranDataUtamaFirestore = {
        id: namaFile,
        urutan: urutanLampiran + 1,
        namaFileAsli: file.name,
        namaFileDiStorageLokal: namaFile,
        romawiLampiran,
        judulPembatasLampiran,
        footerText,
        footerWidth: footer.width,
        footerX: footer.x,
        footerY: footer.y,
        fontSize: footer.fontSize,
        footerHeight: footer.height,
        jumlahHalaman: isCALK ? halamanTerakhirCALK : jumlahHalaman,
        isCALK,
        babs: babCALK,
        jumlahTotalLembar: jumlahHalaman,
      };

      // ----- SIMPAN KE FIRESTORE -----
      const firestoreResult = await addLampiranUtamaFirestore(
        dokumenIdFirestore,
        newLampiranFirestore,
        isCALK
      );

      if (!firestoreResult.success) {
        alert("Gagal menyimpan ke database");
        return;
      }

      const newLampiran: LampiranDataUtama = {
        id: firestoreResult.lampiranId ? firestoreResult.lampiranId : namaFile,
        urutan: urutanLampiran + 1,
        file: file,
        namaFileDiStorageLokal: namaFile,
        romawiLampiran,
        judulPembatasLampiran,
        footerText,
        footerWidth: footer.width,
        footerX: footer.x,
        footerY: footer.y,
        fontSize: footer.fontSize,
        footerHeight: footer.height,
        jumlahHalaman: isCALK ? halamanTerakhirCALK : jumlahHalaman,
        isCALK,
        babs: babCALK,
        jumlahTotalLembar: jumlahHalaman,
      };

      if (!firestoreResult.success)
        throw new Error("Gagal menyimpan ke Firestore");

      // ----- SIMPAN KE VARIABLE -----
      onAddLampiran(newLampiran);
      alert(`Lampiran "${file.name}" berhasil ditambahkan dan disimpan`);
      setActiveMenu(MenuOption.LAMPIRAN_UTAMA);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan lampiran: " + err);
    } finally {
      setIsLoadingSaving(false); // selesai loading
    }
  };

  const footerSettings = [
    { label: "Lebar Footer (%)", key: "width" },
    { label: "Offset X", key: "x" },
    { label: "Posisi Y", key: "y" },
    { label: "Font Size", key: "fontSize" },
    { label: "Tinggi Footer", key: "height" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold text-gray-800 mb-2 ml-6 capitalize">
        Tambah Lampiran {generateTextJenisLaporan(jenisLaporan)}
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        {/* Upload Area */}
        <UploadLampiran
          file={file}
          setFile={setFile}
          setPreviewUrl={setPreviewUrl}
          onFileLoad={handleFileLoad}
        />

        {/* Form Footer */}
        {file && (
          <div className="flex flex-col mt-5">
            <fieldset className="border p-5 border-blue-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <legend className="px-2 font-semibold">INFORMASI LAMPIRAN</legend>

              {/* <div
                className={`p-2 col-span-5 bg-blue-200 max-w-fit rounded-sm cursor-pointer hover:bg-blue-300 border border-s-gray-500`}
                onClick={() => setOpenUploadModal(true)}
              >
                Tambahkan Daftar Isi Lampiran
              </div> */}

              <div
                className={`col-span-5 flex items-center justify-between px-2 ${
                  jenisLaporan === JenisLaporan.RAPERDA ||
                  jenisLaporan === JenisLaporan.PERDA
                    ? ""
                    : "hidden"
                }`}
              >
                <div className="flex flex-col gap-y-3 w-full">
                  <label className="font-medium mb-1 block">
                    <input
                      type="checkbox"
                      checked={isCALK}
                      onChange={() => setIsCALK(!isCALK)}
                      className="mr-2"
                    />
                    Apakah lampiran CALK
                  </label>
                  <span className={`${isCALK ? "" : "hidden"}`}>
                    <div className="flex flex-col gap-y-3">
                      <div className="flex flex-col">
                        <p>Penomoran Halaman terakhir CALK</p>
                        <input
                          disabled={!isCALK}
                          type="number"
                          value={
                            Number.isNaN(halamanTerakhirCALK)
                              ? ""
                              : halamanTerakhirCALK
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setHalamanTerakhirCALK(
                              val === "" ? NaN : parseInt(val)
                            );
                          }}
                          className={`p-2 border rounded-sm ${
                            !isCALK && "bg-gray-300"
                          }`}
                          placeholder="Halaman terakhir CALK"
                        />
                      </div>
                      <button
                        disabled={!isCALK}
                        onClick={() => setOpenCALKModal(true)}
                        className={`${
                          isCALK
                            ? "bg-blue-700 hover:bg-blue-800"
                            : "bg-gray-400"
                        } text-white px-2 py-1 rounded-md max-w-[300px] sm:w-auto`}
                      >
                        Atur Daftar Halaman CALK
                      </button>
                    </div>
                  </span>
                </div>
              </div>

              <div
                className={`col-span-5 flex items-center justify-between px-2 ${
                  jenisLaporan === JenisLaporan.RAPERBUP ||
                  jenisLaporan === JenisLaporan.PERBUP
                    ? ""
                    : "hidden"
                }`}
              >
                <div className="flex flex-col gap-y-3 w-full">
                  <label className="font-medium mb-1 block">
                    <input
                      type="checkbox"
                      checked={isCALK}
                      onChange={() => setIsCALK(!isCALK)}
                      className="mr-2"
                    />
                    Tambahkan Daftar Isi Khusus
                  </label>
                  <span className={`${isCALK ? "" : "hidden"}`}>
                    <div className="flex flex-col gap-y-3">
                      <button
                        disabled={!isCALK}
                        onClick={() => setIsOpenVariasiLampiranRaperbup(true)}
                        className={`${
                          isCALK
                            ? "bg-blue-700 hover:bg-blue-800"
                            : "bg-gray-400"
                        } text-white px-2 py-1 rounded-md max-w-[300px] sm:w-auto`}
                      >
                        Atur Daftar Halaman
                      </button>
                    </div>
                  </span>
                </div>
              </div>

              {/* Romawi Lampiran */}
              <div className="col-span-5">
                <label className="font-medium mb-1 block">
                  Romawi Lampiran
                </label>
                <input
                  value={romawiLampiran}
                  onChange={(e) => setRomawiLampiran(e.target.value)}
                  className="p-2 border rounded-sm w-full"
                />
              </div>

              {/* Judul Pembatas */}
              <div className="col-span-5">
                <label className="font-medium mb-1 block">
                  Judul Pembatas Lampiran
                </label>
                <input
                  value={judulPembatasLampiran}
                  onChange={(e) => setJudulPembatasLampiran(e.target.value)}
                  className="p-2 border rounded-sm w-full"
                />
              </div>

              {/* Footer Text */}
              <div className={`${isCALK ? "hidden" : "col-span-5"}`}>
                <label className="font-medium mb-1 block">
                  Keterangan Footer Halaman
                </label>
                <input
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="p-2 border rounded-sm w-full"
                />
              </div>

              {/* Footer Settings */}
              {!isCALK &&
                footerSettings.map(({ label, key }, idx) => (
                  <div key={idx} className="flex flex-col">
                    <label className="font-medium mb-1">{label}</label>
                    <input
                      type="number"
                      value={footer[key as keyof typeof footer]}
                      onChange={(e) =>
                        setFooter((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value),
                        }))
                      }
                      className="p-2 border rounded-sm"
                    />
                  </div>
                ))}
            </fieldset>

            {/* Tombol Aksi */}
            <div className="flex gap-x-2 flex-wrap">
              <button
                onClick={regeneratePdf}
                disabled={!fileDataRef.current || isGenerating}
                className={`px-4 py-2 rounded-md w-full sm:w-auto ${
                  fileDataRef.current
                    ? "bg-blue-700 hover:bg-blue-800 text-white"
                    : "bg-gray-500 text-white cursor-not-allowed"
                }`}
              >
                {isGenerating ? "Memproses..." : "Preview Lampiran"}
              </button>

              <button
                onClick={handleSimpan}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Simpan Lampiran
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal untuk Upload PDF Lampiran  */}
      <UploadModalTambahLampiran
        updateOPDBLampiranById={updateOPDBLampiranById}
        daftarOPDAndFile={daftarOPDAndFile}
        isOpen={openUploadModal}
        onClose={() => setOpenUploadModal(false)}
        onFileSelected={(file, arrayBuffer) => {
          setFile(file);
          fileDataRef.current = arrayBuffer;
          regeneratePdf();
        }}
      />

      {/* Preview PDF */}
      {previewUrl && (
        <div className="w-full h-[600px] shadow-lg rounded-xl overflow-hidden border border-gray-300">
          <iframe src={previewUrl} className="w-full h-full" />
        </div>
      )}

      {openCALKModal && (
        <CalkStructureModal
          onClose={() => setOpenCALKModal(false)}
          initialData={babCALK}
          onAddLampiranUtamaCALK={onAddLampiranUtamaCALK}
        />
      )}

      {isOpenVariasiLampiranRaperbup && (
        <LampiranUtamaVariasiRaperbupModal
          onClose={() => setIsOpenVariasiLampiranRaperbup(false)}
          initialData={babCALK}
          onAddLampiranUtamaCALK={onAddLampiranUtamaCALK}
        />
      )}

      {isLoadingSaving && <LoadingProcessing message="Menyimpan lampiran..." />}
    </div>
  );
}
