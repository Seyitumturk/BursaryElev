import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
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
      <html lang="en">
        <body className="min-h-screen flex gap-4 bg-gray-100 dark:bg-gray-800">
          {/* Sidebar Navigation with new glass morphic design and toggle */}
          <Sidebar
            title="EleV Dashboard"
            links={[
              { href: "/", label: "Dashboard" },
              { href: "/bursaries", label: "Bursaries" },
              { href: "/submit", label: "Submit Opportunity" },
            ]}
          />
          {/* Main Content Area */}
          <main className="flex-1">
            <Header />
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
