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

export default API;
