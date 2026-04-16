import Script from "next/script";

export default function StartupNetworkGuard() {
  return (
    <Script id="startup-network-guard" strategy="beforeInteractive">
      {`
        (function () {
          try {
            var isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
            var path = typeof window !== "undefined" ? window.location.pathname : "";
            var alreadyOfflinePage = path === "/offline" || path === "/offline.html";

            if (isOffline && !alreadyOfflinePage) {
              window.location.replace("/offline");
            }
          } catch (error) {
            console.error("startup-network-guard", error);
          }
        })();
      `}
    </Script>
  );
}
