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

    const handleOffline = () => {
      if (!navigator.onLine && pathname !== "/offline") {
        router.replace("/offline");
      }
    };

    handleOffline();

    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("offline", handleOffline);
    };
  }, [pathname, router]);

  return null;
}
