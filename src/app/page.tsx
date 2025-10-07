"use client";

import Image from "next/image";
import React, { useState } from "react";

interface SidebarLink {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export default function Home() {
  const menuItems: SidebarLink[] = [
    {
      label: "Informasi Laporan",
      href: "#",
      icon: "/images/edit/informasi.png",
    },
    {
      label: "Batang Tubuh",
      href: "#",
      icon: "/images/edit/batang-tubuh.png",
    },
    {
      label: "Lampiran",
      href: "#",
      icon: "/images/edit/lampiran.png",
      badge: 7,
    },
    { label: "Preview", href: "#", icon: "/images/edit/preview.png" },
    { label: "Generate", href: "#", icon: "/images/edit/generate.png" },
  ];

  // ✅ State untuk menyimpan menu yang sedang aktif
  const [activeMenu, setActiveMenu] = useState<string>("Informasi Laporan");

  const SidebarItem: React.FC<
    SidebarLink & { active: boolean; onClick: () => void }
  > = ({ label, href, icon, active, badge, onClick }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full mt-3 flex items-center p-2 rounded-lg transition-all duration-200 ${
          active
            ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        <Image
          src={icon}
          alt={label}
          width={22}
          height={22}
          className="object-contain"
        />
        <span className="ml-3 flex-1 truncate text-md font-medium text-left">
          {label}
        </span>
        {badge && (
          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-yellow-100">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center justify-center px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <Image src="/images/bank.png" alt="Logo" width={40} height={40} />
          <span className="ml-3 mt-2 text-2xl font-bold text-gray-700 dark:text-gray-200">
            TUNTAS
          </span>
        </div>

        <nav className="mt-6 space-y-1 px-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
              active={activeMenu === item.label}
              onClick={() => setActiveMenu(item.label)}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 bg-blue-50 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">{activeMenu}</h1>
        <p className="text-gray-700">
          Konten untuk menu <span className="font-semibold">{activeMenu}</span>{" "}
          akan tampil di sini.
        </p>
      </main>
    </div>
  );
}
