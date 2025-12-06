import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";
import { useAuth } from "./AuthContext";

/**
 * Wishlist Context
 *
 * Manages user's favorite/wishlist products.
 * All wishlist operations use the real API endpoints.
 * Falls back to localStorage for guest users (if needed).
 */

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Wishlist items state
  const [wishlist, setWishlist] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  /**
   * Helper function to construct full image URL from API response
   * Handles both absolute URLs and relative paths
   */
  const getImageUrl = (imagePath) => {
    // Handle null, undefined, or falsy values
    if (!imagePath) return null;

    // Handle non-string types
    if (typeof imagePath !== "string") {
      // If it's an object, try to extract URL from common properties
      if (typeof imagePath === "object" && imagePath !== null) {
        const extractedUrl =
          imagePath.url ||
          imagePath.path ||
          imagePath.src ||
          imagePath.image ||
          null;
        // Recursively process the extracted value to ensure it's a string
        if (extractedUrl) {
          return getImageUrl(extractedUrl);
        }
        return null;
      }
      // If it's a number or other type, try to convert to string
      try {
        imagePath = String(imagePath);
      } catch (e) {
        return null;
      }
    }

    // Trim whitespace
    imagePath = imagePath.trim();
    if (!imagePath) return null;

    // If already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // If relative path, construct full URL
    // Remove /api from base URL for images (images are usually at root domain)
    const baseUrl = (
      import.meta.env.VITE_API_URL || "https://laeij.teamqeematech.site/api"
    ).replace("/api", "");
    return imagePath.startsWith("/")
      ? `${baseUrl}${imagePath}`
      : `${baseUrl}/${imagePath}`;
  };

  /**
   * Helper function to format wishlist items from API response
   */
  const formatWishlistItems = (items) => {
    return items.map((item) => {
      try {
        const product = item.product || item;

        // Get the primary image URL with safe extraction
        const primaryImage =
          product?.thumb_image ||
          product?.image ||
          (Array.isArray(product?.images) ? product.images[0] : null) ||
          item?.image ||
          null;
        const imageUrl = getImageUrl(primaryImage);

        // Process images array if it exists
        let processedImages = [];
        if (product?.images && Array.isArray(product.images)) {
          processedImages = product.images
            .map((img) => {
              try {
                return getImageUrl(img);
              } catch (e) {
                console.warn("Error processing image in array:", e, img);
                return null;
              }
            })
            .filter(Boolean);
        } else if (imageUrl) {
          processedImages = [imageUrl];
        }

        return {
          id: item.product_id || item.id,
          name: product?.name || item?.name || "",
          nameEn: product?.name_en || product?.nameEn || item?.name || "",
          category: product?.category?.name || item?.category || "",
          categoryId: product?.category_id || item?.category_id || null,
          price: parseFloat(product?.price || item?.price || 0) || 0,
          thumb_image: imageUrl,
          image: imageUrl,
          images: processedImages,
          size: product?.size || item?.size || "",
          description: product?.description || item?.description || "",
          descriptionEn:
            product?.description_en || product?.descriptionEn || "",
        };
      } catch (error) {
        console.error("Error formatting wishlist item:", error, item);
        // Return a minimal valid item structure to prevent crashes
        return {
          id: item?.product_id || item?.id || 0,
          name: item?.name || "",
          nameEn: item?.name || "",
          category: "",
          categoryId: null,
          price: 0,
          thumb_image: null,
          image: null,
          images: [],
          size: "",
          description: "",
          descriptionEn: "",
        };
      }
    });
  };

  /**
   * Fetch wishlist from API when authenticated
   * Called on mount and when authentication state changes
   */
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          setError(null);
          const response = await apiService.getFavoriteList();

          if (response.success && response.data) {
            // Transform API response to match our wishlist item structure
            const items = Array.isArray(response.data)
              ? response.data
              : response.data.products || response.data.items || [];

            // Debug: Log raw API response in development (disabled to reduce console noise)
            // Uncomment the block below if you need to debug wishlist API responses
            /*
            if (import.meta.env.DEV && items.length > 0) {
              console.log("Wishlist API Response - First item:", items[0]);
            }
            */

            // Map API wishlist items to our format
            const formattedItems = formatWishlistItems(items);

            // Debug: Log formatted items in development
            if (import.meta.env.DEV && formattedItems.length > 0) {
              console.log(
                "Wishlist Formatted - First item:",
                formattedItems[0]
              );
            }

            setWishlist(formattedItems);
          } else {
            setWishlist([]);
          }
        } catch (err) {
          console.error("Error fetching wishlist:", err);
          setError("Failed to load wishlist");
          // Fallback to empty wishlist on error
          setWishlist([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Not authenticated - load from localStorage as fallback
        const saved = localStorage.getItem("wishlist");
        if (saved) {
          try {
            const items = JSON.parse(saved);
            setWishlist(items);
          } catch (e) {
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  /**
   * Sync wishlist to localStorage (for guest users or as backup)
   */
  useEffect(() => {
    if (!isAuthenticated && wishlist.length > 0) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  /**
   * Add product to wishlist
   * POST /products/:id/toggle-favorite
   * @param {Object} product - Product object
   */
  const addToWishlist = async (product) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Use real API
        const response = await apiService.toggleFavorite(product.id);

        if (response.success) {
          // Refresh wishlist from API
          const wishlistResponse = await apiService.getFavoriteList();
          if (wishlistResponse.success && wishlistResponse.data) {
            const items = Array.isArray(wishlistResponse.data)
              ? wishlistResponse.data
              : wishlistResponse.data.products ||
                wishlistResponse.data.items ||
                [];

            const formattedItems = formatWishlistItems(items);
            setWishlist(formattedItems);
          }
          return {
            success: true,
            message: response.message || "Added to wishlist",
          };
        } else {
          setError(response.message || "Failed to add to wishlist");
          return {
            success: false,
            message: response.message || "Failed to add to wishlist",
          };
        }
      } else {
        // Guest user - use localStorage
        setWishlist((prev) => {
          const exists = prev.find((item) => item.id === product.id);
          if (exists) {
            return prev;
          }
          return [...prev, product];
        });
        return { success: true, message: "Added to wishlist" };
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      setError(err.message || "Failed to add to wishlist");
      return {
        success: false,
        message: err.message || "Failed to add to wishlist",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove product from wishlist
   * POST /products/:id/toggle-favorite (toggles off)
   * @param {number} productId - Product ID
   */
  const removeFromWishlist = async (productId) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Use real API - toggle favorite to remove
        const response = await apiService.toggleFavorite(productId);

        if (response.success) {
          // Refresh wishlist from API
          const wishlistResponse = await apiService.getFavoriteList();
          if (wishlistResponse.success && wishlistResponse.data) {
            const items = Array.isArray(wishlistResponse.data)
              ? wishlistResponse.data
              : wishlistResponse.data.products ||
                wishlistResponse.data.items ||
                [];

            const formattedItems = formatWishlistItems(items);
            setWishlist(formattedItems);
          }
          return {
            success: true,
            message: response.message || "Removed from wishlist",
          };
        } else {
          setError(response.message || "Failed to remove from wishlist");
          return {
            success: false,
            message: response.message || "Failed to remove from wishlist",
          };
        }
      } else {
        // Guest user - use localStorage
        setWishlist((prev) => prev.filter((item) => item.id !== productId));
        return { success: true, message: "Removed from wishlist" };
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setError(err.message || "Failed to remove from wishlist");
      return {
        success: false,
        message: err.message || "Failed to remove from wishlist",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if product is in wishlist
   * @param {number} productId - Product ID
   * @returns {boolean}
   */
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  /**
   * Clear entire wishlist
   * Removes all items one by one (API doesn't have bulk clear endpoint)
   */
  const clearWishlist = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Remove all items from wishlist
        const removePromises = wishlist.map((item) =>
          apiService.toggleFavorite(item.id)
        );

        await Promise.all(removePromises);

        // Refresh wishlist
        const wishlistResponse = await apiService.getFavoriteList();
        if (wishlistResponse.success && wishlistResponse.data) {
          const items = Array.isArray(wishlistResponse.data)
            ? wishlistResponse.data
            : wishlistResponse.data.products ||
              wishlistResponse.data.items ||
              [];

          const formattedItems = formatWishlistItems(items);

          setWishlist(formattedItems);
        }
        return { success: true, message: "Wishlist cleared" };
      } else {
        // Guest user - use localStorage
        setWishlist([]);
        localStorage.removeItem("wishlist");
        return { success: true, message: "Wishlist cleared" };
      }
    } catch (err) {
      console.error("Error clearing wishlist:", err);
      setError(err.message || "Failed to clear wishlist");
      return {
        success: false,
        message: err.message || "Failed to clear wishlist",
      };
    } finally {
      setLoading(false);
    }
  };

  // Calculate wishlist count
  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
