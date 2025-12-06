import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";
import CreateBookingListModal from "../components/CreateBookingListModal";

const BookingLists = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [bookingLists, setBookingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingBookingListId, setDeletingBookingListId] = useState(null);
  const hasShownToast = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        showToast(
          t("bookingLists.pleaseLogin") ||
            "Please login to view your booking lists",
          "error"
        );
      }
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

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

  // Helper function to format booking list from API response
  const formatBookingListFromAPI = (bookingList) => {
    const statusMap = {
      active: "active",
      pending: "pending",
      cancelled: "cancelled",
      completed: "completed",
    };

    return {
      id: bookingList.id,
      product_id: bookingList.product_id || bookingList.product?.id,
      product: bookingList.product || null,
      quantity: bookingList.quantity || 1,
      status:
        statusMap[bookingList.status?.toLowerCase()] ||
        bookingList.status ||
        "active",
      originalStatus: bookingList.status,
      date:
        bookingList.created_at ||
        bookingList.updated_at ||
        new Date().toISOString(),
      updated_at: bookingList.updated_at || bookingList.created_at,
      price: bookingList.price || bookingList.product?.price || 0,
      total:
        bookingList.total ||
        (bookingList.quantity || 1) *
          (bookingList.price || bookingList.product?.price || 0),
    };
  };

  // Fetch booking lists from API
  useEffect(() => {
    const fetchBookingLists = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getBookingLists();

        console.log("📋 Booking Lists API Response:", response);

        if (response.success) {
          // Handle different response structures
          let bookingListsArray = [];
          if (Array.isArray(response.data)) {
            bookingListsArray = response.data;
          } else if (response.data && typeof response.data === "object") {
            if (Array.isArray(response.data.booking_lists)) {
              bookingListsArray = response.data.booking_lists;
            } else if (Array.isArray(response.data.data)) {
              bookingListsArray = response.data.data;
            }
          }

          const formattedBookingLists = bookingListsArray.map(
            formatBookingListFromAPI
          );
          // Sort by date (newest first)
          formattedBookingLists.sort((a, b) => {
            try {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
              return dateB - dateA;
            } catch {
              return 0;
            }
          });

          console.log(
            "📋 Formatted Booking Lists Count:",
            formattedBookingLists.length
          );
          setBookingLists(formattedBookingLists);

          if (formattedBookingLists.length === 0) {
            console.log(
              "ℹ️ No booking lists found - this is normal if you haven't created any yet"
            );
          }
        } else {
          console.warn("⚠️ Booking Lists API returned error:", response);
          setError(response.message || t("bookingLists.errorLoading"));
          setBookingLists([]);
        }
      } catch (err) {
        console.error("Error fetching booking lists:", err);
        setError(t("bookingLists.errorLoading"));
        setBookingLists([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBookingLists();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, t]);

  // Handle booking list creation success
  const handleBookingListCreated = () => {
    setShowCreateModal(false);
    // Refresh booking lists list
    const fetchBookingLists = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await apiService.getBookingLists();
        if (response.success) {
          let bookingListsArray = [];
          if (Array.isArray(response.data)) {
            bookingListsArray = response.data;
          } else if (response.data && typeof response.data === "object") {
            if (Array.isArray(response.data.booking_lists)) {
              bookingListsArray = response.data.booking_lists;
            } else if (Array.isArray(response.data.data)) {
              bookingListsArray = response.data.data;
            }
          }
          const formattedBookingLists = bookingListsArray.map(
            formatBookingListFromAPI
          );
          formattedBookingLists.sort((a, b) => {
            try {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
              return dateB - dateA;
            } catch {
              return 0;
            }
          });
          setBookingLists(formattedBookingLists);
        }
      } catch (err) {
        console.error("Error refreshing booking lists:", err);
      }
    };
    fetchBookingLists();
  };

  // Handle booking list deletion
  const handleDeleteBookingList = async (bookingListId) => {
    if (
      !window.confirm(
        t("bookingLists.deleteConfirm") ||
          "Are you sure you want to delete this booking list?"
      )
    ) {
      return;
    }

    try {
      setDeletingBookingListId(bookingListId);
      const response = await apiService.deleteBookingList(bookingListId);

      if (response.success) {
        showToast(
          response.message || t("bookingLists.deleteSuccess"),
          "success"
        );
        // Remove booking list from list
        setBookingLists(bookingLists.filter((b) => b.id !== bookingListId));
      } else {
        showToast(response.message || t("bookingLists.deleteFailed"), "error");
      }
    } catch (err) {
      console.error("Error deleting booking list:", err);
      showToast(t("bookingLists.deleteFailed"), "error");
    } finally {
      setDeletingBookingListId(null);
    }
  };

  // Handle booking list cancellation
  const handleCancelBookingList = async (bookingListId) => {
    if (
      !window.confirm(
        t("bookingLists.cancelConfirm") ||
          "Are you sure you want to cancel this booking list?"
      )
    ) {
      return;
    }

    try {
      const response = await apiService.cancelBookingList(bookingListId);

      if (response.success) {
        showToast(
          response.message || t("bookingLists.cancelSuccess"),
          "success"
        );
        // Refresh booking lists
        const refreshResponse = await apiService.getBookingLists();
        if (refreshResponse.success) {
          let bookingListsArray = [];
          if (Array.isArray(refreshResponse.data)) {
            bookingListsArray = refreshResponse.data;
          } else if (
            refreshResponse.data &&
            typeof refreshResponse.data === "object"
          ) {
            if (Array.isArray(refreshResponse.data.booking_lists)) {
              bookingListsArray = refreshResponse.data.booking_lists;
            } else if (Array.isArray(refreshResponse.data.data)) {
              bookingListsArray = refreshResponse.data.data;
            }
          }
          const formattedBookingLists = bookingListsArray.map(
            formatBookingListFromAPI
          );
          formattedBookingLists.sort((a, b) => {
            try {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
              return dateB - dateA;
            } catch {
              return 0;
            }
          });
          setBookingLists(formattedBookingLists);
        }
      } else {
        showToast(response.message || t("bookingLists.cancelFailed"), "error");
      }
    } catch (err) {
      console.error("Error cancelling booking list:", err);
      showToast(t("bookingLists.cancelFailed"), "error");
    }
  };

  // Filter booking lists by status
  const filteredBookingLists =
    activeTab === "all"
      ? bookingLists
      : activeTab === "active"
      ? bookingLists.filter(
          (b) => b.status === "active" || b.status === "pending"
        )
      : activeTab === "cancelled"
      ? bookingLists.filter((b) => b.status === "cancelled")
      : activeTab === "completed"
      ? bookingLists.filter((b) => b.status === "completed")
      : bookingLists;

  // Get status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        label: t("bookingLists.status.active"),
        icon: "✓",
        bg: isDark ? "bg-green-900/40" : "bg-green-100",
        text: isDark ? "text-green-300" : "text-green-700",
        border: isDark ? "border-green-600/60" : "border-green-400/60",
      },
      pending: {
        label: t("bookingLists.status.pending"),
        icon: "⏳",
        bg: isDark ? "bg-yellow-900/40" : "bg-yellow-100",
        text: isDark ? "text-yellow-300" : "text-yellow-700",
        border: isDark ? "border-yellow-600/60" : "border-yellow-400/60",
      },
      cancelled: {
        label: t("bookingLists.status.cancelled"),
        icon: "✕",
        bg: isDark ? "bg-red-900/40" : "bg-red-100",
        text: isDark ? "text-red-300" : "text-red-700",
        border: isDark ? "border-red-600/60" : "border-red-400/60",
      },
      completed: {
        label: t("bookingLists.status.completed"),
        icon: "✓",
        bg: isDark ? "bg-blue-900/40" : "bg-blue-100",
        text: isDark ? "text-blue-300" : "text-blue-700",
        border: isDark ? "border-blue-600/60" : "border-blue-400/60",
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
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
          month: "short",
          year: "numeric",
        });
      } else {
        return date.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      return dateString;
    }
  };

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/95 backdrop-blur-md border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";

  const nestedPanelClasses = isDark
    ? "bg-luxury-brown-darker/75 border border-luxury-gold-dark/30 text-luxury-brown-light"
    : "bg-luxury-cream border border-luxury-gold-light/30 text-luxury-brown-text";

  if (!isAuthenticated) {
    return null;
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center ${
                  isDark
                    ? "bg-gradient-to-br from-luxury-gold-dark/20 to-luxury-gold/20 border border-luxury-gold-dark/30"
                    : "bg-gradient-to-br from-luxury-gold/10 to-luxury-gold-light/10 border border-luxury-gold-light/30"
                }`}
              >
                <svg
                  className={`w-8 h-8 md:w-10 md:h-10 ${
                    isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                  }`}
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
              </div>
              <div>
                <h1
                  className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-luxury-brown-text"
                  }`}
                >
                  {t("bookingLists.title") || "Booking Lists"}
                </h1>
                <p
                  className={`text-sm md:text-base ${
                    isDark
                      ? "text-luxury-brown-light/70"
                      : "text-luxury-brown-text/60"
                  }`}
                >
                  {t("bookingLists.subtitle") ||
                    "Manage your product bookings and reservations"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
              } hover:scale-105 transform shadow-lg hover:shadow-xl`}
            >
              {t("bookingLists.createBookingList") || "+ Add Booking"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: t("bookingLists.tabs.all") || "All" },
            {
              key: "active",
              label: t("bookingLists.tabs.active") || "Active",
            },
            {
              key: "cancelled",
              label: t("bookingLists.tabs.cancelled") || "Cancelled",
            },
            {
              key: "completed",
              label: t("bookingLists.tabs.completed") || "Completed",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.key
                  ? isDark
                    ? "bg-luxury-gold text-luxury-brown-darker"
                    : "bg-luxury-gold text-white"
                  : isDark
                  ? "bg-luxury-brown-darker/60 text-luxury-brown-light hover:bg-luxury-brown-darker/80"
                  : "bg-luxury-cream/60 text-luxury-brown-text hover:bg-luxury-cream/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`${panelClasses} rounded-2xl p-6 animate-pulse`}
              >
                <div className="h-6 bg-gray-700/50 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
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
              {t("bookingLists.errorLoading") || "Error loading booking lists"}
            </h3>
            <p
              className={`${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              {error}
            </p>
          </div>
        )}

        {/* Booking Lists List */}
        {!loading && !error && (
          <>
            {filteredBookingLists.length === 0 ? (
              <div
                className={`${panelClasses} backdrop-blur-sm rounded-2xl p-12 md:p-16 text-center shadow-lg`}
              >
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    isDark ? "bg-gray-700/20" : "bg-gray-100"
                  }`}
                >
                  <svg
                    className={`w-10 h-10 md:w-12 md:h-12 ${
                      isDark ? "text-gray-400" : "text-gray-600"
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
                  {t("bookingLists.noBookingLists") || "No booking lists found"}
                </h3>
                <p
                  className={`mb-6 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text/70"
                  }`}
                >
                  {t("bookingLists.noBookingListsDescription") ||
                    "You haven't created any booking lists yet."}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                      : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
                  } hover:scale-105 transform shadow-lg hover:shadow-xl`}
                >
                  {t("bookingLists.createBookingList") || "+ Add Booking"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookingLists.map((bookingList) => {
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
                    <div
                      key={bookingList.id}
                      className={`${panelClasses} rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      {/* Product Image */}
                      {imageUrl && (
                        <Link to={`/booking-list/${bookingList.id}`}>
                          <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
                            <img
                              src={imageUrl}
                              alt={productName}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                        </Link>
                      )}

                      {/* Product Info */}
                      <div className="mb-4">
                        <Link to={`/booking-list/${bookingList.id}`}>
                          <h3
                            className={`text-lg font-bold mb-2 hover:text-luxury-gold transition-colors ${
                              isDark ? "text-white" : "text-luxury-brown-text"
                            }`}
                          >
                            {productName}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm ${
                              isDark
                                ? "text-luxury-brown-light/70"
                                : "text-luxury-brown-text/60"
                            }`}
                          >
                            {t("bookingLists.quantity") || "Quantity"}:{" "}
                            <span className="font-semibold">
                              {bookingList.quantity}
                            </span>
                          </span>
                          {getStatusBadge(bookingList.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-lg font-bold ${
                              isDark
                                ? "text-luxury-gold-light"
                                : "text-luxury-gold"
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
                        <p
                          className={`text-xs mt-2 ${
                            isDark
                              ? "text-luxury-brown-light/60"
                              : "text-luxury-brown-text/50"
                          }`}
                        >
                          {formatDate(bookingList.date)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t border-luxury-gold-dark/20">
                        <Link
                          to={`/booking-list/${bookingList.id}`}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-center transition-all duration-300 ${
                            isDark
                              ? "bg-luxury-brown-darker/60 hover:bg-luxury-brown-darker/80 text-luxury-brown-light"
                              : "bg-luxury-cream/60 hover:bg-luxury-cream/80 text-luxury-brown-text"
                          }`}
                        >
                          {t("bookingLists.view") || "View"}
                        </Link>
                        {bookingList.status !== "cancelled" &&
                          bookingList.status !== "completed" && (
                            <>
                              <button
                                onClick={() =>
                                  handleCancelBookingList(bookingList.id)
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                  isDark
                                    ? "bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300"
                                    : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                                }`}
                              >
                                {t("bookingLists.cancel") || "Cancel"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteBookingList(bookingList.id)
                                }
                                disabled={
                                  deletingBookingListId === bookingList.id
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                  isDark
                                    ? "bg-red-900/40 hover:bg-red-900/60 text-red-300"
                                    : "bg-red-100 hover:bg-red-200 text-red-700"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {deletingBookingListId === bookingList.id ? (
                                  <svg
                                    className="w-4 h-4 animate-spin"
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
                                ) : (
                                  "✕"
                                )}
                              </button>
                            </>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Create Booking List Modal */}
        {showCreateModal && (
          <CreateBookingListModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleBookingListCreated}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default BookingLists;
