"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export default function Navbar() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const syncUser = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to sync user");
        }

        setUser(data);
        setMessage(data.message || "User synced");
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, []);
  console.log(JSON.stringify(user, null, 2));

  const pathname = usePathname() || "";
  const router = useRouter();
  const [openSwitchDialog, setOpenSwitchDialog] = useState(false);

  const isProfileAvatarPath =
    pathname.includes("/profile/avatar/profile") ||
    pathname.includes("/profile/avatar/my-coins") ||
    pathname.includes("/profile/avatar/shop") ||
    pathname.includes("/profile/avatar/downloads");

  const handleConfirmSwitchUser = () => {
    setOpenSwitchDialog(false);
    router.push("/profile/avatar");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href={
                isProfileAvatarPath
                  ? `/profile/avatar/profile`
                  : `/profile/avatar`
              }
              className="font-mono text-xl font-bold tracking-wider text-primary"
            >
              Komicats
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-zinc-800" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {isProfileAvatarPath && (
                  <div className="animate-in fade-in slide-in-from-left-2 hidden items-center gap-4 md:flex">
                    <AlertDialog
                      open={openSwitchDialog}
                      onOpenChange={setOpenSwitchDialog}
                    >
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className={`text-sm font-medium transition-colors ${
                            pathname === "/profile/avatar"
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          Switch User
                        </button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-left text-xl">
                            Switch user?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-left">
                            You’re about to leave the current avatar profile
                            view and switch to another user.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                          You can always come back to this profile later.
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-lg">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleConfirmSwitchUser}
                            className="rounded-lg"
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Link
                      href="/profile/avatar/my-coins"
                      className={`text-sm font-medium transition-colors ${
                        pathname.includes("/profile/avatar/my-coins")
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      My Coins
                    </Link>

                    <Link
                      href="/profile/avatar/shop"
                      className={`text-sm font-medium transition-colors ${
                        pathname.includes("/profile/avatar/shop")
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      Shop
                    </Link>

                    <Link
                      href="/profile/avatar/downloads"
                      className={`text-sm font-medium transition-colors ${
                        pathname.includes("/profile/avatar/downloads")
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
