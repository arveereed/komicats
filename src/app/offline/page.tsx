"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  const handleGoBack = () => {
    const lastOnlinePath = sessionStorage.getItem("last-online-path") || "/";
    router.replace(lastOnlinePath);
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07141a]/60 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-20 w-20 animate-pulse rounded-full bg-cyan-500/20 blur-2xl" />
      </div>

      <p className="mt-4 text-sm font-medium uppercase tracking-widest text-cyan-100/60 animate-pulse">
        You are offline
      </p>

      {!isOnline ? (
        <p className="mt-3 text-xs text-cyan-100/50">
          Waiting for connection...
        </p>
      ) : (
        <button
          onClick={handleGoBack}
          className="mt-5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20"
        >
          Go back
        </button>
      )}
    </div>
  );
}
