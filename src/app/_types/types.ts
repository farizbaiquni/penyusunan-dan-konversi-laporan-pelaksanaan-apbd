export interface DokumenLaporan {
  id: string;
  jenisLaporan: JenisLaporan;
  tahun: number;
  nomor: number | null;
  tanggalPengesahan: string;
  status: StatusDokumenLaporan;
  batangTubuh: string | null;
  lampirans: LampiranDataUtama[];
  lastUpdated: string | null;
  lampiransPendukung: LampiranDataPendukung[];
}

export enum StatusDokumenLaporan {
  BELUM_DIBUAT = "belum dibuat",
  PROSES = "proses",
  SELESAI = "selesai",
}

export interface RangkumanDokumenLaporanTahunan {
  id: string;
  tahun: number;
  statusRaperda: StatusDokumenLaporan;
  statusPerda: StatusDokumenLaporan;
  statusRaperbup: StatusDokumenLaporan;
  statusPerbup: StatusDokumenLaporan;
}

export enum MenuOption {
  INFORMASI_LAPORAN = "Informasi Laporan",
  BATANG_TUBUH = "Batang Tubuh",
  LAMPIRAN_UTAMA = "Lampiran Utama",
  TAMBAH_LAMPIRAN_UTAMA = "Tambah Lampiran Utama",
  TAMBAH_LAMPIRAN_UTAMA_CALK = "Tambah Lampiran Utama CALK",
  EDIT_LAMPIRAN_UTAMA = "Edit Lampiran Utama",
  LAMPIRAN_PENDUKUNG = "Lampiran Pendukung",
  TAMBAH_LAMPIRAN_PENDUKUNG = "Tambah Lampiran Pendukung",
  EDIT_LAMPIRAN_PENDUKUNG = "Edit Lampiran Pendukung",
  PREVIEW = "Preview",
  GENERATE = "Generate",
}

export interface LampiranDataUtama {
  id: string;
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
  id: string;
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
  RAPERDA = "raperda",
  RAPERBUP = "raperbup",
  PERDA = "perda",
  PERBUP = "perbup",
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
