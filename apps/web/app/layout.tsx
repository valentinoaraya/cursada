import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-sans",
});

const display = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Cursada",
  description: "Copiloto de estudio que responde con tu material y cita la fuente.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
