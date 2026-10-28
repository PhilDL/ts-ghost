/// <reference types="vitest/config" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Unit tests only, no Docker; the live suite runs via vitest.config.live.ts.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.live.test.ts"],
    setupFiles: ["./src/expected-failures.ts"],
    // Only type tests: runtime files are type-checked by `tsc` and would otherwise be reported twice.
    typecheck: {
      include: ["src/**/*.test-d.ts"],
      tsconfig: "./tsconfig.json",
    },
  },
});
