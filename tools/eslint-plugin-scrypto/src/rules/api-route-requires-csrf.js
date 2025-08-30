/**
 * Ensure verifyCsrf(request) is used in non-GET API handlers in app/api/.../route.ts (glob form).
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Non-GET API route handlers must verify CSRF.',
    },
    messages: {
      missingCsrf: 'Non-GET API handlers must call verifyCsrf(request) and return early when invalid.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isApiRoute = /\/app\/api\/.+\/route\.(t|j)s$/.test(filename);
    if (!isApiRoute) return {};

    function isNonGetExportedHandler(node) {
      // export async function POST/PUT/DELETE(request, ...)
      return (
        node.type === 'FunctionDeclaration' &&
        node.id &&
        ['POST', 'PUT', 'DELETE', 'PATCH'].includes(node.id.name)
      );
    }

    function containsVerifyCsrf(node) {
      const src = context.getSourceCode().getText(node);
      // Simple textual check is robust across nested try/catch and blocks
      return /verifyCsrf\s*\(\s*request\s*\)/.test(src);
    }

    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration) return;
        const decl = node.declaration;
        if (isNonGetExportedHandler(decl)) {
          if (!containsVerifyCsrf(decl)) {
            context.report({ node: decl.id, messageId: 'missingCsrf' });
          }
        }
      },
    };
  },
};
