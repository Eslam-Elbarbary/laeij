import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";

const BookingListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [bookingList, setBookingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(1);

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
    return null;
  };

  // Format booking list from API response
  const formatBookingListFromAPI = (bookingListData) => {
    const statusMap = {
      active: "active",
      pending: "pending",
      cancelled: "cancelled",
      completed: "completed",
    };

    return {
      id: bookingListData.id,
      product_id: bookingListData.product_id || bookingListData.product?.id,
      product: bookingListData.product || null,
      quantity: bookingListData.quantity || 1,
      status:
        statusMap[bookingListData.status?.toLowerCase()] ||
        bookingListData.status ||
        "active",
      originalStatus: bookingListData.status,
      date: bookingListData.created_at || new Date().toISOString(),
      updated_at: bookingListData.updated_at || bookingListData.created_at,
      price: bookingListData.price || bookingListData.product?.price || 0,
      total:
        bookingListData.total ||
        (bookingListData.quantity || 1) *
          (bookingListData.price || bookingListData.product?.price || 0),
    };
  };

  // Format date
  const formatDate = (dateString) => {
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      showToast(
        t("bookingLists.pleaseLogin") || "Please login to view booking list",
        "error"
      );
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Fetch booking list from API
  useEffect(() => {
    const fetchBookingList = async () => {
      if (!isAuthenticated || !id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getBookingListById(id);

        if (response.success && response.data) {
          const formattedBookingList = formatBookingListFromAPI(response.data);
          setBookingList(formattedBookingList);
          setQuantity(formattedBookingList.quantity);
        } else {
          setError(
            response.message ||
              t("bookingLists.errorLoading") ||
              "Failed to load booking list"
          );
        }
      } catch (err) {
        console.error("Error fetching booking list:", err);
        setError(
          t("bookingLists.errorLoading") || "Failed to load booking list"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookingList();
  }, [id, isAuthenticated, navigate, showToast, t]);

  // Handle update quantity
  const handleUpdateQuantity = async () => {
    if (!bookingList || quantity === bookingList.quantity) return;
    if (quantity < 1) {
      showToast(
        t("bookingLists.quantityMin") || "Quantity must be at least 1",
        "error"
      );
      return;
    }

    setIsUpdating(true);

    try {
      const response = await apiService.updateBookingList(
        id,
        quantity,
        bookingList.product_id
      );

      if (response.success) {
        showToast(
          response.message || t("bookingLists.updateSuccess"),
          "success"
        );
        // Refresh booking list data
        const refreshResponse = await apiService.getBookingListById(id);
        if (refreshResponse.success && refreshResponse.data) {
          setBookingList(formatBookingListFromAPI(refreshResponse.data));
        }
      } else {
        showToast(response.message || t("bookingLists.updateFailed"), "error");
      }
    } catch (err) {
      console.error("Error updating booking list:", err);
      showToast(t("bookingLists.updateFailed"), "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cancel booking list
  const handleCancel = async () => {
    if (
      !window.confirm(
        t("bookingLists.cancelConfirm") ||
          "Are you sure you want to cancel this booking list?"
      )
    ) {
      return;
    }

    try {
      const response = await apiService.cancelBookingList(id);

      if (response.success) {
        showToast(
          response.message || t("bookingLists.cancelSuccess"),
          "success"
        );
        // Refresh booking list data
        const refreshResponse = await apiService.getBookingListById(id);
        if (refreshResponse.success && refreshResponse.data) {
          setBookingList(formatBookingListFromAPI(refreshResponse.data));
        }
      } else {
        showToast(response.message || t("bookingLists.cancelFailed"), "error");
      }
    } catch (err) {
      console.error("Error cancelling booking list:", err);
      showToast(t("bookingLists.cancelFailed"), "error");
    }
  };

  // Handle delete booking list
  const handleDelete = async () => {
    if (
      !window.confirm(
        t("bookingLists.deleteConfirm") ||
          "Are you sure you want to delete this booking list?"
      )
    ) {
      return;
    }

    try {
      const response = await apiService.deleteBookingList(id);

      if (response.success) {
        showToast(
          response.message || t("bookingLists.deleteSuccess"),
          "success"
        );
        navigate("/booking-lists");
      } else {
        showToast(response.message || t("bookingLists.deleteFailed"), "error");
      }
    } catch (err) {
      console.error("Error deleting booking list:", err);
      showToast(t("bookingLists.deleteFailed"), "error");
    }
  };

  // Get status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        label: t("bookingLists.status.active"),
        bg: isDark ? "bg-green-900/40" : "bg-green-100",
        text: isDark ? "text-green-300" : "text-green-700",
        border: isDark ? "border-green-600/60" : "border-green-400/60",
      },
      pending: {
        label: t("bookingLists.status.pending"),
        bg: isDark ? "bg-yellow-900/40" : "bg-yellow-100",
        text: isDark ? "text-yellow-300" : "text-yellow-700",
        border: isDark ? "border-yellow-600/60" : "border-yellow-400/60",
      },
      cancelled: {
        label: t("bookingLists.status.cancelled"),
        bg: isDark ? "bg-red-900/40" : "bg-red-100",
        text: isDark ? "text-red-300" : "text-red-700",
        border: isDark ? "border-red-600/60" : "border-red-400/60",
      },
      completed: {
        label: t("bookingLists.status.completed"),
        bg: isDark ? "bg-blue-900/40" : "bg-blue-100",
        text: isDark ? "text-blue-300" : "text-blue-700",
        border: isDark ? "border-blue-600/60" : "border-blue-400/60",
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.label}
      </span>
    );
  };

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/95 backdrop-blur-md border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";

  const nestedPanelClasses = isDark
    ? "bg-luxury-brown-darker/75 border border-luxury-gold-dark/30 text-luxury-brown-light"
    : "bg-luxury-cream border border-luxury-gold-light/30 text-luxury-brown-text";

  const inputClasses = isDark
    ? "bg-luxury-brown-darker/80 text-luxury-brown-light placeholder-luxury-brown-light/60 border border-luxury-gold-dark/40 focus:border-luxury-gold"
    : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border border-luxury-gold-light/60 focus:border-luxury-gold";

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
          <div className="space-y-6">
            <div className="h-16 bg-gray-700/50 rounded-lg w-64 animate-pulse"></div>
            <div className={`${panelClasses} rounded-2xl p-8 animate-pulse`}>
              <div className="h-6 bg-gray-700/50 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !bookingList) {
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
              {t("bookingLists.errorLoading") || "Error loading booking list"}
            </h3>
            <p
              className={`mb-6 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              {error || t("bookingLists.notFound") || "Booking list not found"}
            </p>
            <button
              onClick={() => navigate("/booking-lists")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
              } hover:scale-105 transform shadow-lg hover:shadow-xl`}
            >
              {t("bookingLists.backToBookingLists") || "Back to Booking Lists"}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const productImage =
    bookingList.product?.thumb_image ||
    bookingList.product?.image ||
    bookingList.product?.images?.[0]?.path;
  const imageUrl = getImageUrl(productImage);
  const productName =
    bookingList.product?.name ||
    bookingList.product?.nameEn ||
    t("bookingLists.product") ||
    "Product";

  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/booking-lists")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              isDark
                ? "text-luxury-brown-light hover:text-luxury-gold-light hover:bg-luxury-brown-darker/60"
                : "text-luxury-brown-text hover:text-luxury-gold hover:bg-luxury-gold/10"
            }`}
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
                d={i18n.language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
              />
            </svg>
            {t("bookingLists.backToBookingLists") || "Back to Booking Lists"}
          </button>
        </div>

        {/* Booking List Details Card */}
        <div
          className={`${panelClasses} rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl mb-6`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1
                  className={`text-2xl md:text-3xl font-bold ${
                    isDark ? "text-white" : "text-luxury-brown-text"
                  }`}
                >
                  {t("bookingLists.bookingList") || "Booking List"} #
                  {bookingList.id}
                </h1>
                {getStatusBadge(bookingList.status)}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-luxury-gold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span
                    className={
                      isDark
                        ? "text-luxury-brown-light/70"
                        : "text-luxury-brown-text/60"
                    }
                  >
                    {t("bookingLists.created") || "Created"}:{" "}
                    {formatDate(bookingList.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Product Image */}
            {imageUrl && (
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <img
                  src={imageUrl}
                  alt={productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}

            {/* Product Details */}
            <div>
              <h2
                className={`text-xl md:text-2xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {productName}
              </h2>
              {bookingList.product && (
                <Link
                  to={`/product/${bookingList.product.id}`}
                  className={`inline-block mb-4 text-sm font-semibold transition-colors ${
                    isDark
                      ? "text-luxury-gold-light hover:text-luxury-gold"
                      : "text-luxury-gold hover:text-luxury-gold-dark"
                  }`}
                >
                  {t("bookingLists.viewProduct") || "View Product"} →
                </Link>
              )}

              {/* Quantity Update */}
              {bookingList.status !== "cancelled" &&
                bookingList.status !== "completed" && (
                  <div className="mb-6">
                    <label
                      className={`block text-base font-semibold mb-2 ${
                        isDark
                          ? "text-luxury-brown-light"
                          : "text-luxury-brown-text"
                      }`}
                    >
                      {t("bookingLists.quantity") || "Quantity"}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(parseInt(e.target.value) || 1)
                        }
                        className={`w-24 px-4 py-2 rounded-xl ${inputClasses}`}
                      />
                      <button
                        onClick={handleUpdateQuantity}
                        disabled={
                          isUpdating || quantity === bookingList.quantity
                        }
                        className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                          isDark
                            ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                            : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
                        } hover:scale-105 transform shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isUpdating
                          ? t("bookingLists.updating") || "Updating..."
                          : t("bookingLists.update") || "Update"}
                      </button>
                    </div>
                  </div>
                )}

              {/* Price Info */}
              <div className={`${nestedPanelClasses} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`${
                      isDark
                        ? "text-luxury-brown-light/70"
                        : "text-luxury-brown-text/60"
                    }`}
                  >
                    {t("bookingLists.unitPrice") || "Unit Price"}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                    }`}
                  >
                    {parseFloat(bookingList.price || 0).toLocaleString(
                      i18n.language === "ar" ? "ar-AE" : "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}{" "}
                    {t("common.currency") || "AED"}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`${
                      isDark
                        ? "text-luxury-brown-light/70"
                        : "text-luxury-brown-text/60"
                    }`}
                  >
                    {t("bookingLists.quantity") || "Quantity"}
                  </span>
                  <span
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-luxury-brown-text"
                    }`}
                  >
                    {bookingList.quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-luxury-gold-dark/20">
                  <span
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-luxury-brown-text"
                    }`}
                  >
                    {t("bookingLists.total") || "Total"}
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                    }`}
                  >
                    {parseFloat(bookingList.total || 0).toLocaleString(
                      i18n.language === "ar" ? "ar-AE" : "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}{" "}
                    {t("common.currency") || "AED"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {bookingList.status !== "cancelled" &&
            bookingList.status !== "completed" && (
              <div className="flex items-center gap-4 pt-6 border-t border-luxury-gold-dark/20">
                <button
                  onClick={handleCancel}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300 border border-yellow-600/60"
                      : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-400/60"
                  }`}
                >
                  {t("bookingLists.cancel") || "Cancel Booking"}
                </button>
                <button
                  onClick={handleDelete}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-600/60"
                      : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-400/60"
                  }`}
                >
                  {t("bookingLists.delete") || "Delete"}
                </button>
              </div>
            )}
        </div>
      </div>
    </PageLayout>
  );
};

export default BookingListDetail;
