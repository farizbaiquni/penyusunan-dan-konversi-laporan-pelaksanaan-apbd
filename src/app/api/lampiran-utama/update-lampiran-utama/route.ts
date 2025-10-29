import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT_STORAGE =
  "C:\\Users\\Fariz Baiquni\\Documents\\Storage Aplikasi Tuntas";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const tahun = formData.get("tahun") as string | null;
    const jenisLaporan = formData.get("jenisLaporan") as string | null;
    const namaFile = formData.get("namaFile") as string | null;
    const namaFileLama = formData.get("namaFileLama") as string | null;

    // 🧩 Validasi awal
    if (!file || !tahun || !jenisLaporan || !namaFile) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 💡 Pastikan nama file aman (hapus karakter aneh)
    const safeFileName = `${namaFile.replace(/[^\w\s-]/g, "")}.pdf`;
    const targetFolder = path.join(
      ROOT_STORAGE,
      tahun,
      jenisLaporan,
      "lampiran_utama"
    );
    const filePath = path.join(targetFolder, safeFileName);

    // 🏗️ Pastikan folder target ada
    fs.mkdirSync(targetFolder, { recursive: true });

    let oldFileDeleted = false;

    const filePathFileLama = path.join(
      ROOT_STORAGE,
      tahun,
      jenisLaporan,
      "lampiran_utama",
      `${namaFileLama}.pdf`
    );
    // 🧹 Jika file lama ada → hapus dulu
    if (fs.existsSync(filePathFileLama)) {
      fs.unlinkSync(filePathFileLama);
      oldFileDeleted = true;
    }

    // 💾 Simpan file baru
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: oldFileDeleted
        ? "File lama berhasil dihapus dan file baru disimpan"
        : "File baru berhasil disimpan",
      path: filePath,
    });
  } catch (err: unknown) {
    console.error("Error updating file:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
