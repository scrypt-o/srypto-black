/**
 * Disallow requireUser() in app/patient/** page files.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow requireUser() in patient pages; middleware protects routes.',
    },
    messages: {
      noRequireUser: 'Do not call requireUser() in pages. Middleware protects /patient/* routes.',
      noImportRequireUser: 'Do not import requireUser() in pages. Middleware protects /patient/* routes.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isPatientPage = /\/app\/patient\/.+\/page\.(t|j)sx?$/.test(filename);
    if (!isPatientPage) return {};

    return {
      ImportSpecifier(node) {
        if (node.imported && node.imported.name === 'requireUser') {
          context.report({ node, messageId: 'noImportRequireUser' });
        }
      },
      CallExpression(node) {
        const callee = node.callee;
        if (callee && callee.type === 'Identifier' && callee.name === 'requireUser') {
          context.report({ node, messageId: 'noRequireUser' });
        }
      },
    };
  },
};

