import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const inWishlist = isInWishlist(product.id);
  const cartItem = cartItems.find((item) => item.id === product.id);
  const inCart = !!cartItem;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast("يرجى تسجيل الدخول لإضافة المنتج إلى السلة", "error");
      navigate("/login");
      return;
    }

    addToCart(product, 1);
    if (cartItem) {
      showToast(`تم تحديث الكمية في السلة`, "success");
    } else {
      showToast(`تم إضافة ${product.name} إلى السلة`, "success");
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast("يرجى تسجيل الدخول لإضافة المنتج إلى قائمة الأمنيات", "error");
      navigate("/login");
      return;
    }

    if (inWishlist) {
      removeFromWishlist(product.id);
      showToast(`تم إزالة ${product.name} من قائمة الأمنيات`, "info");
    } else {
      addToWishlist(product);
      showToast(`تم إضافة ${product.name} إلى قائمة الأمنيات`, "success");
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
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            <div className="w-full h-full bg-gradient-to-br from-luxury-gold to-luxury-gold-dark"></div>
          </div>
          <img
            src={
              product.image ||
              "https://via.placeholder.com/400x400/92400e/ffffff?text=Product"
            }
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x400/92400e/ffffff?text=Product";
            }}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 bg-white/40 dark:bg-black/40">
            <span className="text-white text-sm font-semibold bg-luxury-gold px-4 py-2 rounded-lg">
              عرض سريع
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
            {product.category}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-base sm:text-lg md:text-xl line-clamp-1 text-primary group-hover:text-luxury-gold-light transition-colors duration-300">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed mt-3 text-muted">
            {product.description}
          </p>
        </div>

        {/* الحجم ثابت فوق السعر */}
        <p className="text-luxury-gold-light text-xs sm:text-sm font-medium mt-3">
          الحجم: {product.size}
        </p>

        {/* السعر + زرار إضافة للعربة */}
        <div className="mt-3 pt-4 border-t border-card group-hover:border-luxury-gold/40 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-luxury-gold font-bold text-lg sm:text-xl md:text-2xl group-hover:text-luxury-gold-light transition-colors duration-300">
              {product.price} درهم
            </span>
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
                في السلة ({cartItem.quantity})
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
                <span>في السلة</span>
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
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
