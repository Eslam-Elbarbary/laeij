import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const hasShownToast = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const panelClasses = isDark
    ? "bg-luxury-brown-darker/90 border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/50 text-luxury-brown-text";
  const nestedPanelClasses = isDark
    ? "bg-luxury-brown-darker/75 border border-luxury-gold-dark/30 text-luxury-brown-light"
    : "bg-luxury-cream border border-luxury-gold-light/40 text-luxury-brown-text";
  const inputClasses = isDark
    ? "bg-luxury-brown-darker/80 text-luxury-brown-light placeholder-luxury-brown-light/60 border border-luxury-gold-dark/40 focus:border-luxury-gold"
    : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border border-luxury-gold-light/60 focus:border-luxury-gold";
  const inactiveStepLine = isDark
    ? "bg-luxury-brown-light/40"
    : "bg-luxury-brown-text/20";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast("يرجى تسجيل الدخول للمتابعة إلى الدفع", "error");
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate, showToast]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (isAuthenticated && cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems.length, navigate, isAuthenticated]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const orderItems = cartItems;
  const subtotal = cartTotal;
  const delivery = 50;
  const discount = 0;
  const total = subtotal + delivery - discount;

  const formatPrice = (price) => {
    return price.toLocaleString("ar-AE");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate card details if payment method is card
    if (paymentMethod === "card") {
      if (
        !cardDetails.number ||
        !cardDetails.name ||
        !cardDetails.expiry ||
        !cardDetails.cvv
      ) {
        showToast("يرجى إكمال بيانات البطاقة", "error");
        return;
      }
      if (cardDetails.number.replace(/\s/g, "").length < 16) {
        showToast("رقم البطاقة غير صحيح", "error");
        return;
      }
    }

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      showToast("تم تأكيد الطلب بنجاح! شكراً لك", "success");
      setTimeout(() => navigate("/orders"), 1000);
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <PageLayout>
      <div className="w-full ltr max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
        {/* Progress Indicator - Professional Design */}
        <div className="mb-10 md:mb-16">
          <div
            className={`${panelClasses} rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl backdrop-blur-xl border-2 ${
              isDark
                ? "border-luxury-gold-dark/30"
                : "border-luxury-gold-light/40"
            }`}
          >
            <div className="flex items-center justify-center gap-3 md:gap-6 lg:gap-8">
              {/* Step 1: Completed - السلة */}
              <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-[200px]">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-luxury-gold via-luxury-gold-light to-luxury-gold rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(229,193,88,0.4),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1)] ring-4 ring-luxury-gold/30 animate-pulse-slow">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-luxury-brown-darker"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-white dark:border-luxury-brown-darker shadow-lg animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs md:text-sm font-semibold mb-1 ${
                      isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                    }`}
                  >
                    الخطوة 1
                  </p>
                  <p className="text-sm md:text-base lg:text-lg font-bold text-primary">
                    السلة
                  </p>
                </div>
              </div>

              {/* Connector Line 1 */}
              <div className="flex-1 max-w-[120px] md:max-w-[150px] lg:max-w-[200px] relative">
                <div className="h-1 md:h-1.5 bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold rounded-full shadow-lg shadow-luxury-gold/50"></div>
                <div className="absolute inset-0 h-1 md:h-1.5 bg-luxury-gold/20 rounded-full animate-pulse"></div>
              </div>

              {/* Step 2: Active - الدفع */}
              <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-[200px]">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-luxury-gold via-luxury-gold-light to-luxury-gold rounded-full flex items-center justify-center shadow-[0_12px_35px_rgba(229,193,88,0.6),0_6px_15px_rgba(229,193,88,0.4),inset_0_2px_6px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.15)] ring-4 ring-luxury-gold/50 scale-110 transform transition-all duration-300 animate-pulse-gold">
                    <span className="text-luxury-brown-darker font-extrabold text-lg md:text-xl lg:text-2xl">
                      2
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-luxury-gold-light/50 to-transparent animate-ping opacity-20"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs md:text-sm font-semibold mb-1 ${
                      isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                    }`}
                  >
                    الخطوة 2
                  </p>
                  <p
                    className={`text-sm md:text-base lg:text-lg font-bold ${
                      isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                    }`}
                  >
                    الدفع
                  </p>
                </div>
              </div>

              {/* Connector Line 2 */}
              <div className="flex-1 max-w-[120px] md:max-w-[150px] lg:max-w-[200px] relative">
                <div
                  className={`h-1 md:h-1.5 rounded-full ${inactiveStepLine}`}
                ></div>
              </div>

              {/* Step 3: Pending - التأكيد */}
              <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-[200px]">
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center shadow-lg border-2 ${
                      isDark
                        ? "bg-luxury-brown-darker border-luxury-gold-dark/40"
                        : "bg-white border-luxury-gold-light/60"
                    }`}
                  >
                    <span
                      className={`font-extrabold text-lg md:text-xl lg:text-2xl ${
                        isDark
                          ? "text-luxury-brown-light"
                          : "text-luxury-brown-text"
                      }`}
                    >
                      3
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold mb-1 text-muted">
                    الخطوة 3
                  </p>
                  <p className="text-sm md:text-base lg:text-lg font-bold text-muted">
                    التأكيد
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center md:text-right mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 md:mb-4">
            إتمام الطلب
          </h1>
          <p className="text-muted text-lg md:text-xl">
            راجع طلبك وأكمل عملية الدفع
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Delivery Address */}
              <div
                className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur`}
              >
                <div className="flex items-center justify-between mb-6">
                  <Link
                    to="/addresses"
                    className="text-amber-500 hover:text-amber-400 text-sm md:text-base font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
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
                    <span>تغيير</span>
                  </Link>
                  <div className="flex items-center gap-3 md:gap-4">
                    <h2 className="text-primary font-bold text-xl md:text-2xl text-right">
                      عنوان التوصيل
                    </h2>
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
                </div>
                <div className={`${nestedPanelClasses} rounded-xl p-4 md:p-6`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-primary font-semibold text-base md:text-lg mb-1">
                        المنزل
                      </p>
                      <p className="text-secondary text-sm md:text-base mb-1">
                        أبو ظبي – حي النرجس
                      </p>
                      <p className="text-muted text-sm">
                        طريق الكورنيش الشمالي، بجانب رد سي مول
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div
                className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur`}
              >
                <div className="flex items-center gap-3 md:gap-4 mb-6">
                  <h2 className="text-primary font-bold text-xl md:text-2xl text-right flex-1">
                    طريقة الدفع
                  </h2>
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
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Wallet Payment */}
                  <div
                    onClick={() => setPaymentMethod("wallet")}
                    className={`rounded-xl p-5 md:p-6 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      paymentMethod === "wallet"
                        ? "border border-luxury-gold bg-luxury-gold/10 shadow-lg shadow-luxury-gold/20"
                        : `${nestedPanelClasses}`
                    }`}
                  >
                    <div className="flex items-center gap-4 md:gap-5">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          paymentMethod === "wallet"
                            ? "border-luxury-gold bg-luxury-gold"
                            : isDark
                            ? "border-luxury-gold-dark/40"
                            : "border-luxury-gold-light/60"
                        }`}
                      >
                        {paymentMethod === "wallet" && (
                          <div className="w-2.5 h-2.5 bg-luxury-brown-darker rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-primary font-semibold text-base md:text-lg">
                            المحفظة الرقمية
                          </p>
                          <p className="text-muted text-xs md:text-sm">
                            الدفع من رصيد المحفظة
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-luxury-gold font-semibold text-sm md:text-base">
                      1,250 درهم متاح
                    </div>
                  </div>

                  {/* Credit Card Payment */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-xl p-5 md:p-6 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      paymentMethod === "card"
                        ? "border border-luxury-gold bg-luxury-gold/10 shadow-lg shadow-luxury-gold/20"
                        : `${nestedPanelClasses}`
                    }`}
                  >
                    <div className="flex items-center gap-4 md:gap-5">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          paymentMethod === "card"
                            ? "border-luxury-gold bg-luxury-gold"
                            : isDark
                            ? "border-luxury-gold-dark/40"
                            : "border-luxury-gold-light/60"
                        }`}
                      >
                        {paymentMethod === "card" && (
                          <div className="w-2.5 h-2.5 bg-luxury-brown-darker rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-primary font-semibold text-base md:text-lg">
                            بطاقة ائتمان / خصم
                          </p>
                          <p className="text-muted text-xs md:text-sm">
                            فيزا، ماستركارد، أمريكان إكسبريس
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xl">
                      <span className="text-2xl">💳</span>
                      <span className="text-2xl">💳</span>
                    </div>
                  </div>
                </div>

                {/* Card Details Form */}
                {paymentMethod === "card" && (
                  <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-card space-y-4 md:space-y-5 animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-primary font-medium text-sm md:text-base mb-2">
                          رقم البطاقة
                        </label>
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              number: formatCardNumber(e.target.value),
                            })
                          }
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={`w-full rounded-xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 transition-all ${inputClasses}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-primary font-medium text-sm md:text-base mb-2">
                          اسم حامل البطاقة
                        </label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              name: e.target.value,
                            })
                          }
                          placeholder="اسم حامل البطاقة"
                          className={`w-full rounded-xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 transition-all ${inputClasses}`}
                        />
                      </div>
                      <div>
                        <label className="block text-primary font-medium text-sm md:text-base mb-2">
                          تاريخ الانتهاء
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              expiry: formatExpiry(e.target.value),
                            })
                          }
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full rounded-xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 transition-all ${inputClasses}`}
                        />
                      </div>
                      <div>
                        <label className="block text-primary font-medium text-sm md:text-base mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cvv: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 3),
                            })
                          }
                          placeholder="123"
                          maxLength={3}
                          className={`w-full rounded-xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 transition-all ${inputClasses}`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <p className="text-muted text-xs md:text-sm">
                        معلوماتك محمية ومشفرة بشكل آمن
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div
                className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur`}
              >
                <h2 className="text-primary font-bold text-xl md:text-2xl mb-6">
                  طلبك
                </h2>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 md:gap-6 rounded-xl p-4 md:p-5 ${nestedPanelClasses}`}
                    >
                      <div
                        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 border ${
                          isDark
                            ? "bg-black border-luxury-gold-dark/40"
                            : "bg-luxury-cream border-luxury-gold-light/40"
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-primary font-semibold text-base md:text-lg mb-1">
                          {item.name}
                        </h3>
                        <p className="text-muted text-sm md:text-base">
                          الكمية: {item.quantity}
                        </p>
                      </div>
                      <div className="text-amber-500 font-bold text-lg md:text-xl">
                        {formatPrice(item.price * item.quantity)} درهم
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1 space-y-6 md:space-y-8 lg:sticky lg:top-24 lg:h-fit">
              {/* Order Summary */}
              <div
                className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur`}
              >
                <h3 className="text-primary font-bold text-xl md:text-2xl mb-6 pb-4 border-b border-card">
                  ملخص الطلب
                </h3>
                <div className="space-y-4 md:space-y-5">
                  <div className="flex justify-between text-secondary text-base md:text-lg">
                    <span>المجموع الجزئي</span>
                    <span>{formatPrice(subtotal)} درهم</span>
                  </div>
                  <div className="flex justify-between text-secondary text-base md:text-lg">
                    <span>التوصيل</span>
                    <span>{formatPrice(delivery)} درهم</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400 text-base md:text-lg font-semibold">
                      <span>الخصم</span>
                      <span>-{formatPrice(discount)} درهم</span>
                    </div>
                  )}
                  <div className="border-t border-card pt-4 md:pt-5 flex justify-between text-primary font-bold text-xl md:text-2xl">
                    <span>الإجمالي</span>
                    <span className="text-amber-500">
                      {formatPrice(total)} درهم
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div
                className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <h4 className="text-primary font-semibold text-base md:text-lg">
                    دفع آمن
                  </h4>
                </div>
                <p className="text-muted text-xs md:text-sm leading-relaxed mb-4">
                  جميع المعاملات محمية ومشفرة. معلوماتك في أمان تام.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div
                    className={`rounded-lg px-3 py-2 text-xs ${nestedPanelClasses}`}
                  >
                    <span>🔒 SSL</span>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-xs ${nestedPanelClasses}`}
                  >
                    <span>✓ آمن</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-5 md:py-6 rounded-xl font-extrabold text-xl md:text-2xl transition-all shadow-2xl hover:shadow-2xl hover:scale-[1.03] transform duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-4 border-[3px] ${
                  isDark
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-luxury-brown-darker border-amber-600 shadow-amber-900/60"
                    : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-white border-amber-700 shadow-amber-900/50"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="font-black">جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    <span className="font-black tracking-wide">
                      تأكيد الدفع
                    </span>
                    <span
                      className={`text-2xl font-bold ${
                        isDark ? "text-luxury-brown-darker/70" : "text-white/80"
                      }`}
                    >
                      |
                    </span>
                    <span
                      className={`font-black ${
                        isDark ? "text-luxury-brown-darker" : "text-white"
                      }`}
                    >
                      {formatPrice(total)} درهم
                    </span>
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="block w-full text-center text-amber-500 py-3 md:py-4 hover:text-amber-400 transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-amber-700/50 rounded-xl"
              >
                العودة إلى السلة
              </Link>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default Checkout;
