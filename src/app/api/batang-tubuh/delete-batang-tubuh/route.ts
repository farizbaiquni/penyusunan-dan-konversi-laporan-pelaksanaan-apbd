// app/api/delete-lampiran/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT_STORAGE =
  "C:\\Users\\Fariz Baiquni\\Documents\\Storage Aplikasi Tuntas";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tahun = searchParams.get("tahun");
    const jenisLaporan = searchParams.get("jenisLaporan");
    const namaFile = searchParams.get("namaFile");

    if (!tahun || !jenisLaporan || !namaFile) {
      return NextResponse.json(
        { success: false, error: "Parameter tidak lengkap" },
        { status: 400 }
      );
    }

    const filePath = path.join(
      ROOT_STORAGE,
      tahun,
      jenisLaporan,
      "batang_tubuh",
      `${namaFile}`
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({ success: true, path: filePath });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
