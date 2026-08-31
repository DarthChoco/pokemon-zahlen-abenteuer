import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Pokémon Zahlen Abenteuer",
        short_name: "Pokémon Zahlen",
        description: "Matheaufgaben lösen und Pokémon aus Kanto fangen",
        theme_color: "#e3350d",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App-Shell (HTML/JS/CSS) wird automatisch vorgecacht.
        // Zusätzlich: alle Pokémon-Sprites von PokeAPI (+ jsDelivr-Mirror
        // als Fallback für einzelne Dateien, die über raw.githubusercontent.com
        // wiederholt fehlschlagen) dauerhaft im Service-Worker-Cache ablegen,
        // damit sie auch offline verfügbar sind, sobald die Seite einmal mit
        // Internet geöffnet wurde. maxEntries deckt alle 1025 Pokémon (Gen 1–9)
        // über beide Quellen hinweg mit Puffer ab.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === "https://raw.githubusercontent.com" || url.origin === "https://cdn.jsdelivr.net",
            handler: "CacheFirst",
            options: {
              cacheName: "pokemon-sprites-cache",
              expiration: {
                maxEntries: 1100,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Jahr
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
