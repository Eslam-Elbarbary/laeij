/**
 * API Service - Handles all backend API calls
 * 
 * This service replaces all mock API calls with real API endpoints
 * based on the Postman collection structure.
 * 
 * Features:
 * - Conditional authentication (only for specific endpoints)
 * - Automatic language header (Accept-Language)
 * - Error handling and response formatting
 * - Support for multipart/form-data (file uploads)
 * 
 * Authentication Rules:
 * - Public endpoints (NO auth): Categories, Products, Sliders, Offers, Branches, 
 *   Attributes, Auth (register/login/verify/reset-password)
 * - Authenticated endpoints (REQUIRES auth): Cart, Favorite-list, Orders, 
 *   Profile, Addresses, Transactions, Tickets, Booking Lists, 
 *   Auth (profile/edit-profile/change-password/logout/delete-account)
 */

// Import axios clients from axiosConfig
// publicApiClient: Used for endpoints that DON'T require authentication
// authApiClient: Used for endpoints that REQUIRE authentication
import { publicApiClient, authApiClient } from "./axiosConfig";

/**
 * Helper function to create FormData from object
 * Used for multipart/form-data requests (file uploads)
 */
const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File || data[key] instanceof Blob) {
        formData.append(key, data[key]);
      } else if (Array.isArray(data[key])) {
        // Handle array fields (e.g., attachments[])
        data[key].forEach((item, index) => {
          if (item instanceof File || item instanceof Blob) {
            formData.append(`${key}[${index}]`, item);
          } else {
            formData.append(`${key}[${index}]`, item);
          }
        });
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  return formData;
};

/**
 * API Service Object
 * Contains all API endpoint functions organized by feature
 */
export const apiService = {
  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================

  /**
   * Register a new user
   * POST /auth/register
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.phone - User's phone number
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} userData.password_confirmation - Password confirmation
   * @param {File} userData.image - Optional profile image
   * @param {string} userData.gender - Optional: "male" or "female"
   * @param {string} userData.invitation_code - Optional invitation code
   */
  register: async (userData) => {
    try {
      // Ensure password_confirmation is included
      const completeData = {
        ...userData,
        password_confirmation: userData.password,
      };

      const formData = createFormData(completeData);

      const response = await publicApiClient.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Registration successful",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Registration failed",
        errors: error.response?.data?.errors || {},
      };
    }
  },


  /**
   * Verify phone number with OTP code
   * POST /auth/verify
   * @param {string} email - User's email
   * @param {string} code - 6-digit verification code
   */
  verifyPhone: async (email, code) => {
    try {
      const formData = createFormData({ email, code });
      // Use publicApiClient - phone verification doesn't require authentication
      const response = await publicApiClient.post("/auth/verify", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Store token if provided
      if (response.data.data?.token) {
        localStorage.setItem("authToken", response.data.data.token);
      }
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Verification successful",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Verification failed",
      };
    }
  },

  /**
   * Login user
   * POST /auth/login
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  login: async (email, password) => {
    try {
      const formData = createFormData({ email, password });
      // Use publicApiClient - login doesn't require authentication
      const response = await publicApiClient.post("/auth/login", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Store token and user data
      if (response.data.data?.token) {
        localStorage.setItem("authToken", response.data.data.token);
      }
      if (response.data.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Login successful",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Login failed",
      };
    }
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: async () => {
    try {
      // Use authApiClient - logout requires authentication
      await authApiClient.post("/auth/logout");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return {
        success: true,
        message: "Logout successful",
      };
    } catch (err) {
      // Clear local storage even if API call fails
      console.error("Logout error:", err);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return {
        success: true,
        message: "Logged out locally",
      };
    }
  },

  /**
   * Delete user account
   * DELETE /auth/delete-account
   */
  deleteAccount: async () => {
    try {
      // Use authApiClient - delete account requires authentication
      await authApiClient.delete("/auth/delete-account");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return {
        success: true,
        message: "Account deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete account",
      };
    }
  },

  /**
   * Get user profile
   * GET /auth/profile
   */
  getProfile: async () => {
    try {
      // Use authApiClient - profile requires authentication
      const response = await authApiClient.get("/auth/profile");
      const userData = response.data.data || response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      return {
        success: true,
        data: userData,
        message: "Profile fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch profile",
      };
    }
  },

  /**
   * Update user profile
   * POST /auth/edit-profile
   * @param {Object} profileData - Profile update data
   */
  updateProfile: async (profileData) => {
    try {
      const formData = createFormData(profileData);
      // Use authApiClient - edit profile requires authentication
      const response = await authApiClient.post("/auth/edit-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const userData = response.data.data || response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      return {
        success: true,
        data: userData,
        message: response.data.message || "Profile updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to update profile",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  /**
   * Change user password
   * POST /auth/change-password
   * @param {string} current_password - Current password
   * @param {string} password - New password
   * @param {string} password_confirmation - New password confirmation
   */
  changePassword: async (current_password, password, password_confirmation) => {
    try {
      const formData = createFormData({
        current_password,
        password,
        password_confirmation,
      });
      // Use authApiClient - change password requires authentication
      const response = await authApiClient.post("/auth/change-password", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        message: response.data.message || "Password changed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to change password",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // ============================================
  // PASSWORD RESET ENDPOINTS
  // ============================================

  /**
   * Send OTP for password reset
   * POST /auth/reset-password/send-otp
   * @param {string} email - User's email
   */
  sendResetOTP: async (email) => {
    try {
      const formData = createFormData({ email });
      // Use publicApiClient - password reset doesn't require authentication
      const response = await publicApiClient.post(
        "/auth/reset-password/send-otp",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return {
        success: true,
        message: response.data.message || "OTP sent successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send OTP",
      };
    }
  },

  /**
   * Verify OTP for password reset
   * POST /auth/reset-password/verify-otp
   * @param {string} email - User's email
   * @param {string} code - 6-digit OTP code
   */
  verifyResetOTP: async (email, code) => {
    try {
      const formData = createFormData({ email, code });
      // Use publicApiClient - password reset doesn't require authentication
      const response = await publicApiClient.post(
        "/auth/reset-password/verify-otp",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "OTP verified successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "OTP verification failed",
      };
    }
  },

  /**
   * Set new password after OTP verification
   * POST /auth/reset-password/set-new-password
   * @param {string} reset_token - Reset token from verify-otp
   * @param {string} password - New password
   * @param {string} password_confirmation - Password confirmation
   */
  setNewPassword: async (reset_token, password, password_confirmation) => {
    try {
      const formData = createFormData({
        reset_token,
        password,
        password_confirmation,
      });
      // Use publicApiClient - password reset doesn't require authentication
      const response = await publicApiClient.post(
        "/auth/reset-password/set-new-password",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return {
        success: true,
        message: response.data.message || "Password reset successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to reset password",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // ============================================
  // CATEGORIES ENDPOINTS
  // ============================================

  /**
   * Get all categories
   * GET /categories?limit=-1
   * @param {number} limit - Optional limit (-1 for all)
   */
  getCategories: async (limit = -1) => {
    try {
      // Use publicApiClient - categories don't require authentication
      const response = await publicApiClient.get("/categories", {
        params: { limit },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Categories fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch categories",
      };
    }
  },

  /**
   * Get category by ID
   * GET /categories/:id
   * @param {number} id - Category ID
   */
  getCategoryById: async (id) => {
    try {
      // Use publicApiClient - categories don't require authentication
      const response = await publicApiClient.get(`/categories/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Category fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch category",
      };
    }
  },

  // ============================================
  // PRODUCTS ENDPOINTS
  // ============================================

  /**
   * Get products with filters and pagination
   * GET /products
   * @param {Object} filters - Filter parameters
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {number} filters.category_id - Filter by category
   * @param {boolean} filters.featured - Filter featured products
   * @param {boolean} filters.new - Filter new products
   * @param {number} filters.price_min - Minimum price
   * @param {number} filters.price_max - Maximum price
   * @param {number} filters.attribute_options[] - Filter by attribute options
   * @param {string} filters.sort - Sort option: newest, oldest, expensive, cheap, a_to_z, z_to_a
   */
  getProducts: async (filters = {}) => {
    try {
      // Use publicApiClient - products don't require authentication
      const response = await publicApiClient.get("/products", { params: filters });

      // Handle different response structures from backend
      let productsData = [];
      let paginationData = null;

      // Check if response has a data wrapper
      if (response.data) {
        // Try multiple possible response structures
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          productsData = response.data.products;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          productsData = response.data.items;
        }

        // Extract pagination info
        paginationData = response.data.pagination || response.data.meta || response.data.paginator || null;
      }

      return {
        success: true,
        data: productsData,
        pagination: paginationData,
        message: "Products fetched successfully",
      };
    } catch (error) {
      // Enhanced error logging
      console.error("❌ Error fetching products:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        filters,
      });

      // Check for network/CORS errors
      if (!error.response && error.message.includes("Network")) {
        console.error("⚠️ Network Error: Please check:");
        console.error("  1. Is the backend server running?");
        console.error("  2. Is the API URL correct in .env file?");
        console.error("  3. Are there CORS issues?");
      }

      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || error.message || "Failed to fetch products",
      };
    }
  },

  /**
   * Get product by ID
   * GET /products/:id
   * @param {number} id - Product ID
   */
  getProductById: async (id) => {
    try {
      // Use publicApiClient - products don't require authentication
      const response = await publicApiClient.get(`/products/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Product fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch product",
      };
    }
  },

  /**
   * Get featured products
   * GET /products?featured=true
   * @param {number} limit - Number of products to return
   */
  getFeaturedProducts: async (limit = 4) => {
    try {
      // Use publicApiClient - products don't require authentication
      const response = await publicApiClient.get("/products", {
        params: { featured: true, limit },
      });
      return {
        success: true,
        data: response.data.data || response.data.products || response.data,
        message: "Featured products fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch featured products",
      };
    }
  },

  /**
   * Search products
   * GET /products/search?query=...
   * @param {string} query - Search query
   */
  searchProducts: async (query) => {
    try {
      // Use publicApiClient - product search doesn't require authentication
      const response = await publicApiClient.get("/products/search", {
        params: { query },
      });
      return {
        success: true,
        data: response.data.data || response.data.products || response.data,
        message: "Search completed successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Search failed",
      };
    }
  },

  /**
   * Toggle product favorite status
   * POST /products/:id/toggle-favorite
   * @param {number} id - Product ID
   */
  toggleFavorite: async (id) => {
    try {
      // Use authApiClient - toggle favorite requires authentication
      const response = await authApiClient.post(`/products/${id}/toggle-favorite`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Favorite status updated",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update favorite",
      };
    }
  },

  /**
   * Add product review
   * POST /products/:id/review
   * @param {number} id - Product ID
   * @param {string} comment - Review comment
   * @param {number} rating - Rating (1-5)
   */
  addReview: async (id, comment, rating) => {
    try {
      const formData = createFormData({ comment, rating });
      // Use authApiClient - product review requires authentication
      const response = await authApiClient.post(`/products/${id}/review`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Review added successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add review",
      };
    }
  },

  // ============================================
  // FAVORITE LIST (WISHLIST) ENDPOINTS
  // ============================================

  /**
   * Get user's favorite list
   * GET /favorite-list
   */
  getFavoriteList: async () => {
    try {
      // Use authApiClient - favorite list requires authentication
      const response = await authApiClient.get("/favorite-list");
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Favorite list fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch favorite list",
      };
    }
  },

  // ============================================
  // CART ENDPOINTS
  // ============================================

  /**
   * Get user's cart
   * GET /cart
   */
  getCart: async () => {
    try {
      // Use authApiClient - cart requires authentication
      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await authApiClient.get(`/cart?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Cart fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch cart",
      };
    }
  },

  /**
   * Add product to cart
   * POST /cart/:id
   * @param {number} productId - Product ID
   * @param {number} variantId - Pack size/variant ID (required)
   */
  addToCart: async (productId, variantId, quantity = 1) => {
    try {
      const response = await authApiClient.post(`/cart/${productId}`, {
        pack_size_id: variantId,  // مش variant_id → ده السبب الرئيسي لكل المشاكل
        quantity: quantity
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "تمت الإضافة للسلة بنجاح"
      };
    } catch (error) {
      console.error("Add to cart failed:", error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || "فشل إضافة المنتج للسلة",
        errors: error.response?.data?.errors || {}
      };
    }
  },

  /**
   * Update cart item quantity
   * PUT /cart/:id?quantity=...&pack_size_id=...
   * @param {number} cartItemId - Cart item ID
   * @param {number} quantity - New quantity
   * @param {number} packSizeId - Pack size ID
   */
  updateCartItem: async (cartItemId, quantity, packSizeId) => {
    try {
      // Use authApiClient - cart operations require authentication
      const response = await authApiClient.put(`/cart/${cartItemId}`, null, {
        params: { quantity, pack_size_id: packSizeId },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Cart updated successfully",
        routeNotFound: false,
      };
    } catch (error) {
      const isRouteNotFound = error.response?.status === 404;
      if (isRouteNotFound) {
        // Suppress console error for expected route not found
        // The interceptor already marked this as suppressLog
        if (!error.suppressLog) {
          console.warn(`⚠️ API Route Not Found (expected): PUT /cart/${cartItemId}`);
        }
      } else if (!error.suppressLog) {
        console.error("Error updating cart item:", error);
      }
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update cart",
        routeNotFound: isRouteNotFound,
      };
    }
  },

  /**
   * Remove item from cart
   * DELETE /cart/:id?pack_size_id=...
   * @param {number} productId - Product ID (used in URL path)
   * @param {number} variantId - Variant/Pack size ID (used as query parameter)
   */removeFromCart: async (cartItemId, variantId = null) => {
    try {
      console.log("جاري حذف cart_item_id:", cartItemId, "variant_id:", variantId);

      const response = await authApiClient.delete(`/cart/${cartItemId}`, {
        data: variantId ? { variant_id: variantId } : {}
      });

      console.log("تم الحذف من السيرفر بنجاح:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("فشل حذف من السيرفر:", error.response?.status, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || "فشل الحذف",
        status: error.response?.status
      };
    }
  },

  /**
   * Clear entire cart
   * DELETE /cart
   */
  clearCart: async () => {
    try {
      // Use authApiClient - cart operations require authentication
      const response = await authApiClient.delete("/cart");
      return {
        success: true,
        message: response.data.message || "Cart cleared successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to clear cart",
      };
    }
  },

  /**
   * Apply coupon to cart
   * POST /cart/apply-coupon
   * @param {string} code - Coupon code
   */
  applyCoupon: async (code) => {
    try {
      const formData = createFormData({ code });
      // Use authApiClient - cart operations require authentication
      const response = await authApiClient.post("/cart/apply-coupon", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Coupon applied successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to apply coupon",
      };
    }
  },

  // ============================================
  // ADDRESSES ENDPOINTS
  // ============================================

  /**
   * Get user's addresses
   * GET /addresses
   */
  getAddresses: async () => {
    try {
      // Use authApiClient - addresses require authentication
      const response = await authApiClient.get("/addresses");
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Addresses fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch addresses",
      };
    }
  },

  /**
   * Create new address
   * POST /addresses
   * @param {Object} addressData - Address data
   */
  createAddress: async (addressData) => {
    try {
      const formData = createFormData(addressData);
      // Use authApiClient - addresses require authentication
      const response = await authApiClient.post("/addresses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Address created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create address",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  /**
   * Update address
   * PUT /addresses/:id
   * @param {number} id - Address ID
   * @param {Object} addressData - Updated address data
   */
  updateAddress: async (id, addressData) => {
    try {
      const formData = createFormData(addressData);
      // Use authApiClient - addresses require authentication
      const response = await authApiClient.put(`/addresses/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Address updated successfully",
      };
    } catch (error) {
      // Check for route not found errors
      const errorMessage = error.response?.data?.message || "";
      const isRouteNotFound = errorMessage.includes("could not be found") ||
        errorMessage.includes("route") ||
        error.response?.status === 404;

      if (isRouteNotFound) {
        // Suppress console error for expected route-not-found errors
        // (The error is expected since the backend doesn't implement this endpoint)
        return {
          success: false,
          data: null,
          message: errorMessage || "The update address endpoint is not available on the server",
          routeNotFound: true,
          errors: {},
        };
      }

      // Log other errors normally for debugging
      console.error("Error updating address:", error);
      return {
        success: false,
        data: null,
        message: errorMessage || "Failed to update address",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  /**
   * Delete address
   * DELETE /addresses/:id
   * Note: This endpoint may not be available in the backend yet
   * @param {number} id - Address ID
   */
  deleteAddress: async (id) => {
    try {
      // Use authApiClient - addresses require authentication
      const response = await authApiClient.delete(`/addresses/${id}`);
      return {
        success: true,
        message: response.data.message || "Address deleted successfully",
      };
    } catch (error) {
      // Check for route not found errors
      const errorMessage = error.response?.data?.message || "";
      const isRouteNotFound = errorMessage.includes("could not be found") ||
        errorMessage.includes("route") ||
        error.response?.status === 404;

      if (isRouteNotFound) {
        // Suppress console error for expected route-not-found errors
        // (The error is expected since the backend doesn't implement this endpoint)
        return {
          success: false,
          message: errorMessage || "The delete address endpoint is not available on the server",
          routeNotFound: true,
        };
      }

      // Log other errors normally for debugging
      console.error("Error deleting address:", error);
      return {
        success: false,
        message: errorMessage || "Failed to delete address",
      };
    }
  },

  // ============================================
  // ORDERS ENDPOINTS
  // ============================================

  /**
   * Get user's orders
   * GET /orders
   */
  getOrders: async () => {
    try {
      // Use authApiClient - orders require authentication
      const response = await authApiClient.get("/orders");
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Orders fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch orders",
      };
    }
  },

  /**
   * Get order by ID
   * GET /orders/:id
   * @param {number} id - Order ID
   */
  getOrderById: async (id) => {
    try {
      // Use authApiClient - orders require authentication
      const response = await authApiClient.get(`/orders/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Order fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch order",
      };
    }
  },

  /**
   * Create new order
   * POST /orders
   * @param {Object} orderData - Order data
   * @param {number} orderData.shipping_address_id - Shipping address ID
   * @param {number} orderData.billing_address_id - Billing address ID
   * @param {string} orderData.payment_method - Payment method
   * @param {string} orderData.coupon_code - Optional coupon code
   * @param {boolean} orderData.use_points - Optional: use loyalty points
   * @param {number} orderData.branch_id - Optional branch ID
   */
  createOrder: async (orderData) => {
    try {
      console.log("Creating order:", orderData);
      const response = await authApiClient.post("/orders", orderData);

      // Extract order and transaction data from response
      const responseData = response.data?.data || response.data;
      const orderId = responseData?.id || responseData?.order_id;
      const transactionId =
        responseData?.transaction_id ||
        responseData?.transaction?.id ||
        responseData?.transactions?.[0]?.id;

      return {
        success: true,
        data: responseData,
        order_id: orderId,
        transaction_id: transactionId,
        // Include full response for detailed access
        fullResponse: response.data,
      };
    } catch (error) {
      // Handle 500 error related to Pusher (order might still be created)
      if (error.response?.status === 500 && error.response?.data?.message?.includes("Pusher")) {
        // Try to extract order ID from error response if available
        const errorData = error.response?.data;
        return {
          success: true,
          data: errorData,
          order_id: errorData?.order_id || errorData?.id,
          transaction_id: errorData?.transaction_id || errorData?.transaction?.id,
          message: "Order created successfully (notification service issue)",
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || "Failed to create order",
        data: error.response?.data,
      };
    }
  },

  /**
   * Cancel order
   * POST /orders/:id/cancel
   * @param {number} id - Order ID
   */
  cancelOrder: async (id) => {
    try {
      // Use authApiClient - orders require authentication
      const response = await authApiClient.post(`/orders/${id}/cancel`);
      return {
        success: true,
        message: response.data.message || "Order cancelled successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to cancel order",
      };
    }
  },

  // ============================================
  // TRANSACTIONS ENDPOINTS
  // ============================================

  /**
   * Get user's transactions
   * GET /transactions
   */
  getTransactions: async () => {
    try {
      // Use authApiClient - transactions require authentication
      const response = await authApiClient.get("/transactions");

      // Handle different response structures
      let transactionsData = null;
      if (response.data) {
        if (Array.isArray(response.data)) {
          transactionsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          transactionsData = response.data.data;
        } else if (response.data.transactions && Array.isArray(response.data.transactions)) {
          transactionsData = response.data.transactions;
        } else {
          transactionsData = [];
        }
      } else {
        transactionsData = [];
      }

      console.log("📊 Transactions API - Fetched:", transactionsData.length, "transactions");

      return {
        success: true,
        data: transactionsData,
        message: "Transactions fetched successfully",
      };
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch transactions",
      };
    }
  },

  /**
   * Get transaction by ID
   * GET /transactions/:id
   * @param {number} id - Transaction ID
   */
  getTransactionById: async (id) => {
    try {
      // Use authApiClient - transactions require authentication
      const response = await authApiClient.get(`/transactions/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Transaction fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to fetch transaction",
      };
    }
  },

  /**
   * Pay for transaction
   * POST /transactions/:id/pay
   * @param {number} id - Transaction ID
   */
  payTransaction: async (id) => {
    try {
      // Use authApiClient - transactions require authentication
      const response = await authApiClient.post(`/transactions/${id}/pay`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Payment processed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Payment failed",
      };
    }
  },

  // ============================================
  // ATTRIBUTES ENDPOINTS
  // ============================================

  /**
   * Get product attributes (for filters)
   * GET /attributes
   */
  getAttributes: async () => {
    try {
      // Use publicApiClient - attributes don't require authentication
      const response = await publicApiClient.get("/attributes");
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Attributes fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch attributes",
      };
    }
  },

  // ============================================
  // TICKETS (SUPPORT) ENDPOINTS
  // ============================================

  /**
   * Get user's support tickets
   * GET /tickets
   */
  getTickets: async () => {
    try {
      // Use authApiClient - tickets require authentication
      const response = await authApiClient.get("/tickets");

      // Handle different response structures
      let ticketsData = null;
      if (response.data) {
        if (Array.isArray(response.data)) {
          ticketsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          ticketsData = response.data.data;
        } else if (response.data.tickets && Array.isArray(response.data.tickets)) {
          ticketsData = response.data.tickets;
        } else {
          ticketsData = [];
        }
      } else {
        ticketsData = [];
      }

      console.log("🎫 Tickets API - Fetched:", ticketsData.length, "tickets");

      return {
        success: true,
        data: ticketsData,
        message: "Tickets fetched successfully",
      };
    } catch (error) {
      console.error("❌ Error fetching tickets:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch tickets",
      };
    }
  },

  /**
   * Get ticket by ID
   * GET /tickets/:id
   * @param {number} id - Ticket ID
   */
  getTicketById: async (id) => {
    try {
      // Use authApiClient - tickets require authentication
      const response = await authApiClient.get(`/tickets/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Ticket fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch ticket",
      };
    }
  },

  /**
   * Create support ticket
   * POST /tickets
   * @param {Object} ticketData - Ticket data
   * @param {string} ticketData.subject - Ticket subject
   * @param {string} ticketData.description - Ticket description
   * @param {File[]} ticketData.attachments - Optional file attachments
   */
  createTicket: async (ticketData) => {
    try {
      const formData = createFormData(ticketData);
      // Use authApiClient - tickets require authentication
      const response = await authApiClient.post("/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Ticket created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create ticket",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  /**
   * Update ticket
   * PUT /tickets/:id
   * @param {number} id - Ticket ID
   * @param {Object} ticketData - Updated ticket data
   */
  updateTicket: async (id, ticketData) => {
    try {
      // Use authApiClient - tickets require authentication
      const response = await authApiClient.put(`/tickets/${id}`, null, {
        params: ticketData,
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Ticket updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update ticket",
      };
    }
  },

  /**
   * Delete ticket
   * DELETE /tickets/:id
   * @param {number} id - Ticket ID
   */
  deleteTicket: async (id) => {
    try {
      // Use authApiClient - tickets require authentication
      const response = await authApiClient.delete(`/tickets/${id}`);
      return {
        success: true,
        message: response.data.message || "Ticket deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete ticket",
      };
    }
  },

  /**
   * Reply to ticket
   * POST /tickets/:id/reply
   * @param {number} id - Ticket ID
   * @param {string} message - Reply message
   */
  replyToTicket: async (id, message) => {
    try {
      const formData = createFormData({ message });
      // Use authApiClient - tickets require authentication
      const response = await authApiClient.post(`/tickets/${id}/reply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Reply sent successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send reply",
      };
    }
  },

  // ============================================
  // BRANCHES ENDPOINTS
  // ============================================

  /**
   * Get all branches
   * GET /branches
   */
  getBranches: async () => {
    try {
      // Use publicApiClient - branches don't require authentication
      const response = await publicApiClient.get("/branches");
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Branches fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch branches",
      };
    }
  },

  // ============================================
  // OFFERS ENDPOINTS
  // ============================================

  /**
   * Get all offers
   * GET /offers
   */
  getOffers: async () => {
    try {
      // Use publicApiClient - offers don't require authentication
      const response = await publicApiClient.get("/offers");

      // Handle different response structures
      let offersData = null;
      if (response.data) {
        if (Array.isArray(response.data)) {
          offersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          offersData = response.data.data;
        } else if (response.data.offers && Array.isArray(response.data.offers)) {
          offersData = response.data.offers;
        } else {
          offersData = [];
        }
      } else {
        offersData = [];
      }

      console.log("🌐 API getOffers - Raw response:", response);
      console.log("🌐 API getOffers - Processed data:", offersData);
      console.log(`🌐 API getOffers - Offers count: ${offersData.length}`);

      return {
        success: true,
        data: offersData,
        message: "Offers fetched successfully",
      };
    } catch (error) {
      console.error("❌ API getOffers - Error:", error);
      console.error("❌ API getOffers - Error response:", error.response?.data);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch offers",
      };
    }
  },

  // ============================================
  // SLIDERS ENDPOINTS
  // ============================================

  /**
   * Get all sliders
   * GET /sliders
   */
  getSliders: async () => {
    try {
      // Use publicApiClient - sliders don't require authentication
      const response = await publicApiClient.get("/sliders");
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Sliders fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch sliders",
      };
    }
  },

  // ============================================
  // BOOKING LISTS ENDPOINTS
  // ============================================

  /**
   * Get user's booking lists
   * GET /booking-lists
   */
  getBookingLists: async () => {
    try {
      // Use authApiClient - booking lists require authentication
      const response = await authApiClient.get("/booking-lists");
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Booking lists fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch booking lists",
      };
    }
  },

  /**
   * Get booking list by ID
   * GET /booking-lists/:id
   * @param {number} id - Booking list ID
   */
  getBookingListById: async (id) => {
    try {
      // Use authApiClient - booking lists require authentication
      const response = await authApiClient.get(`/booking-lists/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Booking list fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to fetch booking list",
      };
    }
  },

  /**
   * Create booking list
   * POST /booking-lists
   * @param {number} product_id - Product ID
   * @param {number} quantity - Quantity
   */
  createBookingList: async (product_id, quantity) => {
    try {
      const formData = createFormData({ product_id, quantity });
      // Use authApiClient - booking lists require authentication
      const response = await authApiClient.post("/booking-lists", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Booking list created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to create booking list",
      };
    }
  },

  /**
   * Update booking list
   * PUT /booking-lists/:id
   * @param {number} id - Booking list ID
   * @param {number} quantity - New quantity
   * @param {number} product_id - Product ID
   */
  updateBookingList: async (id, quantity, product_id) => {
    try {
      // Use authApiClient - booking lists require authentication
      const response = await authApiClient.put(`/booking-lists/${id}`, null, {
        params: { quantity, product_id },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Booking list updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update booking list",
      };
    }
  },

  /**
   * Delete booking list
   * DELETE /booking-lists/:id
   * @param {number} id - Booking list ID
   */
  deleteBookingList: async (id) => {
    try {
      // Use authApiClient - booking lists require authentication
      const response = await authApiClient.delete(`/booking-lists/${id}`);
      return {
        success: true,
        message: response.data.message || "Booking list deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to delete booking list",
      };
    }
  },

  /**
   * Cancel booking list
   * POST /booking-lists/:id/cancel
   * @param {number} id - Booking list ID
   */
  cancelBookingList: async (id) => {
    try {
      // Use authApiClient - booking lists require authentication
      const response = await authApiClient.post(`/booking-lists/${id}/cancel`);
      return {
        success: true,
        message: response.data.message || "Booking list cancelled successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to cancel booking list",
      };
    }
  },
};

// Export the axios clients for direct use if needed
// Note: getApiClient is available from axiosConfig if you need dynamic client selection
export { publicApiClient, authApiClient } from "./axiosConfig";

// Default export
export default apiService;
