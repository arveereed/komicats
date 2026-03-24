import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";
import AdminNavbar from "@/components/AdminNavbar";

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

  const adminEmail = process.env.ADMIN_EMAIL as string | undefined;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0].emailAddress === adminEmail;

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="min-h-screen">
            {isAdmin ? <AdminNavbar /> : <Navbar />}
            <main className="py-8">
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
