import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SyncUser from "../components/SyncUser";
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Toaster } from 'react-hot-toast'

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
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-[#f4ece4] to-[#e8dccc] dark:from-gray-900 dark:to-gray-800">
        <ClerkProvider>
          <SyncUser />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
            <Toaster position="top-right" />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
