// ESLint flat config using local Scrypto plugin
// Adds TypeScript parser so TS/TSX files parse correctly.
import scrypto from './tools/eslint-plugin-scrypto/index.js'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser },
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
]
