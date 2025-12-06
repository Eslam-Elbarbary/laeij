import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import apiService from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import CreateBookingListModal from "../components/CreateBookingListModal";
import {
  getTranslatedName,
  getTranslatedDescription,
  getTranslatedCategory,
} from "../utils/translations";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDark } = useTheme();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackSize, setSelectedPackSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProductById(id);

        if (response.success && response.data) {
          const productData = response.data;

          // نضمن إن pack_sizes دايمًا array
          if (
            !productData.pack_sizes ||
            !Array.isArray(productData.pack_sizes)
          ) {
            productData.pack_sizes = [];
          }

          // === الحل السحري: لو مفيش pack_sizes → نعمل واحد وهمي من الـ size العادي ===
          if (productData.pack_sizes.length === 0) {
            const fallbackSize = productData.size || "30 جم";
            const fallbackId =
              productData.default_pack_size_id || productData.id || 1;

            productData.pack_sizes = [
              {
                id: fallbackId,
                size: fallbackSize,
                price: productData.price,
              },
            ];
          }

          setProduct(productData);
          setSelectedPackSize(productData.pack_sizes[0]); // نختار الأول (سواء حقيقي أو وهمي)
        }
      } catch (err) {
        console.error(err);
        setError(t("productDetail.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, t]);

  // Format price helper
  const formatPrice = (price) => {
    if (typeof price === "number") {
      return price.toLocaleString(i18n.language === "ar" ? "ar-AE" : "en-US");
    }
    return price;
  };

  const currentPrice = selectedPackSize?.price || product?.price || 0;

  const skeletonBg = isDark
    ? "bg-luxury-brown-darker/60"
    : "bg-luxury-cream/60";
  const detailPanelClasses = isDark
    ? "bg-luxury-brown-darker border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";
  const unselectedSizeClasses = isDark
    ? "border border-luxury-gold-dark/40 text-luxury-brown-light hover:border-luxury-gold/70 hover:bg-luxury-brown-darker/50"
    : "border border-luxury-gold-light/60 text-luxury-brown-text hover:border-luxury-gold/60 hover:bg-luxury-gold/10";

  if (loading) {
    return (
      <PageLayout>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div
              className={`${skeletonBg} rounded-2xl p-8 lg:p-12 min-h-[400px] md:min-h-[500px] lg:min-h-[600px] animate-pulse`}
            ></div>
            <div className="space-y-6">
              <div
                className={`h-8 ${skeletonBg} rounded w-3/4 animate-pulse`}
              ></div>
              <div
                className={`h-6 ${skeletonBg} rounded w-1/2 animate-pulse`}
              ></div>
              <div className={`h-32 ${skeletonBg} rounded animate-pulse`}></div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">
              {error || t("productDetail.notFound")}
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
            >
              {t("productDetail.backToProducts")}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images - Full Width */}
          <div className="relative">
            <div
              className={`${detailPanelClasses} rounded-2xl min-h-[400px] md:min-h-[500px] lg:min-h-[600px] overflow-hidden relative`}
            >
              <img
                src={
                  product.thumb_image ||
                  product.image ||
                  product.images?.[0] ||
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect fill='%2392400e' width='600' height='600'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='36' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EProduct%3C/text%3E%3C/svg%3E"
                }
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={(e) => {
                  // Use data URI as fallback to avoid network requests
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect fill='%2392400e' width='600' height='600'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='36' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EProduct%3C/text%3E%3C/svg%3E";
                  e.target.onerror = null; // Prevent infinite loop
                }}
              />
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                className={`backdrop-blur-sm p-3 rounded-xl transition-all ${
                  isDark
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-black/10 text-luxury-brown-text hover:bg-black/20"
                }`}
              >
                ❤️
              </button>
              <button
                className={`backdrop-blur-sm p-3 rounded-xl transition-all ${
                  isDark
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-black/10 text-luxury-brown-text hover:bg-black/20"
                }`}
              >
                📤
              </button>
            </div>
          </div>

          {/* Product Info - Full Width */}
          <div className="space-y-6 lg:space-y-8 text-primary">
            {/* Rating */}
            {product.rating && (
              <div className="flex ltr items-center gap-3">
                <div className="flex text-amber-400 text-xl">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.floor(product.rating)
                          ? "text-amber-400"
                          : i < product.rating
                          ? "text-amber-300"
                          : "text-muted"
                      }
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-primary text-lg">
                  {product.rating.toFixed(1)}
                </span>
                {product.reviews && (
                  <span className="text-muted text-sm">
                    ({product.reviews} {t("productDetail.review")})
                  </span>
                )}
              </div>
            )}

            <div>
              <p className="text-amber-500 text-sm mb-2 font-medium">
                {getTranslatedCategory(product.category)}
              </p>
              <h1 className="text-primary text-4xl lg:text-5xl font-bold mb-4">
                {getTranslatedName(product)}
              </h1>
              <div className="flex items-center ltr gap-4">
                <p className="text-amber-500 text-3xl lg:text-4xl font-bold">
                  {formatPrice(currentPrice)} {t("productDetail.currency")}
                </p>
                {product.originalPrice &&
                  product.originalPrice > currentPrice && (
                    <p className="text-muted text-xl line-through">
                      {formatPrice(product.originalPrice)}{" "}
                      {t("productDetail.currency")}
                    </p>
                  )}
                {product.discount > 0 && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    {t("productDetail.discount", {
                      discount: product.discount,
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selection - مضمون 100% يظهر حجم */}
            <div>
              <label className="block text-primary text-lg font-semibold mb-4">
                {t("productDetail.size")}:
              </label>
              <div className="flex ltr gap-3 flex-wrap">
                {product?.pack_sizes?.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPackSize(pack)}
                    className={`px-6 py-3 rounded-xl transition-all font-medium border-2 ${
                      selectedPackSize?.id === pack.id
                        ? "bg-luxury-gold/15 border-luxury-gold text-luxury-gold shadow-lg"
                        : unselectedSizeClasses
                    }`}
                  >
                    {pack.size}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-sm text-muted">
                {t("productDetail.selectedSize")}:{" "}
                <strong>{selectedPackSize?.size || "جاري التحميل..."}</strong>
              </p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-primary">
                {t("productDetail.quantity")}:
              </label>
              <div className="flex ltr items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-colors border focus:outline-none focus:ring-4 focus:ring-luxury-gold/40 ${
                    isDark
                      ? "bg-luxury-brown-darker text-luxury-brown-light border-luxury-gold-dark/50 hover:bg-luxury-brown-darker/80"
                      : "bg-luxury-cream text-luxury-brown-text border-luxury-gold-light/50 hover:bg-luxury-cream/90"
                  }`}
                >
                  −
                </button>
                <span className="text-2xl font-semibold w-12 text-center text-primary">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-colors border focus:outline-none focus:ring-4 focus:ring-luxury-gold/40 ${
                    isDark
                      ? "bg-luxury-brown-darker text-luxury-brown-light border-luxury-gold-dark/50 hover:bg-luxury-brown-darker/80"
                      : "bg-luxury-cream text-luxury-brown-text border-luxury-gold-light/50 hover:bg-luxury-cream/90"
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-xl mb-3 text-primary">
                {t("productDetail.description")}
              </h3>
              <p className="leading-relaxed text-secondary">
                {getTranslatedDescription(product)}
                {}
              </p>
            </div>

            {/* Key Features */}
            <div>
              <button
                className={`w-full ltr flex items-center justify-between py-4 border rounded-xl px-4 transition-colors ${
                  isDark
                    ? "border-luxury-gold-dark/30 hover:bg-luxury-brown-darker/40 text-luxury-brown-light"
                    : "border-luxury-gold-light/40 hover:bg-luxury-cream/70 text-luxury-brown-text"
                }`}
              >
                <span className="font-medium">
                  {t("productDetail.keyFeatures")}
                </span>
                <span>▼</span>
              </button>
            </div>

            {/* Wishlist and Add to Cart Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast(t("productDetail.pleaseLoginWishlist"), "error");
                    navigate("/login");
                    return;
                  }

                  if (product) {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                      showToast(
                        t("productDetail.removedFromWishlist", {
                          name: getTranslatedName(product),
                        }),
                        "info"
                      );
                    } else {
                      addToWishlist(product);
                      showToast(
                        t("productDetail.addedToWishlist", {
                          name: getTranslatedName(product),
                        }),
                        "success"
                      );
                    }
                  }
                }}
                className={`flex-1 min-w-[200px] max-w-[250px] py-5 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 flex items-center justify-center gap-3 ${
                  product && isInWishlist(product.id)
                    ? isDark
                      ? "bg-red-500/90 text-white hover:bg-red-600/90"
                      : "bg-red-500 text-white hover:bg-red-600"
                    : isDark
                    ? "bg-luxury-brown-darker/90 text-luxury-brown-light hover:bg-luxury-brown-text hover:text-red-400 border-2 border-luxury-gold-dark/40"
                    : "bg-luxury-cream/80 text-luxury-brown-text hover:bg-luxury-cream-dark hover:text-red-500 border-2 border-luxury-gold-light/50"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    product && isInWishlist(product.id)
                      ? "fill-current"
                      : "fill-none"
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
                <span>
                  {product && isInWishlist(product.id)
                    ? t("productDetail.removeFromWishlist")
                    : t("productDetail.addToWishlist")}
                </span>
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast(t("productDetail.pleaseLoginCart"), "error");
                    navigate("/login");
                    return;
                  }

                  if (!selectedPackSize) {
                    showToast(t("productDetail.selectSize"), "error");
                    return;
                  }

                  addToCart(product, quantity, selectedPackSize.id); // هنا المفتاح: pack_size.id

                  showToast(
                    t("productDetail.addedToCart", {
                      name: getTranslatedName(product),
                      size: selectedPackSize.size,
                    }),
                    "success"
                  );

                  setTimeout(() => navigate("/cart"), 600);
                }}
                className="flex-[2] min-w-[280px] bg-gradient-to-r from-amber-600 to-amber-800 text-white py-5 rounded-xl font-semibold text-xl hover:from-amber-700 hover:to-amber-900 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-luxury-gold/60"
              >
                {t("productDetail.addToCartWithPrice", {
                  price: `${formatPrice(currentPrice * quantity)} ${t(
                    "productDetail.currency"
                  )}`,
                })}
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast(t("productDetail.pleaseLoginCart"), "error");
                    navigate("/login");
                    return;
                  }
                  setShowBookingModal(true);
                }}
                className={`flex-1 min-w-[200px] max-w-[250px] py-5 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 flex items-center justify-center gap-3 ${
                  isDark
                    ? "bg-luxury-brown-darker/90 text-luxury-brown-light hover:bg-luxury-brown-darker border-2 border-luxury-gold-dark/40"
                    : "bg-luxury-cream/80 text-luxury-brown-text hover:bg-luxury-cream border-2 border-luxury-gold-light/50"
                }`}
              >
                <svg
                  className="w-6 h-6"
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
                  {t("productDetail.addToBookingList") || "Add to Booking List"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showBookingModal && product && (
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
          initialQuantity={quantity}
        />
      )}
    </PageLayout>
  );
};

export default ProductDetail;
