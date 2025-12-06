import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";

const OffersSection = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

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

  // Check if offer is currently active
  const isOfferActive = (offer) => {
    // Check is_active flag - handle boolean, string, or number
    const isActive =
      offer.is_active === true ||
      offer.is_active === 1 ||
      offer.is_active === "1" ||
      offer.is_active === "true";

    if (!isActive) return false;

    const now = new Date();

    // Handle start_date - be flexible with date formats
    let startDate = null;
    if (offer.start_date) {
      startDate = new Date(offer.start_date);
      if (isNaN(startDate.getTime())) {
        startDate = null;
      }
    }

    // Handle end_date - be flexible with date formats
    let endDate = null;
    if (offer.end_date) {
      endDate = new Date(offer.end_date);
      if (isNaN(endDate.getTime())) {
        endDate = null;
      }
    }

    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;

    return true;
  };

  // Format discount value
  const formatDiscount = (offer) => {
    if (!offer.discount_type || !offer.discount_value) return "";
    const value = parseFloat(offer.discount_value) || 0;
    if (offer.discount_type === "percentage") {
      return `${value}%`;
    }
    return `${value} ${t("offers.currency") || "AED"}`;
  };

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await apiService.getOffers();

        console.log("🎯 OffersSection - API Response:", response);

        if (response.success && response.data && Array.isArray(response.data)) {
          console.log(
            `📦 OffersSection - Total offers: ${response.data.length}`
          );

          // Filter active offers and sort by date/order
          const activeOffers = response.data
            .filter((offer) => isOfferActive(offer))
            .sort((a, b) => {
              // Sort by start_date (newest first) or by id
              if (a.start_date && b.start_date) {
                return new Date(b.start_date) - new Date(a.start_date);
              }
              return (b.id || 0) - (a.id || 0);
            })
            .slice(0, 6); // Limit to 6 offers for display

          console.log(
            `✅ OffersSection - Active offers after filter: ${activeOffers.length}`
          );
          console.log("Active offers in section:", activeOffers);

          setOffers(activeOffers);
        } else {
          console.warn(
            "⚠️ OffersSection - No offers data or invalid response:",
            response
          );
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Auto-rotate offers every 5 seconds
  useEffect(() => {
    if (offers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [offers.length]);

  if (loading) {
    return (
      <section
        className={`w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 md:py-20 lg:py-24 mb-16 md:mb-20 lg:mb-24 transition-all duration-300 ${
          isDark ? "bg-luxury-brown-darker" : "bg-luxury-cream"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 md:mb-16">
            <div className="h-12 bg-gray-700/50 rounded-lg w-64 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-luxury-brown-dark/50 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-700/50"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (offers.length === 0) {
    return null; // Don't render if no offers
  }

  const currentOffer = offers[currentOfferIndex];

  // Get offer link based on type
  const getOfferLink = (offer) => {
    if (offer.type === "product" && offer.condition?.product_id) {
      return `/product/${offer.condition.product_id}`;
    }
    if (offer.link || offer.url) {
      return offer.link || offer.url;
    }
    return "/products";
  };

  return (
    <section
      className={`w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 md:py-20 lg:py-24 mb-16 md:mb-20 lg:mb-24 transition-all duration-300 ${
        isDark ? "bg-luxury-brown-darker" : "bg-luxury-cream"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12 md:mb-16 lg:mb-20">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center ${
                isDark
                  ? "bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-600/30"
                  : "bg-gradient-to-br from-red-500/10 to-red-700/10 border border-red-500/20"
              }`}
            >
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {t("offers.title") || "Special Offers"}
            </h2>
          </div>
          {offers.length > 1 && (
            <div className="flex items-center gap-2">
              {offers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentOfferIndex(index)}
                  className={`transition-all duration-300 rounded-full focus:outline-none ${
                    index === currentOfferIndex
                      ? "w-10 h-3 bg-luxury-gold shadow-lg shadow-luxury-gold/60"
                      : "w-3 h-3 bg-white/50 hover:bg-white/80 hover:scale-125 transform"
                  }`}
                  aria-label={`${t("offers.goToOffer") || "Go to offer"} ${
                    index + 1
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Featured Offer (Large Banner) */}
        {currentOffer && (
          <Link
            to={getOfferLink(currentOffer)}
            className="block mb-8 md:mb-12 group"
          >
            <div
              className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] transform ${
                isDark
                  ? "bg-gradient-to-r from-red-900/40 to-red-800/40 border-2 border-red-700/30"
                  : "bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200/50"
              }`}
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                  <img
                    src={
                      getImageUrl(currentOffer.image) ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23dc2626' width='600' height='400'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='32' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EOffer%3C/text%3E%3C/svg%3E"
                    }
                    alt={currentOffer.title || "Special Offer"}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23dc2626' width='600' height='400'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='32' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EOffer%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {/* Discount Badge Overlay */}
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
                    <div className="bg-gradient-to-br from-red-600 to-red-800 text-white px-6 py-3 rounded-2xl shadow-2xl transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                      <p className="text-2xl md:text-3xl font-bold">
                        {formatDiscount(currentOffer)}
                      </p>
                      <p className="text-xs md:text-sm opacity-90">
                        {currentOffer.discount_type === "percentage"
                          ? t("offers.off") || "OFF"
                          : t("offers.discount") || "Discount"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                  <div
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 w-fit ${
                      isDark
                        ? "bg-red-900/50 text-red-300 border border-red-700/50"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    {t("offers.limitedTime") || "Limited Time Offer"}
                  </div>
                  <h3
                    className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 line-clamp-2 ${
                      isDark ? "text-white" : "text-luxury-brown-text"
                    }`}
                  >
                    {currentOffer.title || t("offers.specialOffer")}
                  </h3>
                  <p
                    className={`text-base md:text-lg lg:text-xl mb-6 md:mb-8 line-clamp-3 ${
                      isDark
                        ? "text-luxury-brown-light"
                        : "text-luxury-brown-text/80"
                    }`}
                  >
                    {currentOffer.description ||
                      t("offers.description") ||
                      "Don't miss out on this amazing deal!"}
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 ${
                        isDark
                          ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                          : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
                      } group-hover:scale-105 transform shadow-lg group-hover:shadow-xl`}
                    >
                      {t("offers.shopNow") || "Shop Now"} →
                    </div>
                    {currentOffer.end_date && (
                      <div
                        className={`text-sm md:text-base ${
                          isDark ? "text-red-300" : "text-red-600"
                        }`}
                      >
                        {t("offers.endsAt") || "Ends"}{" "}
                        {new Date(currentOffer.end_date).toLocaleDateString(
                          i18n.language === "ar" ? "ar-AE" : "en-US"
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Other Offers Grid */}
        {offers.length > 1 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {offers.slice(1, 5).map((offer, index) => (
              <Link
                key={offer.id || index}
                to={getOfferLink(offer)}
                className="group block"
              >
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 transform ${
                    isDark
                      ? "bg-luxury-brown-dark/50 border border-red-700/30"
                      : "bg-white border border-red-200/50"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-32 md:h-40 overflow-hidden">
                    <img
                      src={
                        getImageUrl(offer.image) ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23dc2626' width='300' height='200'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EOffer%3C/text%3E%3C/svg%3E"
                      }
                      alt={offer.title || "Offer"}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23dc2626' width='300' height='200'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EOffer%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    {/* Small Discount Badge */}
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                      {formatDiscount(offer)}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h4
                      className={`font-bold text-sm md:text-base line-clamp-2 mb-2 ${
                        isDark ? "text-white" : "text-luxury-brown-text"
                      }`}
                    >
                      {offer.title || t("offers.specialOffer")}
                    </h4>
                    <p
                      className={`text-xs md:text-sm line-clamp-1 ${
                        isDark
                          ? "text-luxury-brown-light"
                          : "text-luxury-brown-text/70"
                      }`}
                    >
                      {t("offers.viewOffer") || "View Offer"} →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OffersSection;
