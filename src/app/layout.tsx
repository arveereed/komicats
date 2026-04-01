import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";

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
    !!adminEmail && clerkUser?.emailAddresses[0].emailAddress === adminEmail;

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="min-h-screen">
            <Navbar />
            <main
              className={`py-8 ${isAdmin ? "min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white" : ""}`}
            >
              {isAdmin && (
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
                  <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
                  <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>
              )}
              {/* container to center the content */}
              <div className="max-w-7xl mx-auto px-4 ">
                <div className="">{children}</div>
              </div>
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
