import prettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{ts,tsx,js,jsx}"],

    languageOptions: {
      parser: tseslint.parser,
      sourceType: "module",
      ecmaVersion: 2020,
      parserOptions: {},
    },

    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier,
    },

    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-var": "off",
      "prefer-const": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],

      //   "@typescript-eslint/ban-types": [
      //     "error",
      //     {
      //       types: {
      //         Function: false,
      //       },

      //       extendDefaults: true,
      //     },
      //   ],
    },
  },
]);
