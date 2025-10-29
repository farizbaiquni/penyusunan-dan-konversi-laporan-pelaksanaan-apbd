import { JenisLaporan } from "../_types/types";

export const generateTextJenisLaporan = (jenis: JenisLaporan) => {
  switch (jenis) {
    case JenisLaporan.RAPERDA:
      return "raperda";
    case JenisLaporan.RAPERBUP:
      return "raperbup";
    case JenisLaporan.PERDA:
      return "perda";
    case JenisLaporan.PERBUP:
      return "pebup";
  }
};
