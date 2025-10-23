export enum MenuOption {
  INFORMASI_LAPORAN = "Informasi Laporan",
  BATANG_TUBUH = "Batang Tubuh",
  LAMPIRAN_UTAMA = "Lampiran Utama",
  TAMBAH_LAMPIRAN_UTAMA = "Tambah Lampiran Utama",
  TAMBAH_LAMPIRAN_UTAMA_CALK = "Tambah Lampiran Utama CALK",
  EDIT_LAMPIRAN_UTAMA = "Edit Lampiran Utama",
  LAMPIRAN_PENDUKUNG = "Lampiran Pendukung",
  PREVIEW = "Preview",
  GENERATE = "Generate",
}

export interface LampiranDataUtama {
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
  isCALK: boolean;
  babs?: BabCalk[];
  jumlahTotalLembar: number;
}

export interface LampiranDataPendukung {
  id: number;
  urutan: number;
  file: File;
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

export enum JenisLaporan {
  RAPERDA = "Raperda",
  RAPERBUP = "Raperbup",
  PERDA = "Perda",
  PERBUP = "Perbup",
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
