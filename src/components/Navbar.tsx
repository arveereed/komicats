"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SignOutButton, useClerk, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Bell, Loader2, Search, UserCircle2 } from "lucide-react";

type SyncedUser = {
  id?: string;
  fullname?: string;
  name?: string;
  email?: string;
  image?: string;
  imageUrl?: string;
} | null;

export default function Navbar() {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<SyncedUser>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openSwitchDialog, setOpenSwitchDialog] = useState(false);

  const [signingOut, setSigningOut] = useState(false);

  const pathname = usePathname() || "";
  const router = useRouter();

  useEffect(() => {
    const syncCurrentUser = async () => {
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
          console.log(data.error || "Failed to sync user");
        }

        setUser(data.user ?? data ?? null);
        setMessage(data.message || "User synced");
      } catch (error) {
        console.error("SYNC_USER_ERROR", error);
        setMessage("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    syncCurrentUser();
  }, []);

  const isProfileAvatarPath =
    pathname.includes("/profile/avatar/profile") ||
    pathname.includes("/profile/avatar/my-coins") ||
    pathname.includes("/profile/avatar/shop") ||
    pathname.includes("/profile/avatar/downloads");

  const handleConfirmSwitchUser = () => {
    setOpenSwitchDialog(false);
    router.push("/profile/avatar");
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/profile/avatar/shop?q=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
  };

  const notifications = useMemo(() => {
    const items: { id: number; title: string; description: string }[] = [];

    if (message) {
      items.push({
        id: 1,
        title: message,
        description: "Your account state was updated.",
      });
    }

    if (pathname.includes("/profile/avatar/my-coins")) {
      items.push({
        id: 2,
        title: "Coins page active",
        description: "You are currently viewing your coin balance.",
      });
    }

    if (pathname.includes("/profile/avatar/shop")) {
      items.push({
        id: 3,
        title: "Shop is open",
        description: "Browse available avatar items and upgrades.",
      });
    }

    if (pathname.includes("/profile/avatar/downloads")) {
      items.push({
        id: 4,
        title: "Downloads ready",
        description: "Your downloadable assets are available here.",
      });
    }

    if (items.length === 0) {
      items.push({
        id: 99,
        title: "No new notifications",
        description: "You’re all caught up.",
      });
    }

    return items;
  }, [message, pathname]);

  const unreadCount = notifications[0]?.id === 99 ? 0 : notifications.length;

  const profileHref = isProfileAvatarPath
    ? "/profile/avatar/profile"
    : "/profile/avatar";

  const profileName = user?.fullname || user?.name || user?.email || "Profile";
  const profileImage = user?.image || user?.imageUrl || "";

  const navLinkClass = (active: boolean) =>
    `relative text-[15px] font-medium transition-colors ${
      active ? "text-white" : "text-white/80 hover:text-white"
    }`;

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut();
      router.refresh();
      router.push("/");
      setUser(null);
    } catch (error) {
      console.log("Error in handleSignOut fc: ", error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-xl supports-[backdrop-filter]:bg-black/80">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link
              href={isSignedIn && user ? profileHref : "/"}
              className="font-mono text-xl font-bold tracking-wider text-white"
            >
              Komicats
            </Link>

            {isProfileAvatarPath && (
              <div className="hidden items-center gap-8 md:flex">
                <AlertDialog
                  open={openSwitchDialog}
                  onOpenChange={setOpenSwitchDialog}
                >
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className={navLinkClass(pathname === "/profile/avatar")}
                    >
                      Switch User
                      {pathname === "/profile/avatar" && (
                        <span className="absolute -bottom-1 left-0 h-px w-full bg-white/80" />
                      )}
                    </button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-left text-xl">
                        Switch user?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-left text-zinc-400">
                        You’re about to leave the current avatar profile view
                        and switch to another user.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
                      You can always come back to this profile later.
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg border-white/10 bg-transparent text-white hover:bg-white/10">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmSwitchUser}
                        className="rounded-lg bg-white text-black hover:bg-white/90"
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Link
                  href="/profile/avatar/my-coins"
                  className={navLinkClass(
                    pathname.includes("/profile/avatar/my-coins"),
                  )}
                >
                  My Coins
                  {pathname.includes("/profile/avatar/my-coins") && (
                    <span className="absolute -bottom-1 left-0 h-px w-full bg-white/80" />
                  )}
                </Link>

                <Link
                  href="/profile/avatar/shop"
                  className={navLinkClass(
                    pathname.includes("/profile/avatar/shop"),
                  )}
                >
                  Shop
                  {pathname.includes("/profile/avatar/shop") && (
                    <span className="absolute -bottom-1 left-0 h-px w-full bg-white/80" />
                  )}
                </Link>

                <Link
                  href="/profile/avatar/downloads"
                  className={navLinkClass(
                    pathname.includes("/profile/avatar/downloads"),
                  )}
                >
                  Downloads
                  {pathname.includes("/profile/avatar/downloads") && (
                    <span className="absolute -bottom-1 left-0 h-px w-full bg-white/80" />
                  )}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {loading && (
              <div className="h-8 w-20 animate-pulse rounded bg-zinc-800" />
            )}
            {isSignedIn && user && isProfileAvatarPath && (
              <div className="flex items-center gap-3">
                <div className="ml-2 flex items-center gap-3">
                  <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-white hover:bg-white/10 hover:text-white"
                        aria-label="Search"
                      >
                        <Search className="h-6 w-6" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-80 rounded-2xl border border-white/10 bg-zinc-950 p-3 text-white shadow-xl"
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold">Search</p>
                          <p className="text-xs text-zinc-400">
                            Search items in the avatar shop.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search avatars, items, coins..."
                            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSearch();
                            }}
                          />
                          <Button
                            onClick={handleSearch}
                            className="bg-white text-black hover:bg-white/90"
                          >
                            Go
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover
                    open={notificationsOpen}
                    onOpenChange={setNotificationsOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-10 w-10 rounded-full text-white hover:bg-white/10 hover:text-white"
                        aria-label="Notifications"
                      >
                        <Bell className="h-6 w-6" />
                        {unreadCount > 0 && (
                          <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] text-black">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-96 rounded-2xl border border-white/10 bg-zinc-950 p-0 text-white shadow-xl"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-sm font-semibold">Notifications</p>
                        <p className="text-xs text-zinc-400">
                          Recent updates in your account
                        </p>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            className="border-b border-white/10 px-4 py-3 last:border-b-0"
                          >
                            <p className="text-sm font-medium text-white">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
            {isSignedIn && user && !isProfileAvatarPath && (
              <div className="flex justify-center items-center space-x-3">
                <Link href={profileHref}>
                  <Button
                    variant="ghost"
                    className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-2 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9 rounded-lg">
                        <AvatarImage src={profileImage} alt={profileName} />
                        <AvatarFallback className="rounded-lg bg-zinc-800 text-white">
                          {typeof profileName === "string" &&
                          profileName.length > 0 ? (
                            profileName.slice(0, 1).toUpperCase()
                          ) : (
                            <UserCircle2 className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <span className="hidden max-w-[120px] truncate text-sm font-medium text-white md:inline-block">
                        {profileName}
                      </span>
                    </div>
                  </Button>
                </Link>
                <Button
                  disabled={signingOut}
                  onClick={handleSignOut}
                  variant="ghost"
                  className="rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
                >
                  {signingOut ? (
                    <>
                      <Loader2 className="animate-spin size-2" /> Loading..
                    </>
                  ) : (
                    "Sign out"
                  )}
                </Button>
              </div>
            )}
            {!isSignedIn && (
              /* GUEST USER */
              <div className="space-x-4">
                <Link href="/auth/sign-in">
                  <Button className="bg-white text-black hover:bg-white/90">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
