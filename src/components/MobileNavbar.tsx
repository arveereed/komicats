"use client";

import {
  ArrowLeft,
  Bell,
  BellIcon,
  HomeIcon,
  Loader2,
  LogOutIcon,
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
import { SignOutButton, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { syncUser } from "@/actions/user.action";

type SyncedUserType = Awaited<ReturnType<typeof syncUser>>;

function MobileNavbar({ user }: { user: SyncedUserType }) {
  const { signOut } = useClerk();

  const { isSignedIn, isLoaded } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

    /* if (message) {
      items.push({
        id: 1,
        title: message,
        description: "Your account state was updated.",
      }); 
    }*/

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

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const profileHref = isProfileAvatarPath
    ? "/profile/avatar/profile"
    : "/profile/avatar";

  const [signingOut, setSigningOut] = useState(false);

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

  return (
    <div className="flex md:hidden h-16 items-center space-x-2 justify-between">
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
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="flex h-full w-[300px] flex-col border-white/10 bg-zinc-950 text-white"
          >
            <SheetHeader className="shrink-0">
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>

            <nav className="mt-6 flex flex-1 flex-col">
              {isSignedIn ? (
                <div className="flex flex-col gap-4">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/profile/avatar/profile">
                      <HomeIcon className="w-4 h-4" />
                      Home
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="flex items-center justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/profile/avatar/my-coins">
                      <BellIcon className="w-4 h-4" />
                      My Coins
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="flex items-center justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/profile/avatar/shop">
                      <UserIcon className="w-4 h-4" />
                      Shop
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="flex items-center justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/profile/avatar/downloads">
                      <UserIcon className="w-4 h-4" />
                      Downloads
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-1 flex-col">
                  <Link href="/" className="w-full">
                    <Button className="w-full bg-white text-black hover:bg-white/90">
                      Home
                    </Button>
                  </Link>

                  <div className="mt-auto flex flex-col gap-2">
                    <Link href="/auth/sign-in" className="w-full">
                      <Button className="w-full bg-white text-black hover:bg-white/90">
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
          <div className="flex justify-center items-center space-x-3">
            <Link href={profileHref}>
              <Button
                variant="ghost"
                className="h-11 rounded-xl border border-white/10 bg-white/[0.04] cursor-default px-2 hover:bg-white/[0.08]"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user.fullname || ""}
                    />
                    <AvatarFallback className="rounded-lg bg-zinc-800 text-white">
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
                  <Loader2 className="animate-spin size-2" /> Loading..
                </>
              ) : (
                "Sign out"
              )}
            </Button>
          </div>
        )}

      {isLoaded && isSignedIn && user && isProfileAvatarPath && (
        <div className="flex items-center gap-3">
          <div className="ml-2 flex items-center space-x-4">
            {/* SEARCH BUTTON */}
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

            {/* NOTIFICATION BUTTON */}
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

            <Link href="/profile/avatar/setting">
              <Avatar className="h-9 w-9 rounded-full">
                <AvatarImage src={"profileImage"} alt={"profileName"} />
                <AvatarFallback className="rounded-lg bg-zinc-800 text-white">
                  {/* {typeof profileName === "string" &&
                    profileName.length > 0 ? (
                      profileName.slice(0, 1).toUpperCase()
                    ) : ( */}
                  <UserCircle2 className="h-4 w-4" />
                  {/* )} */}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      )}

      {isProfileAvatarSetting && (
        <Button
          asChild
          variant="ghost"
          className="group h-10 rounded-xl px-3 text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
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
        <Avatar className="h-9 w-9 rounded-full">
          <AvatarImage src={"profileImage"} alt={"profileName"} />
          <AvatarFallback className="rounded-lg bg-zinc-800 text-white">
            {/*  {typeof profileName === "string" && profileName.length > 0 ? (
                profileName.slice(0, 1).toUpperCase()
              ) : ( */}
            <UserCircle2 className="h-4 w-4" />
            {/* )} */}
          </AvatarFallback>
        </Avatar>
      )}
      {isLoaded && !isSignedIn && (
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
  );
}

export default MobileNavbar;
