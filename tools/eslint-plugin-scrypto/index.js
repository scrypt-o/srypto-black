/**
 * Scrypto custom ESLint plugin
 */
module.exports = {
  rules: {
    'no-requireUser-in-pages': require('./src/rules/no-requireUser-in-pages'),
    'server-reads-from-views': require('./src/rules/server-reads-from-views'),
    'api-route-requires-csrf': require('./src/rules/api-route-requires-csrf'),
    'api-route-requires-auth': require('./src/rules/api-route-requires-auth'),
    'prefer-enum-options': require('./src/rules/prefer-enum-options'),
    'prefer-view-layout-names': require('./src/rules/prefer-view-layout-names'),
    'prefetch-guidance': require('./src/rules/prefetch-guidance'),
  },
};
