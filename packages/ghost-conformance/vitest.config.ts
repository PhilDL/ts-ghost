/// <reference types="vitest/config" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Unit tests only, no Docker; the live suite runs via vitest.config.live.ts.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.live.test.ts"],
    setupFiles: ["./src/expected-failures.ts"],
    // With --typecheck, unit test files are also type-checked; live files are left to `tsc`.
    typecheck: {
      include: ["src/**/*.test.ts"],
      exclude: ["src/**/*.live.test.ts"],
      tsconfig: "./tsconfig.json",
    },
  },
});
