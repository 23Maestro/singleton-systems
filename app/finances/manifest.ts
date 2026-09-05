import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finances | Singleton Systems",
    short_name: "Finances",
    start_url: "/finances-form",
    scope: "/",
    display: "standalone",
    background_color: "#f1f4f8",
    theme_color: "#f1f4f8",
    icons: [
      { src: "/ledger/ledger-192.png", sizes: "192x192", type: "image/png" },
      { src: "/ledger/ledger-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
