/**
 * Ensure verifyCsrf(request) is used in non-GET API handlers in app/api/**/route.ts.
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

    function containsVerifyCsrf(body) {
      return body.body.some(stmt => {
        if (stmt.type === 'VariableDeclaration') {
          return stmt.declarations.some(dec =>
            dec.init &&
            dec.init.type === 'CallExpression' &&
            dec.init.callee.type === 'Identifier' &&
            dec.init.callee.name === 'verifyCsrf'
          );
        }
        if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'CallExpression') {
          return stmt.expression.callee.type === 'Identifier' && stmt.expression.callee.name === 'verifyCsrf';
        }
        return false;
      });
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

