/**
 * Prefer Zod enum .options over Object.values(Enum.enum)
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Use Zod enum .options instead of Object.values(Enum.enum).' },
    messages: {
      useOptions: 'Prefer {{enumName}}.options over Object.values({{enumName}}.enum).',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Match Object.values(Enum.enum)
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Object' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'values' &&
          node.arguments && node.arguments.length === 1
        ) {
          const arg = node.arguments[0]
          if (
            arg.type === 'MemberExpression' &&
            arg.property && arg.property.type === 'Identifier' && arg.property.name === 'enum'
          ) {
            const enumName = arg.object && arg.object.type === 'Identifier' ? arg.object.name : 'Enum'
            context.report({ node, messageId: 'useOptions', data: { enumName } })
          }
        }
      },
    }
  },
}

