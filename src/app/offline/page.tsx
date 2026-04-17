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
    router.replace("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen grid place-items-center bg-[#07141a] text-white p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">You are in offline page</h1>
        <p className="mt-3 text-sm text-zinc-300">
          Please reconnect to continue. Cached pages may still be available.
        </p>
      </div>
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
    </main>
  );
}
