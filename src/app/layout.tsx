import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Image from "next/image";
import PWARegister from "@/components/pwa/PWARegister";
import OfflineWatcher from "@/components/pwa/OfflineWatcher";
import StartupNetworkGuard from "@/components/pwa/StartupNetworkGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Komicats",
  description: "Powered by Next JS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen overflow-x-hidden bg-[#07141a] text-white antialiased`}
        >
          <StartupNetworkGuard />
          <PWARegister />
          <OfflineWatcher />

          <div className="relative z-10 min-h-screen">{children}</div>

          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
