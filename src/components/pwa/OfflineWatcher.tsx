"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function OfflineWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/offline") {
      sessionStorage.setItem("last-online-path", pathname);
    }

    const redirectToOffline = () => {
      if (!navigator.onLine && pathname !== "/offline") {
        router.replace("/offline");
      }
    };

    const handleOnline = () => {
      if (pathname === "/offline") {
        const lastOnlinePath =
          sessionStorage.getItem("last-online-path") || "/";
        router.replace(lastOnlinePath);
        router.refresh();
      }
    };

    redirectToOffline();

    window.addEventListener("offline", redirectToOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("pageshow", redirectToOffline);
    document.addEventListener("visibilitychange", redirectToOffline);

    return () => {
      window.removeEventListener("offline", redirectToOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("pageshow", redirectToOffline);
      document.removeEventListener("visibilitychange", redirectToOffline);
    };
  }, [pathname, router]);

  return null;
}
