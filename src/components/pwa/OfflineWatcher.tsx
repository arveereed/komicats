"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function OfflineWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isDownloadsRoute = pathname.startsWith("/profile/avatar/downloads");

    if (navigator.onLine && pathname !== "/offline") {
      sessionStorage.setItem("last-online-path", pathname);
    }

    const redirectWhenOffline = () => {
      const currentlyOffline = navigator.onLine === false;
      const currentPath = window.location.pathname;
      const alreadyOnDownloads = currentPath.startsWith(
        "/profile/avatar/downloads",
      );

      if (currentlyOffline && !alreadyOnDownloads) {
        router.replace("/profile/avatar/downloads");
      }
    };

    const handleOnline = () => {
      const currentPath = window.location.pathname;

      if (currentPath === "/offline") {
        const lastOnlinePath =
          sessionStorage.getItem("last-online-path") || "/";
        router.replace(lastOnlinePath);
        router.refresh();
      }
    };

    if (!isDownloadsRoute) {
      redirectWhenOffline();
    }

    window.addEventListener("offline", redirectWhenOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("pageshow", redirectWhenOffline);
    document.addEventListener("visibilitychange", redirectWhenOffline);

    return () => {
      window.removeEventListener("offline", redirectWhenOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("pageshow", redirectWhenOffline);
      document.removeEventListener("visibilitychange", redirectWhenOffline);
    };
  }, [pathname, router]);

  return null;
}
