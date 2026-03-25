import vue from "@vitejs/plugin-vue";
import fs from "fs";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync("server-key.pem"),
      cert: fs.readFileSync("server-cert.pem"),
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pwa-192x192.png", "pwa-512x512"],
      manifest: {
        name: "画像テキストエディタ",
        short_name: "画像エディタ",
        description: "画像にテキストを追加して編集できるアプリ",
        theme_color: "#4285f4",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
            },
          },
          {
            urlPattern: /^https:\/\/use\.typekit\.net\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "typekit-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
