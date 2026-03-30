import axios from "axios";

/**
 * Axios instance configured with the backend base URL.
 * Uses VITE_API_URL from .env (defaults to http://localhost:8081).
 */
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

export const updateUser = (userId, userData) => {
    return API.put(`/api/v1/users/${userId}`, userData);
};

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
 * Update user profile details.
 * @param {string} userId 
 * @param {Object} userData 
 * @returns {Promise} Axios response
 */

export const updateUser2 = (userId, userData) => API.put(`/api/v1/users/${userId}`, userData);

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

// ── PROPERTY ENDPOINTS ──────────────────────────────────────

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

export default API;
