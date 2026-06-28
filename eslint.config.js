import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

/**
 * Root flat config for the Pumdoki monorepo.
 *
 * Intentionally pragmatic: the existing prototype carries unused imports/vars
 * and other noise that is not worth mass-editing before backend integration.
 * Such rules are downgraded to warnings so CI lint stays green, while genuine
 * errors (react-hooks violations, undefined references) still fail the build.
 * New code can be held to a stricter bar over time.
 */
export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/.vite/**",
    ],
  },

  // Frontend (React 19 + browser).
  {
    files: ["apps/web/**/*.{js,jsx}"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Genuine hook-ordering bugs stay hard errors; the newer React-Compiler
      // purity rules are intentionally left off — the prototype uses
      // Math.random()/Date.now() for decorative effects and rewriting that is
      // out of scope for the Phase 1 foundation.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },

  // Test files (Vitest + jsdom + node globals).
  {
    files: ["**/*.{test,spec}.{js,jsx}", "apps/web/src/test/**/*.{js,jsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
  },

  // Node-side config & tooling files.
  {
    files: ["**/*.config.{js,cjs,mjs}", "tests/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },

  prettier,
];
