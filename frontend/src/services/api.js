import axios from "axios";

/**
 * Axios instance configured with the backend base URL.
 * Uses VITE_API_URL from .env (defaults to http://localhost:8081).
 */
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081",
    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

/**
 * Sign up a new user.
 * @param {{ fullName: string, email: string, phone: string, password: string, role: string }} data
 * @returns {Promise} Axios response
 */
export const signupUser = (data) => API.post("/api/auth/signup", data);

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {Promise} Axios response
 */
export const loginUser = (data) => API.post("/api/auth/login", data);

/**
 * Fetch approved reviews for a specific property.
 * @param {string} propertyId 
 * @returns {Promise} Axios response
 */
export const getPropertyReviews = (propertyId) => API.get(`/api/v1/reviews/property/${propertyId}?onlyApproved=true`);

/**
 * Submit a new property review (Starts as PENDING).
 * @param {{ propertyId: string, reviewerId: string, rating: number, comment: string, photos: string[] }} data 
 * @returns {Promise} Axios response
 */
export const submitReview = (data) => API.post("/api/v1/reviews", data);

/**
 * Fetch all pending reviews. (Requires Admin)
 * @returns {Promise} Axios response
 */
export const getPendingReviews = () => API.get(`/api/v1/reviews/status/PENDING`);

/**
 * Update the status of a review. (Requires Admin)
 * @param {string} reviewId 
 * @param {string} status 'APPROVED' | 'REJECTED'
 * @returns {Promise} Axios response
 */
export const updateReviewStatus = (reviewId, status) => API.put(`/api/v1/reviews/${reviewId}/status?status=${status}`);

/**
 * Edit an existing review. (Requires Author)
 * @param {string} reviewId
 * @param {{ rating: number, comment: string, photos: string[] }} reviewData
 * @returns {Promise} Axios response
 */
export const updateReview = (reviewId, reviewData) => API.put(`/api/v1/reviews/${reviewId}`, reviewData);

/**
 * Delete a review. (Requires Author)
 * @param {string} reviewId
 * @returns {Promise} Axios response
 */
export const deleteReview = (reviewId) => API.delete(`/api/v1/reviews/${reviewId}`);

export default API;
