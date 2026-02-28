import { apiClient } from '@/lib/apiClient'

export async function fetchAnalyticsOverview({ propertyId = 'all', from, to, granularity = 'monthly' } = {}) {
  return apiClient.get('/api/analytics/overview', {
    propertyId,
    from,
    to,
    granularity,
  })
}
