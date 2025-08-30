import { DependentCreateInputSchema } from '@/schemas/dependents'

describe('Dependents Schema', () => {
  test('valid create input passes', () => {
    const ok = DependentCreateInputSchema.safeParse({
      full_name: 'Child Doe'
    })
    expect(ok.success).toBe(true)
  })

  test('missing full_name fails', () => {
    const bad = DependentCreateInputSchema.safeParse({})
    expect(bad.success).toBe(false)
  })
})

