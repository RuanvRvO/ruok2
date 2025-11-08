// eslint.config.ts
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // JS recommended
  js.configs.recommended,

  // TS recommended
  ...tseslint.configs.recommended,

  // React recommended (works across versions)
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { react: reactPlugin },
    settings: { react: { version: "detect" } },
    rules: {
      ...(reactPlugin.configs.recommended?.rules ?? {}),
    },
  },
]);
