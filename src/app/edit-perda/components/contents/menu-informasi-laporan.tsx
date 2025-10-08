"use client";

import { useState } from "react";
function InformasiLaporan() {
  const [tahun, setTahun] = useState<number>(2025);
  return (
    <div className="flex flex-col pt-7 h-full w-full">
      <table className="w-full">
        <tbody>
          <tr className="w-full">
            <td>Tahun Perda</td>
            <td>:</td>
            <td>
              <input
                type="number"
                min="1900"
                max="2099"
                step="1"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Tahun"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default InformasiLaporan;
