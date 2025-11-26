import axios from "axios";
import { api as mockApi } from "./mockData";

// API Base URL - In production, this would be your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.laeij.com/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (for adding auth tokens, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for handling errors globally)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Check if we should use mock API (for development)
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

// API Service Functions
export const apiService = {
  // Categories
  getCategories: async () => {
    if (USE_MOCK_API) {
      return await mockApi.getCategories();
    }
    try {
      const response = await apiClient.get("/categories");
      return {
        success: true,
        data: response.data,
        message: "Categories fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch categories",
      };
    }
  },

  getCategoryById: async (id) => {
    if (USE_MOCK_API) {
      return await mockApi.getCategoryById(id);
    }
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Category fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching category:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch category",
      };
    }
  },

  // Products
  getProducts: async (filters = {}) => {
    if (USE_MOCK_API) {
      return await mockApi.getProducts(filters);
    }
    try {
      const response = await apiClient.get("/products", { params: filters });
      return {
        success: true,
        data: response.data.products || response.data,
        pagination: response.data.pagination,
        message: "Products fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || "Failed to fetch products",
      };
    }
  },

  getProductById: async (id) => {
    if (USE_MOCK_API) {
      return await mockApi.getProductById(id);
    }
    try {
      const response = await apiClient.get(`/products/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Product fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch product",
      };
    }
  },

  getFeaturedProducts: async (limit = 4) => {
    if (USE_MOCK_API) {
      return await mockApi.getFeaturedProducts(limit);
    }
    try {
      const response = await apiClient.get("/products/featured", {
        params: { limit },
      });
      return {
        success: true,
        data: response.data,
        message: "Featured products fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch featured products",
      };
    }
  },

  getProductsByCategory: async (categoryId, limit = null) => {
    if (USE_MOCK_API) {
      return await mockApi.getProductsByCategory(categoryId, limit);
    }
    try {
      const response = await apiClient.get(`/categories/${categoryId}/products`, {
        params: { limit },
      });
      return {
        success: true,
        data: response.data,
        message: "Products fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch products",
      };
    }
  },

  searchProducts: async (query) => {
    if (USE_MOCK_API) {
      return await mockApi.searchProducts(query);
    }
    try {
      const response = await apiClient.get("/products/search", {
        params: { q: query },
      });
      return {
        success: true,
        data: response.data,
        message: "Search completed successfully",
      };
    } catch (error) {
      console.error("Error searching products:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Search failed",
      };
    }
  },

  // Cart operations (for future implementation)
  addToCart: async (productId, quantity = 1) => {
    if (USE_MOCK_API) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        data: { productId, quantity },
        message: "Product added to cart",
      };
    }
    try {
      const response = await apiClient.post("/cart/add", {
        productId,
        quantity,
      });
      return {
        success: true,
        data: response.data,
        message: "Product added to cart",
      };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to add to cart",
      };
    }
  },
};

export default apiService;

