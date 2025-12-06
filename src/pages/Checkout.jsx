import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { getTranslatedName } from "../utils/translations";
import apiService from "../services/api";

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { cartItems, cartTotal, clearCart, refreshCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const hasShownToast = useRef(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [couponCode, setCouponCode] = useState("");
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
      showToast(t("checkout.pleaseLogin"), "error");
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

  // Fetch addresses from API
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isAuthenticated) return;

      try {
        setLoadingAddresses(true);
        const response = await apiService.getAddresses();

        if (response.success && response.data && Array.isArray(response.data)) {
          setAddresses(response.data);
          // Auto-select first address as shipping and billing if available
          if (response.data.length > 0) {
            const firstAddress = response.data[0];
            setSelectedShippingAddress(firstAddress.id);
            setSelectedBillingAddress(firstAddress.id);
          } else {
            // No addresses - redirect to add address
            showToast(t("checkout.noAddressesRequired"), "error");
            setTimeout(() => navigate("/addresses"), 2000);
          }
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
        setAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

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
    return price.toLocaleString(i18n.language === "ar" ? "ar-AE" : "en-US");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast(t("checkout.cartEmpty"), "error");
      navigate("/cart");
      return;
    }

    if (!selectedShippingAddress || !selectedBillingAddress) {
      showToast(t("checkout.selectAddress"), "error");
      return;
    }

    setIsProcessing(true);

    try {
      // بناء orderData صحيح 100% للـ backend بتاعكم
      const orderItems = cartItems.map((item) => ({
        product_id: parseInt(item.id),
        pack_size_id: item.variantId || item.pack_size_id || 1, // fallback لـ 1 عشان ما يفشلش
        quantity: item.quantity,
      }));

      const orderData = {
        shipping_address_id: parseInt(selectedShippingAddress),
        billing_address_id: parseInt(selectedBillingAddress),
        payment_method: paymentMethod === "card" ? "card" : "cash_on_delivery",
        items: orderItems,
      };

      console.log("إرسال الطلب النهائي:", orderData);

      // Create order via API
      const response = await apiService.createOrder(orderData);

      // Extract order ID and transaction ID from response
      const orderId =
        response.order_id ||
        response.data?.id ||
        response.data?.data?.id ||
        response.data?.order_id;

      const transactionId =
        response.transaction_id ||
        response.data?.transaction_id ||
        response.data?.data?.transaction_id ||
        response.data?.transaction?.id ||
        response.data?.data?.transaction?.id;

      console.log(
        "Order created - Order ID:",
        orderId,
        "Transaction ID:",
        transactionId
      );

      // If order was created successfully
      if (response.success || orderId) {
        // Clear cart immediately
        clearCart();
        refreshCart(); // Refresh to ensure cart is cleared

        // Show success message
        const successMessage = orderId
          ? t("checkout.orderConfirmed") ||
            `Order #${orderId} created successfully!`
          : t("checkout.orderConfirmed") || "Order created successfully!";
        showToast(successMessage, "success");

        // Navigate to order detail page if we have order ID
        // If we have transaction ID, we could also navigate to transaction page
        // But order detail is more comprehensive
        if (orderId) {
          setTimeout(() => navigate(`/order-detail/${orderId}`), 1500);
        } else if (transactionId) {
          // Fallback: navigate to transaction if order ID not available
          setTimeout(() => navigate(`/transaction/${transactionId}`), 1500);
        } else {
          // Last resort: navigate to orders list
          setTimeout(() => navigate("/orders"), 1500);
        }
      } else {
        // Handle error case
        const errorMessage =
          response.message ||
          t("checkout.orderFailed") ||
          "Failed to create order. Please try again.";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage =
        error.response?.data?.message ||
        t("checkout.orderFailed") ||
        "Failed to create order. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
        {/* Progress Indicator - Professional Design */}
        <div className="mb-10 md:mb-16">
          <div
            className={`${panelClasses} rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl backdrop-blur-xl border-2 ${
              isDark
                ? "border-luxury-gold-dark/30"
                : "border-luxury-gold-light/40"
            }`}
          >
            <div
              className={`flex items-center justify-center gap-3 md:gap-6 lg:gap-8 ${
                i18n.language === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Step 1: Completed */}
              <div
                className={`flex items-center gap-3 md:gap-4 flex-1 max-w-[200px] ${
                  i18n.language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
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
                    {t("checkout.step1")}
                  </p>
                  <p className="text-sm md:text-base lg:text-lg font-bold text-primary">
                    {t("checkout.cartStep")}
                  </p>
                </div>
              </div>

              {/* Connector Line 1 */}
              <div className="flex-1 max-w-[120px] md:max-w-[150px] lg:max-w-[200px] relative">
                <div className="h-1 md:h-1.5 bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold rounded-full shadow-lg shadow-luxury-gold/50"></div>
                <div className="absolute inset-0 h-1 md:h-1.5 bg-luxury-gold/20 rounded-full animate-pulse"></div>
              </div>

              {/* Step 2: Active */}
              <div
                className={`flex items-center gap-3 md:gap-4 flex-1 max-w-[200px] ${
                  i18n.language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
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
                    {t("checkout.step2")}
                  </p>
                  <p
                    className={`text-sm md:text-base lg:text-lg font-bold ${
                      isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                    }`}
                  >
                    {t("checkout.paymentStep")}
                  </p>
                </div>
              </div>

              {/* Connector Line 2 */}
              <div className="flex-1 max-w-[120px] md:max-w-[150px] lg:max-w-[200px] relative">
                <div
                  className={`h-1 md:h-1.5 rounded-full ${inactiveStepLine}`}
                ></div>
              </div>

              {/* Step 3: Pending */}
              <div
                className={`flex items-center gap-3 md:gap-4 flex-1 max-w-[200px] ${
                  i18n.language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
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
                    {t("checkout.step3")}
                  </p>
                  <p className="text-sm md:text-base lg:text-lg font-bold text-muted">
                    {t("checkout.confirmStep")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div
          className={`text-center ${
            i18n.language === "ar" ? "md:text-right" : "md:text-left"
          } mb-8 md:mb-12`}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 md:mb-4">
            {t("checkout.title")}
          </h1>
          <p className="text-muted text-lg md:text-xl">
            {t("checkout.subtitle")}
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
                    <span>{t("checkout.change")}</span>
                  </Link>
                  <div
                    className={`flex ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    } items-center gap-3 md:gap-4`}
                  >
                    <h2
                      className={`text-primary font-bold text-xl md:text-2xl ${
                        i18n.language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {t("checkout.shippingAddress")}
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
                {loadingAddresses ? (
                  <div
                    className={`${nestedPanelClasses} rounded-xl p-4 md:p-6`}
                  >
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div
                    className={`${nestedPanelClasses} rounded-xl p-6 text-center`}
                  >
                    <p className="text-muted mb-4">
                      {t("checkout.noAddresses")}
                    </p>
                    <Link
                      to="/addresses"
                      className="text-amber-500 hover:text-amber-400 font-medium"
                    >
                      {t("checkout.addNewAddress")}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => {
                          setSelectedShippingAddress(address.id);
                          // Set billing address to same as shipping by default
                          if (!selectedBillingAddress) {
                            setSelectedBillingAddress(address.id);
                          }
                        }}
                        className={`${nestedPanelClasses} rounded-xl p-4 md:p-6 cursor-pointer transition-all ${
                          selectedShippingAddress === address.id
                            ? "border-2 border-luxury-gold bg-luxury-gold/10"
                            : "border border-transparent hover:border-luxury-gold/50"
                        }`}
                      >
                        <div
                          className={`flex items-start gap-4 ${
                            i18n.language === "ar" ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                              selectedShippingAddress === address.id
                                ? "border-luxury-gold bg-luxury-gold"
                                : isDark
                                ? "border-luxury-gold-dark/40"
                                : "border-luxury-gold-light/60"
                            }`}
                          >
                            {selectedShippingAddress === address.id && (
                              <div className="w-2.5 h-2.5 bg-luxury-brown-darker rounded-full"></div>
                            )}
                          </div>
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
                          <div
                            className={`flex-1 ${
                              i18n.language === "ar"
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            <p className="text-primary font-semibold text-base md:text-lg mb-1">
                              {address.name ||
                                address.type ||
                                t("checkout.home")}
                            </p>
                            <p className="text-secondary text-sm md:text-base mb-1">
                              {address.city && address.country
                                ? `${address.city}, ${address.country}`
                                : address.city || address.country || ""}
                            </p>
                            <p className="text-muted text-sm">
                              {address.address || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div
                className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur`}
              >
                <div
                  className={`flex ${
                    i18n.language === "ar" ? "flex-row-reverse" : ""
                  } items-center gap-3 md:gap-4 mb-6`}
                >
                  <h2
                    className={`text-primary font-bold text-xl md:text-2xl ${
                      i18n.language === "ar" ? "text-right" : "text-left"
                    } flex-1`}
                  >
                    {t("checkout.paymentMethod")}
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
                    } ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex items-center gap-4 md:gap-5 ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      }`}
                    >
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
                      <div
                        className={`flex items-center gap-3 md:gap-4 ${
                          i18n.language === "ar" ? "flex-row-reverse" : ""
                        }`}
                      >
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
                            {t("checkout.digitalWallet")}
                          </p>
                          <p className="text-muted text-xs md:text-sm">
                            {t("checkout.payFromWallet")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-luxury-gold font-semibold text-sm md:text-base ${
                        i18n.language === "ar" ? "text-left" : "text-right"
                      }`}
                    >
                      1,250 {t("checkout.currency")} {t("checkout.available")}
                    </div>
                  </div>

                  {/* Credit Card Payment */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-xl p-5 md:p-6 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      paymentMethod === "card"
                        ? "border border-luxury-gold bg-luxury-gold/10 shadow-lg shadow-luxury-gold/20"
                        : `${nestedPanelClasses}`
                    } ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex items-center gap-4 md:gap-5 ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      }`}
                    >
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
                      <div
                        className={`flex items-center gap-3 md:gap-4 ${
                          i18n.language === "ar" ? "flex-row-reverse" : ""
                        }`}
                      >
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
                            {t("checkout.creditCard")}
                          </p>
                          <p className="text-muted text-xs md:text-sm">
                            {t("checkout.cardTypes")}
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
                        <label
                          className={`block text-primary font-medium text-sm md:text-base mb-2 ${
                            i18n.language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          {t("checkout.cardNumber")}
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
                          placeholder={t("checkout.cardNumberPlaceholder")}
                          maxLength={19}
                          dir={i18n.language === "ar" ? "rtl" : "ltr"}
                          className={`w-full rounded-xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 transition-all ${inputClasses} ${
                            i18n.language === "ar" ? "text-right" : "text-left"
                          }`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label
                          className={`block text-primary font-medium text-sm md:text-base mb-2 ${
                            i18n.language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          {t("checkout.cardHolderName")}
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
                          placeholder={t("checkout.cardNamePlaceholder")}
                          dir={i18n.language === "ar" ? "rtl" : "ltr"}
                          className={`w-full rounded-xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 transition-all ${inputClasses} ${
                            i18n.language === "ar" ? "text-right" : "text-left"
                          }`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-primary font-medium text-sm md:text-base mb-2 ${
                            i18n.language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          {t("checkout.expiryDate")}
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
                          placeholder={t("checkout.expiryPlaceholder")}
                          maxLength={5}
                          dir="ltr"
                          className={`w-full rounded-xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 transition-all ${inputClasses} text-center`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-primary font-medium text-sm md:text-base mb-2 ${
                            i18n.language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          {t("checkout.cvv")}
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
                          placeholder={t("checkout.cvvPlaceholder")}
                          maxLength={3}
                          dir="ltr"
                          className={`w-full rounded-xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 transition-all ${inputClasses} text-center`}
                        />
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 pt-2 ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      }`}
                    >
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
                      <p
                        className={`text-muted text-xs md:text-sm ${
                          i18n.language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        {t("checkout.secureInfo")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div
                className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur`}
              >
                <h2
                  className={`text-primary font-bold text-xl md:text-2xl mb-6 ${
                    i18n.language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t("checkout.yourOrder")}
                </h2>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 md:gap-6 rounded-xl p-4 md:p-5 ${nestedPanelClasses} ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      }`}
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
                          alt={getTranslatedName(item)}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format";
                          }}
                        />
                      </div>
                      <div
                        className={`flex-1 ${
                          i18n.language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <h3 className="text-primary font-semibold text-base md:text-lg mb-1">
                          {getTranslatedName(item)}
                        </h3>
                        <p className="text-muted text-sm md:text-base">
                          {t("checkout.quantity", { qty: item.quantity })}
                        </p>
                      </div>
                      <div
                        className={`text-amber-500 font-bold text-lg md:text-xl ${
                          i18n.language === "ar" ? "text-left" : "text-right"
                        }`}
                      >
                        {formatPrice(item.price * item.quantity)}{" "}
                        {t("checkout.currency")}
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
                <h3
                  className={`text-primary font-bold text-xl md:text-2xl mb-6 pb-4 border-b border-card ${
                    i18n.language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t("checkout.orderSummary")}
                </h3>
                <div className="space-y-4 md:space-y-5">
                  <div
                    className={`flex justify-between text-secondary text-base md:text-lg ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span>{t("checkout.subtotal")}</span>
                    <span>
                      {formatPrice(subtotal)} {t("checkout.currency")}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between text-secondary text-base md:text-lg ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span>{t("checkout.shipping")}</span>
                    <span>
                      {formatPrice(delivery)} {t("checkout.currency")}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div
                      className={`flex justify-between text-green-400 text-base md:text-lg font-semibold ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span>{t("checkout.discount")}</span>
                      <span>
                        -{formatPrice(discount)} {t("checkout.currency")}
                      </span>
                    </div>
                  )}
                  <div
                    className={`border-t border-card pt-4 md:pt-5 flex justify-between text-primary font-bold text-xl md:text-2xl ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span>{t("checkout.total")}</span>
                    <span className="text-amber-500">
                      {formatPrice(total)} {t("checkout.currency")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div
                className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur`}
              >
                <div
                  className={`flex items-center gap-3 mb-4 ${
                    i18n.language === "ar" ? "flex-row-reverse" : ""
                  }`}
                >
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
                  <h4
                    className={`text-primary font-semibold text-base md:text-lg ${
                      i18n.language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {t("checkout.securePayment")}
                  </h4>
                </div>
                <p
                  className={`text-muted text-xs md:text-sm leading-relaxed mb-4 ${
                    i18n.language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t("checkout.secureInfo")}
                </p>
                <div
                  className={`flex items-center gap-3 flex-wrap ${
                    i18n.language === "ar" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 text-xs ${nestedPanelClasses}`}
                  >
                    <span>{t("checkout.sslBadge")}</span>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-xs ${nestedPanelClasses}`}
                  >
                    <span>{t("checkout.secureBadge")}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-5 md:py-6 rounded-xl font-extrabold text-xl md:text-2xl transition-all shadow-2xl hover:shadow-2xl hover:scale-[1.03] transform duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-4 border-[3px] ${
                  i18n.language === "ar" ? "flex-row-reverse" : ""
                } ${
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
                    <span className="font-black">
                      {t("checkout.processing")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-black tracking-wide">
                      {t("checkout.confirmPayment")}
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
                      {formatPrice(total)} {t("checkout.currency")}
                    </span>
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="block w-full text-center text-amber-500 py-3 md:py-4 hover:text-amber-400 transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-amber-700/50 rounded-xl"
              >
                {t("checkout.backToCart")}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default Checkout;
