import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Cursada",
  description: "Copiloto de estudio que responde con tu material y cita la fuente.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={sans.variable}>{children}</body>
    </html>
  );
}
