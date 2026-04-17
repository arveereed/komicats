import Script from "next/script";

export default function StartupNetworkGuard() {
  return (
    <Script id="startup-network-guard" strategy="beforeInteractive">
      {`
        (function () {
          try {
            var isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
            var path = typeof window !== "undefined" ? window.location.pathname : "";

            var isDownloadsRoute = path.indexOf("/profile/avatar/downloads") === 0;
            var isOfflinePage = path === "/offline" || path === "/offline.html";

            if (isOffline && !isDownloadsRoute && !isOfflinePage) {
              window.location.replace("/profile/avatar/downloads");
            }
          } catch (error) {
            console.error("startup-network-guard", error);
          }
        })();
      `}
    </Script>
  );
}
