import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT_STORAGE =
  "C:\\Users\\Fariz Baiquni\\Documents\\Storage Aplikasi Tuntas";

export async function GET(req: NextRequest) {
  try {
    // 🔹 Ambil parameter dari URL
    const { searchParams } = new URL(req.url);
    const tahun = searchParams.get("tahun");
    const jenisLaporan = searchParams.get("jenisLaporan");
    const namaFile = searchParams.get("namaFile");

    // 🔒 Validasi parameter
    if (!tahun || !jenisLaporan || !namaFile) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    // 🧩 Sanitasi nama file
    const safeFileName = `${namaFile.replace(/[^\w\s-]/g, "")}.pdf`;

    // 🔍 Tentukan lokasi file
    const filePath = path.join(
      ROOT_STORAGE,
      tahun,
      jenisLaporan,
      "batang_tubuh",
      safeFileName
    );

    // 🚫 Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // 📂 Baca file sebagai buffer
    const fileBuffer = fs.readFileSync(filePath);

    // 📤 Kembalikan file sebagai response PDF
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeFileName}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Error reading file:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
