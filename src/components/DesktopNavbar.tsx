"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ArrowLeft, Bell, Loader2, Search, UserCircle2 } from "lucide-react";
import { syncUser } from "@/actions/user.action";
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

type SyncedUserType = Awaited<ReturnType<typeof syncUser>>;

export default function DesktopNavbar({ user }: { user: SyncedUserType }) {
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const pathname = usePathname() || "";
  const router = useRouter();

  const isProfileAvatarPath =
    pathname.includes("/profile/avatar/profile") ||
    pathname.includes("/profile/avatar/my-coins") ||
    pathname.includes("/profile/avatar/shop") ||
    pathname.includes("/profile/avatar/downloads");

  const isProfileAvatarSetting = pathname.includes("/profile/avatar/setting");

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/profile/avatar/shop?q=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
  };

  const notifications = useMemo(() => {
    const items: { id: number; title: string; description: string }[] = [];

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
  }, [pathname]);

  const unreadCount = notifications[0]?.id === 99 ? 0 : notifications.length;

  const profileHref = isProfileAvatarPath
    ? "/profile/avatar/profile"
    : "/profile/avatar";

  const navLinkClass = (active: boolean) =>
    `relative text-[15px] font-medium transition-colors ${
      active ? "text-teal-300" : "text-white/75 hover:text-white"
    }`;

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.log("Error in handleSignOut fc: ", error);
    } finally {
      setSigningOut(false);
    }
  };

  const isOnRead = pathname.includes("/profile/avatar/comics");

  const [openSwitchDialog, setOpenSwitchDialog] = useState(false);

  const handleConfirmSwitchUser = () => {
    setOpenSwitchDialog(false);
    localStorage.removeItem("komicats_active_profile");
    router.push("/profile/avatar");
  };

  if (isOnRead) return null;

  return (
    <div className="hidden items-center justify-between md:flex">
      <div className="flex h-16 items-center gap-10">
        {isProfileAvatarSetting ? (
          <Button
            asChild
            variant="ghost"
            className="group h-10 rounded-xl px-3 text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            <Link
              href="/profile/avatar/profile"
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </Link>
          </Button>
        ) : (
          <Link
            href={isSignedIn && user ? profileHref : "/"}
            className="hidden font-mono text-xl font-bold tracking-wider text-white md:flex"
          >
            Komicats
          </Link>
        )}

        {isProfileAvatarPath && (
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/profile/avatar/my-coins"
              className={navLinkClass(
                pathname.includes("/profile/avatar/my-coins"),
              )}
            >
              My Coins
              {pathname.includes("/profile/avatar/my-coins") && (
                <span className="absolute -bottom-1 left-0 h-px w-full bg-teal-300" />
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
                <span className="absolute -bottom-1 left-0 h-px w-full bg-teal-300" />
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
                <span className="absolute -bottom-1 left-0 h-px w-full bg-teal-300" />
              )}
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!isLoaded && (
          <>
            <div className="h-8 w-20 animate-pulse rounded bg-white/10" />
            <div className="h-8 w-20 animate-pulse rounded bg-white/10" />
          </>
        )}

        {isLoaded && isSignedIn && user && isProfileAvatarPath && (
          <div className="flex items-center gap-3">
            <div className="ml-2 flex items-center space-x-4">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full text-white hover:bg-white/10 hover:text-white"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-80 rounded-2xl border border-white/10 bg-[#08161c]/95 p-3 text-white shadow-xl backdrop-blur-xl"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold">Search</p>
                      <p className="text-xs text-white/50">
                        Search items in the avatar shop.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search avatars, items, coins..."
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearch();
                        }}
                      />
                      <Button
                        onClick={handleSearch}
                        className="bg-teal-400 text-slate-950 hover:bg-teal-300"
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
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-300 px-1 text-[10px] text-slate-950">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-96 rounded-2xl border border-white/10 bg-[#08161c]/95 p-0 text-white shadow-xl backdrop-blur-xl"
                >
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    <p className="text-xs text-white/50">
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
                        <p className="mt-1 text-xs text-white/50">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Switch User Dialog */}
              <AlertDialog
                open={openSwitchDialog}
                onOpenChange={setOpenSwitchDialog}
              >
                <AlertDialogTrigger asChild>
                  <button type="button" className="group">
                    <Avatar className="h-9 w-9 rounded-full ring-1 ring-white/10 transition group-hover:ring-cyan-300/30">
                      <AvatarImage src={"profileImage"} alt={"profileName"} />
                      <AvatarFallback className="rounded-full bg-white/10 text-white">
                        <UserCircle2 className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="overflow-hidden border border-white/10 bg-[#08161c] p-0 text-white shadow-2xl shadow-black/40 sm:max-w-md">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,153,160,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(72,117,126,0.10),transparent_32%),linear-gradient(135deg,#10242b_0%,#08161c_40%,#030b0f_100%)]" />
                    <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-teal-300/10 blur-3xl" />
                    <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-emerald-300/10 blur-3xl" />
                    <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.22)_70%,rgba(0,0,0,0.5)_100%)]" />

                    <div className="relative z-10 px-6 py-6">
                      <AlertDialogHeader className="space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner shadow-white/5">
                          <UserCircle2 className="h-6 w-6 text-cyan-200" />
                        </div>

                        <AlertDialogTitle className="text-left text-2xl font-semibold tracking-tight text-white">
                          Switch user?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-left leading-6 text-zinc-300">
                          You’re about to leave the current avatar profile view
                          and switch to another user.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-300 backdrop-blur-sm">
                        You can always come back to this profile later.
                      </div>

                      <AlertDialogFooter className="mt-6 flex-col gap-3 sm:flex-row">
                        <AlertDialogCancel className="rounded-xl border border-white/10 bg-white/[0.03] text-white hover:bg-white/10">
                          Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                          onClick={handleConfirmSwitchUser}
                          className="rounded-xl border border-cyan-300/20 bg-gradient-to-r from-[#5699a0] via-[#48757e] to-[#2f5c63] text-white hover:opacity-90"
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </div>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {isLoaded &&
          isSignedIn &&
          user &&
          !isProfileAvatarPath &&
          !isProfileAvatarSetting && (
            <div className="flex items-center justify-center space-x-3">
              <Link href={profileHref}>
                <Button
                  variant="ghost"
                  className="h-11 cursor-default rounded-xl border border-white/10 bg-white/[0.04] px-2 hover:bg-white/[0.08]"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9 rounded-lg">
                      <AvatarImage
                        src={user?.image || ""}
                        alt={user.fullname || ""}
                      />
                      <AvatarFallback className="rounded-lg bg-white/10 text-white">
                        {typeof user.fullname === "string" &&
                        user.fullname.length > 0 ? (
                          user.fullname.slice(0, 1).toUpperCase()
                        ) : (
                          <UserCircle2 className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <span className="hidden max-w-[120px] truncate text-sm font-medium text-white md:inline-block">
                      {user.fullname}
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
                    <Loader2 className="size-4 animate-spin" /> Loading...
                  </>
                ) : (
                  "Sign out"
                )}
              </Button>
            </div>
          )}

        {isLoaded && isSignedIn && user && isProfileAvatarSetting && (
          <Avatar className="h-9 w-9 rounded-full ring-1 ring-white/10">
            <AvatarImage src={"profileImage"} alt={"profileName"} />
            <AvatarFallback className="rounded-lg bg-white/10 text-white">
              <UserCircle2 className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}

        {isLoaded && !isSignedIn && (
          <div className="space-x-4">
            <Link href="/auth/sign-in">
              <Button className="bg-teal-400 text-slate-950 hover:bg-teal-300">
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
  );
}
