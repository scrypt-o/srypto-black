/**
 * Ensure API handlers check supabase.auth.getUser() in POST/PUT/DELETE.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Non-GET API handlers must authenticate user via supabase.auth.getUser().' },
    messages: {
      missingAuthCheck: 'Non-GET API handlers should authenticate with supabase.auth.getUser() before DB writes.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isApiRoute = /\/app\/api\/.+\/route\.(t|j)s$/.test(filename);
    if (!isApiRoute) return {};

    function isNonGetExportedHandler(node) {
      return node.type === 'FunctionDeclaration' && node.id && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(node.id.name);
    }

    function containsAuthGetUser(body) {
      const sourceCode = context.getSourceCode().getText(body);
      // Accept either direct supabase.auth.getUser() or helper getAuthenticatedApiClient()
      return /auth\.getUser\s*\(/.test(sourceCode) || /getAuthenticatedApiClient\s*\(/.test(sourceCode);
    }

    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration) return;
        const decl = node.declaration;
        if (isNonGetExportedHandler(decl)) {
          if (!containsAuthGetUser(decl)) {
            context.report({ node: decl.id, messageId: 'missingAuthCheck' });
          }
        }
      },
    };
  },
};
