"use client";

import { useEffect, useState } from "react";
import { Download, Plus, Share2, X } from "lucide-react";

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
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const ua = window.navigator.userAgent;
    setIsAndroid(/Android/i.test(ua));
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));

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

  if (!mounted || isInstalled) return null;

  const canPrompt = !!promptEvent;
  const shouldShowButton = canPrompt || isAndroid || isIOS;

  if (!shouldShowButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[320px] flex-col items-end gap-3">
      {showHelp && !canPrompt && (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/95 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">
                {isIOS ? "Install on iPhone" : "Install on Android"}
              </p>
              <p className="mt-1 text-xs text-white/60">
                Add this app to your home screen
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Close install help"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 px-4 py-4 text-sm">
            {isIOS ? (
              <>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                    1
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/70">Tap</p>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium">
                      <Share2 className="h-4 w-4" />
                      Share
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                    2
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/70">Choose</p>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium">
                      <Plus className="h-4 w-4" />
                      Add to Home Screen
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <p className="text-white/70">Open browser menu</p>
                    <p className="mt-1 text-xs font-medium text-white">
                      Tap the three-dot menu
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                    2
                  </div>
                  <div>
                    <p className="text-white/70">Select install option</p>
                    <p className="mt-1 text-xs font-medium text-white">
                      Choose Install app or Add to Home screen
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button
        onClick={onInstall}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98]"
      >
        <Download className="h-4 w-4" />
        {canPrompt ? "Install App" : "How to Install"}
      </button>
    </div>
  );
}
