import { JenisLaporan, StatusDokumenLaporan } from "../_types/types";

export const getJenisLaporanfromString = (jenis: string): JenisLaporan => {
  switch (jenis) {
    case "raperda":
      return JenisLaporan.RAPERDA;
    case "raperbup":
      return JenisLaporan.RAPERBUP;
    case "perda":
      return JenisLaporan.PERDA;
    case "perbup":
      return JenisLaporan.PERBUP;
    default:
      return JenisLaporan.RAPERDA;
  }
};

export const getStatusDokumenLaporanfromString = (
  status: string
): StatusDokumenLaporan => {
  switch (status) {
    case "belum dibuat":
      return StatusDokumenLaporan.BELUM_DIBUAT;
    case "dibuat":
      return StatusDokumenLaporan.DIBUAT;
    default:
      return StatusDokumenLaporan.BELUM_DIBUAT;
  }
};
