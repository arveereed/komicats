import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";
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

const SIGN_IN_URL = "/auth/sign-in";
const SIGN_UP_URL = "/auth/sign-up";
const DEFAULT_AFTER_AUTH_URL = "/profile/avatar";

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
    <ClerkProvider
      signInUrl={SIGN_IN_URL}
      signUpUrl={SIGN_UP_URL}
      signInForceRedirectUrl={DEFAULT_AFTER_AUTH_URL}
      signUpForceRedirectUrl={DEFAULT_AFTER_AUTH_URL}
      signInFallbackRedirectUrl={DEFAULT_AFTER_AUTH_URL}
      signUpFallbackRedirectUrl={DEFAULT_AFTER_AUTH_URL}
      afterSignOutUrl={SIGN_IN_URL}
      afterMultiSessionSingleSignOutUrl={SIGN_IN_URL}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#27484e] via-[#11262b] to-[#020507] text-white antialiased`}
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
