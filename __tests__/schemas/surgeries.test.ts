import { SurgeryCreateInputSchema } from '@/schemas/surgeries'

describe('Surgeries Schema', () => {
  test('valid create input passes', () => {
    const ok = SurgeryCreateInputSchema.safeParse({
      surgery_name: 'Appendectomy'
    })
    expect(ok.success).toBe(true)
  })

  test('missing surgery_name fails', () => {
    const bad = SurgeryCreateInputSchema.safeParse({})
    expect(bad.success).toBe(false)
  })
})

