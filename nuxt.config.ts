import tailwindcss from "@tailwindcss/vite"
import type { InputOption } from "rollup"

export default defineNuxtConfig({
  compatibilityDate: "2026-05-12",
  ssr: false,
  srcDir: "app/",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || "http://localhost:4000/api",
    },
  },
  app: {
    head: {
      title: "WazaShop",
      meta: [
        {
          name: "description",
          content: "WazaShop, la plateforme WhatsApp Commerce pour lancer et piloter votre boutique.",
        },
      ],
    },
  },
  hooks: {
    "vite:extendConfig"(config, { isClient }) {
      if (!isClient) {
        return
      }

      const mutableConfig = config as typeof config & {
        build?: {
          rollupOptions?: {
            input?: InputOption
          }
        }
      }

      const input = config.build?.rollupOptions?.input as InputOption | undefined
      if (!input || typeof input === "string" || Array.isArray(input)) {
        return
      }

      if ("entry" in input && !("server" in input) && input.entry) {
        mutableConfig.build ||= {}
        mutableConfig.build.rollupOptions ||= {}
        mutableConfig.build.rollupOptions.input = {
          ...input,
          // Nuxt 4 dev expects a `server` key even in SPA mode.
          server: input.entry,
        }
      }
    },
  },
})
