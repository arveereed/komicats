"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPhone|iPad|iPod/i.test(ua);
    setIsIOS(ios);

    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    if (isStandalone) {
      setInstalled(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (installed) {
    return null;
  }

  if (isIOS) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-xl bg-black/80 px-4 py-3 text-sm text-white shadow-lg backdrop-blur">
        On iPhone, tap <strong>Share</strong> →{" "}
        <strong>Add to Home Screen</strong>
      </div>
    );
  }

  if (!deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={!deferredPrompt}
      className="fixed bottom-4 right-4 z-50 rounded-xl bg-blue-600 px-4 py-2 text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {" "}
      {deferredPrompt ? "Install App" : "Install not available yet"}{" "}
    </button>
  );
}
