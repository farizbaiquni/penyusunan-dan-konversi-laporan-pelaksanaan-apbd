export enum MenuOption {
  INFORMASI_LAPORAN = "Informasi Laporan",
  BATANG_TUBUH = "Batang Tubuh",
  LAMPIRAN_UTAMA = "Lampiran Utama",
  TAMBAH_LAMPIRAN_UTAMA = "Tambah Lampiran Utama",
  EDIT_LAMPIRAN_UTAMA = "Edit Lampiran Utama",
  LAMPIRAN_PENDUKUNG = "Lampiran Pendukung",
  PREVIEW = "preview",
  GENERATE = "generate",
}

export interface LampiranData {
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
}
