import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import PageLayout from "../components/PageLayout";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const hasShownToast = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast(t("wishlist.pleaseLogin"), "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageLayout>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-16 md:pb-20 lg:pb-24">
        <div className="w-full max-w-7xl mx-auto py-8 md:py-12 lg:py-16">
          {/* Header */}
          <div className={`flex ${i18n.language === "ar" ? "flex-row-reverse" : ""} items-center justify-between mb-8 md:mb-12`}>
            <div className={i18n.language === "ar" ? "text-right" : "text-left"}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-2 md:mb-3">
                {t("wishlist.title")}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-muted">
                {wishlist.length > 0
                  ? `${wishlist.length} ${t("wishlist.productsCount")}`
                  : t("wishlist.empty")}
              </p>
            </div>
            {wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 ${
                  isDark
                    ? "bg-luxury-brown-darker/90 text-luxury-brown-light hover:bg-luxury-brown-text hover:text-red-500 border-2 border-luxury-gold-dark/40"
                    : "bg-luxury-cream/80 text-luxury-brown-text hover:bg-luxury-cream-dark hover:text-red-600 border-2 border-luxury-gold-light/50"
                }`}
              >
                <span className="flex items-center gap-2">
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {t("wishlist.clearAll")}
                </span>
              </button>
            )}
          </div>

          {/* Empty State */}
          {wishlist.length === 0 ? (
            <div className="text-center py-16 md:py-24">
              <div className="mb-8">
                <svg
                  className={`w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 ${
                    isDark
                      ? "text-luxury-brown-light/30"
                      : "text-luxury-brown-text/20"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h2
                className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 ${
                  isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
                }`}
              >
                {t("wishlist.empty")}
              </h2>
              <p
                className={`text-lg md:text-xl mb-8 ${
                  isDark
                    ? "text-luxury-brown-light/70"
                    : "text-luxury-brown-text/70"
                }`}
              >
                {t("wishlist.emptyAction")}
              </p>
              <Link
                to="/products"
                className={`inline-block px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold text-lg md:text-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 ${
                  isDark
                    ? "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-luxury-gold/50"
                    : "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-luxury-gold/30"
                }`}
              >
                {t("wishlist.browseProducts")}
              </Link>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 md:gap-8">
                {wishlist.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className={`absolute ${i18n.language === "ar" ? "top-3 left-3" : "top-3 right-3"} z-30 p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-110 transform focus:outline-none focus:ring-4 focus:ring-red-500/60 ${
                        isDark
                          ? "bg-red-500/90 text-white hover:bg-red-600/90"
                          : "bg-red-500/90 text-white hover:bg-red-600/90"
                      }`}
                      aria-label={t("wishlist.remove")}
                    >
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className={`mt-12 md:mt-16 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center`}>
                <Link
                  to="/products"
                  className={`w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold text-lg md:text-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 text-center ${
                    isDark
                      ? "bg-luxury-brown-darker/90 text-luxury-brown-light hover:bg-luxury-brown-text hover:text-luxury-gold-light border-2 border-luxury-gold-dark/40"
                      : "bg-luxury-cream/80 text-luxury-brown-text hover:bg-luxury-cream-dark hover:text-luxury-gold border-2 border-luxury-gold-light/50"
                  }`}
                >
                  {t("wishlist.continueShopping")}
                </Link>
                <button
                  onClick={() => {
                    wishlist.forEach((product) => {
                      addToCart(product, 1);
                    });
                    navigate("/cart");
                  }}
                  className={`w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold text-lg md:text-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 ${
                    isDark
                      ? "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-luxury-gold/50"
                      : "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-luxury-gold/30"
                  }`}
                >
                  {t("wishlist.addAllToCart")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Wishlist;
