import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IBK - Rastreamento Clínico",
  description: "Sistema de triagem da Síndrome do X Frágil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* 2. ADICIONAR O COMPONENTE AQUI (pode ser antes do children) */}
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}