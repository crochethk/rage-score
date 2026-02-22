import js from "@eslint/js";
import reactDom from "eslint-plugin-react-dom";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react-x";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,

      /**
       * Enable type-aware lint rules as described in:
       * https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
       */
      ...tseslint.configs.recommendedTypeChecked,
      // Stylistic rules (optional)
      ...tseslint.configs.stylisticTypeChecked,

      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,

      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        // @ts-ignore
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      semi: ["error", "always"],
      "@typescript-eslint/no-unused-vars": ["off"],
      "@typescript-eslint/switch-exhaustiveness-check": ["error"],
    },
  },
  {
    files: ["**/contexts/**/*.tsx", "**/contexts/**/*.ts"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
