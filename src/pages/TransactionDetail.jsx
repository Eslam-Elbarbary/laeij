import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const hasShownToast = useRef(false);

  // Format transaction from API response
  const formatTransactionFromAPI = (transactionData) => {
    const statusMap = {
      paid: "paid",
      pending: "pending",
      failed: "failed",
      cancelled: "cancelled",
      refunded: "refunded",
    };

    return {
      id: transactionData.id,
      orderId: transactionData.order_id || transactionData.order?.id,
      paymentMethod: transactionData.payment_method || "N/A",
      amount: parseFloat(transactionData.amount || 0),
      currency: transactionData.currency || "AED",
      status:
        statusMap[transactionData.status?.toLowerCase()] ||
        transactionData.status ||
        "pending",
      originalStatus: transactionData.status,
      date:
        transactionData.created_at ||
        transactionData.updated_at ||
        new Date().toISOString(),
      order: transactionData.order || null,
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

  // Format currency
  const formatCurrency = (amount, currency) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast(t("transactions.pleaseLogin"), "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Fetch transaction from API
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!isAuthenticated || !id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getTransactionById(id);

        if (response.success && response.data) {
          const formattedTransaction = formatTransactionFromAPI(response.data);
          setTransaction(formattedTransaction);
        } else {
          setError(response.message || t("transactions.errorLoading"));
        }
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError(t("transactions.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, isAuthenticated, navigate, showToast, t]);

  // Handle payment
  const handlePay = async () => {
    if (!transaction || isPaying) return;

    try {
      setIsPaying(true);
      const response = await apiService.payTransaction(transaction.id);

      if (response.success) {
        showToast(
          response.message || t("transactions.paymentSuccess"),
          "success"
        );
        // Refresh transaction data
        const refreshResponse = await apiService.getTransactionById(
          transaction.id
        );
        if (refreshResponse.success && refreshResponse.data) {
          setTransaction(formatTransactionFromAPI(refreshResponse.data));
        }
      } else {
        showToast(response.message || t("transactions.paymentFailed"), "error");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      showToast(t("transactions.paymentFailed"), "error");
    } finally {
      setIsPaying(false);
    }
  };

  // Get status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        label: t("transactions.status.paid"),
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
      pending: {
        label: t("transactions.status.pending"),
        bg: isDark ? "bg-yellow-900/40" : "bg-yellow-100",
        text: isDark ? "text-yellow-300" : "text-yellow-700",
        border: isDark ? "border-yellow-600/60" : "border-yellow-400/60",
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
      failed: {
        label: t("transactions.status.failed"),
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
      cancelled: {
        label: t("transactions.status.cancelled"),
        bg: isDark ? "bg-gray-900/40" : "bg-gray-100",
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ),
      },
      refunded: {
        label: t("transactions.status.refunded"),
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ),
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {config.label}
      </div>
    );
  };

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/95 backdrop-blur-md border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";

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

  if (error || !transaction) {
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
              {t("transactions.errorLoading") || "Error loading transaction"}
            </h3>
            <p
              className={`${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              } mb-6`}
            >
              {error || t("transactions.notFound") || "Transaction not found"}
            </p>
            <button
              onClick={() => navigate("/transactions")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
              } hover:scale-105 transform shadow-lg hover:shadow-xl`}
            >
              {t("transactions.backToTransactions") || "Back to Transactions"}
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
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/transactions")}
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
            {t("transactions.backToTransactions") || "Back to Transactions"}
          </button>
        </div>

        {/* Transaction Details Card */}
        <div
          className={`${panelClasses} rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl mb-6`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h1
                className={`text-3xl md:text-4xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {t("transactions.transaction")} #{transaction.id}
              </h1>
              {getStatusBadge(transaction.status)}
            </div>
            {transaction.status === "pending" && (
              <button
                onClick={handlePay}
                disabled={isPaying}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                    : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
                } hover:scale-105 transform shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPaying
                  ? t("transactions.processing") || "Processing..."
                  : t("transactions.payNow") || "Pay Now"}
              </button>
            )}
          </div>

          {/* Transaction Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p
                className={`text-sm mb-2 ${
                  isDark
                    ? "text-luxury-brown-light/70"
                    : "text-luxury-brown-text/60"
                }`}
              >
                {t("transactions.amount") || "Amount"}
              </p>
              <p
                className={`text-2xl md:text-3xl font-bold ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>
            <div>
              <p
                className={`text-sm mb-2 ${
                  isDark
                    ? "text-luxury-brown-light/70"
                    : "text-luxury-brown-text/60"
                }`}
              >
                {t("transactions.paymentMethod") || "Payment Method"}
              </p>
              <p
                className={`text-lg md:text-xl ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {transaction.paymentMethod}
              </p>
            </div>
            <div>
              <p
                className={`text-sm mb-2 ${
                  isDark
                    ? "text-luxury-brown-light/70"
                    : "text-luxury-brown-text/60"
                }`}
              >
                {t("transactions.date") || "Date"}
              </p>
              <p
                className={`text-lg md:text-xl ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {formatDate(transaction.date)}
              </p>
            </div>
            <div>
              <p
                className={`text-sm mb-2 ${
                  isDark
                    ? "text-luxury-brown-light/70"
                    : "text-luxury-brown-text/60"
                }`}
              >
                {t("transactions.status") || "Status"}
              </p>
              {getStatusBadge(transaction.status)}
            </div>
          </div>

          {/* Order Link */}
          {transaction.orderId && (
            <div className="pt-6 border-t border-luxury-gold-dark/20">
              <Link
                to={`/order-detail/${transaction.orderId}`}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-luxury-gold-dark/20 hover:bg-luxury-gold-dark/30 text-luxury-gold-light border border-luxury-gold-dark/40"
                    : "bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold border border-luxury-gold-light/40"
                } hover:scale-105 transform`}
              >
                {t("transactions.viewOrder") || "View Order"} #
                {transaction.orderId}
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
        </div>

        {/* Order Summary (if available) */}
        {transaction.order && (
          <div
            className={`${panelClasses} rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl`}
          >
            <h2
              className={`text-2xl md:text-3xl font-bold mb-6 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {t("transactions.orderSummary") || "Order Summary"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className={`text-sm mb-2 ${
                    isDark
                      ? "text-luxury-brown-light/70"
                      : "text-luxury-brown-text/60"
                  }`}
                >
                  {t("transactions.orderTotal") || "Order Total"}
                </p>
                <p
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-luxury-brown-text"
                  }`}
                >
                  {formatCurrency(
                    parseFloat(
                      transaction.order.final_total ||
                        transaction.order.total ||
                        0
                    ),
                    transaction.currency
                  )}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm mb-2 ${
                    isDark
                      ? "text-luxury-brown-light/70"
                      : "text-luxury-brown-text/60"
                  }`}
                >
                  {t("transactions.orderStatus") || "Order Status"}
                </p>
                <p
                  className={`text-lg ${
                    isDark ? "text-white" : "text-luxury-brown-text"
                  }`}
                >
                  {transaction.order.status || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TransactionDetail;
