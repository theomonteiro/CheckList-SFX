"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

interface HeaderProps {
  isAdmin?: boolean;
}

export default function Header({ isAdmin = false }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <header
      className="w-full shadow-md relative overflow-hidden"
      style={{
        backgroundColor: "#212b54",
        backgroundImage:
          "radial-gradient(circle at 90% 220%, #3a4a8a 0%, transparent 55%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/painel" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/IBK_LOGOTIPO_white.png"
            alt="Instituto Buko Kaesemodel"
            width={160}
            height={40}
          />
        </Link>
        <nav className="flex items-center gap-6">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 text-white font-medium text-sm hover:text-blue-300 transition-colors duration-200"
            >
              <ShieldCheck size={16} /> Painel Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white font-medium text-sm hover:text-red-300 transition-colors duration-200"
          >
            Sair do Sistema <LogOut size={16} />
          </button>
        </nav>
      </div>
    </header>
  );
}
