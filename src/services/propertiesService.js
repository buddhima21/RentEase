import { apiClient } from '@/lib/apiClient'

export async function fetchProperties() {
  return apiClient.get('/api/properties')
}

export async function fetchPropertyById(propertyId) {
  return apiClient.get(`/api/properties/${propertyId}`)
}

export async function fetchPropertyReviews(propertyId, query = {}) {
  return apiClient.get(`/api/properties/${propertyId}/reviews`, query)
}
