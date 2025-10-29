// app/api/get-lampiran-utama/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT_STORAGE =
  "C:\\Users\\Fariz Baiquni\\Documents\\Storage Aplikasi Tuntas";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tahun = url.searchParams.get("tahun");
    const jenisLaporan = url.searchParams.get("jenisLaporan");

    if (!tahun || !jenisLaporan) {
      return NextResponse.json(
        { success: false, error: "Tahun dan jenisLaporan harus diisi" },
        { status: 400 }
      );
    }

    const targetFolder = path.join(
      ROOT_STORAGE,
      tahun,
      jenisLaporan,
      "lampiran_utama"
    );

    const fileNames = fs.existsSync(targetFolder)
      ? fs.readdirSync(targetFolder).filter((f) => f.endsWith(".pdf"))
      : [];

    // Kirim file sebagai array base64 + nama file
    const files = fileNames.map((fileName) => {
      const fileBuffer = fs.readFileSync(path.join(targetFolder, fileName));
      return {
        name: fileName,
        data: fileBuffer.toString("base64"), // frontend nanti bisa convert ke File
      };
    });

    return NextResponse.json({ success: true, files });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
