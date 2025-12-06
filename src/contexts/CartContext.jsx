import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import apiService from "../services/api";
import { useAuth } from "./AuthContext";

/**
 * Cart Context
 *
 * Manages shopping cart state and operations.
 * All cart operations use the real API endpoints.
 * Falls back to localStorage for guest users (if needed).
 */

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
    } catch {
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

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Cart items state
  const [cartItems, setCartItems] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // Track locally deleted items (when API delete fails with 404)
  // This prevents them from being restored when cart refreshes
  const [locallyDeletedItems, setLocallyDeletedItems] = useState(new Set());

  /**
   * Helper function to format and filter cart items
   * Filters out items that were deleted locally (404 delete)
   */
  const formatAndFilterCartItems = useCallback(
    (items) => {
      return items
        .map((item) => {
          const rawImage =
            item.product?.thumb_image ||
            item.product?.image ||
            item.image ||
            item.product?.images?.[0] ||
            null;

          return {
            id: item.product_id || item.product?.id || item.id,
            cartItemId: item.id,
            variantId: item.variant_id || item.pack_size_id || item.variant?.id,
            name: item.product?.name || item.name,
            nameEn: item.product?.name_en || item.product?.nameEn || item.name,
            category: item.product?.category?.name || item.category,
            categoryId: item.product?.category_id || item.category_id,
            price: parseFloat(item.price || item.product?.price || 0),
            quantity: parseInt(item.quantity || 1),
            image: getImageUrl(rawImage),
            size: item.pack_size?.size || item.size || item.variant?.size,
          };
        })
        .filter((item) => {
          // Filter out items that were deleted locally
          const itemKey = `${item.id}-${item.cartItemId}-${item.variantId}`;
          return !locallyDeletedItems.has(itemKey);
        });
    },
    [locallyDeletedItems]
  );

  /**
   * Fetch cart from API when authenticated
   * Called on mount and when authentication state changes
   */
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        // Clear localStorage cart when authenticated (use API only)
        localStorage.removeItem("cart");
        try {
          setLoading(true);
          setError(null);
          const response = await apiService.getCart();
          if (response.success && response.data) {
            // Transform API response to match our cart item structure
            const items = Array.isArray(response.data)
              ? response.data
              : response.data.items || [];

            // Map API cart items to our format and filter deleted items
            const formattedItems = formatAndFilterCartItems(items);

            setCartItems(formattedItems);
          } else {
            setCartItems([]);
          }
        } catch (err) {
          console.error("Error fetching cart:", err);
          setError("Failed to load cart");
          // Fallback to empty cart on error
          setCartItems([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Not authenticated - load from localStorage as fallback
        const saved = localStorage.getItem("cart");
        if (saved) {
          try {
            const items = JSON.parse(saved);
            setCartItems(items);
          } catch {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
    };

    fetchCart();
  }, [isAuthenticated, formatAndFilterCartItems]);

  /**
   * Sync cart to localStorage (for guest users or as backup)
   */
  useEffect(() => {
    if (!isAuthenticated && cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  /**
   * Add product to cart
   * POST /cart/:id
   * @param {Object} product - Product object
   * @param {number} quantity - Quantity to add
   * @param {number} variantId - Pack size/variant ID (required by API)
   */
  const addToCart = async (product, quantity = 1, variantId = null) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Use real API
        // Note: API requires variant_id (must exist in pack_sizes table)
        // NEVER use product.id as variant_id - it must be a valid pack_size.id
        let selectedVariantId = variantId;

        // If variantId not provided, try to find it from product.pack_sizes
        if (!selectedVariantId) {
          // First priority: get from pack_sizes array
          if (product.variants.length > 0 && Array.isArray(product.variants)) {
            selectedVariantId = product.variants[0].id;
          }
          // Second priority: check other variant ID fields
          else if (product.variant_id) {
            selectedVariantId = product.variant_id;
          } else if (product.variantId) {
            selectedVariantId = product.variantId;
          } else if (product.pack_size_id) {
            selectedVariantId = product.pack_size_id;
          }
        }

        // Debug: Log variant ID selection in development
        if (import.meta.env.DEV) {
          console.log("🔍 Variant ID Selection:", {
            providedVariantId: variantId,
            productPackSizes: product.pack_sizes,
            selectedVariantId,
            productId: product.id,
          });
        }

        // If no valid variant_id found, return error (don't use product.id)
        if (!selectedVariantId) {
          const errorMsg =
            "Variant ID (pack size) is required. Please select a size on the product page.";
          setError(errorMsg);
          return {
            success: false,
            message: errorMsg,
          };
        }

        const response = await apiService.addToCart(
          product.id,
          selectedVariantId,
          quantity
        );
        console.log(response);
        if (response.success) {
          // Small delay to ensure backend has processed the request
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Refresh cart from API
          const cartResponse = await apiService.getCart();
          if (cartResponse.success && cartResponse.data) {
            const items = Array.isArray(cartResponse.data)
              ? cartResponse.data
              : cartResponse.data.items || [];

            const formattedItems = items.map((item) => {
              // Get image from various possible locations in API response
              const rawImage =
                item.product?.thumb_image ||
                item.product?.image ||
                item.image ||
                item.product?.images?.[0] ||
                null;

              return {
                id: item.product_id || item.id,
                cartItemId: item.id,
                variantId: item.variant_id || item.pack_size_id,
                name: item.product?.name || item.name,
                nameEn:
                  item.product?.name_en || item.product?.nameEn || item.name,
                category: item.product?.category?.name || item.category,
                categoryId: item.product?.category_id || item.category_id,
                price: parseFloat(item.price || item.product?.price || 0),
                quantity: parseInt(item.quantity || 1),
                image: getImageUrl(rawImage),
                size: item.pack_size?.size || item.size || item.variant?.size,
              };
            });

            setCartItems(formattedItems);
          }
          return {
            success: true,
            message: response.message || "Product added to cart",
          };
        } else {
          setError(response.message || "Failed to add to cart");
          return {
            success: false,
            message: response.message || "Failed to add to cart",
          };
        }
      } else {
        // Guest user - use localStorage
        setCartItems((prev) => {
          const existingItem = prev.find((item) => item.id === product.id);
          if (existingItem) {
            return prev.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return [
            ...prev,
            {
              id: product.id,
              name: product.name,
              nameEn: product.nameEn || product.name,
              category: product.category,
              categoryId: product.categoryId,
              price:
                typeof product.price === "string"
                  ? parseFloat(product.price.replace(/[^\d.]/g, ""))
                  : product.price,
              quantity: quantity,
              image: product.image,
              size: product.size,
            },
          ];
        });
        return { success: true, message: "Product added to cart" };
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(err.message || "Failed to add to cart");
      return {
        success: false,
        message: err.message || "Failed to add to cart",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove product from cart
   * DELETE /cart/:id
   * @param {number} productId - Product ID or cart item ID
   * @param {number} packSizeId - Pack size ID (required by API)
   */
  const removeFromCart = async (productId, variant_id = null) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Find the cart item to get cartItemId and packSizeId
        // داخل removeFromCart function
        const cartItem = cartItems.find(
          (item) => item.id === productId || item.cartItemId === productId
        );

        if (!cartItem) return { success: false };

        // المهم جدًا: نستخدم cartItemId (اللي هو item.id من الـ API)
        const cartItemIdToDelete = cartItem.cartItemId || cartItem.id;
        const variantIdToDelete =
          variant_id || cartItem.variantId || cartItem.pack_size_id;

        const response = await apiService.removeFromCart(
          cartItemIdToDelete,
          variantIdToDelete
        );

        if (response.success) {
          // Small delay to ensure backend has processed the request
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Refresh cart from API
          const cartResponse = await apiService.getCart();
          if (cartResponse.success && cartResponse.data) {
            const items = Array.isArray(cartResponse.data)
              ? cartResponse.data
              : cartResponse.data.items || [];

            const formattedItems = items.map((item) => {
              // Get image from various possible locations in API response
              const rawImage =
                item.product?.thumb_image ||
                item.product?.image ||
                item.image ||
                item.product?.images?.[0] ||
                null;

              return {
                id: item.product_id || item.id,
                cartItemId: item.id,
                variantId: item.variant_id || item.pack_size_id,
                name: item.product?.name || item.name,
                nameEn:
                  item.product?.name_en || item.product?.nameEn || item.name,
                category: item.product?.category?.name || item.category,
                categoryId: item.product?.category_id || item.category_id,
                price: parseFloat(item.price || item.product?.price || 0),
                quantity: parseInt(item.quantity || 1),
                image: getImageUrl(rawImage),
                size: item.pack_size?.size || item.size || item.variant?.size,
              };
            });

            setCartItems(formattedItems);
          } else {
            // If cart fetch fails after delete, clear cart items
            setCartItems([]);
          }
          return {
            success: true,
            message: response.message || "Item removed from cart",
          };
        } else {
          // Check if route is not found (404)
          if (response.routeNotFound) {
            // Fallback to local state update since API route doesn't exist
            // This is expected - the DELETE endpoint is not implemented on backend yet
            // Track this deletion so it won't be restored on refresh
            const deletedItemKey = `${productIdToDelete}-${
              cartItem.cartItemId || cartItem.id
            }-${variantIdToDelete || cartItem.variantId}`;
            setLocallyDeletedItems(
              (prev) => new Set([...prev, deletedItemKey])
            );

            // Remove from local state using product_id
            setCartItems((prev) =>
              prev.filter(
                (item) =>
                  !(
                    item.id === productIdToDelete &&
                    (item.variantId === variantIdToDelete || !variantIdToDelete)
                  )
              )
            );
            return {
              success: true,
              message: "Item removed from cart",
              routeNotFound: true,
            };
          }
          setError(response.message || "Failed to remove item");
          return {
            success: false,
            message: response.message || "Failed to remove item",
          };
        }
      } else {
        // Guest user - use localStorage
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
        return { success: true, message: "Item removed from cart" };
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError(err.message || "Failed to remove item");
      return {
        success: false,
        message: err.message || "Failed to remove item",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update cart item quantity
   * PUT /cart/:id
   * @param {number} productId - Product ID or cart item ID
   * @param {number} quantity - New quantity
   * @param {number} packSizeId - Pack size ID (required by API)
   */
  const updateQuantity = async (productId, quantity, packSizeId = null) => {
    if (quantity <= 0) {
      return await removeFromCart(productId, packSizeId);
    }

    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Find the cart item
        const cartItem = cartItems.find(
          (item) => item.id === productId || item.cartItemId === productId
        );

        if (!cartItem) {
          return { success: false, message: "Item not found in cart" };
        }

        const cartItemId = cartItem.cartItemId || cartItem.id;
        const variantId = packSizeId || cartItem.variantId;

        const response = await apiService.updateCartItem(
          cartItemId,
          quantity,
          variantId
        );

        if (response.success) {
          // Small delay to ensure backend has processed the request
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Refresh cart from API
          const cartResponse = await apiService.getCart();
          if (cartResponse.success && cartResponse.data) {
            const items = Array.isArray(cartResponse.data)
              ? cartResponse.data
              : cartResponse.data.items || [];

            const formattedItems = items.map((item) => {
              // Get image from various possible locations in API response
              const rawImage =
                item.product?.thumb_image ||
                item.product?.image ||
                item.image ||
                item.product?.images?.[0] ||
                null;

              return {
                id: item.product_id || item.id,
                cartItemId: item.id,
                variantId: item.variant_id || item.pack_size_id,
                name: item.product?.name || item.name,
                nameEn:
                  item.product?.name_en || item.product?.nameEn || item.name,
                category: item.product?.category?.name || item.category,
                categoryId: item.product?.category_id || item.category_id,
                price: parseFloat(item.price || item.product?.price || 0),
                quantity: parseInt(item.quantity || 1),
                image: getImageUrl(rawImage),
                size: item.pack_size?.size || item.size || item.variant?.size,
              };
            });

            setCartItems(formattedItems);
          }
          return {
            success: true,
            message: response.message || "Cart updated successfully",
          };
        } else {
          // Check if route is not found (404)
          if (response.routeNotFound) {
            // Fallback to local state update since API route doesn't exist
            setCartItems((prev) =>
              prev.map((item) =>
                item.id === productId || item.cartItemId === productId
                  ? { ...item, quantity }
                  : item
              )
            );
            return {
              success: true,
              message: "Cart updated successfully (local update)",
              routeNotFound: true,
            };
          }
          setError(response.message || "Failed to update cart");
          return {
            success: false,
            message: response.message || "Failed to update cart",
          };
        }
      } else {
        // Guest user - use localStorage
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
        return { success: true, message: "Cart updated successfully" };
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      setError(err.message || "Failed to update cart");
      return {
        success: false,
        message: err.message || "Failed to update cart",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear entire cart
   * DELETE /cart
   */
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        const response = await apiService.clearCart();

        if (response.success) {
          setCartItems([]);
          return {
            success: true,
            message: response.message || "Cart cleared successfully",
          };
        } else {
          setError(response.message || "Failed to clear cart");
          return {
            success: false,
            message: response.message || "Failed to clear cart",
          };
        }
      } else {
        // Guest user - use localStorage
        setCartItems([]);
        localStorage.removeItem("cart");
        return { success: true, message: "Cart cleared successfully" };
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError(err.message || "Failed to clear cart");
      return { success: false, message: err.message || "Failed to clear cart" };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply coupon to cart
   * POST /cart/apply-coupon
   * @param {string} code - Coupon code
   */
  const applyCoupon = async (code) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        const response = await apiService.applyCoupon(code);

        if (response.success) {
          // Small delay to ensure backend has processed the request
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Refresh cart to get updated prices
          const cartResponse = await apiService.getCart();
          if (cartResponse.success && cartResponse.data) {
            const items = Array.isArray(cartResponse.data)
              ? cartResponse.data
              : cartResponse.data.items || [];

            const formattedItems = items.map((item) => {
              // Get image from various possible locations in API response
              const rawImage =
                item.product?.thumb_image ||
                item.product?.image ||
                item.image ||
                item.product?.images?.[0] ||
                null;

              return {
                id: item.product_id || item.id,
                cartItemId: item.id,
                variantId: item.variant_id || item.pack_size_id,
                name: item.product?.name || item.name,
                nameEn:
                  item.product?.name_en || item.product?.nameEn || item.name,
                category: item.product?.category?.name || item.category,
                categoryId: item.product?.category_id || item.category_id,
                price: parseFloat(item.price || item.product?.price || 0),
                quantity: parseInt(item.quantity || 1),
                image: getImageUrl(rawImage),
                size: item.pack_size?.size || item.size || item.variant?.size,
              };
            });

            setCartItems(formattedItems);
          }
          return {
            success: true,
            message: response.message || "Coupon applied successfully",
            data: response.data,
          };
        } else {
          setError(response.message || "Failed to apply coupon");
          return {
            success: false,
            message: response.message || "Failed to apply coupon",
          };
        }
      } else {
        // Guest users can't apply coupons (requires authentication)
        return { success: false, message: "Please login to apply coupon" };
      }
    } catch (err) {
      console.error("Error applying coupon:", err);
      setError(err.message || "Failed to apply coupon");
      return {
        success: false,
        message: err.message || "Failed to apply coupon",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manual refresh cart from API
   * Useful for refreshing cart when navigating to cart page
   */
  const refreshCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getCart();

        if (response.success && response.data) {
          const items = Array.isArray(response.data)
            ? response.data
            : response.data.items || [];

          const formattedItems = formatAndFilterCartItems(items);

          setCartItems(formattedItems);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Error refreshing cart:", err);
        setError("Failed to refresh cart");
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate cart totals
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
