"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function OfflineWatcher() {
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const updateStatus = () => {
      const offline = !navigator.onLine;
      setIsOffline(offline);

      if (offline && pathname !== "/offline") {
        router.push("/offline");
      }
    };

    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [pathname, router]);

  return null;
}
