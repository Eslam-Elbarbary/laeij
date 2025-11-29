import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import {
  getTranslatedName,
  getTranslatedCategory,
} from "../utils/translations";

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState("");

  const handleUpdateQuantity = (id, change) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      updateQuantity(id, Math.max(1, item.quantity + change));
    }
  };

  const subtotal = cartTotal;
  const delivery = 50;
  const discountAmount = discountApplied ? Math.round(subtotal * 0.1) : 0; // 10% discount
  const total = subtotal + delivery - discountAmount;

  const primaryPanelClasses = isDark
    ? "bg-luxury-brown-darker/90 border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/50 text-luxury-brown-text";

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountError(t("cart.discountRequired"));
      showToast(t("cart.discountRequired"), "error");
      return;
    }
    // Simulate discount code validation
    const validCodes = ["DISCOUNT10", "SAVE20", "WELCOME15"];
    if (validCodes.includes(discountCode.toUpperCase())) {
      setDiscountApplied(true);
      setDiscountError("");
      showToast(t("cart.discountApplied"), "success");
    } else {
      setDiscountError(t("cart.discountError"));
      setDiscountApplied(false);
      showToast(t("cart.discountError"), "error");
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountApplied(false);
    setDiscountCode("");
    setDiscountError("");
    showToast(t("cart.removeDiscount"), "info");
  };

  const handleRemoveItem = (itemId, itemName) => {
    removeFromCart(itemId);
    showToast(t("cart.removedFromCart", { name: itemName }), "success");
  };

  return (
    <PageLayout>
      <div className="w-full ltr max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
          <div className="text-primary">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-5">
              {t("cart.title")}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted">
              {cartItems.length === 0
                ? t("cart.empty")
                : t("cart.itemsCount", { count: cartItems.length })}
            </p>
          </div>

          {cartItems.length === 0 && (
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2
                className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 ${
                  isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
                }`}
              >
                {t("cart.empty")}
              </h2>
              <p
                className={`text-lg md:text-xl mb-8 ${
                  isDark
                    ? "text-luxury-brown-light/70"
                    : "text-luxury-brown-text/70"
                }`}
              >
                {t("cart.emptyDesc")}
              </p>
              <Link
                to="/products"
                className={`inline-block px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold text-lg md:text-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 ${
                  isDark
                    ? "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-luxury-gold/50"
                    : "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-luxury-gold/30"
                }`}
              >
                {t("cart.continueShopping")}
              </Link>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="grid lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
              {/* Cart Items - Full Width on Mobile */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${primaryPanelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 flex gap-6 md:gap-8 items-start transition-colors shadow-lg hover:shadow-xl card-hover ${
                      isDark
                        ? "hover:bg-luxury-brown-darker/70 hover:border-luxury-gold/60"
                        : "hover:bg-luxury-cream hover:border-luxury-gold/50"
                    } ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Product Image */}
                    <div
                      className={`relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border ${
                        isDark
                          ? "bg-black border-luxury-gold-dark/40"
                          : "bg-luxury-cream border-luxury-gold-light/50"
                      } ${i18n.language === "ar" ? "order-3" : "order-1"}`}
                    >
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format"
                        }
                        alt={getTranslatedName(item)}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format";
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className={`flex-1 ${i18n.language === "ar" ? "text-right order-2" : "text-left order-2"}`}>
                      {/* Quantity Controls */}
                      <div className={`flex items-center gap-2 mb-4 md:mb-6 ${i18n.language === "ar" ? "justify-end flex-row-reverse" : "justify-start"}`}>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-4 focus:ring-luxury-gold/40 transition-colors ${
                            isDark
                              ? "bg-luxury-brown-dark text-luxury-brown-light hover:bg-luxury-brown-dark/80 border border-luxury-gold-dark/40"
                              : "bg-luxury-cream text-luxury-brown-text border border-luxury-gold-light/50 hover:bg-luxury-cream/90"
                          }`}
                        >
                          −
                        </button>
                        <span className="text-primary font-bold text-lg md:text-xl min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-4 focus:ring-luxury-gold/40 transition-colors ${
                            isDark
                              ? "bg-luxury-brown-dark text-luxury-brown-light hover:bg-luxury-brown-dark/80 border border-luxury-gold-dark/40"
                              : "bg-luxury-cream text-luxury-brown-text border border-luxury-gold-light/50 hover:bg-luxury-cream/90"
                          }`}
                        >
                          +
                        </button>
                      </div>

                      {/* Product Title */}
                      <h3 className="text-primary font-bold text-lg md:text-xl lg:text-2xl mb-3">
                        {getTranslatedName(item)}
                      </h3>
                      
                      {/* Product Category */}
                      <p className="text-muted text-sm md:text-base mb-4 md:mb-5">
                        {getTranslatedCategory(item.category, item.categoryId)}
                      </p>
                      
                      {/* Price */}
                      <p className="text-amber-500 font-bold text-xl md:text-2xl lg:text-3xl mb-5">
                        {item.price * item.quantity} {t("productCard.currency")}
                      </p>

                      {/* Add Note Button */}
                      <button className={`text-amber-500 text-base md:text-lg flex items-center gap-2 hover:text-amber-400 transition-colors focus:outline-none focus:ring-4 focus:ring-amber-700/50 rounded-lg px-3 py-2 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}>
                        <span>+</span>
                        <span>{t("cart.addNote")}</span>
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      className={`text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-500/10 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 flex items-center justify-center flex-shrink-0 ${i18n.language === "ar" ? "order-1" : "order-3"}`}
                      aria-label="Remove item"
                    >
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6"
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
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Summary - Sticky on Desktop */}
              <div className="lg:col-span-1 space-y-6 md:space-y-8 lg:sticky lg:top-24 lg:h-fit">
                {/* Delivery Address */}
                <div
                  className={`${primaryPanelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="text-primary font-semibold text-lg md:text-xl">
                      {t("cart.deliveryAddress")}
                    </h3>
                    <button
                      className="text-amber-500 hover:text-amber-400 transition-colors p-2 hover:bg-amber-500/10 rounded-lg focus:outline-none focus:ring-4 focus:ring-amber-700/50 flex items-center justify-center"
                      aria-label={t("cart.changeAddress")}
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-secondary">
                    <div className="text-right flex-1">
                      <p className="text-primary font-medium md:text-lg">
                        {t("cart.home")}
                      </p>
                      <p className="text-sm md:text-base text-secondary">
                        {t("footer.addressValue")}
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 md:w-7 md:h-7 text-amber-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Discount Code - Enhanced */}
                <div
                  className={`${primaryPanelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 ${
                    isDark
                      ? "hover:border-luxury-gold/60"
                      : "hover:border-luxury-gold/50"
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-primary font-semibold text-base md:text-lg">
                      {t("cart.discountCode")}
                    </h3>
                  </div>
                  {discountApplied ? (
                    <div
                      className={`rounded-xl p-4 md:p-5 flex items-center justify-between ${
                        isDark
                          ? "bg-green-900/30 border border-green-700/60"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-green-700/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 md:w-6 md:h-6 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-green-400 font-semibold text-sm md:text-base mb-1">
                            {t("cart.discountApplied")}
                          </p>
                          <p className="text-muted text-xs md:text-sm">
                            {t("cart.discountAmount", {
                              amount: discountAmount,
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveDiscount}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-3 md:gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => {
                              setDiscountCode(e.target.value);
                              setDiscountError("");
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleApplyDiscount();
                              }
                            }}
                            placeholder={t("cart.enterDiscountCode")}
                            className={`w-full rounded-xl px-4 md:px-6 py-3 md:py-4 pl-12 pr-4 md:pr-6 focus:outline-none focus:ring-4 transition-all duration-300 shadow-inner ${
                              discountError
                                ? "border border-red-500 focus:border-red-500 focus:ring-red-400/40"
                                : isDark
                                ? "bg-luxury-brown-darker/70 text-luxury-brown-light placeholder-luxury-brown-light/60 border border-luxury-gold-dark/40 focus:border-luxury-gold focus:ring-luxury-gold/40"
                                : "bg-luxury-cream text-luxury-brown-text placeholder-luxury-brown-light/80 border border-luxury-gold-light/50 hover:border-luxury-gold/60 focus:border-luxury-gold focus:ring-luxury-gold/30"
                            }`}
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <svg
                              className="w-5 h-5 text-muted"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                          </div>
                        </div>
                        <button
                          onClick={handleApplyDiscount}
                          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:from-amber-700 hover:to-amber-800 whitespace-nowrap font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-900/50 hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-amber-700/50 flex items-center justify-center gap-2.5 md:gap-3"
                        >
                          <span>{t("cart.apply")}</span>
                          <svg
                            className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      </div>
                      {discountError && (
                        <p className="text-red-500 text-xs md:text-sm mt-3 flex items-center gap-2 animate-fade-in">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{discountError}</span>
                        </p>
                      )}
                      <p className="text-muted text-xs md:text-sm mt-4 md:mt-5 flex items-start gap-2.5 md:gap-3">
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 text-amber-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="leading-relaxed">
                          {t("cart.discountHint")}
                        </span>
                      </p>
                    </>
                  )}
                </div>

                {/* Delivery Option */}
                <div
                  className={`${primaryPanelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-lg`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <input
                      type="checkbox"
                      className="w-5 h-5 md:w-6 md:h-6 accent-amber-600 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-700/50 rounded"
                    />
                    <span className="text-primary font-medium md:text-lg">
                      {t("cart.sameDayDelivery")}
                    </span>
                  </div>
                  <span className="text-amber-500 font-semibold md:text-lg">
                    + 60 {t("productCard.currency")}
                  </span>
                </div>

                {/* Order Summary */}
                <div
                  className={`${primaryPanelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 space-y-4 md:space-y-5 shadow-lg`}
                >
                  <h3 className="text-primary font-semibold text-lg md:text-xl mb-6">
                    {t("cart.orderSummary")}
                  </h3>
                  <div className="flex justify-between text-secondary text-base md:text-lg">
                    <span>{t("cart.subtotal")}</span>
                    <span>
                      {subtotal} {t("productCard.currency")}
                    </span>
                  </div>
                  <div className="flex justify-between text-secondary text-base md:text-lg">
                    <span>{t("cart.shipping")}</span>
                    <span>
                      {delivery} {t("productCard.currency")}
                    </span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-green-400 text-base md:text-lg font-semibold">
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {t("cart.discount")}
                      </span>
                      <span>
                        -{discountAmount} {t("productCard.currency")}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-card pt-4 md:pt-5 flex justify-between text-primary font-bold text-xl md:text-2xl">
                    <span>{t("cart.total")}</span>
                    <span className="text-amber-500">
                      {total} {t("productCard.currency")}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      showToast(t("cart.loginRequiredCheckout"), "error");
                      navigate("/login");
                    } else {
                      navigate("/checkout");
                    }
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white py-4 md:py-5 rounded-xl font-semibold text-lg md:text-xl hover:from-amber-700 hover:to-amber-900 transition-all shadow-2xl hover:shadow-amber-900/50 hover:scale-[1.02] transform duration-300 focus:outline-none focus:ring-4 focus:ring-amber-700/50"
                >
                  {t("cart.checkout")}
                </button>

                <Link
                  to="/products"
                  className="block w-full text-center text-amber-500 py-3 md:py-4 hover:text-amber-400 transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-amber-700/50 rounded-xl"
                >
                  {t("cart.continueShoppingLink")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Cart;
