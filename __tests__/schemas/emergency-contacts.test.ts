import { EmergencyContactCreateInputSchema } from '@/schemas/emergencyContacts'

describe('Emergency Contacts Schema', () => {
  test('valid create input passes', () => {
    const ok = EmergencyContactCreateInputSchema.safeParse({
      full_name: 'Alice Help',
      relationship: 'friend'
    })
    expect(ok.success).toBe(true)
  })

  test('missing full_name fails', () => {
    const bad = EmergencyContactCreateInputSchema.safeParse({ relationship: 'friend' })
    expect(bad.success).toBe(false)
  })
})

