import { apiClient } from '@/lib/apiClient'

export async function fetchTenantReviews(query = {}) {
  return apiClient.get('/api/reviews/me', query)
}

export async function fetchTenantReviewWriteOptions() {
  return apiClient.get('/api/reviews/me/write-options')
}

export async function fetchOwnerReviews(query = {}) {
  return apiClient.get('/api/owner/reviews', query)
}

export async function fetchAdminReviews(query = {}) {
  return apiClient.get('/api/admin/reviews', query)
}

export async function createReview(propertyId, payload) {
  return apiClient.post(`/api/properties/${propertyId}/reviews`, payload)
}

export async function updateReview(reviewId, payload) {
  return apiClient.put(`/api/reviews/${reviewId}`, payload)
}

export async function deleteReview(reviewId) {
  return apiClient.delete(`/api/reviews/${reviewId}`)
}

export async function ownerHideReview(reviewId, note) {
  return apiClient.post(`/api/owner/reviews/${reviewId}/hide`, note ? { note } : {})
}

export async function ownerUnhideReview(reviewId, note) {
  return apiClient.post(`/api/owner/reviews/${reviewId}/unhide`, note ? { note } : {})
}

export async function ownerReplyReview(reviewId, text) {
  return apiClient.post(`/api/owner/reviews/${reviewId}/reply`, { text })
}

export async function adminHideReview(reviewId, note) {
  return apiClient.post(`/api/admin/reviews/${reviewId}/hide`, note ? { note } : {})
}

export async function adminUnhideReview(reviewId, note) {
  return apiClient.post(`/api/admin/reviews/${reviewId}/unhide`, note ? { note } : {})
}

export async function adminRemoveReview(reviewId, note) {
  return apiClient.post(`/api/admin/reviews/${reviewId}/remove`, note ? { note } : {})
}

export async function adminRestoreReview(reviewId, note) {
  return apiClient.post(`/api/admin/reviews/${reviewId}/restore`, note ? { note } : {})
}
