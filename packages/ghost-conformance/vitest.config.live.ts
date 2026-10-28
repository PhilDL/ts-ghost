/// <reference types="vitest/config" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Live suite: needs Docker; global setup starts and bootstraps a pinned Ghost.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: ["src/**/*.live.test.ts"],
    globalSetup: ["./src/live/global-setup.ts"],
    setupFiles: ["./src/expected-failures.ts"],
    testTimeout: 30_000,
    // Seeding runs in beforeAll hooks, with every file hitting one Ghost at once.
    hookTimeout: 60_000,
  },
});
