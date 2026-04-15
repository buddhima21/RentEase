import axios from "axios";

/**
 * Axios instance configured with the backend base URL.
 * Uses VITE_API_URL from .env (defaults to http://localhost:8080).
 */
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use((req) => {
    let token = null;
    const isAdminRequest = req.url && req.url.includes('/api/v1/admin');

    // For admin endpoints, use admin token only
    if (isAdminRequest) {
        token = localStorage.getItem('adminToken');
        if (!token) {
            try {
                const adminUserStr = localStorage.getItem('adminUser');
                if (adminUserStr) {
                    const adminUser = JSON.parse(adminUserStr);
                    token = adminUser?.token;
                }
            } catch (e) {
                console.error("Error parsing admin user token", e);
            }
        }
        // Final admin fallback in case token exists only in shared auth key.
        if (!token) {
            token = localStorage.getItem('token');
        }
    }

    // For non-admin endpoints, prefer normal user token
    if (!isAdminRequest) {
        // Prefer token stored in the 'user' object (Owner/Tenant login path)
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                token = userObj?.token;
            }
        } catch (e) {
            console.error("Error parsing user token", e);
        }

        // Fallback (older auth flows)
        if (!token) {
            token = localStorage.getItem('token');
        }
    }

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// ── Auth ──────────────────────────────────────────────
export const signupUser = (data) => API.post("/api/v1/auth/signup", data);
export const loginUser = (data) => API.post("/api/v1/auth/login", data);

// ── User ──────────────────────────────────────────────
/**
 * Update user profile details.
 * @param {string} userId
 * @param {Object} userData
 * @returns {Promise} Axios response
 */
export const updateUser = (userId, userData) => API.put(`/api/v1/users/${userId}`, userData);

// ── Properties (Public) ───────────────────────────────
/**
 * Public fetches all approved properties
 * @returns {Promise} Axios response
 */
export const getApprovedProperties = () => API.get("/api/v1/public/properties");

/**
 * Public fetches a single approved property by id
 * @param {string} propertyId
 * @returns {Promise} Axios response
 */
export const getApprovedPropertyById = (propertyId) => API.get(`/api/v1/public/properties/${propertyId}`);

/**
 * Fetch all properties (legacy - used by tenant listings)
 */
export const getAllProperties = () => API.get("/api/v1/properties");

/**
 * Get a property by ID
 */
export const getPropertyById = (id) => API.get(`/api/v1/properties/${id}`);

/**
 * Get all available properties
 */
export const getAvailableProperties = () => API.get("/api/v1/properties/status/AVAILABLE");

// ── Properties (Owner) ────────────────────────────────
/**
 * Owner creates a new property listing (Requires Owner)
 * @param {Object} propertyData
 * @returns {Promise} Axios response
 */
export const createProperty = (propertyData) => API.post("/api/v1/owner/properties", propertyData);

/**
 * Owner fetches all their properties
 * @returns {Promise} Axios response
 */
export const getOwnerProperties = () => API.get("/api/v1/owner/properties");

/**
 * Owner fetches single property by id
 * @param {string} propertyId
 * @returns {Promise} Axios response
 */
export const getOwnerPropertyById = (propertyId) => API.get(`/api/v1/owner/properties/${propertyId}`);

/**
 * Owner updates an existing property
 * @param {string} propertyId
 * @param {Object} propertyData
 * @returns {Promise} Axios response
 */
export const updateProperty = (propertyId, propertyData) =>
    API.put(`/api/v1/owner/properties/${propertyId}`, propertyData);

/**
 * Owner requests to delete a property with a reason
 * @param {string} propertyId
 * @param {string} reason
 * @returns {Promise} Axios response
 */
export const deleteProperty = (propertyId, reason) => API.delete(`/api/v1/owner/properties/${propertyId}`, { params: { reason } });

// ── Properties (Admin) ────────────────────────────────
/**
 * Admin fetches all pending properties (Requires Admin)
 * @returns {Promise} Axios response
 */
export const getPendingProperties = () => API.get("/api/v1/admin/properties/pending");

/**
 * Admin fetches all properties (Requires Admin)
 * @returns {Promise} Axios response
 */
export const getAllPropertiesForAdmin = () => API.get("/api/v1/admin/properties");

/**
 * Admin fetches a single property by id (Requires Admin)
 * @param {string} propertyId
 * @returns {Promise} Axios response
 */
export const getAdminPropertyById = (propertyId) => API.get(`/api/v1/admin/properties/${propertyId}`);

/**
 * Admin moderates a property (Requires Admin)
 * @param {string} propertyId
 * @param {{ action: string, remarks: string }} data action="APPROVE" | "REJECT"
 * @returns {Promise} Axios response
 */
export const moderateProperty = (propertyId, data) => API.patch(`/api/v1/admin/properties/${propertyId}/moderate`, data);
export const createTechnicianAccount = (data) => API.post("/api/v1/admin/users/technicians", data);

// ── Bookings ──────────────────────────────────────────
/** Tenant creates a booking request */
export const createBookingRequest = (data) => API.post("/api/v1/bookings", data);

/** Get all bookings for the logged-in tenant */
export const getTenantBookings = (tenantId) => API.get(`/api/v1/bookings/tenant/${tenantId}`);

/** Get all bookings for the logged-in owner */
export const getOwnerBookings = (ownerId) => API.get(`/api/v1/bookings/owner/${ownerId}`);

/** Owner approves a pending booking */
export const approveBooking = (bookingId, ownerId) => API.patch(`/api/v1/bookings/${bookingId}/approve`, null, { params: { ownerId } });

/** Owner rejects a pending booking */
export const rejectBooking = (bookingId, ownerId) => API.patch(`/api/v1/bookings/${bookingId}/reject`, null, { params: { ownerId } });

/** Tenant cancels their own booking */
export const tenantCancelBooking = (bookingId, data) => API.patch(`/api/v1/bookings/${bookingId}/cancel`, data);

/** Owner removes an allocated tenant (soft remove) */
export const removeAllocation = (bookingId, ownerId) => API.delete(`/api/v1/bookings/${bookingId}`, { params: { ownerId } });

/** Owner permanently deletes a booking from history */
export const hardDeleteBooking = (bookingId) => API.delete(`/api/v1/bookings/${bookingId}/hard-delete`);

/** Get available bedroom slots for a property */
export const getPropertyAvailableSlots = (propertyId) =>
    API.get(`/api/v1/bookings/property/${propertyId}/available-slots`);

// ── Reviews ───────────────────────────────────────────
/**
 * Fetch approved reviews for a specific property.
 * @param {string} propertyId
 * @returns {Promise} Axios response
 */
export const getPropertyReviews = (propertyId) => API.get(`/api/v1/reviews/property/${propertyId}?onlyApproved=true`);
export const submitReview = (data) => API.post("/api/v1/reviews", data);
export const getPendingReviews = () => API.get(`/api/v1/reviews/status/PENDING`);
export const getOwnerReviews = () => API.get(`/api/v1/reviews/owner`);
export const updateReviewStatus = (reviewId, status) => API.put(`/api/v1/reviews/${reviewId}/status?status=${status}`);
export const replyToReview = (reviewId, replyText) => API.put(`/api/v1/reviews/${reviewId}/reply`, { replyText });
export const updateReview = (reviewId, reviewData) => API.put(`/api/v1/reviews/${reviewId}`, reviewData);
export const deleteReview = (reviewId) => API.delete(`/api/v1/reviews/${reviewId}`);

// ── System Analytics ────────────────────────────────────
export const getSystemAnalytics = () => API.get("/api/v1/analytics/overview");

// ── Rental agreements (JWT required) ───────────────────
export const createAgreement = (data) => API.post("/api/v1/agreements", data);
export const getTenantAgreements = (tenantId) => API.get(`/api/v1/agreements/tenant/${tenantId}`);
export const getOwnerAgreements = (ownerId) => API.get(`/api/v1/agreements/owner/${ownerId}`);
export const getEligibleAgreementBookings = (tenantId) =>
    API.get(`/api/v1/agreements/eligible-bookings/${tenantId}`);
export const getAgreementById = (id) => API.get(`/api/v1/agreements/${id}`);
/** Returns axios response with blob data — use responseType blob */
export const downloadAgreementPdf = (id) =>
    API.get(`/api/v1/agreements/${id}/pdf`, { responseType: "blob" });
export const terminateAgreementEarly = (id, data) =>
    API.patch(`/api/v1/agreements/${id}/terminate`, data ?? {});

// ── Maintenance ─────────────────────────────────────────
export const createMaintenanceRequest = (data) => API.post("/api/v1/maintenance", data);
export const getMaintenanceById = (id) => API.get(`/api/v1/maintenance/${id}`);
export const getMaintenanceByProperty = (propertyId) => API.get(`/api/v1/maintenance/property/${propertyId}`);
export const getTenantMaintenance = (tenantId) => API.get(`/api/v1/maintenance/tenant/${tenantId}`);
export const getTechnicianMaintenance = (technicianId, status) =>
    API.get(`/api/v1/maintenance/technician/${technicianId}`, { params: status ? { status } : undefined });
export const getOwnerMaintenance = (ownerId) => API.get(`/api/v1/maintenance/owner/${ownerId}`);
export const getAdminMaintenanceQueue = (params) => API.get("/api/v1/maintenance/admin/queue", { params });
export const assignMaintenanceTechnician = (requestId, data) =>
    API.patch(`/api/v1/maintenance/${requestId}/assign`, data);
export const updateMaintenancePriority = (requestId, priority) =>
    API.patch(`/api/v1/maintenance/${requestId}/priority`, null, { params: { priority } });
export const scheduleMaintenance = (requestId, data) =>
    API.patch(`/api/v1/maintenance/${requestId}/schedule`, data);
export const acceptMaintenance = (requestId) => API.patch(`/api/v1/maintenance/${requestId}/accept`);
export const startMaintenance = (requestId) => API.patch(`/api/v1/maintenance/${requestId}/start`);
export const pauseMaintenance = (requestId) => API.patch(`/api/v1/maintenance/${requestId}/pause`);
export const resumeMaintenance = (requestId) => API.patch(`/api/v1/maintenance/${requestId}/resume`);
export const resolveMaintenance = (requestId, data) => API.patch(`/api/v1/maintenance/${requestId}/resolve`, data);
export const closeMaintenance = (requestId, adminNote) =>
    API.patch(`/api/v1/maintenance/${requestId}/close`, null, { params: adminNote ? { adminNote } : undefined });
export const getMaintenanceTechnicians = () => API.get("/api/v1/maintenance/technicians");

export default API;
