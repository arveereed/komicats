import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";
import { Toaster } from "sonner";
import Image from "next/image";
import PWARegister from "@/components/pwa/PWARegister";
import BottomNav from "@/components/BottomNavbar";
import { getProfiles } from "@/actions/profile.action";
import { syncUser } from "@/actions/user.action";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkUser = await currentUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  const profiles = await getProfiles();

  const user = await syncUser();
  const activeProfileId = user?.activeProfileId ?? null;

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="min-h-screen">
            <Navbar />

            <main
              className={
                isAdmin
                  ? "relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white"
                  : "relative min-h-screen overflow-hidden bg-[#07141a] text-white"
              }
            >
              {isAdmin ? <AdminBackgroundDecor /> : <BackgroundDecor />}

              <div className="relative z-10 min-h-screen pb-20">
                <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center -bottom-12 -left-[700px]">
                  <Image
                    src="/icons/bg-logo.png"
                    alt="Background logo"
                    fill
                    className="object-contain opacity-[0.05]"
                    priority
                  />
                </div>

                <PWARegister />
                {children}
                <BottomNav
                  profiles={profiles}
                  activeProfileId={activeProfileId}
                />
              </div>
              <Toaster richColors position="top-right" />
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,153,160,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(72,117,126,0.12),transparent_30%),linear-gradient(135deg,#10242b_0%,#08161c_35%,#030b0f_100%)]" />

      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />
      <div className="absolute left-[18%] top-[52%] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-[10%] top-[12%] h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="absolute bottom-[-80px] left-[30%] h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.22)_70%,rgba(0,0,0,0.55)_100%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_20%,rgba(0,0,0,0.18)_65%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}

function AdminBackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30">
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>
  );
}
