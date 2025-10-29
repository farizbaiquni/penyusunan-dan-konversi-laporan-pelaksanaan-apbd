import { doc, updateDoc } from "firebase/firestore";
import { v4 } from "uuid";
import { db } from "../firebase";

export async function addBatangTubuh(
  batangTubuhFile: File,
  tahun: number,
  jenisLaporan: string,
  dokumenIdFirestore: string
) {
  try {
    // ----- BAGIAN PENTING: KIRIM FILE KE API -----
    if (!batangTubuhFile) return alert("Unggah file PDF terlebih dahulu!");
    const namaFile = v4();
    const formData = new FormData();
    formData.append("file", batangTubuhFile);
    formData.append("tahun", tahun.toString());
    formData.append("jenisLaporan", jenisLaporan);
    formData.append("namaFile", namaFile);

    const dokumenRef = doc(db, "dokumenLaporan", dokumenIdFirestore);

    await updateDoc(dokumenRef, {
      batangTubuh: namaFile,
    });
    await fetch("/api/batang-tubuh/add-batang-tubuh", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    alert("Gagal menambahkan batang tubuh.");
    return { success: true };
  } finally {
    return { success: false };
  }
}

export async function deleteBatangTubuh(
  namaBatangTubuh: string,
  tahun: number,
  jenisLaporan: string,
  dokumenIdFirestore: string
) {
  try {
    const res = await fetch(
      `/api/batang-tubuh/delete-batang-tubuh?tahun=${tahun}&jenisLaporan=${jenisLaporan}&namaFile=${namaBatangTubuh}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.error || "Gagal menghapus file");
      throw new Error(data.error || "Gagal menghapus file");
    }

    const dokumenRef = doc(db, "dokumenLaporan", dokumenIdFirestore);

    await updateDoc(dokumenRef, {
      batangTubuh: null,
    });
  } catch (error) {
    return { success: true };
  } finally {
    return { success: false };
  }
}
