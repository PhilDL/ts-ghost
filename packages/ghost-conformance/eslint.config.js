import { defineConfig } from "eslint/config";

import root from "../../eslint.config.js";

// The suite must see the client exactly as consumers do: package entry points only.
export default defineConfig([
  ...root,
  {
    files: ["**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: ["@ts-ghost/*/*", "**/ts-ghost-admin-api/**", "**/ts-ghost-core-api/**"] },
      ],
    },
  },
]);
