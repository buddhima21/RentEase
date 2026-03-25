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

// ── Auth ──────────────────────────────────────────────
export const signupUser = (data) => API.post("/api/auth/signup", data);
export const loginUser = (data) => API.post("/api/auth/login", data);

// ── Properties ────────────────────────────────────────
export const getAllProperties = () => API.get("/api/v1/properties");
export const getPropertyById = (id) => API.get(`/api/v1/properties/${id}`);
export const getAvailableProperties = () => API.get("/api/v1/properties/status/AVAILABLE");

// ── Bookings ──────────────────────────────────────────
/** Tenant creates a booking request */
export const createBookingRequest = (data) => API.post("/api/v1/bookings", data);

/** Get all bookings for the logged-in tenant */
export const getTenantBookings = (tenantId) => API.get(`/api/v1/bookings/tenant/${tenantId}`);

/** Get all bookings for the logged-in owner */
export const getOwnerBookings = (ownerId) => API.get(`/api/v1/bookings/owner/${ownerId}`);

/** Owner approves a pending booking */
export const approveBooking = (bookingId) => API.patch(`/api/v1/bookings/${bookingId}/approve`);

/** Owner rejects a pending booking */
export const rejectBooking = (bookingId) => API.patch(`/api/v1/bookings/${bookingId}/reject`);

/** Tenant cancels their own booking */
export const tenantCancelBooking = (bookingId, data) => API.patch(`/api/v1/bookings/${bookingId}/cancel`, data);


/** Owner removes an allocated tenant (soft remove) */
export const removeAllocation = (bookingId) => API.delete(`/api/v1/bookings/${bookingId}`);

/** Owner permanently deletes a booking from history */
export const hardDeleteBooking = (bookingId) => API.delete(`/api/v1/bookings/${bookingId}/hard-delete`);

/** Get available bedroom slots for a property */
export const getPropertyAvailableSlots = (propertyId) =>
    API.get(`/api/v1/bookings/property/${propertyId}/available-slots`);

// ── Reviews ───────────────────────────────────────────
export const getPropertyReviews = (propertyId) => API.get(`/api/v1/reviews/property/${propertyId}?onlyApproved=true`);
export const submitReview = (data) => API.post("/api/v1/reviews", data);
export const getPendingReviews = () => API.get(`/api/v1/reviews/status/PENDING`);
export const updateReviewStatus = (reviewId, status) => API.put(`/api/v1/reviews/${reviewId}/status?status=${status}`);
export const updateReview = (reviewId, reviewData) => API.put(`/api/v1/reviews/${reviewId}`, reviewData);
export const deleteReview = (reviewId) => API.delete(`/api/v1/reviews/${reviewId}`);

export default API;
