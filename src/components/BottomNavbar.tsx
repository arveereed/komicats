"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Download,
  Home,
  ShoppingBag,
  Gamepad2,
  UserCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@clerk/nextjs";
import { useIsInstalledApp } from "@/hooks/useIsInstalledApp";

const navItems = [
  { label: "Home", href: "/profile/avatar/profile", icon: Home },
  { label: "Shop", href: "/profile/avatar/shop", icon: ShoppingBag },
  { label: "Games", href: "/profile/avatar/my-coins", icon: Gamepad2 },
  { label: "Downloads", href: "/profile/avatar/downloads", icon: Download },
];

type Profiles = Awaited<
  ReturnType<typeof import("@/actions/profile.action").getProfiles>
>;

export default function BottomNav({
  profiles,
  activeProfileId,
}: {
  profiles: Profiles;
  activeProfileId: string | null;
}) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const activeProfile =
    profiles.find((profile) => profile.id === activeProfileId) ?? null;

  const isProfileAvatarPath =
    pathname.includes("/profile/avatar/profile") ||
    pathname.includes("/profile/avatar/my-coins") ||
    pathname.includes("/profile/avatar/shop") ||
    pathname.includes("/profile/avatar/search") ||
    pathname.includes("/profile/avatar/notifications") ||
    pathname.includes("/profile/avatar/downloads");

  const inGamePath = pathname.includes("/profile/avatar/my-coins/game");

  const isInstalledApp = useIsInstalledApp();

  if (!isInstalledApp || inGamePath) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden border-t border-white/10 bg-black/95 backdrop-blur">
      {isSignedIn && isProfileAvatarPath && (
        <div className="mx-auto flex h-20 max-w-md items-stretch px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-w-0 flex-1 items-center justify-center"
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={[
                    "flex w-full max-w-[96px] flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all duration-200",
                    isActive
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-300",
                  ].join(" ")}
                >
                  <Icon
                    size={24}
                    strokeWidth={2.2}
                    className={[
                      "mb-1 transition-transform duration-200",
                      isActive ? "scale-105" : "group-hover:scale-105",
                    ].join(" ")}
                  />
                  <span className="truncate text-[11px] font-medium tracking-wide">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}

          <Link
            href="/profile/avatar/settings"
            className="group flex min-w-0 flex-1 items-center justify-center"
            aria-current={
              isActiveRoute("/profile/avatar/profile") ? "page" : undefined
            }
          >
            <div className="flex w-full max-w-[96px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-white transition-all duration-200">
              <Avatar className="mb-1 h-7 w-7 rounded-md">
                <AvatarImage
                  src={activeProfile?.image ?? ""}
                  alt={activeProfile?.name ?? "Profile"}
                  className="rounded-md object-cover"
                />
                <AvatarFallback className="rounded-md bg-white/10 text-white">
                  <UserCircle2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-[11px] font-medium tracking-wide">
                Profile
              </span>
            </div>
          </Link>
        </div>
      )}
    </nav>
  );
}
