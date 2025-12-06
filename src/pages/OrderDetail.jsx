import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { getTranslatedName } from "../utils/translations";
import apiService from "../services/api";
import CancelOrderModal from "../components/CancelOrderModal";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const hasShownToast = useRef(false);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (typeof imagePath === "string") {
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
      }
      const baseUrl =
        import.meta.env.VITE_API_URL || "https://laeij.teamqeematech.site/api";
      const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
      if (imagePath.startsWith("/")) {
        return `${cleanBaseUrl}${imagePath}`;
      }
      return `${cleanBaseUrl}/${imagePath}`;
    }
    if (imagePath && typeof imagePath === "object" && imagePath.path) {
      return getImageUrl(imagePath.path);
    }
    return null;
  };

  // Format order from API response
  const formatOrderFromAPI = (orderData) => {
    // Map API status to frontend status - preserve original status value
    const originalStatus = orderData.status?.toLowerCase() || "";
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
    const formattedItems = Array.isArray(orderData.items)
      ? orderData.items.map((item) => ({
          id: item.id || item.product_id || item.product?.id,
          name:
            item.product?.name ||
            item.name ||
            (i18n.language === "en" && item.product?.name_en
              ? item.product.name_en
              : item.product?.name) ||
            "",
          nameEn: item.product?.name_en || item.product?.nameEn || "",
          image: getImageUrl(
            item.product?.thumb_image ||
              item.product?.image ||
              item.image ||
              (Array.isArray(item.product?.images) &&
              item.product.images[0]?.path
                ? item.product.images[0].path
                : null)
          ),
          quantity: parseInt(item.quantity || 1),
          price: parseFloat(item.price || item.subtotal || 0),
          size: item.variant?.name || item.pack_size?.size || item.size || "",
        }))
      : [];

    // Format date from ISO string
    const formatDateFromISO = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
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
      } catch {
        return dateString;
      }
    };

    // Calculate subtotal from items
    const subtotal = formattedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      id: orderData.id?.toString() || `D${orderData.id}` || "",
      orderId: orderData.id, // Store original numeric ID for API calls
      status: statusMap[originalStatus] || originalStatus || "in-progress",
      originalStatus: originalStatus, // Store original API status
      date: formatDateFromISO(orderData.created_at || orderData.updated_at),
      deliveryDate: formatDateFromISO(orderData.expected_delivery_date),
      productCount: formattedItems.length,
      products: formattedItems,
      payment: {
        method:
          orderData.payment_method || t("orderDetail.paymentMethod") || "N/A",
        cardNumber: orderData.payment_card_number || "****",
      },
      // Transaction information
      transaction_id:
        orderData.transaction_id || orderData.transaction?.id || null,
      transaction: orderData.transaction || null,
      address: orderData.shipping_address
        ? {
            // Format address from API response
            type:
              orderData.shipping_address.name ||
              orderData.shipping_address.type ||
              t("addresses.home") ||
              "Home",
            location:
              [
                orderData.shipping_address.city,
                orderData.shipping_address.state,
                orderData.shipping_address.country,
              ]
                .filter(Boolean)
                .join(", ") || "",
            details: orderData.shipping_address.address || "",
            phone: orderData.shipping_address.phone || "",
            city: orderData.shipping_address.city || "",
            country: orderData.shipping_address.country || "",
            state: orderData.shipping_address.state || "",
            postal_code: orderData.shipping_address.postal_code || "",
            // Store full address object for reference
            fullAddress: orderData.shipping_address,
          }
        : {
            type: t("addresses.home") || "Home",
            location: "",
            details: "",
            phone: "",
            city: "",
            country: "",
            state: "",
            postal_code: "",
          },
      subtotal: subtotal,
      discount: parseFloat(
        orderData.discount || orderData.coupon_discount_value || 0
      ),
      delivery: parseFloat(orderData.shipping_cost || 0),
      total: parseFloat(orderData.final_total || orderData.total || 0),
      // Additional API fields
      payment_status: orderData.payment_status || "",
      shipping_address_id: orderData.shipping_address_id,
      billing_address_id: orderData.billing_address_id,
    };
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast(t("orderDetail.pleaseLogin"), "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Fetch order from API
  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated || !id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getOrderById(id);

        if (response.success && response.data) {
          let formattedOrder = formatOrderFromAPI(response.data);

          // If shipping_address is missing but we have shipping_address_id, fetch the address
          if (
            !formattedOrder.address?.details &&
            !formattedOrder.address?.city &&
            formattedOrder.shipping_address_id
          ) {
            try {
              const addressesResponse = await apiService.getAddresses();
              if (addressesResponse.success && addressesResponse.data) {
                const shippingAddress = addressesResponse.data.find(
                  (addr) => addr.id === formattedOrder.shipping_address_id
                );
                if (shippingAddress) {
                  formattedOrder.address = {
                    type:
                      shippingAddress.name ||
                      shippingAddress.type ||
                      t("addresses.home") ||
                      "Home",
                    location:
                      [
                        shippingAddress.city,
                        shippingAddress.state,
                        shippingAddress.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "",
                    details: shippingAddress.address || "",
                    phone: shippingAddress.phone || "",
                    city: shippingAddress.city || "",
                    country: shippingAddress.country || "",
                    state: shippingAddress.state || "",
                    postal_code: shippingAddress.postal_code || "",
                    fullAddress: shippingAddress,
                  };
                }
              }
            } catch (addrError) {
              console.warn("Could not fetch address details:", addrError);
              // Continue without address - order will still display
            }
          }

          setOrder(formattedOrder);
        } else {
          setError(
            response.message ||
              t("orderDetail.errorLoading") ||
              "Failed to load order"
          );
          showToast(
            response.message ||
              t("orderDetail.errorLoading") ||
              "Failed to load order",
            "error"
          );
          navigate("/orders");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        const errorMsg =
          t("orderDetail.errorLoading") || "Failed to load order";
        setError(errorMsg);
        showToast(errorMsg, "error");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, isAuthenticated, navigate, showToast, t]);

  // Cancel order handler - opens modal
  const handleCancelOrderClick = () => {
    setShowCancelModal(true);
  };

  // Cancel order confirmation handler
  // Note: reason parameter is collected from modal but not sent to API currently
  // as the API doesn't require it. Kept for potential future API enhancement.
  const handleCancelOrderConfirm = async (_reason) => {
    if (!order) return;

    // Extract numeric order ID
    const orderId = order.orderId || order.id;
    if (!orderId) {
      showToast(t("orderDetail.cancelFailed") || "Invalid order ID", "error");
      setShowCancelModal(false);
      return;
    }

    try {
      setIsCancelling(true);
      setShowCancelModal(false);

      const response = await apiService.cancelOrder(orderId);

      if (response.success) {
        showToast(
          response.message ||
            t("orderDetail.cancelSuccess") ||
            "Order cancelled successfully",
          "success"
        );

        // Refresh order data
        const refreshResponse = await apiService.getOrderById(orderId);
        if (refreshResponse.success && refreshResponse.data) {
          const formattedOrder = formatOrderFromAPI(refreshResponse.data);
          setOrder(formattedOrder);
        }

        // Navigate back to orders after a delay
        setTimeout(() => navigate("/orders"), 2000);
      } else {
        showToast(
          response.message ||
            t("orderDetail.cancelFailed") ||
            "Failed to cancel order",
          "error"
        );
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      showToast(
        t("orderDetail.cancelFailed") ||
          "Failed to cancel order. Please try again.",
        "error"
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/90 border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";

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
              {t("orderDetail.loading") || "Loading order details..."}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state or no order
  if (error || !order) {
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
              {t("orderDetail.errorLoading") || "Error loading order"}
            </h3>
            <p
              className={`text-base md:text-lg mb-6 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              {error || t("orderDetail.orderNotFound") || "Order not found"}
            </p>
            <Link
              to="/orders"
              className={`inline-block px-8 py-4 rounded-xl font-semibold text-base md:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 transform ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-light hover:to-luxury-gold text-luxury-brown-darker"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-light hover:to-luxury-gold text-white"
              }`}
            >
              {t("orderDetail.backToOrders")}
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const formatPrice = (price) => {
    return price.toLocaleString(i18n.language === "ar" ? "ar-AE" : "en-US");
  };
  const nestedPanelClasses = isDark
    ? "bg-luxury-brown-darker/75 border border-luxury-gold-dark/30 text-luxury-brown-light"
    : "bg-luxury-cream border border-luxury-gold-light/30 text-luxury-brown-text";

  const getStatusBadge = (status) => {
    const statusConfig = {
      "in-progress": {
        label: t("orders.status.inProgress"),
        bg: isDark ? "bg-amber-900/40" : "bg-amber-100",
        text: isDark ? "text-amber-300" : "text-amber-700",
        border: isDark ? "border-amber-600/60" : "border-amber-400/60",
        icon: (
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
            className="w-5 h-5"
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
            className="w-5 h-5"
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
        ),
      },
      pending: {
        label: t("orders.status.pending"),
        bg: isDark ? "bg-gray-700/40" : "bg-gray-100",
        text: isDark ? "text-gray-300" : "text-gray-700",
        border: isDark ? "border-gray-600/60" : "border-gray-400/60",
        icon: (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
    };

    const config = statusConfig[status] || statusConfig["in-progress"];

    return (
      <span
        className={`${config.bg} ${config.text} ${config.border} border-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm md:text-base font-bold flex items-center gap-2`}
      >
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div
          className={`flex flex-col md:flex-row ${
            i18n.language === "ar" ? "md:flex-row-reverse" : ""
          } md:items-center justify-between gap-4 mb-8 md:mb-12`}
        >
          <div className={i18n.language === "ar" ? "text-right" : "text-left"}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 md:mb-3">
              {t("orderDetail.title")}
            </h1>
            <p className="text-muted text-base md:text-lg">
              {t("orderDetail.orderNumber")}:{" "}
              <span className="text-amber-500 font-semibold">#{order.id}</span>
            </p>
          </div>
          <Link
            to="/orders"
            className={`text-amber-500 hover:text-amber-400 text-base md:text-lg font-medium transition-colors flex ${
              i18n.language === "ar" ? "flex-row-reverse" : ""
            } items-center gap-2`}
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
                d={
                  i18n.language === "ar"
                    ? "M14 5l7 7m0 0l-7 7m7-7H3"
                    : "M10 19l-7-7m0 0l7-7m-7 7h18"
                }
              />
            </svg>
            <span>{t("orderDetail.backToOrders")}</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Order Status Card */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg`}
            >
              <div
                className={`flex flex-col md:flex-row ${
                  i18n.language === "ar" ? "md:flex-row-reverse" : ""
                } md:items-center justify-between gap-4 mb-6`}
              >
                <div
                  className={
                    i18n.language === "ar" ? "text-right" : "text-left"
                  }
                >
                  <p className="text-muted text-sm md:text-base mb-2">
                    {t("orderDetail.orderDate")}
                  </p>
                  <p className="text-primary font-semibold text-base md:text-lg">
                    {order.date}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>
              {(order.status === "in-progress" ||
                order.status === "pending" ||
                order.status === "processing") &&
                order.status !== "cancelled" && (
                  <div
                    className={`bg-amber-900/10 border border-amber-700/30 rounded-xl p-4 md:p-5 flex ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    } items-start gap-3 md:gap-4`}
                  >
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-amber-500 flex-shrink-0 mt-0.5"
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
                    <div
                      className={
                        i18n.language === "ar" ? "text-right" : "text-left"
                      }
                    >
                      <p className="text-amber-400 font-semibold text-sm md:text-base mb-1">
                        {t("orderDetail.expectedDelivery")}:{" "}
                        {order.deliveryDate}
                      </p>
                      <p className="text-muted text-xs md:text-sm">
                        {t("orderDetail.statusUpdate")}
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Products List */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg`}
            >
              <div
                className={`flex ${
                  i18n.language === "ar" ? "flex-row-reverse" : ""
                } items-center gap-3 md:gap-4 mb-6 pb-4 border-b border-card`}
              >
                <h2
                  className={`text-primary font-bold text-xl md:text-2xl ${
                    i18n.language === "ar" ? "text-right" : "text-left"
                  } flex-1`}
                >
                  {t("orderDetail.items")} ({order.productCount})
                </h2>
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-amber-500 flex-shrink-0"
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
              </div>
              <div className="space-y-4 md:space-y-6">
                {order.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 md:gap-6 pb-4 md:pb-6 border-b border-card last:border-0 last:pb-0"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="text-amber-500 hover:text-amber-400 transition-colors p-2 hover:bg-amber-500/10 rounded-lg flex-shrink-0"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </Link>
                    <div
                      className={`flex-1 min-w-0 ${
                        i18n.language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <h3 className="text-primary font-semibold text-base md:text-lg mb-1 line-clamp-1">
                        {getTranslatedName(product)}
                      </h3>
                      <p className="text-muted text-sm md:text-base mb-2">
                        {t("orderDetail.size")}: {product.size}
                      </p>
                      <div
                        className={`flex items-center ${
                          i18n.language === "ar"
                            ? "justify-between"
                            : "justify-between"
                        }`}
                      >
                        <p className="text-amber-500 font-bold text-base md:text-lg">
                          {formatPrice(product.price * product.quantity)}{" "}
                          {t("orderDetail.currency")}
                        </p>
                        <p className="text-muted text-sm">
                          {t("orderDetail.quantity")}: {product.quantity}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`relative w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border ${
                        isDark
                          ? "bg-black border-luxury-gold-dark/40"
                          : "bg-luxury-cream border-luxury-gold-light/40"
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml;base64,${btoa(
                            '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="#9ca3af">No Image</text></svg>'
                          )}`;
                        }}
                      />
                      {product.quantity > 1 && (
                        <div className="absolute top-1 right-1 bg-amber-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                          {product.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg`}
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
                  {t("orderDetail.shippingAddress")}
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
                    {/* Address Type/Name */}
                    {order.address.type && (
                      <p className="text-primary font-semibold text-base md:text-lg mb-2">
                        {order.address.type}
                      </p>
                    )}

                    {/* Phone Number */}
                    {order.address.phone && (
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-4 h-4 text-muted"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <p className="text-secondary text-sm md:text-base">
                          {order.address.phone}
                        </p>
                      </div>
                    )}

                    {/* Street Address */}
                    {order.address.details && (
                      <p className="text-secondary text-sm md:text-base mb-2">
                        {order.address.details}
                      </p>
                    )}

                    {/* City, State, Country */}
                    {(order.address.city ||
                      order.address.state ||
                      order.address.country) && (
                      <p className="text-secondary text-sm md:text-base mb-2">
                        {[
                          order.address.city,
                          order.address.state,
                          order.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    {/* Postal Code */}
                    {order.address.postal_code && (
                      <p className="text-muted text-sm">
                        {t("addresses.postalCode") || "Postal Code"}:{" "}
                        {order.address.postal_code}
                      </p>
                    )}

                    {/* Fallback: Show location if address fields are not available */}
                    {!order.address.details &&
                      !order.address.city &&
                      order.address.location && (
                        <p className="text-secondary text-sm md:text-base">
                          {order.address.location}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* Order Summary */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg lg:sticky lg:top-24`}
            >
              <h3
                className={`text-primary font-bold text-xl md:text-2xl mb-6 pb-4 border-b border-card ${
                  i18n.language === "ar" ? "text-right" : "text-left"
                }`}
              >
                {t("orderDetail.orderSummary")}
              </h3>
              <div className="space-y-4 md:space-y-5">
                <div
                  className={`flex ${
                    i18n.language === "ar" ? "flex-row-reverse" : ""
                  } justify-between text-secondary text-base md:text-lg`}
                >
                  <span>{t("orderDetail.subtotal")}</span>
                  <span>
                    {formatPrice(order.subtotal)} {t("orderDetail.currency")}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div
                    className={`flex ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    } justify-between text-green-400 text-base md:text-lg font-semibold`}
                  >
                    <span>{t("orderDetail.discount")}</span>
                    <span>
                      -{formatPrice(order.discount)} {t("orderDetail.currency")}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${
                    i18n.language === "ar" ? "flex-row-reverse" : ""
                  } justify-between text-secondary text-base md:text-lg`}
                >
                  <span>{t("orderDetail.shipping")}</span>
                  <span>
                    {formatPrice(order.delivery)} {t("orderDetail.currency")}
                  </span>
                </div>
                <div
                  className={`border-t border-card pt-4 md:pt-5 flex ${
                    i18n.language === "ar" ? "flex-row-reverse" : ""
                  } justify-between text-primary font-bold text-xl md:text-2xl`}
                >
                  <span>{t("orderDetail.total")}</span>
                  <span className="text-amber-500">
                    {formatPrice(order.total)} {t("orderDetail.currency")}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Link (if available) */}
            {order.transaction_id && (
              <div
                className={`${nestedPanelClasses} rounded-2xl p-6 md:p-8 mb-6`}
              >
                <h3
                  className={`text-xl md:text-2xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-luxury-brown-text"
                  }`}
                >
                  {t("orderDetail.transaction") || "Transaction"}
                </h3>
                <Link
                  to={`/transaction/${order.transaction_id}`}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-luxury-gold-dark/20 hover:bg-luxury-gold-dark/30 text-luxury-gold-light border border-luxury-gold-dark/40"
                      : "bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold border border-luxury-gold-light/40"
                  } hover:scale-105 transform`}
                >
                  {t("orderDetail.viewTransaction") || "View Transaction"} #
                  {order.transaction_id}
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            )}

            {/* Payment Details */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg`}
            >
              <div
                className={`flex ${
                  i18n.language === "ar" ? "flex-row-reverse" : ""
                } items-center gap-3 md:gap-4 mb-6`}
              >
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
                <h3
                  className={`text-primary font-bold text-lg md:text-xl ${
                    i18n.language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t("orderDetail.paymentDetails")}
                </h3>
              </div>
              <div className="space-y-4">
                <div
                  className={
                    i18n.language === "ar" ? "text-right" : "text-left"
                  }
                >
                  <p className="text-muted text-sm md:text-base mb-2">
                    {t("orderDetail.paymentMethod")}
                  </p>
                  <p className="text-primary font-semibold text-base md:text-lg">
                    {order.payment.method}
                  </p>
                </div>
                <div
                  className={
                    i18n.language === "ar" ? "text-right" : "text-left"
                  }
                >
                  <p className="text-muted text-sm md:text-base mb-2">
                    {t("orderDetail.cardDetails")}
                  </p>
                  <p className="text-primary font-medium text-base md:text-lg ltr">
                    {order.payment.cardNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 md:space-y-4">
              {/* Show action buttons only for active orders (not cancelled or completed) */}
              {(order.status === "in-progress" ||
                order.status === "pending" ||
                order.status === "processing") &&
                order.status !== "cancelled" && (
                  <>
                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg hover:from-amber-700 hover:to-amber-900 transition-all shadow-2xl hover:shadow-amber-900/50 hover:scale-[1.02] transform duration-300 focus:outline-none focus:ring-4 focus:ring-amber-700/50 flex items-center justify-center gap-2"
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>{t("orderDetail.trackOrder")}</span>
                    </button>
                    <button
                      onClick={handleCancelOrderClick}
                      disabled={isCancelling}
                      className={`w-full py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 hover:scale-[1.02] transform border-2 ${
                        isDark
                          ? "bg-red-900/30 hover:bg-red-900/40 text-red-300 border-red-600/50 disabled:opacity-50"
                          : "bg-red-100 hover:bg-red-200 text-red-700 border-red-400/60 disabled:opacity-50"
                      } flex items-center justify-center gap-2`}
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
                      <span>{t("orderDetail.cancel")}</span>
                    </button>
                  </>
                )}
              <Link
                to="/products"
                className={`block w-full text-center py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 hover:scale-[1.02] transform border ${
                  isDark
                    ? "bg-luxury-brown-darker/70 text-luxury-brown-light hover:bg-luxury-brown-darker/50 border-luxury-gold-dark/40"
                    : "bg-white text-luxury-brown-text hover:bg-luxury-cream border-luxury-gold-light/40"
                }`}
              >
                {t("orderDetail.continueShopping")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrderConfirm}
        orderNumber={order?.id || ""}
        isLoading={isCancelling}
      />
    </PageLayout>
  );
};

export default OrderDetail;
