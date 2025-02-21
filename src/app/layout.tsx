import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "../components/Header";
import SyncUser from "../components/SyncUser";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EleV Bursary Platform",
  description: "AI-powered bursary matching platform for Indigenous youth in Atlantic Canada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <SyncUser />
      <html lang="en">
        {/* Removed the global Sidebard here to avoid duplicate sidebars */}
        <body className="min-h-screen bg-[#f4ece4] dark:bg-gray-800">
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
