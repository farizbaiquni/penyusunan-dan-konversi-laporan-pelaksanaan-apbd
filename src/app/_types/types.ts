import { Timestamp } from "firebase/firestore";

export enum JenisLaporan {
  RAPERDA = "raperda",
  RAPERBUP = "raperbup",
  PERDA = "perda",
  PERBUP = "perbup",
}

export enum StatusDokumenLaporan {
  BELUM_DIBUAT = "belum dibuat",
  DIBUAT = "dibuat",
}

export enum MenuOption {
  INFORMASI_LAPORAN = "Informasi Laporan",
  BATANG_TUBUH = "Batang Tubuh",
  LAMPIRAN_UTAMA = "Lampiran Utama",
  TAMBAH_LAMPIRAN_UTAMA = "Tambah Lampiran Utama",
  TAMBAH_LAMPIRAN_UTAMA_PER_OPD = "Tambah Lampiran Utama Per OPD",
  TAMBAH_LAMPIRAN_UTAMA_CALK = "Tambah Lampiran Utama CALK",
  EDIT_LAMPIRAN_UTAMA = "Edit Lampiran Utama",
  LAMPIRAN_PENDUKUNG = "Lampiran Pendukung",
  TAMBAH_LAMPIRAN_PENDUKUNG = "Tambah Lampiran Pendukung",
  EDIT_LAMPIRAN_PENDUKUNG = "Edit Lampiran Pendukung",
  PREVIEW = "Preview",
  GENERATE = "Generate",
}

export interface RangkumanDokumenLaporanTahunan {
  id: string;
  tahun: number;
  statusRaperda: StatusDokumenLaporan;
  statusPerda: StatusDokumenLaporan;
  statusRaperbup: StatusDokumenLaporan;
  statusPerbup: StatusDokumenLaporan;
}

export interface DokumenLaporan {
  id: string;
  jenisLaporan: JenisLaporan;
  tahun: number;
  nomor: number | null;
  tanggalPengesahan: Date | null;
  status: StatusDokumenLaporan;
  batangTubuh: string | null;
  lampirans: LampiranDataUtama[];
  lastUpdated: Date | null;
  lampiransPendukung: LampiranDataPendukung[];
}

export interface DokumenLaporanFirestore {
  id: string;
  jenisLaporan: JenisLaporan;
  tahun: number;
  nomor: number | null;
  tanggalPengesahan: Date | null;
  status: StatusDokumenLaporan;
  batangTubuh: string | null;
  lastUpdated: Timestamp | null;
}

export interface LampiranDataUtama {
  id: string;
  urutan: number;
  file: File;
  namaFileDiStorageLokal: string;
  romawiLampiran: string;
  judulPembatasLampiran: string;
  footerText: string;
  footerWidth: number;
  footerX: number;
  footerY: number;
  fontSize: number;
  footerHeight: number;
  jumlahHalaman: number;
  isCALK: boolean;
  babs?: BabCalk[];
  jumlahTotalLembar: number;
}

export interface LampiranDataUtamaFirestore {
  id: string;
  urutan: number;
  namaFileAsli: string;
  namaFileDiStorageLokal: string;
  romawiLampiran: string;
  judulPembatasLampiran: string;
  footerText: string;
  footerWidth: number;
  footerX: number;
  footerY: number;
  fontSize: number;
  footerHeight: number;
  jumlahHalaman: number;
  isCALK: boolean;
  babs?: BabCalk[];
  jumlahTotalLembar: number;
}

export interface LampiranDataPendukung {
  id: string;
  urutan: number;
  namaFileAsli: string;
  namaFileDiStorageLokal: string;
  file: File;
  judul: string;
  jumlahTotalLembar: number;
}

export interface LampiranDataPendukungFirestore {
  id: string;
  urutan: number;
  namaFileAsli: string;
  namaFileDiStorageLokal: string;
  judul: string;
  jumlahTotalLembar: number;
}

export interface DaftarIsiLampiran {
  id: string;
  romawi: string;
  judul: string;
  nomorHalaman: number;
  isCALK: boolean;
  jamlahPenomoranHalaman?: number;
  babs?: BabCalk[];
}

export interface BabCalk {
  id: string;
  bab: string;
  judul: string;
  halamanMulai: number;
  subbabs?: SubbabCalk[];
}

export interface SubbabCalk {
  id: string;
  subbab: string;
  judul: string;
  halamanMulai: number;
}

export interface DaftarIsiBabLampiranCALK {
  id: number;
  bab: string;
  mulaiDariLembarKe: number;
}

export interface DaftarIsiSubBabLampiranCALK {
  id: number;
  urutan: number;
  subBab: string;
  daftarIsiBabLampiranCALK: DaftarIsiBabLampiranCALK[];
}
