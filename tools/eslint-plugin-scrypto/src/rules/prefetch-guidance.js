/**
 * Prefetch guidance: Prefer <Link prefetch> for intra-app navigation instead of router.push()
 * in client components. This is advisory (warn only).
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Use <Link prefetch> for internal navigation instead of router.push().' },
    messages: {
      preferLinkPrefetch: 'Prefer <Link prefetch> for internal navigation instead of router.push().',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Detect router.push('/...')
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'push' &&
          node.arguments && node.arguments.length >= 1
        ) {
          const first = node.arguments[0]
          const isInternal = (lit) => typeof lit === 'string' && lit.startsWith('/') && !lit.startsWith('//')
          if (first.type === 'Literal' && isInternal(first.value)) {
            context.report({ node: first, messageId: 'preferLinkPrefetch' })
          } else if (first.type === 'TemplateLiteral') {
            // Conservative: warn on template literals that look like internal paths
            const raw = first.quasis.map(q => q.value && q.value.raw || '').join('')
            if (raw.startsWith('/')) {
              context.report({ node: first, messageId: 'preferLinkPrefetch' })
            }
          }
        }
      },
    }
  },
}

