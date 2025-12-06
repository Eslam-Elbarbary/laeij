import axios from "axios";
import i18n from "../i18n";

/**
 * Axios Configuration
 * 
 * This file configures axios instances for the application.
 * We use two instances:
 * 1. publicApiClient - For endpoints that DON'T require authentication
 * 2. authApiClient - For endpoints that REQUIRE authentication
 * 
 * This separation ensures that:
 * - Public endpoints work without tokens
 * - Authenticated endpoints always have tokens when available
 * - 401 errors are handled appropriately
 */

// API Base URL - Get from environment variable or use default
// Set this in your .env file: VITE_API_URL=https://your-api-url.com/api
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://laeij.teamqeematech.site/api";

// Log API URL in development mode for debugging
if (import.meta.env.DEV) {
    console.log("🌐 API Base URL:", API_BASE_URL);
    console.log("📝 Environment variable VITE_API_URL:", import.meta.env.VITE_API_URL || "Not set (using default)");
}

/**
 * List of endpoint paths that REQUIRE authentication
 * These endpoints will use authApiClient
 * 
 * Authentication is required for:
 * - Cart operations (/cart)
 * - Favorite/Wishlist (/favorite-list)
 * - Orders (/orders)
 * - User profile operations (/auth/profile, /auth/edit-profile, /auth/change-password, /auth/logout, /auth/delete-account)
 * - Addresses (/addresses)
 * - Transactions (/transactions)
 * - Tickets (/tickets)
 * - Booking Lists (/booking-lists)
 * - Product favorites/reviews (/products/:id/toggle-favorite, /products/:id/review)
 */
const AUTHENTICATED_ENDPOINTS = [
    "/cart",
    "/favorite-list",
    "/orders",
    "/auth/profile",
    "/auth/edit-profile",
    "/auth/change-password",
    "/auth/logout",
    "/auth/delete-account",
    "/addresses",
    "/transactions",
    "/tickets",
    "/booking-lists",
    "/products/", // Products endpoints that require auth (toggle-favorite, review)
];

/**
 * Check if an endpoint requires authentication
 * @param {string} url - The endpoint URL
 * @returns {boolean} - True if endpoint requires auth
 */
const requiresAuth = (url) => {
    // Check if URL matches any authenticated endpoint pattern
    return AUTHENTICATED_ENDPOINTS.some((endpoint) => {
        // Handle exact matches and path prefixes
        if (url.startsWith(endpoint)) {
            // Special handling for /products/ - only certain product endpoints need auth
            if (endpoint === "/products/") {
                return url.includes("/toggle-favorite") || url.includes("/review");
            }
            return true;
        }
        // Check for user account related endpoints (exclude public auth endpoints)
        if (url.includes("/auth/") &&
            !url.includes("/register") &&
            !url.includes("/login") &&
            !url.includes("/verify") &&
            !url.includes("/reset-password")) {
            return true;
        }
        return false;
    });
};

/**
 * PUBLIC API Client
 * Used for endpoints that DON'T require authentication:
 * - Categories
 * - Products
 * - Product search
 * - Auth (register, login, verify, reset password)
 * - Sliders
 * - Offers
 * - Branches
 * - Attributes
 */
export const publicApiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("authToken"),
    },
    cache: false,
});
export const publicApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    cache: false,
});


// export const addTocard2= async(Products,prams){

//     const localProducts= localStorage.setItem("products", JSON.stringify(Products));
//     if(localProducts.length > 0){
//         return {
//             success: true,
//             message: "Products added to cart",
//             data: localProducts,
//         }
//     }
//     try {

//         for(const product of Products){
//             const response= await publicApi.post("/cart", product);
//             if(response.status === 200){
//                 return {
//                     success: true,
//                     message: "Products added to cart",
//                     data: response.data,
//                 }
//             }
//             }
//             localStorage.removeItem("products");
//             return {
//                 success: false,
//                 message: "Failed to add products to cart",
//                 data: error.response.data,
//             }
//         }



//     } catch (error) {
//         return {
//             success: false,
//             message: "Failed to add products to cart",
//             data: error.response.data,
//         }
//     }
// }

/**
 * AUTHENTICATED API Client
 * Used for endpoints that REQUIRE authentication:
 * - Cart operations
 * - Favorite/Wishlist
 * - Orders
 * - Profile
 * - Addresses
 * - Transactions
 * - Tickets
 * - Booking Lists
 */
export const authApiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

/**
 * Request Interceptor for PUBLIC API Client
 * Adds language header but NO authentication token
 */
publicApiClient.interceptors.request.use(
    (config) => {
        // Add language header based on current i18n language
        const currentLang = i18n.language || "ar";
        config.headers["Accept-Language"] = currentLang;

        // For multipart/form-data requests, let axios set Content-Type automatically
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Request Interceptor for AUTHENTICATED API Client
 * Adds authentication token AND language header
 */
authApiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage and add to Authorization header
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add language header based on current i18n language
        const currentLang = i18n.language || "ar";
        config.headers["Accept-Language"] = currentLang;

        // For multipart/form-data requests, let axios set Content-Type automatically
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor for PUBLIC API Client
 * Handles errors but does NOT redirect on 401 (since public endpoints shouldn't return 401)
 */
publicApiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Public endpoints shouldn't typically return 401, but handle it gracefully
        if (error.response?.status === 401) {
            console.warn("Received 401 on public endpoint:", error.config.url);
        }
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor for AUTHENTICATED API Client
 * Handles 401 errors by clearing token and redirecting to login
 * Suppresses console errors for expected 404s on cart operations
 */
authApiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
            // Clear authentication data
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");

            // Redirect to login only if not already on login page
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        // Suppress console errors for expected 404s on cart operations
        // These routes may not be implemented yet on the backend
        const isCart404 = error.response?.status === 404 &&
            error.config?.url?.includes('/cart/') &&
            (error.config?.method === 'put' || error.config?.method === 'delete');

        if (isCart404) {
            // Suppress the default axios error logging
            // The error will still be returned to the catch block for handling
            error.suppressLog = true;
        }

        // Return error for component-level handling
        return Promise.reject(error);
    }
);

/**
 * Smart API Client Function
 * Automatically chooses the correct axios instance based on the endpoint
 * 
 * Usage:
 *   const client = getApiClient('/products'); // Returns publicApiClient
 *   const client = getApiClient('/cart'); // Returns authApiClient
 * 
 * @param {string} url - The endpoint URL
 * @returns {AxiosInstance} - The appropriate axios instance
 */
export const getApiClient = (url) => {
    return requiresAuth(url) ? authApiClient : publicApiClient;
};

/**
 * Helper to determine if a URL requires authentication
 * Exported for use in API service functions
 */
export { requiresAuth };

/**
 * Export the base URL for use in other files
 */
export { API_BASE_URL };

