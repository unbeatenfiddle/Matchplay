import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatchPlay F&B Analytics — Silverado Resort",
  description: "Executive sales dashboard for MatchPlay F&B outlet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
