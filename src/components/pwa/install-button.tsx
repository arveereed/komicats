"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export default function InstallButton() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isAndroid = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android/i.test(navigator.userAgent);
  }, []);

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const checkInstalled = () => {
      const standalone =
        mediaQuery.matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true;

      setIsInstalled(standalone);

      if (standalone) {
        setPromptEvent(null);
        setShowHelp(false);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setPromptEvent(null);
      setShowHelp(false);
    };

    checkInstalled();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery.addEventListener("change", checkInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener("change", checkInstalled);
    };
  }, []);

  const onInstall = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      setPromptEvent(null);

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }

      return;
    }

    if (isAndroid || isIOS) {
      setShowHelp((prev) => !prev);
    }
  };

  if (isInstalled) return null;

  const canPrompt = !!promptEvent;
  const shouldShowButton = canPrompt || isAndroid || isIOS;

  if (!shouldShowButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-xs flex-col items-end gap-2">
      {showHelp && !canPrompt && isAndroid && (
        <div className="rounded-xl bg-black px-4 py-3 text-xs text-white shadow-lg">
          <div className="font-semibold">Install on Android</div>
          <div className="mt-1">
            Open this site in Chrome, tap the menu{" "}
            <span className="font-semibold">⋮</span> then choose{" "}
            <span className="font-semibold">Install app</span> or{" "}
            <span className="font-semibold">Add to Home screen</span>.
          </div>
        </div>
      )}

      {showHelp && !canPrompt && isIOS && (
        <div className="rounded-xl bg-black px-4 py-3 text-xs text-white shadow-lg">
          <div className="font-semibold">Install on iPhone</div>
          <div className="mt-1">
            Open this site in Safari, tap the{" "}
            <span className="font-semibold">Share</span> button, then choose{" "}
            <span className="font-semibold">Add to Home Screen</span>.
          </div>
        </div>
      )}

      <button
        onClick={onInstall}
        className="cursor-pointer rounded-full bg-blue-600 px-5 py-3 text-white shadow-lg hover:bg-blue-700"
      >
        {canPrompt ? "Install App" : "How to Install"}
      </button>
    </div>
  );
}
