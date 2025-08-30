/**
 * Enforce that server pages read from RLS views (v_*) when using supabase.from().
 * Applies to any app/**/page.tsx file.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Server pages must read from views (v_*) when using supabase.from().',
    },
    messages: {
      mustUseViews: "Server pages should read from views. Use table name starting with 'v_' (e.g., v_patient__...).",
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isServerPage = /\/app\/.+\/page\.(t|j)sx?$/.test(filename);
    if (!isServerPage) return {};

    function isFromCall(node) {
      return (
        node &&
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'from'
      );
    }

    return {
      CallExpression(node) {
        if (!isFromCall(node)) return;
        const args = node.arguments || [];
        if (args.length === 0) return;
        const first = args[0];
        if (first.type === 'Literal' && typeof first.value === 'string') {
          const table = first.value;
          if (!table.startsWith('v_')) {
            context.report({ node: first, messageId: 'mustUseViews' });
          }
        }
      },
    };
  },
};

