import { VitalSignCreateInputSchema } from '@/schemas/vitalSigns'

describe('Vital Signs Schema', () => {
  test('valid create input passes', () => {
    const ok = VitalSignCreateInputSchema.safeParse({
      measurement_date: '2024-01-01',
      systolic_bp: 120,
      diastolic_bp: 80
    })
    expect(ok.success).toBe(true)
  })

  test('invalid ranges fail', () => {
    const bad = VitalSignCreateInputSchema.safeParse({ systolic_bp: 500 })
    expect(bad.success).toBe(false)
  })
})

