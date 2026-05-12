import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  globalIgnores([
    ".nuxt/**",
    ".output/**",
    ".next/**",
    "node_modules/**",
    "dist/**",
  ]),
])
