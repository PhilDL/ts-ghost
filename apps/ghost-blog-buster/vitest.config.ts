/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: ["./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}", "./test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
    watchExclude: [".*\\/node_modules\\/.*", ".*\\/build\\/.*", ".*\\/dist\\/.*"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache", ".pnpm", ".turbo", "build", "public"],
  },
});
