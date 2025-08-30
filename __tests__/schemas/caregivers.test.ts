import { CaregiverCreateInputSchema } from '@/schemas/caregivers'

describe('Caregivers Schema', () => {
  test('valid create input passes', () => {
    const ok = CaregiverCreateInputSchema.safeParse({
      full_name: 'Jane Care',
      phone_number: '1234567890',
    })
    expect(ok.success).toBe(true)
  })

  test('missing required fields fails', () => {
    const bad = CaregiverCreateInputSchema.safeParse({})
    expect(bad.success).toBe(false)
  })
})

