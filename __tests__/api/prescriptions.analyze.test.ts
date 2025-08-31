/** @jest-environment node */
import { POST as analyze } from '@/app/api/patient/prescriptions/analyze/route'

jest.mock('@/lib/supabase-server', () => ({
  getServerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u-test' } }, error: null }) },
  })
}))

jest.mock('@/lib/services/ai-cost-control.service', () => ({
  AICostControlService: class {
    async checkUsageLimits() { return { allowed: true } }
    async logUsage() { /* noop */ }
  }
}))

jest.mock('@/lib/services/prescription-ai.service', () => ({
  ModernPrescriptionAIService: class {
    async analyzePrescription() {
      return {
        success: true,
        isPrescription: true,
        data: { overallConfidence: 90, scanQuality: 85, medications: [] },
        sessionId: 's-stub',
        uploadedPath: 'user/path.jpg',
        cost: 0.01,
      }
    }
  }
}))

jest.mock('@/lib/api-helpers', () => ({
  verifyCsrf: () => undefined,
}))

function makeReq(body: any) {
  const headers = new Headers({ origin: 'http://localhost:4569' })
  return {
    headers,
    nextUrl: { origin: 'http://localhost:4569' },
    async json() { return body },
  } as any
}

describe('POST /api/patient/prescriptions/analyze', () => {
  it('returns 422 on invalid input', async () => {
    const res = await analyze(makeReq({}))
    expect(res.status).toBe(422)
  })

  it('returns 200 with structured data on success', async () => {
    const res = await analyze(makeReq({ imageBase64: 'data:image/jpeg;base64,AA==', fileName: 'a.jpg', fileType: 'image/jpeg' }))
    expect(res.status).toBe(200)
    const json = await (res as any).json()
    expect(json.success).toBe(true)
    expect(json.isPrescription).toBe(true)
    expect(json.data.overallConfidence).toBeGreaterThan(0)
  })
})

