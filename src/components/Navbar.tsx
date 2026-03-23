"use client"; // Change to Client Component

import Link from "next/link";
import { Button } from "./ui/button";
import { SignOutButton, useUser } from "@clerk/nextjs"; // Use useUser hook
import { usePathname } from "next/navigation"; // Standard hook for path changes

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname() || "";

  // This will now update INSTANTLY as you click links
  const isProfileAvatarPath = pathname.includes("/profile/avatar/profile=");

  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xl font-bold text-primary font-mono tracking-wider"
            >
              Komicats
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {!isLoaded ? (
              <div className="w-20 h-8 bg-zinc-800 animate-pulse rounded" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* SHOW THESE ONLY ON THE TARGET PATH */}
                {isProfileAvatarPath && (
                  <div className="hidden md:flex items-center gap-4 animate-in fade-in slide-in-from-left-2">
                    <Link
                      href="/profile/avatar"
                      className={`text-sm font-medium transition-colors ${
                        pathname.includes("/library")
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      Switch User
                    </Link>
                    <Link
                      href="/history"
                      className={`text-sm font-medium transition-colors ${
                        pathname.includes("/history")
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      My Coins
                    </Link>
                    <Link
                      href="/settings"
                      className={`text-sm font-medium transition-colors ${
                        pathname.includes("/settings")
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      Shop
                    </Link>
                    <Link
                      href="/settings"
                      className={`text-sm font-medium transition-colors ${
                        pathname.includes("/settings")
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      Downloads
                    </Link>
                  </div>
                )}
                <SignOutButton redirectUrl="/">
                  <Button variant="ghost">Sign out</Button>
                </SignOutButton>
              </div>
            ) : (
              <div className="space-x-4">
                <Link href="/auth/sign-in">
                  <Button variant="default">Sign in</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button variant="ghost">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
