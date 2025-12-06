import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";

const Transactions = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasShownToast = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast(t("transactions.pleaseLogin"), "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Helper function to format transaction from API response
  const formatTransactionFromAPI = (transaction) => {
    const statusMap = {
      paid: "paid",
      pending: "pending",
      failed: "failed",
      cancelled: "cancelled",
      refunded: "refunded",
    };

    return {
      id: transaction.id,
      orderId: transaction.order_id || transaction.order?.id,
      paymentMethod: transaction.payment_method || "N/A",
      amount: parseFloat(transaction.amount || 0),
      currency: transaction.currency || "AED",
      status:
        statusMap[transaction.status?.toLowerCase()] ||
        transaction.status ||
        "pending",
      originalStatus: transaction.status,
      date:
        transaction.created_at ||
        transaction.updated_at ||
        new Date().toISOString(),
      order: transaction.order || null,
    };
  };

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getTransactions();

        if (response.success && response.data) {
          const formattedTransactions = Array.isArray(response.data)
            ? response.data.map(formatTransactionFromAPI)
            : [];
          setTransactions(formattedTransactions);
        } else {
          setError(response.message || t("transactions.errorLoading"));
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(t("transactions.errorLoading"));
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isAuthenticated, t]);

  // Filter transactions by status
  const filteredTransactions =
    activeTab === "all"
      ? transactions
      : activeTab === "paid"
      ? transactions.filter((t) => t.status === "paid")
      : activeTab === "pending"
      ? transactions.filter((t) => t.status === "pending")
      : activeTab === "failed"
      ? transactions.filter(
          (t) => t.status === "failed" || t.status === "cancelled"
        )
      : transactions;

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
      pending: {
        label: t("transactions.status.pending"),
        bg: isDark ? "bg-yellow-900/40" : "bg-yellow-100",
        text: isDark ? "text-yellow-300" : "text-yellow-700",
        border: isDark ? "border-yellow-600/60" : "border-yellow-400/60",
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
      failed: {
        label: t("transactions.status.failed"),
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
      cancelled: {
        label: t("transactions.status.cancelled"),
        bg: isDark ? "bg-gray-900/40" : "bg-gray-100",
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
            className="w-4 h-4"
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
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "ar" ? "ar-AE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/95 backdrop-blur-md border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";

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
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center ${
                isDark
                  ? "bg-gradient-to-br from-luxury-gold-dark/20 to-luxury-gold/20 border border-luxury-gold-dark/30"
                  : "bg-gradient-to-br from-luxury-gold/10 to-luxury-gold-light/10 border border-luxury-gold-light/30"
              }`}
            >
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-luxury-gold"
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
            <div>
              <h1
                className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {t("transactions.title") || "My Transactions"}
              </h1>
              <p
                className={`text-lg md:text-xl ${
                  isDark
                    ? "text-luxury-brown-light"
                    : "text-luxury-brown-text/80"
                }`}
              >
                {t("transactions.subtitle") ||
                  "View all your payment transactions"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 border-b border-luxury-gold-dark/20">
            {[
              { id: "all", label: t("transactions.all") || "All" },
              { id: "paid", label: t("transactions.status.paid") || "Paid" },
              {
                id: "pending",
                label: t("transactions.status.pending") || "Pending",
              },
              {
                id: "failed",
                label: t("transactions.status.failed") || "Failed",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold text-sm md:text-base transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? isDark
                      ? "text-luxury-gold-light"
                      : "text-luxury-gold"
                    : isDark
                    ? "text-luxury-brown-light/70 hover:text-luxury-gold-light"
                    : "text-luxury-brown-text/70 hover:text-luxury-gold"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                      isDark ? "bg-luxury-gold-light" : "bg-luxury-gold"
                    }`}
                  ></span>
                )}
              </button>
            ))}
          </div>
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
              {t("transactions.errorLoading") || "Error loading transactions"}
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

        {/* Transactions List */}
        {!loading && !error && (
          <>
            {filteredTransactions.length === 0 ? (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3
                  className={`font-bold text-xl md:text-2xl mb-3 ${
                    isDark ? "text-white" : "text-luxury-brown-text"
                  }`}
                >
                  {t("transactions.noTransactions") || "No transactions found"}
                </h3>
                <p
                  className={`${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text/70"
                  }`}
                >
                  {t("transactions.noTransactionsDescription") ||
                    "You haven't made any transactions yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <Link
                    key={transaction.id}
                    to={`/transaction/${transaction.id}`}
                    className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] transform block`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left Side - Transaction Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3
                              className={`text-xl md:text-2xl font-bold mb-2 ${
                                isDark ? "text-white" : "text-luxury-brown-text"
                              }`}
                            >
                              {t("transactions.transaction")} #{transaction.id}
                            </h3>
                            {transaction.orderId && (
                              <Link
                                to={`/order-detail/${transaction.orderId}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`text-sm md:text-base hover:text-luxury-gold transition-colors ${
                                  isDark
                                    ? "text-luxury-brown-light"
                                    : "text-luxury-brown-text/70"
                                }`}
                              >
                                {t("transactions.viewOrder") || "View Order"} #
                                {transaction.orderId} →
                              </Link>
                            )}
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p
                              className={`text-sm mb-1 ${
                                isDark
                                  ? "text-luxury-brown-light/70"
                                  : "text-luxury-brown-text/60"
                              }`}
                            >
                              {t("transactions.amount") || "Amount"}
                            </p>
                            <p
                              className={`text-lg md:text-xl font-bold ${
                                isDark ? "text-white" : "text-luxury-brown-text"
                              }`}
                            >
                              {formatCurrency(
                                transaction.amount,
                                transaction.currency
                              )}
                            </p>
                          </div>
                          <div>
                            <p
                              className={`text-sm mb-1 ${
                                isDark
                                  ? "text-luxury-brown-light/70"
                                  : "text-luxury-brown-text/60"
                              }`}
                            >
                              {t("transactions.paymentMethod") ||
                                "Payment Method"}
                            </p>
                            <p
                              className={`text-base md:text-lg ${
                                isDark ? "text-white" : "text-luxury-brown-text"
                              }`}
                            >
                              {transaction.paymentMethod}
                            </p>
                          </div>
                          <div>
                            <p
                              className={`text-sm mb-1 ${
                                isDark
                                  ? "text-luxury-brown-light/70"
                                  : "text-luxury-brown-text/60"
                              }`}
                            >
                              {t("transactions.date") || "Date"}
                            </p>
                            <p
                              className={`text-base md:text-lg ${
                                isDark ? "text-white" : "text-luxury-brown-text"
                              }`}
                            >
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - View Details Button */}
                      <div className="flex-shrink-0">
                        <div
                          className={`px-6 py-3 rounded-xl font-semibold text-center transition-all duration-300 ${
                            isDark
                              ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                              : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
                          } hover:scale-105 transform shadow-lg hover:shadow-xl`}
                        >
                          {t("transactions.viewDetails") || "View Details"} →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Transactions;
