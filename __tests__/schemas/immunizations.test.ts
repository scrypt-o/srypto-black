import { ImmunizationCreateInputSchema } from '@/schemas/immunizations'

describe('Immunizations Schema', () => {
  test('valid create input passes', () => {
    const ok = ImmunizationCreateInputSchema.safeParse({
      vaccine_name: 'MMR',
      date_given: '2024-01-01'
    })
    expect(ok.success).toBe(true)
  })

  test('missing vaccine_name fails', () => {
    const bad = ImmunizationCreateInputSchema.safeParse({})
    expect(bad.success).toBe(false)
  })
})

