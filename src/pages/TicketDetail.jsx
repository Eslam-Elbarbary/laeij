import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
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
    return null;
  };

  // Format ticket from API response
  const formatTicketFromAPI = (ticketData) => {
    const statusMap = {
      open: "open",
      pending: "pending",
      closed: "closed",
      resolved: "resolved",
      "in-progress": "in-progress",
    };

    return {
      id: ticketData.id,
      subject: ticketData.subject || "",
      description: ticketData.description || "",
      status:
        statusMap[ticketData.status?.toLowerCase()] ||
        ticketData.status ||
        "open",
      originalStatus: ticketData.status,
      date: ticketData.created_at || new Date().toISOString(),
      updated_at: ticketData.updated_at || ticketData.created_at,
      attachments_url:
        ticketData.attachments_url || ticketData.attachments || [],
      replies: ticketData.replies || [],
      user: ticketData.user || null,
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
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast(t("tickets.pleaseLogin"), "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Fetch ticket from API
  useEffect(() => {
    const fetchTicket = async () => {
      if (!isAuthenticated || !id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getTicketById(id);

        if (response.success && response.data) {
          const formattedTicket = formatTicketFromAPI(response.data);
          setTicket(formattedTicket);
        } else {
          setError(
            response.message ||
              t("tickets.errorLoading") ||
              "Failed to load ticket"
          );
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError(t("tickets.errorLoading") || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, isAuthenticated, navigate, showToast, t]);

  // Handle reply submission
  const handleReply = async (e) => {
    e.preventDefault();

    if (!replyMessage.trim()) {
      showToast(
        t("tickets.replyRequired") || "Please enter a reply message",
        "error"
      );
      return;
    }

    setIsReplying(true);

    try {
      const response = await apiService.replyToTicket(id, replyMessage.trim());

      if (response.success) {
        showToast(response.message || t("tickets.replySuccess"), "success");
        setReplyMessage("");
        // Refresh ticket data
        const refreshResponse = await apiService.getTicketById(id);
        if (refreshResponse.success && refreshResponse.data) {
          setTicket(formatTicketFromAPI(refreshResponse.data));
        }
      } else {
        showToast(response.message || t("tickets.replyFailed"), "error");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      showToast(t("tickets.replyFailed"), "error");
    } finally {
      setIsReplying(false);
    }
  };

  // Get status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: {
        label: t("tickets.status.open"),
        bg: isDark ? "bg-green-900/40" : "bg-green-100",
        text: isDark ? "text-green-300" : "text-green-700",
        border: isDark ? "border-green-600/60" : "border-green-400/60",
      },
      pending: {
        label: t("tickets.status.pending"),
        bg: isDark ? "bg-yellow-900/40" : "bg-yellow-100",
        text: isDark ? "text-yellow-300" : "text-yellow-700",
        border: isDark ? "border-yellow-600/60" : "border-yellow-400/60",
      },
      closed: {
        label: t("tickets.status.closed"),
        bg: isDark ? "bg-gray-900/40" : "bg-gray-100",
        text: isDark ? "text-gray-300" : "text-gray-700",
        border: isDark ? "border-gray-600/60" : "border-gray-400/60",
      },
      resolved: {
        label: t("tickets.status.resolved"),
        bg: isDark ? "bg-blue-900/40" : "bg-blue-100",
        text: isDark ? "text-blue-300" : "text-blue-700",
        border: isDark ? "border-blue-600/60" : "border-blue-400/60",
      },
      "in-progress": {
        label: t("tickets.status.inProgress"),
        bg: isDark ? "bg-amber-900/40" : "bg-amber-100",
        text: isDark ? "text-amber-300" : "text-amber-700",
        border: isDark ? "border-amber-600/60" : "border-amber-400/60",
      },
    };

    const config = statusConfig[status] || statusConfig.open;
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

  if (error || !ticket) {
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
              {t("tickets.errorLoading") || "Error loading ticket"}
            </h3>
            <p
              className={`mb-6 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              {error || t("tickets.notFound") || "Ticket not found"}
            </p>
            <button
              onClick={() => navigate("/tickets")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
              } hover:scale-105 transform shadow-lg hover:shadow-xl`}
            >
              {t("tickets.backToTickets") || "Back to Tickets"}
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
            onClick={() => navigate("/tickets")}
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
            {t("tickets.backToTickets") || "Back to Tickets"}
          </button>
        </div>

        {/* Ticket Details Card */}
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
                  {ticket.subject}
                </h1>
                {getStatusBadge(ticket.status)}
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
                    {t("tickets.created") || "Created"}:{" "}
                    {formatDate(ticket.date)}
                  </span>
                </div>
                {ticket.updated_at !== ticket.date && (
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span
                      className={
                        isDark
                          ? "text-luxury-brown-light/70"
                          : "text-luxury-brown-text/60"
                      }
                    >
                      {t("tickets.updated") || "Updated"}:{" "}
                      {formatDate(ticket.updated_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3
              className={`text-lg md:text-xl font-semibold mb-4 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {t("tickets.description") || "Description"}
            </h3>
            <p
              className={`text-base md:text-lg whitespace-pre-wrap ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
              }`}
            >
              {ticket.description}
            </p>
          </div>

          {/* Attachments */}
          {ticket.attachments_url && ticket.attachments_url.length > 0 && (
            <div className="mb-8">
              <h3
                className={`text-lg md:text-xl font-semibold mb-4 ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {t("tickets.attachments") || "Attachments"} (
                {ticket.attachments_url.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ticket.attachments_url.map((url, index) => {
                  const imageUrl = getImageUrl(url);
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

                  return (
                    <a
                      key={index}
                      href={imageUrl || url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${nestedPanelClasses} rounded-xl p-4 hover:scale-105 transition-all duration-300 group`}
                    >
                      {isImage ? (
                        <div className="relative aspect-square overflow-hidden rounded-lg mb-2">
                          <img
                            src={imageUrl || url}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center aspect-square bg-luxury-gold/20 rounded-lg mb-2">
                          <svg
                            className="w-12 h-12 text-luxury-gold"
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
                      )}
                      <p
                        className={`text-xs truncate text-center ${
                          isDark
                            ? "text-luxury-brown-light/70"
                            : "text-luxury-brown-text/60"
                        }`}
                      >
                        {t("tickets.view") || "View"} →
                      </p>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Replies Section */}
        <div
          className={`${panelClasses} rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl mb-6`}
        >
          <h2
            className={`text-2xl md:text-3xl font-bold mb-6 ${
              isDark ? "text-white" : "text-luxury-brown-text"
            }`}
          >
            {t("tickets.replies") || "Replies"} ({ticket.replies?.length || 0})
          </h2>

          {ticket.replies && ticket.replies.length > 0 ? (
            <div className="space-y-6">
              {ticket.replies.map((reply, index) => (
                <div
                  key={index}
                  className={`${nestedPanelClasses} rounded-xl p-6`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p
                        className={`font-semibold mb-1 ${
                          isDark ? "text-white" : "text-luxury-brown-text"
                        }`}
                      >
                        {reply.user?.name ||
                          t("tickets.support") ||
                          "Support Team"}
                      </p>
                      <p
                        className={`text-sm ${
                          isDark
                            ? "text-luxury-brown-light/70"
                            : "text-luxury-brown-text/60"
                        }`}
                      >
                        {formatDate(reply.created_at || reply.date)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`whitespace-pre-wrap ${
                      isDark
                        ? "text-luxury-brown-light"
                        : "text-luxury-brown-text"
                    }`}
                  >
                    {reply.message || reply.content || ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p
              className={`text-center py-8 ${
                isDark
                  ? "text-luxury-brown-light/70"
                  : "text-luxury-brown-text/60"
              }`}
            >
              {t("tickets.noReplies") || "No replies yet"}
            </p>
          )}
        </div>

        {/* Reply Form */}
        {ticket.status !== "closed" && ticket.status !== "resolved" && (
          <div
            className={`${panelClasses} rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl`}
          >
            <h2
              className={`text-2xl md:text-3xl font-bold mb-6 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {t("tickets.addReply") || "Add Reply"}
            </h2>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                required
                rows={6}
                className={`w-full px-4 py-3 rounded-xl resize-none ${inputClasses}`}
                placeholder={
                  t("tickets.replyPlaceholder") || "Type your reply here..."
                }
              />
              <button
                type="submit"
                disabled={isReplying || !replyMessage.trim()}
                className={`w-full px-6 py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                    : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
                } hover:scale-105 transform shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isReplying ? (
                  <div className="flex items-center justify-center gap-2">
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
                    <span>{t("tickets.sending") || "Sending..."}</span>
                  </div>
                ) : (
                  t("tickets.sendReply") || "Send Reply"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TicketDetail;
