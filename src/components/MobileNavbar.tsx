"use client";

import {
  ArrowLeft,
  Bell,
  BellIcon,
  HomeIcon,
  Loader2,
  MenuIcon,
  Search,
  UserCircle2,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMemo, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { usePathname, useRouter } from "next/navigation";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type SyncedUserType = Awaited<ReturnType<typeof syncUser>>;

function MobileNavbar({ user }: { user: SyncedUserType }) {
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const pathname = usePathname() || "";
  const router = useRouter();

  const isProfileAvatarPath =
    pathname.includes("/profile/avatar/profile") ||
    pathname.includes("/profile/avatar/my-coins") ||
    pathname.includes("/profile/avatar/shop") ||
    pathname.includes("/profile/avatar/search") ||
    pathname.includes("/profile/avatar/downloads");

  const isProfileAvatarSetting = pathname.includes("/profile/avatar/setting");

  const handleSearch = () => {
    const query = searchQuery.trim();
    router.push(
      query
        ? `/profile/avatar/search?q=${encodeURIComponent(query)}`
        : "/profile/avatar/search",
    );
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
    <div className="flex h-16 items-center justify-between space-x-2 md:hidden">
      {!isProfileAvatarPath && !isProfileAvatarSetting && (
        <Link
          href={isSignedIn && user ? profileHref : "/"}
          className="font-mono text-xl font-bold tracking-wider text-white"
        >
          Komicats
        </Link>
      )}

      {isProfileAvatarPath && (
        <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          {/* CHANGED: bg-[#08161c] -> bg-black */}
          <SheetContent
            side="right"
            className="flex h-full w-[300px] flex-col border-white/10 bg-black text-white"
          >
            <SheetHeader className="shrink-0">
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>

            <nav className="mt-6 flex flex-1 flex-col">
              {isSignedIn ? (
                <div className="flex flex-col gap-4">
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/profile/avatar/profile">
                      <HomeIcon className="h-4 w-4" />
                      Home
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/profile/avatar/my-coins">
                      <BellIcon className="h-4 w-4" />
                      My Coins
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/profile/avatar/shop">
                      <UserIcon className="h-4 w-4" />
                      Shop
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/profile/avatar/downloads">
                      <UserIcon className="h-4 w-4" />
                      Downloads
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-1 flex-col">
                  <Link href="/" className="w-full">
                    <Button className="w-full bg-teal-400 text-slate-950 hover:bg-teal-300">
                      Home
                    </Button>
                  </Link>

                  <div className="mt-auto flex flex-col gap-2">
                    <Link href="/auth/sign-in" className="w-full">
                      <Button className="w-full bg-teal-400 text-slate-950 hover:bg-teal-300">
                        Sign in
                      </Button>
                    </Link>

                    <Link href="/auth/sign-up" className="w-full">
                      <Button
                        variant="ghost"
                        className="w-full text-white hover:bg-white/10 hover:text-white"
                      >
                        Sign up
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
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

      {isLoaded && isSignedIn && user && isProfileAvatarPath && (
        <div className="flex min-w-0 items-center gap-2">
          <div className="ml-2 flex min-w-0 items-center gap-2">
            <div className="flex h-12 w-full max-w-[220px] items-center rounded-md bg-[#35535b] px-4">
              <Search className="mr-3 h-5 w-5 shrink-0 text-white/80" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search Comics.."
                className="h-full min-w-0 border-0 bg-transparent p-0 text-[16px] text-white shadow-none outline-none ring-0 placeholder:text-white/55 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

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
              {/* CHANGED: bg-[#08161c]/95 -> bg-black/90 */}
              <PopoverContent
                align="end"
                className="w-96 rounded-2xl border border-white/10 bg-black/90 p-0 text-white shadow-xl backdrop-blur-xl"
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

              {/* CHANGED: bg-[#08161c] -> bg-black */}
              <AlertDialogContent className="overflow-hidden border border-white/10 bg-black p-0 text-white shadow-2xl shadow-black/40 sm:max-w-md">
                <div className="relative">
                  {/* Keep the fancy gradients but slightly toned down for black bg */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,153,160,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(72,117,126,0.05),transparent_32%),linear-gradient(135deg,#000_0%,#000_40%,#000_100%)]" />
                  <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-teal-300/10 blur-3xl" />
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
                  <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-emerald-300/10 blur-3xl" />
                  <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.7)_100%)]" />

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

      {isProfileAvatarSetting && (
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
  );
}

export default MobileNavbar;
