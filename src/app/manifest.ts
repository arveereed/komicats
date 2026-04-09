// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Komicats",
    short_name: "Komicats",
    description: "Powered by Next JS",
    start_url: "/",
    display: "standalone",
    background_color: "#07141a",
    theme_color: "#07141a",
    icons: [
      {
        src: "/pwa-icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-icon-2.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
