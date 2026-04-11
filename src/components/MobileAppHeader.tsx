"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { syncUser } from "@/actions/user.action";

import Image from "next/image";
import {
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
} from "@/actions/notification.action";
import { useIsInstalledApp } from "@/hooks/useIsInstalledApp";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

type SyncedUserType = Awaited<ReturnType<typeof syncUser>>;
type NotificationCount = Awaited<ReturnType<typeof getUnreadNotificationCount>>;

export default function MobileAppHeader({
  user,
  notificationsCount,
}: {
  user: SyncedUserType;
  notificationsCount: NotificationCount;
}) {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const pathname = usePathname() || "";

  const isInstalledApp = useIsInstalledApp();

  const isProfileAvatarPath =
    pathname.includes("/profile/avatar/profile") ||
    pathname.includes("/profile/avatar/my-coins") ||
    pathname.includes("/profile/avatar/shop") ||
    pathname.includes("/profile/avatar/search") ||
    pathname.includes("/profile/avatar/notifications") ||
    pathname.includes("/profile/avatar/downloads");

  const inGamePath = pathname.includes("/profile/avatar/my-coins/game");
  const isOnRead = pathname.includes("/profile/avatar/comics");
  const isProfileAvatarSetting = pathname.includes("/profile/avatar/setting");

  if (isOnRead || inGamePath) return null;

  const handleSearch = () => {
    const query = searchQuery.trim();
    router.push(
      query
        ? `/profile/avatar/search?q=${encodeURIComponent(query)}`
        : "/profile/avatar/search",
    );
  };

  if (
    (!isInstalledApp && !isProfileAvatarPath) ||
    !isSignedIn ||
    isProfileAvatarSetting ||
    pathname === "/profile/avatar"
  )
    return null;

  if (!isInstalledApp || isAdmin) return null;

  /* Mobile navbar Menu */
  return (
    <div className="flex h-16 items-center justify-between px-5 space-x-2 md:hidden">
      <div className="flex items-center ml-3 mr-10 justify-center space-x-2">
        <Image
          alt="Komicats Logo"
          width={44}
          height={44}
          src="/pwa-icon-2.png"
        />
        <span className="text-xl font-bold font-sans">Komicats</span>
      </div>
      {isLoaded && isSignedIn && user && isProfileAvatarPath && (
        <div className="flex min-w-0 items-center gap-2">
          <div className="ml-2 flex min-w-0 items-center gap-2">
            {/* Search */}
            <div className="flex  h-12 w-[360px] items-center rounded-md bg-[#35535b] px-4">
              <Search className="mr-3 h-5 w-5 text-white/80" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search Comics.."
                className="h-full border-0 bg-transparent p-0 text-[14px] text-white shadow-none outline-none ring-0 placeholder:text-white/55 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Link
              href="/profile/avatar/notifications"
              className="relative shrink-0"
              onClick={async () => {
                if (notificationsCount > 0) {
                  await markAllNotificationsAsRead();
                }
              }}
            >
              <Image
                alt="Notification Icon"
                width={24}
                height={24}
                src="/icons/notif.png"
              />
              {notificationsCount > 0 && (
                <Badge className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-300 px-1 text-[10px] text-slate-950">
                  {notificationsCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
