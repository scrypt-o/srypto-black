/**
 * Prevent usage of ListView/DetailView component names; prefer ListViewLayout/DetailViewLayout.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Use *ViewLayout components instead of *View.' },
    messages: {
      noListView: 'Use ListViewLayout instead of ListView.',
      noDetailView: 'Use DetailViewLayout instead of DetailView.',
    },
    schema: [],
  },
  create(context) {
    function checkName(name, node) {
      if (name === 'ListView') context.report({ node, messageId: 'noListView' })
      if (name === 'DetailView') context.report({ node, messageId: 'noDetailView' })
    }
    return {
      ImportSpecifier(node) {
        if (node.imported) checkName(node.imported.name, node)
        if (node.local && node.local.name !== node.imported?.name) checkName(node.local.name, node)
      },
      JSXIdentifier(node) {
        if (node.name) checkName(node.name, node)
      },
      Identifier(node) {
        // Catch variable declarations/uses with these names
        checkName(node.name, node)
      },
    }
  },
}

