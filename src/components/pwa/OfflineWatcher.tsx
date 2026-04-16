"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function OfflineWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (pathname !== "/offline") {
      sessionStorage.setItem("last-online-path", currentPath);
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
  }, [pathname, searchParams, router]);

  return null;
}
