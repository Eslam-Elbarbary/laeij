import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";
import CreateTicketModal from "../components/CreateTicketModal";

const Tickets = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState(null);
  const hasShownToast = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        showToast(t("tickets.pleaseLogin") || "Please login to view your tickets", "error");
      }
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Helper function to format ticket from API response
  const formatTicketFromAPI = (ticket) => {
    const statusMap = {
      open: "open",
      pending: "pending",
      closed: "closed",
      resolved: "resolved",
      "in-progress": "in-progress",
    };

    return {
      id: ticket.id,
      subject: ticket.subject || "",
      description: ticket.description || "",
      status:
        statusMap[ticket.status?.toLowerCase()] || ticket.status || "open",
      originalStatus: ticket.status,
      date: ticket.created_at || ticket.updated_at || new Date().toISOString(),
      updated_at: ticket.updated_at || ticket.created_at,
      attachments_url: ticket.attachments_url || ticket.attachments || [],
      replies_count: ticket.replies_count || ticket.replies?.length || 0,
      user: ticket.user || null,
    };
  };

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getTickets();

        console.log("🎫 Tickets API Response:", response);

        if (response.success && response.data) {
          const formattedTickets = Array.isArray(response.data)
            ? response.data.map(formatTicketFromAPI)
            : [];
          // Sort by date (newest first)
          formattedTickets.sort((a, b) => new Date(b.date) - new Date(a.date));
          console.log("📋 Formatted Tickets:", formattedTickets);
          setTickets(formattedTickets);
        } else {
          console.warn("⚠️ Tickets API returned no data:", response);
          setError(response.message || t("tickets.errorLoading"));
          setTickets([]);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError(t("tickets.errorLoading"));
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated, t]);

  // Handle ticket creation success
  const handleTicketCreated = () => {
    setShowCreateModal(false);
    // Refresh tickets list
    const fetchTickets = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await apiService.getTickets();
        if (response.success && response.data) {
          const formattedTickets = Array.isArray(response.data)
            ? response.data.map(formatTicketFromAPI)
            : [];
          formattedTickets.sort((a, b) => new Date(b.date) - new Date(a.date));
          setTickets(formattedTickets);
        }
      } catch (err) {
        console.error("Error refreshing tickets:", err);
      }
    };
    fetchTickets();
  };

  // Handle ticket deletion
  const handleDeleteTicket = async (ticketId) => {
    if (
      !window.confirm(
        t("tickets.confirmDelete") ||
          "Are you sure you want to delete this ticket?"
      )
    ) {
      return;
    }

    try {
      setDeletingTicketId(ticketId);
      const response = await apiService.deleteTicket(ticketId);

      if (response.success) {
        showToast(response.message || t("tickets.deleteSuccess"), "success");
        // Remove ticket from list
        setTickets(tickets.filter((t) => t.id !== ticketId));
      } else {
        showToast(response.message || t("tickets.deleteFailed"), "error");
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
      showToast(t("tickets.deleteFailed"), "error");
    } finally {
      setDeletingTicketId(null);
    }
  };

  // Filter tickets by status
  const filteredTickets =
    activeTab === "all"
      ? tickets
      : activeTab === "open"
      ? tickets.filter((t) => t.status === "open" || t.status === "pending")
      : activeTab === "closed"
      ? tickets.filter((t) => t.status === "closed" || t.status === "resolved")
      : tickets;

  // Get status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: {
        label: t("tickets.status.open"),
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        ),
      },
      pending: {
        label: t("tickets.status.pending"),
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
      closed: {
        label: t("tickets.status.closed"),
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
      },
      resolved: {
        label: t("tickets.status.resolved"),
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
      "in-progress": {
        label: t("tickets.status.inProgress"),
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      },
    };

    const config = statusConfig[status] || statusConfig.open;
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
      hour: "2-digit",
      minute: "2-digit",
    });
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
                  className="w-8 h-8 md:w-10 md:h-10 text-luxury-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h1
                  className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-luxury-brown-text"
                  }`}
                >
                  {t("tickets.title") || "Support Tickets"}
                </h1>
                <p
                  className={`text-lg md:text-xl ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text/80"
                  }`}
                >
                  {t("tickets.subtitle") ||
                    "Manage your support requests and inquiries"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`px-6 py-3 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
              } hover:scale-105 transform shadow-lg hover:shadow-xl`}
            >
              <div className="flex items-center gap-2">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>{t("tickets.createTicket") || "New Ticket"}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 border-b border-luxury-gold-dark/20">
            {[
              { id: "all", label: t("tickets.all") || "All" },
              { id: "open", label: t("tickets.status.open") || "Open" },
              { id: "closed", label: t("tickets.status.closed") || "Closed" },
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
              {t("tickets.errorLoading") || "Error loading tickets"}
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

        {/* Tickets List */}
        {!loading && !error && (
          <>
            {filteredTickets.length === 0 ? (
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
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3
                  className={`font-bold text-xl md:text-2xl mb-3 ${
                    isDark ? "text-white" : "text-luxury-brown-text"
                  }`}
                >
                  {t("tickets.noTickets") || "No tickets found"}
                </h3>
                <p
                  className={`mb-6 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text/70"
                  }`}
                >
                  {t("tickets.noTicketsDescription") ||
                    "You haven't created any support tickets yet."}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                      : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
                  } hover:scale-105 transform shadow-lg hover:shadow-xl`}
                >
                  {t("tickets.createTicket") || "Create Your First Ticket"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] transform`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Left Side - Ticket Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link
                              to={`/ticket/${ticket.id}`}
                              className="block group"
                            >
                              <h3
                                className={`text-xl md:text-2xl font-bold mb-2 group-hover:text-luxury-gold transition-colors ${
                                  isDark
                                    ? "text-white"
                                    : "text-luxury-brown-text"
                                }`}
                              >
                                {ticket.subject}
                              </h3>
                            </Link>
                            <p
                              className={`text-sm md:text-base line-clamp-2 mb-3 ${
                                isDark
                                  ? "text-luxury-brown-light/80"
                                  : "text-luxury-brown-text/70"
                              }`}
                            >
                              {ticket.description}
                            </p>
                          </div>
                          {getStatusBadge(ticket.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
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
                              {formatDate(ticket.date)}
                            </span>
                          </div>
                          {ticket.replies_count > 0 && (
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
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                              </svg>
                              <span
                                className={
                                  isDark
                                    ? "text-luxury-brown-light/70"
                                    : "text-luxury-brown-text/60"
                                }
                              >
                                {ticket.replies_count}{" "}
                                {ticket.replies_count === 1
                                  ? t("tickets.reply") || "reply"
                                  : t("tickets.replies") || "replies"}
                              </span>
                            </div>
                          )}
                          {ticket.attachments_url &&
                            ticket.attachments_url.length > 0 && (
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
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                  />
                                </svg>
                                <span
                                  className={
                                    isDark
                                      ? "text-luxury-brown-light/70"
                                      : "text-luxury-brown-text/60"
                                  }
                                >
                                  {ticket.attachments_url.length}{" "}
                                  {ticket.attachments_url.length === 1
                                    ? t("tickets.attachment") || "attachment"
                                    : t("tickets.attachments") || "attachments"}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Right Side - Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Link
                          to={`/ticket/${ticket.id}`}
                          className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                            isDark
                              ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                              : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
                          } hover:scale-105 transform shadow-lg hover:shadow-xl`}
                        >
                          {t("tickets.viewDetails") || "View Details"} →
                        </Link>
                        {ticket.status !== "closed" &&
                          ticket.status !== "resolved" && (
                            <button
                              onClick={() => handleDeleteTicket(ticket.id)}
                              disabled={deletingTicketId === ticket.id}
                              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                isDark
                                  ? "text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  : "text-red-600 hover:text-red-700 hover:bg-red-100"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {deletingTicketId === ticket.id ? (
                                <svg
                                  className="w-5 h-5 animate-spin"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTicketCreated}
        />
      )}
    </PageLayout>
  );
};

export default Tickets;
