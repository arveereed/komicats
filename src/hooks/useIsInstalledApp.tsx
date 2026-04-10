"use client";

import { useEffect, useState } from "react";

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function getIsRunningAsApp() {
  if (typeof window === "undefined") return false;

  const iosStandalone =
    (window.navigator as NavigatorWithStandalone).standalone === true;

  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const minimalUi = window.matchMedia("(display-mode: minimal-ui)").matches;
  const fullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
  const overlay = window.matchMedia(
    "(display-mode: window-controls-overlay)",
  ).matches;

  return iosStandalone || standalone || minimalUi || fullscreen || overlay;
}

export function useIsInstalledApp() {
  const [isInstalledApp, setIsInstalledApp] = useState(false);

  useEffect(() => {
    const update = () => setIsInstalledApp(getIsRunningAsApp());

    update();

    const standalone = window.matchMedia("(display-mode: standalone)");
    const minimalUi = window.matchMedia("(display-mode: minimal-ui)");
    const fullscreen = window.matchMedia("(display-mode: fullscreen)");
    const overlay = window.matchMedia(
      "(display-mode: window-controls-overlay)",
    );

    standalone.addEventListener("change", update);
    minimalUi.addEventListener("change", update);
    fullscreen.addEventListener("change", update);
    overlay.addEventListener("change", update);

    window.addEventListener("appinstalled", update);

    return () => {
      standalone.removeEventListener("change", update);
      minimalUi.removeEventListener("change", update);
      fullscreen.removeEventListener("change", update);
      overlay.removeEventListener("change", update);
      window.removeEventListener("appinstalled", update);
    };
  }, []);

  return isInstalledApp;
}
