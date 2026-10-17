import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koreksi.in — AI-assisted Assignment Review",
  description: "Platform review dan penilaian tugas mahasiswa berbantuan AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
