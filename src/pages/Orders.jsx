import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";
import CancelOrderModal from "../components/CancelOrderModal";

const Orders = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const hasShownToast = useRef(false);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (typeof imagePath === "string") {
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
      }
      if (imagePath.startsWith("/")) {
        const baseUrl =
          import.meta.env.VITE_API_URL ||
          "https://laeij.teamqeematech.site/api";
        // Remove /api from base URL if image path starts with /storage
        const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
        return `${cleanBaseUrl}${imagePath}`;
      }
      const baseUrl =
        import.meta.env.VITE_API_URL || "https://laeij.teamqeematech.site/api";
      const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
      return `${cleanBaseUrl}/${imagePath}`;
    }
    if (imagePath && typeof imagePath === "object" && imagePath.path) {
      return getImageUrl(imagePath.path);
    }
    return null;
  };

  // Helper function to format order from API response
  const formatOrderFromAPI = (order) => {
    // Map API status to frontend status - preserve original status value
    const originalStatus = order.status?.toLowerCase() || "";
    const statusMap = {
      pending: "in-progress", // Map pending to in-progress for UI consistency
      processing: "in-progress",
      shipped: "in-progress",
      "in-progress": "in-progress",
      completed: "completed",
      delivered: "delivered",
      cancelled: "cancelled",
      canceled: "cancelled", // Handle both spellings
    };

    // Format items from API
    const formattedItems = Array.isArray(order.items)
      ? order.items.map((item) => ({
          id: item.id || item.product_id || item.product?.id,
          name:
            item.product?.name ||
            item.name ||
            (i18n.language === "en" && item.product?.name_en
              ? item.product.name_en
              : item.product?.name) ||
            "",
          nameEn: item.product?.name_en || item.product?.nameEn || "",
          image:
            item.product?.thumb_image ||
            item.product?.image ||
            item.image ||
            (Array.isArray(item.product?.images) && item.product.images[0]?.path
              ? item.product.images[0].path
              : null) ||
            null,
          quantity: parseInt(item.quantity || 1),
          price: parseFloat(item.price || item.subtotal || 0),
          size: item.variant?.name || item.pack_size?.size || item.size || "",
        }))
      : [];

    return {
      id: order.id?.toString() || `D${order.id}` || "",
      orderId: order.id, // Store original numeric ID for API calls
      status: statusMap[originalStatus] || originalStatus || "in-progress",
      originalStatus: originalStatus, // Store original API status
      total: parseFloat(order.final_total || order.total || 0),
      date: order.created_at || order.updated_at || new Date().toISOString(),
      productCount: formattedItems.length,
      items: formattedItems.map((item) => ({
        ...item,
        image: getImageUrl(item.image),
      })),
      // Additional API fields
      discount: parseFloat(order.discount || 0),
      shipping_cost: parseFloat(order.shipping_cost || 0),
      coupon_discount_value: parseFloat(order.coupon_discount_value || 0),
      payment_status: order.payment_status || "",
      payment_method: order.payment_method || "",
    };
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast(t("orders.pleaseLogin"), "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getOrders();

        if (response.success && response.data) {
          // Map API response to frontend format
          const formattedOrders = Array.isArray(response.data)
            ? response.data.map(formatOrderFromAPI)
            : [];
          setOrders(formattedOrders);
        } else {
          setError(response.message || t("orders.errorLoading"));
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(t("orders.errorLoading"));
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, t]);

  // Cancel order handler - opens modal
  const handleCancelOrderClick = (order) => {
    setSelectedOrderForCancel(order);
    setShowCancelModal(true);
  };

  // Cancel order confirmation handler
  // Note: reason parameter is collected from modal but not sent to API currently
  // as the API doesn't require it. Kept for potential future API enhancement.
  const handleCancelOrderConfirm = async (_reason) => {
    if (!selectedOrderForCancel) return;

    // Extract numeric order ID
    const orderId = selectedOrderForCancel.orderId || selectedOrderForCancel.id;
    if (!orderId) {
      showToast(t("orders.cancelFailed") || "Invalid order ID", "error");
      setShowCancelModal(false);
      setSelectedOrderForCancel(null);
      return;
    }

    try {
      setCancellingOrderId(selectedOrderForCancel.id);
      setShowCancelModal(false);

      const response = await apiService.cancelOrder(orderId);

      if (response.success) {
        showToast(
          response.message ||
            t("orders.cancelSuccess") ||
            "Order cancelled successfully",
          "success"
        );

        // Refresh orders list
        const refreshResponse = await apiService.getOrders();
        if (refreshResponse.success && refreshResponse.data) {
          const formattedOrders = Array.isArray(refreshResponse.data)
            ? refreshResponse.data.map(formatOrderFromAPI)
            : [];
          setOrders(formattedOrders);
        }
      } else {
        showToast(
          response.message ||
            t("orders.cancelFailed") ||
            "Failed to cancel order",
          "error"
        );
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      showToast(
        t("orders.cancelFailed") || "Failed to cancel order. Please try again.",
        "error"
      );
    } finally {
      setCancellingOrderId(null);
      setSelectedOrderForCancel(null);
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
            <p
              className={`mt-4 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {t("orders.loading") || "Loading orders..."}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const panelClasses = isDark
    ? "bg-card border border-card text-primary"
    : "bg-card border border-card text-primary";
  const inactiveTabClasses = isDark
    ? "bg-card-muted text-secondary border border-card hover:text-primary"
    : "bg-card-muted text-secondary border border-card hover:text-primary";

  const formatPrice = (price) => {
    return price.toLocaleString(i18n.language === "ar" ? "ar-AE" : "en-US");
  };

  // Format date based on language - handles ISO date strings from API
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      // Parse ISO date string (e.g., "2025-09-27T11:27:22.000000Z")
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        // If not a valid date, try to parse as is
        return dateString;
      }

      // Format based on language
      if (i18n.language === "ar") {
        return date.toLocaleString("ar-AE", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour12: true,
        });
      } else {
        return date.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour12: true,
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "in-progress": {
        label: t("orders.status.inProgress"),
        bg: isDark ? "bg-amber-900/40" : "bg-amber-100",
        text: isDark ? "text-amber-300" : "text-amber-700",
        border: isDark ? "border-amber-600/60" : "border-amber-400/60",
        icon: (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      completed: {
        label: t("orders.status.completed"),
        bg: isDark ? "bg-blue-900/40" : "bg-blue-100",
        text: isDark ? "text-blue-300" : "text-blue-700",
        border: isDark ? "border-blue-600/60" : "border-blue-400/60",
        icon: (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      delivered: {
        label: t("orders.status.delivered"),
        bg: isDark ? "bg-green-900/40" : "bg-green-100",
        text: isDark ? "text-green-300" : "text-green-700",
        border: isDark ? "border-green-600/60" : "border-green-400/60",
        icon: (
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
        ),
      },
      cancelled: {
        label: t("orders.status.cancelled"),
        bg: isDark ? "bg-red-900/40" : "bg-red-100",
        text: isDark ? "text-red-300" : "text-red-700",
        border: isDark ? "border-red-600/60" : "border-red-400/60",
        icon: (
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ),
      },
      pending: {
        label: t("orders.status.pending"),
        bg: isDark ? "bg-gray-700/40" : "bg-gray-100",
        text: isDark ? "text-gray-300" : "text-gray-700",
        border: isDark ? "border-gray-600/60" : "border-gray-400/60",
        icon: (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
    };

    const config = statusConfig[status] || statusConfig["in-progress"];

    return (
      <span
        className={`${config.bg} ${config.text} ${config.border} border-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2`}
      >
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  const tabs = [
    { id: "all", label: t("orders.all") },
    { id: "in-progress", label: t("orders.inProgress") },
    { id: "completed", label: t("orders.completed") },
    { id: "cancelled", label: t("orders.status.cancelled") },
  ];

  const filteredOrders =
    activeTab === "all"
      ? orders
      : activeTab === "in-progress"
      ? orders.filter(
          (o) => o.status === "in-progress" || o.status === "pending"
        )
      : activeTab === "completed"
      ? orders.filter(
          (o) => o.status === "completed" || o.status === "delivered"
        )
      : activeTab === "cancelled"
      ? orders.filter((o) => o.status === "cancelled")
      : orders;

  // Show error message if there's an error
  if (error && orders.length === 0) {
    return (
      <PageLayout>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
          <div
            className={`${panelClasses} backdrop-blur-sm rounded-2xl p-12 md:p-16 text-center shadow-lg`}
          >
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isDark ? "bg-red-900/20" : "bg-red-100"
              }`}
            >
              <svg
                className={`w-10 h-10 md:w-12 md:h-12 ${
                  isDark ? "text-red-400" : "text-red-600"
                }`}
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
            </div>
            <h3
              className={`font-bold text-xl md:text-2xl mb-3 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {t("orders.errorLoading") || "Error loading orders"}
            </h3>
            <p
              className={`text-base md:text-lg mb-6 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={`inline-block px-8 py-4 rounded-xl font-semibold text-base md:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 transform ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-light hover:to-luxury-gold text-luxury-brown-darker"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-light hover:to-luxury-gold text-white"
              }`}
            >
              {t("orders.retry") || "Retry"}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div
          className={`${
            i18n.language === "ar" ? "text-right" : "text-left"
          } mb-8 md:mb-12`}
        >
          <h1
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 ${
              isDark ? "text-white" : "text-luxury-brown-text"
            }`}
          >
            {t("orders.title")}
          </h1>
          <p
            className={`text-lg md:text-xl ${
              isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/80"
            }`}
          >
            {t("orders.subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div
          className={`flex ${
            i18n.language === "ar" ? "justify-end" : ""
          } gap-3 md:gap-4 mb-8 md:mb-12 overflow-x-auto scrollbar-hide pb-2`}
        >
          {(i18n.language === "ar" ? [...tabs].reverse() : tabs).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base whitespace-nowrap transition-all duration-300 shadow-lg hover:scale-105 transform ${
                activeTab === tab.id
                  ? isDark
                    ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker shadow-luxury-gold/40"
                    : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-[#1A1410] shadow-luxury-gold/40"
                  : `${inactiveTabClasses}`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div
            className={`${panelClasses} backdrop-blur-sm rounded-2xl p-12 md:p-16 text-center shadow-lg`}
          >
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isDark ? "bg-luxury-gold/10" : "bg-luxury-gold/15"
              }`}
            >
              <svg
                className={`w-10 h-10 md:w-12 md:h-12 ${
                  isDark
                    ? "text-luxury-brown-light"
                    : "text-luxury-brown-text/60"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3
              className={`font-bold text-xl md:text-2xl mb-3 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {t("orders.noOrders")}
            </h3>
            <p
              className={`text-base md:text-lg mb-6 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              {t("orders.noOrdersDesc")}
            </p>
            <Link
              to="/products"
              className={`inline-block px-8 py-4 rounded-xl font-semibold text-base md:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 transform ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-light hover:to-luxury-gold text-luxury-brown-darker"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-light hover:to-luxury-gold text-white"
              }`}
            >
              {t("orders.browseProducts")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 ${
                  isDark
                    ? "hover:border-luxury-gold/60 shadow-lg"
                    : "hover:border-luxury-gold/50 shadow-md"
                }`}
              >
                {/* Order Header */}
                <div
                  className={`flex flex-col md:flex-row md:items-center ${
                    i18n.language === "ar" ? "md:flex-row-reverse" : ""
                  } justify-between gap-4 mb-6 pb-6 border-b ${
                    isDark
                      ? "border-luxury-gold-dark/30"
                      : "border-luxury-gold-light/30"
                  }`}
                >
                  <div
                    className={`flex-1 ${
                      i18n.language === "ar" ? "md:order-2" : ""
                    }`}
                  >
                    <div
                      className={`flex ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      } items-center gap-3 md:gap-4 mb-2`}
                    >
                      <div
                        className={`${
                          i18n.language === "ar" ? "text-right" : "text-left"
                        } flex-1`}
                      >
                        <h3
                          className={`font-bold text-lg md:text-xl ${
                            isDark ? "text-white" : "text-luxury-brown-text"
                          }`}
                        >
                          {i18n.language === "ar"
                            ? `#${order.id} ${t("orders.orderNumber")}`
                            : `${t("orders.orderNumber")} #${order.id}`}
                        </h3>
                        <p
                          className={`text-sm md:text-base mt-1 ${
                            i18n.language === "ar" ? "" : "ltr"
                          } ${
                            isDark
                              ? "text-luxury-brown-light"
                              : "text-luxury-brown-text/70"
                          }`}
                        >
                          {formatDate(order.date)}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isDark
                            ? "bg-luxury-gold-dark/20"
                            : "bg-luxury-gold/20"
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 md:w-6 md:h-6 ${
                            isDark
                              ? "text-luxury-gold-light"
                              : "text-luxury-gold"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex ${
                      i18n.language === "ar"
                        ? "flex-row-reverse md:order-1"
                        : ""
                    } items-center gap-4`}
                  >
                    {getStatusBadge(order.status)}
                    <div
                      className={
                        i18n.language === "ar" ? "text-right" : "text-left"
                      }
                    >
                      <p
                        className={`text-xs md:text-sm mb-1 ${
                          isDark
                            ? "text-luxury-brown-light"
                            : "text-luxury-brown-text/70"
                        }`}
                      >
                        {t("orders.total")}
                      </p>
                      <p
                        className={`font-bold text-lg md:text-xl ${
                          i18n.language === "ar" ? "ltr" : ""
                        } ${
                          isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                        }`}
                      >
                        {formatPrice(order.total)} {t("orders.currency")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mb-6">
                  <div
                    className={`flex ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    } items-center gap-2 mb-4 ${
                      isDark ? "text-white" : "text-luxury-brown-text"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        isDark
                          ? "text-luxury-brown-light"
                          : "text-luxury-brown-text/60"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <h4
                      className={`font-semibold text-base md:text-lg ${
                        isDark ? "text-white" : "text-luxury-brown-text"
                      }`}
                    >
                      {order.productCount}{" "}
                      {order.productCount === 1
                        ? t("orders.products")
                        : t("orders.productsPlural")}
                    </h4>
                  </div>
                  <div
                    className={`flex ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    } gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2`}
                  >
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border ${
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
                            e.target.src = `data:image/svg+xml;base64,${btoa(
                              '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="#9ca3af">No Image</text></svg>'
                            )}`;
                          }}
                        />
                        {item.quantity > 1 && (
                          <div
                            className={`absolute top-1 ${
                              i18n.language === "ar" ? "right-1" : "left-1"
                            } text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                              isDark ? "bg-luxury-gold" : "bg-luxury-gold-dark"
                            }`}
                          >
                            {item.quantity}
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div
                        className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center border ${
                          isDark
                            ? "bg-card-muted border-luxury-gold-dark/30"
                            : "bg-card-muted border-luxury-gold-light/40"
                        }`}
                      >
                        <span
                          className={`font-bold text-sm md:text-base ${
                            isDark
                              ? "text-luxury-gold-light"
                              : "text-luxury-gold"
                          }`}
                        >
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div
                  className={`flex flex-col sm:flex-row ${
                    i18n.language === "ar" ? "sm:flex-row-reverse" : ""
                  } items-stretch sm:items-center ${
                    i18n.language === "ar"
                      ? "sm:justify-start"
                      : "justify-between"
                  } gap-3 md:gap-4 pt-6 border-t ${
                    isDark
                      ? "border-luxury-gold-dark/30"
                      : "border-luxury-gold-light/30"
                  }`}
                >
                  <div
                    className={`flex ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    } items-center gap-3 md:gap-4`}
                  >
                    <button
                      onClick={() => navigate(`/order-detail/${order.id}`)}
                      className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 transform flex ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      } items-center justify-center gap-2 border ${
                        isDark
                          ? "bg-card-muted text-primary hover:bg-card-muted/80 border-card hover:border-luxury-gold/50"
                          : "bg-card text-primary hover:bg-card-muted border-card hover:border-luxury-gold/50"
                      }`}
                    >
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>{t("orders.viewDetails")}</span>
                    </button>
                    {(order.status === "in-progress" ||
                      order.status === "pending") &&
                      order.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelOrderClick(order)}
                          disabled={
                            cancellingOrderId === order.id || showCancelModal
                          }
                          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 transform flex ${
                            i18n.language === "ar" ? "flex-row-reverse" : ""
                          } items-center justify-center gap-2 border-2 ${
                            isDark
                              ? "bg-red-900/30 hover:bg-red-900/40 text-red-300 border-red-600/50 disabled:opacity-50"
                              : "bg-red-100 hover:bg-red-200 text-red-700 border-red-400/60 disabled:opacity-50"
                          }`}
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>{t("orders.cancel")}</span>
                        </button>
                      )}
                    {order.status === "completed" && (
                      <button
                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 transform flex ${
                          i18n.language === "ar" ? "flex-row-reverse" : ""
                        } items-center justify-center gap-2 border-2 ${
                          isDark
                            ? "bg-blue-900/30 hover:bg-blue-900/40 text-blue-300 border-blue-600/50"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-400/60"
                        }`}
                      >
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span>{t("orders.reorder")}</span>
                      </button>
                    )}
                  </div>
                  {order.status === "in-progress" && (
                    <Link
                      to={`/order-detail/${order.id}`}
                      className={`flex-1 sm:flex-none px-8 py-4 rounded-xl font-extrabold text-lg md:text-xl transition-all duration-300 shadow-2xl hover:shadow-2xl hover:scale-110 transform flex ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      } items-center justify-center gap-3 border-[3px] ${
                        isDark
                          ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-luxury-brown-darker border-amber-600 shadow-amber-900/60"
                          : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-white border-amber-700 shadow-amber-900/50"
                      }`}
                    >
                      <svg
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span className="font-black tracking-wide">
                        {t("orders.trackOrder")}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedOrderForCancel(null);
        }}
        onConfirm={handleCancelOrderConfirm}
        orderNumber={selectedOrderForCancel?.id || ""}
        isLoading={cancellingOrderId !== null}
      />
    </PageLayout>
  );
};

export default Orders;
