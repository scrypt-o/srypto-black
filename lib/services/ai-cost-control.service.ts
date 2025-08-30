import { getServiceRoleClient } from '@/lib/supabase-server'

interface UsageQuota {
  allowed: boolean
  reason?: string
  remainingRequests?: number
  remainingCost?: number
  usedRequests?: number
  usedCost?: number
}

export class AICostControlService {
  private readonly DAILY_REQUEST_LIMIT = 20
  private readonly DAILY_COST_LIMIT = 5.00

  async checkUsageLimits(userId: string): Promise<UsageQuota> {
    try {
      const supabase = getServiceRoleClient()
      const today = new Date().toISOString().split('T')[0]

      // Get today's usage from ai_audit_log
      const { data: todayUsage, error } = await supabase
        .from('ai_audit_log')
        .select('cost_incurred')
        .eq('user_id', userId)
        .gte('created_at', today)
        .eq('success', true)

      if (error) {
        console.error('Error checking usage limits:', error)
        return { allowed: false, reason: 'Unable to check usage limits' }
      }

      const usedRequests = todayUsage?.length || 0
      const usedCost = todayUsage?.reduce((sum, record) => sum + (record.cost_incurred || 0), 0) || 0

      // Check request limit
      if (usedRequests >= this.DAILY_REQUEST_LIMIT) {
        return {
          allowed: false,
          reason: `Daily request limit reached (${this.DAILY_REQUEST_LIMIT} requests)`,
          usedRequests,
          remainingRequests: 0,
          usedCost,
          remainingCost: Math.max(0, this.DAILY_COST_LIMIT - usedCost)
        }
      }

      // Check cost limit
      if (usedCost >= this.DAILY_COST_LIMIT) {
        return {
          allowed: false,
          reason: `Daily cost limit reached ($${this.DAILY_COST_LIMIT})`,
          usedRequests,
          remainingRequests: Math.max(0, this.DAILY_REQUEST_LIMIT - usedRequests),
          usedCost,
          remainingCost: 0
        }
      }

      return {
        allowed: true,
        usedRequests,
        remainingRequests: this.DAILY_REQUEST_LIMIT - usedRequests,
        usedCost,
        remainingCost: this.DAILY_COST_LIMIT - usedCost
      }

    } catch (error) {
      console.error('Error in checkUsageLimits:', error)
      return { allowed: false, reason: 'Usage check failed' }
    }
  }

  async logUsage(userId: string, operation: string, success: boolean, costIncurred: number = 0) {
    try {
      const supabase = getServiceRoleClient()
      
      await supabase
        .from('ai_audit_log')
        .insert({
          user_id: userId,
          operation,
          success,
          cost_incurred: costIncurred,
          metadata: {
            timestamp: new Date().toISOString(),
            service: 'prescription-scanning'
          }
        })

    } catch (error) {
      console.error('Error logging AI usage:', error)
    }
  }
}