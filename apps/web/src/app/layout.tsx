import type { Metadata } from "next";
import { Golos_Text, Unbounded } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const golos = Golos_Text({
  subsets: ["cyrillic", "latin"],
  variable: "--font-golos",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Кабинет геоприсутствия — Истинный интеллект",
  description: "Просмотры карточек, звонки и маршруты по филиалам на геосервисах.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${unbounded.variable} ${golos.variable} antialiased`}>{children}</body>
    </html>
  );
}
