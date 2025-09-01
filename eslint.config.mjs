// ESLint flat config: Next.js base + local Scrypto plugin
// Consolidated to a single flat config (no legacy .eslintrc*).
import nextPlugin from '@next/eslint-plugin-next'
import scrypto from './tools/eslint-plugin-scrypto/index.js'
import tsParser from '@typescript-eslint/parser'
import tseslint from '@typescript-eslint/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'

export default [
  // Ignore generated/build outputs and large artifacts
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'logs/**',
    ],
  },
  // Note: Avoid importing eslint-config-next to prevent Rushstack patch.
  // Base rules/plugins for all files (JS/TS)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      react,
      '@next/next': nextPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // SECURITY & CRASHES
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',

      // ASYNC BUGS
      'no-async-promise-executor': 'error',
      'require-await': 'error',

      // TYPE SAFETY (kept at warn for build velocity)
      // TS-specific rules added in a TS-only block below

      // REACT SAFETY
      'react/no-unescaped-entities': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-children-prop': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // NEXT.JS SPECIFIC
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-sync-scripts': 'error',

      // CODE QUALITY (Warnings OK)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',

      // DELIBERATELY OFF
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  // TypeScript-specific parser + rules (type-aware)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    files: ['app/patient/**/page.tsx'],
    plugins: { scrypto },
    rules: {
      'scrypto/no-requireUser-in-pages': 'error',
      'scrypto/server-reads-from-views': 'error',
      'scrypto/prefer-view-layout-names': 'error',
    },
  },
  {
    files: ['app/**/page.tsx'],
    plugins: { scrypto },
    rules: {
      'scrypto/server-reads-from-views': 'error',
      'scrypto/prefer-view-layout-names': 'error',
    },
  },
  {
    files: ['app/api/**/route.ts'],
    plugins: { scrypto },
    rules: {
      'scrypto/api-route-requires-csrf': 'error',
      'scrypto/api-route-requires-auth': 'error',
    },
  },
  {
    files: ['app/api/auth/**/route.ts'],
    plugins: { scrypto },
    rules: {
      // Auth routes are exempt from CSRF and may not have a user session
      'scrypto/api-route-requires-csrf': 'off',
      'scrypto/api-route-requires-auth': 'off',
    },
  },
  {
    files: ['components/**/*.tsx', 'config/**/*.ts'],
    plugins: { scrypto },
    rules: {
      'scrypto/prefer-enum-options': 'error',
      'scrypto/prefetch-guidance': 'warn',
      'scrypto/prefer-view-layout-names': 'error',
    },
  },
  // Overrides
  {
    files: ['app/api/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['__mocks__/**/*.{js,ts}'],
    rules: { 'require-await': 'off' },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
]
