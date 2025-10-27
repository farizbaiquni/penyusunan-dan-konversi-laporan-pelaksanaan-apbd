// app/api/save-lampiran/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT_STORAGE =
  "C:\\Users\\Fariz Baiquni\\Documents\\Storage Aplikasi Tuntas";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const tahun = formData.get("tahun") as string;
  const jenisLaporan = formData.get("jenisLaporan") as string;
  const namaFile = formData.get("namaFile") as string;

  try {
    const targetFolder = path.join(
      ROOT_STORAGE,
      tahun,
      jenisLaporan,
      "lampiran_utama"
    );
    fs.mkdirSync(targetFolder, { recursive: true });

    const fileName = `${namaFile}.pdf`;
    const filePath = path.join(targetFolder, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, path: filePath });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
