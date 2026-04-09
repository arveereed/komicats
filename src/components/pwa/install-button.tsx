"use client";

import { useEffect, useState } from "react";
import { Share, Plus } from "lucide-react";

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
  const [isSafari, setIsSafari] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPhone|iPad|iPod/i.test(ua);
    const safari =
      /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua);

    setIsIOS(ios);
    setIsSafari(safari);

    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const iosStandalone =
      "standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone;

    if (isStandalone || iosStandalone) {
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

  if (installed || dismissed) return null;

  if (isIOS && isSafari) {
    return (
      <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-2xl border border-white/10 bg-neutral-950/95 p-4 text-white shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Install Komicats</p>
            <p className="mt-1 text-sm text-white/70">
              Add this app to your Home Screen for a full-screen experience.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-md px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Dismiss install hint"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/80">1.</span>
            <span className="text-white/90">Tap the</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-medium">
              <Share className="h-4 w-4" />
              Share
            </span>
            <span className="text-white/90">button</span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-white/80">2.</span>
            <span className="text-white/90">Choose</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-medium">
              <Plus className="h-4 w-4" />
              Add to Home Screen
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 z-50 rounded-xl bg-blue-600 px-4 py-2 text-white shadow-lg transition hover:bg-blue-500"
    >
      Install App
    </button>
  );
}
