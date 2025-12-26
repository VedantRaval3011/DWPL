import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DWPL - Manufacturing Management System",
  description: "Wire Drawing & Annealing Operations Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="p-6 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
