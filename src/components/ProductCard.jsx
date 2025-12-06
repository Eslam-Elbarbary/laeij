import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useOffers } from "../contexts/OffersContext";
import { useTranslation } from "react-i18next";
import apiService from "../services/api";
import CreateBookingListModal from "./CreateBookingListModal";
import {
  getTranslatedName,
  getTranslatedDescription,
  getTranslatedCategory,
  getTranslatedSize,
} from "../utils/translations";

const ProductCard = ({ product }) => {
  // Debug: Log product image fields to help troubleshoot
  if (import.meta.env.DEV) {
    console.log("ProductCard - Product image fields:", {
      id: product.id,
      thumb_image: product.thumb_image,
      image: product.image,
      images: product.images,
    });
  }

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  // Get offer for this product
  const { getProductOffer, getDiscountedPrice, formatDiscount, hasOffer } =
    useOffers();
  const offer = getProductOffer(product.id);
  const hasProductOffer = hasOffer(product.id);
  const discountedPrice = offer ? getDiscountedPrice(product, offer) : null;
  const originalPrice = parseFloat(product.price) || 0;
  const inWishlist = isInWishlist(product.id);
  const cartItem = cartItems.find((item) => item.id === product.id);
  const inCart = !!cartItem;
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Get translated product data (computed on each render to reflect language changes)
  const productName = getTranslatedName(product);
  const productDescription = getTranslatedDescription(product);
  const productCategory = getTranslatedCategory(
    product.category || product.categoryName,
    product.categoryId
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast(t("productCard.loginRequired"), "error");
      navigate("/login");
      return;
    }

    // Try to find pack_size_id from product
    let packSizeId = null;
    let productToAdd = product;

    // First, check if product has pack_sizes in the card data
    if (
      product.pack_sizes &&
      Array.isArray(product.pack_sizes) &&
      product.pack_sizes.length > 0
    ) {
      packSizeId = product.pack_sizes[0].id;
    } else if (product.variant_id) {
      packSizeId = product.variant_id;
    } else if (product.variantId) {
      packSizeId = product.variantId;
    } else if (product.pack_size_id) {
      packSizeId = product.pack_size_id;
    }

    // If no pack_size_id found, fetch full product details
    if (!packSizeId) {
      try {
        const productResponse = await apiService.getProductById(product.id);
        if (productResponse.success && productResponse.data) {
          productToAdd = productResponse.data;

          // Try to get pack_size_id from full product data
          if (
            productToAdd.pack_sizes &&
            Array.isArray(productToAdd.pack_sizes) &&
            productToAdd.pack_sizes.length > 0
          ) {
            packSizeId = productToAdd.pack_sizes[0].id;
          } else if (productToAdd.variant_id) {
            packSizeId = productToAdd.variant_id;
          } else if (productToAdd.variantId) {
            packSizeId = productToAdd.variantId;
          } else if (productToAdd.pack_size_id) {
            packSizeId = productToAdd.pack_size_id;
          }
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    }

    // If still no pack_size_id found, navigate to product detail page
    if (!packSizeId) {
      showToast(
        t("productCard.selectSizeFirst") ||
          "Please select a size on the product page",
        "info"
      );
      navigate(`/product/${product.id}`);
      return;
    }

    // Call addToCart with the packSizeId
    const result = await addToCart(productToAdd, 1, packSizeId);

    if (result.success) {
      if (cartItem) {
        showToast(t("productCard.updatedInCart"), "success");
      } else {
        showToast(
          t("productCard.addedToCart", { name: productName }),
          "success"
        );
      }
    } else {
      // Show error message
      showToast(
        result.message ||
          t("productCard.errorAddingToCart") ||
          "Failed to add to cart",
        "error"
      );
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast(t("productCard.loginRequiredWishlist"), "error");
      navigate("/login");
      return;
    }

    if (inWishlist) {
      removeFromWishlist(product.id);
      showToast(
        t("productCard.removedFromWishlist", { name: productName }),
        "info"
      );
    } else {
      addToWishlist(product);
      showToast(
        t("productCard.addedToWishlist", { name: productName }),
        "success"
      );
    }
  };

  return (
    <div
      className="
        w-full rounded-2xl overflow-hidden border border-card bg-card shadow-xl backdrop-blur-sm group
        transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] transform card-hover card-shine
        hover:border-luxury-gold/70 dark:hover:border-luxury-gold-light/70
        flex flex-col
      "
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[240px] overflow-hidden bg-card-muted dark:bg-black/40">
          {/* Offer Badge */}
          {hasProductOffer && offer && (
            <div className="absolute top-3 left-3 z-20">
              <div className="bg-gradient-to-br from-red-600 to-red-800 text-white px-3 py-1.5 rounded-lg shadow-2xl transform rotate-[-5deg] group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                <p className="text-sm md:text-base font-bold">
                  {formatDiscount(offer)}
                </p>
                <p className="text-[10px] md:text-xs opacity-90">
                  {offer.discount_type === "percentage"
                    ? t("offers.off") || "OFF"
                    : t("offers.discount") || "OFF"}
                </p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            <div className="w-full h-full bg-gradient-to-br from-luxury-gold to-luxury-gold-dark"></div>
          </div>
          <img
            src={
              product.thumb_image ||
              product.image ||
              product.images?.[0] ||
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%2392400e' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EProduct%3C/text%3E%3C/svg%3E"
            }
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // Use data URI as fallback to avoid network requests
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%2392400e' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EProduct%3C/text%3E%3C/svg%3E";
              e.target.onerror = null; // Prevent infinite loop
            }}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 bg-white/40 dark:bg-black/40">
            <span className="text-white text-sm font-semibold bg-luxury-gold px-4 py-2 rounded-lg">
              {t("productCard.quickView")}
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 left-3 z-30 p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-110 transform focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 ${
              inWishlist
                ? "bg-red-500/90 text-white hover:bg-red-600/90"
                : isDark
                ? "bg-luxury-brown-darker/80 text-luxury-brown-light hover:bg-luxury-brown-darker hover:text-red-500"
                : "bg-white/90 text-luxury-brown-text hover:bg-white hover:text-red-500"
            }`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                inWishlist ? "fill-current" : "fill-none"
              }`}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </Link>

      <div className="p-6 sm:p-7 md:p-8 flex-1 flex flex-col justify-between bg-card-muted">
        <div className="flex-1">
          <p className="text-luxury-gold text-xs sm:text-sm font-semibold mb-2">
            {productCategory}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-base sm:text-lg md:text-xl line-clamp-1 text-primary group-hover:text-luxury-gold-light transition-colors duration-300">
              {productName}
            </h3>
          </Link>
          <p
            className="text-xs sm:text-sm line-clamp-2 leading-relaxed mt-3 text-muted"
            dangerouslySetInnerHTML={{ __html: productDescription }}
          ></p>
        </div>

        {/* Size - Fixed above price */}
        <p className="text-luxury-gold-light text-xs sm:text-sm font-medium mt-3">
          {t("productCard.size")}: {getTranslatedSize(product.size)}
        </p>

        {/* السعر + زرار إضافة للعربة */}
        <div className="mt-3 pt-4 border-t border-card group-hover:border-luxury-gold/40 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {discountedPrice !== null && discountedPrice < originalPrice ? (
                <>
                  <span className="text-luxury-gold font-bold text-lg sm:text-xl md:text-2xl group-hover:text-luxury-gold-light transition-colors duration-300">
                    {discountedPrice.toFixed(2)} {t("productCard.currency")}
                  </span>
                  <span className="text-muted text-xs sm:text-sm line-through">
                    {originalPrice.toFixed(2)} {t("productCard.currency")}
                  </span>
                </>
              ) : (
                <span className="text-luxury-gold font-bold text-lg sm:text-xl md:text-2xl group-hover:text-luxury-gold-light transition-colors duration-300">
                  {product.price} {t("productCard.currency")}
                </span>
              )}
            </div>
            {inCart && (
              <span className="text-xs sm:text-sm text-green-500 font-semibold flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("productCard.inCart")} ({cartItem.quantity})
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] transform focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden flex items-center justify-center gap-2 ${
              inCart
                ? isDark
                  ? "bg-green-600/90 text-white hover:bg-green-600"
                  : "bg-green-600 text-white hover:bg-green-700"
                : isDark
                ? "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker hover:from-luxury-gold-light hover:via-luxury-gold hover:to-luxury-gold-light shadow-luxury-gold/50"
                : "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker hover:from-luxury-gold-light hover:via-luxury-gold hover:to-luxury-gold-light shadow-luxury-gold/30"
            }`}
            aria-label={inCart ? "Already in cart" : "Add to cart"}
          >
            {inCart ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t("productCard.inCart")}</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{t("productCard.addToCart")}</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                showToast(t("productCard.loginRequired"), "error");
                navigate("/login");
                return;
              }
              setShowBookingModal(true);
            }}
            className={`w-full mt-2 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] transform focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden flex items-center justify-center gap-2 ${
              isDark
                ? "bg-luxury-brown-darker/80 text-luxury-brown-light hover:bg-luxury-brown-darker border border-luxury-gold-dark/40"
                : "bg-luxury-cream/80 text-luxury-brown-text hover:bg-luxury-cream border border-luxury-gold-light/40"
            }`}
            aria-label="Add to booking list"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <span>
              {t("productCard.addToBookingList") || "Add to Booking List"}
            </span>
          </button>
        </div>
      </div>
      {showBookingModal && (
        <CreateBookingListModal
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            showToast(
              t("bookingLists.createSuccess") ||
                "Added to booking list successfully",
              "success"
            );
          }}
          productId={product.id}
          initialQuantity={1}
        />
      )}
    </div>
  );
};

export default ProductCard;
