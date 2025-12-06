import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";
import PageLayout from "../components/PageLayout";

const Branches = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Fetch branches from API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getBranches();

        if (response.success && response.data && Array.isArray(response.data)) {
          // Filter only active branches
          const activeBranches = response.data.filter(
            (branch) => branch.is_active !== false && branch.is_active !== 0
          );
          setBranches(activeBranches);

          // Select first branch by default
          if (activeBranches.length > 0) {
            setSelectedBranch(activeBranches[0]);
          }
        } else {
          setBranches([]);
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
        setError(t("branches.errorLoading") || "Failed to load branches");
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [t]);

  // Get Google Maps URL for a branch
  const getMapUrl = (branch) => {
    if (branch.latitude && branch.longitude) {
      return `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`;
    }
    if (branch.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        branch.address
      )}`;
    }
    return null;
  };

  // Get directions URL
  const getDirectionsUrl = (branch) => {
    if (branch.latitude && branch.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;
    }
    if (branch.address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        branch.address
      )}`;
    }
    return null;
  };

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/95 backdrop-blur-md border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";

  if (loading) {
    return (
      <PageLayout>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="h-16 bg-gray-700/50 rounded-lg w-64 animate-pulse"></div>

            {/* Branches Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`${panelClasses} rounded-2xl p-6 animate-pulse`}
                >
                  <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-gray-700/50 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error && branches.length === 0) {
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
              {t("branches.errorLoading") || "Error loading branches"}
            </h3>
            <p
              className={`${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              {error}
            </p>
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
            <div>
              <h1
                className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {t("branches.title") || "Our Branches"}
              </h1>
              <p
                className={`text-lg md:text-xl ${
                  isDark
                    ? "text-luxury-brown-light"
                    : "text-luxury-brown-text/80"
                }`}
              >
                {t("branches.subtitle") || "Visit us at one of our locations"}
              </p>
            </div>
          </div>
        </div>

        {/* Branches Grid */}
        {branches.length === 0 ? (
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
            <h3
              className={`font-bold text-xl md:text-2xl mb-3 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {t("branches.noBranches") || "No branches available"}
            </h3>
            <p
              className={`${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              {t("branches.noBranchesDescription") ||
                "We're working on adding more locations. Please check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className={`${panelClasses} rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform`}
              >
                {/* Branch Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3
                      className={`text-xl md:text-2xl font-bold mb-2 ${
                        isDark ? "text-white" : "text-luxury-brown-text"
                      }`}
                    >
                      {branch.name}
                    </h3>
                    {branch.slug && (
                      <p
                        className={`text-sm ${
                          isDark
                            ? "text-luxury-brown-light/70"
                            : "text-luxury-brown-text/60"
                        }`}
                      >
                        {branch.slug}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDark ? "bg-luxury-gold-dark/20" : "bg-luxury-gold/20"
                    }`}
                  >
                    <svg
                      className="w-6 h-6 text-luxury-gold"
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

                {/* Branch Details */}
                <div className="space-y-4 mb-6">
                  {/* Address */}
                  {branch.address && (
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5"
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
                      <p
                        className={`text-sm md:text-base flex-1 ${
                          isDark
                            ? "text-luxury-brown-light"
                            : "text-luxury-brown-text"
                        }`}
                      >
                        {branch.address}
                      </p>
                    </div>
                  )}

                  {/* Phone */}
                  {branch.phone && (
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-luxury-gold flex-shrink-0"
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
                      <a
                        href={`tel:${branch.phone}`}
                        className={`text-sm md:text-base hover:text-luxury-gold transition-colors ${
                          isDark
                            ? "text-luxury-brown-light"
                            : "text-luxury-brown-text"
                        }`}
                      >
                        {branch.phone}
                      </a>
                    </div>
                  )}

                  {/* Coordinates */}
                  {branch.latitude && branch.longitude && (
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-luxury-gold flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      <p
                        className={`text-xs md:text-sm ${
                          isDark
                            ? "text-luxury-brown-light/70"
                            : "text-luxury-brown-text/60"
                        }`}
                      >
                        {branch.latitude}, {branch.longitude}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-luxury-gold-dark/20">
                  {getMapUrl(branch) && (
                    <a
                      href={getMapUrl(branch)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 text-center ${
                        isDark
                          ? "bg-luxury-gold-dark/20 hover:bg-luxury-gold-dark/30 text-luxury-gold border border-luxury-gold-dark/40"
                          : "bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold border border-luxury-gold-light/40"
                      } hover:scale-105 transform`}
                    >
                      <div className="flex items-center justify-center gap-2">
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
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                          />
                        </svg>
                        <span>{t("branches.viewOnMap") || "View on Map"}</span>
                      </div>
                    </a>
                  )}
                  {getDirectionsUrl(branch) && (
                    <a
                      href={getDirectionsUrl(branch)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 text-center ${
                        isDark
                          ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                          : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
                      } hover:scale-105 transform shadow-lg hover:shadow-xl`}
                    >
                      <div className="flex items-center justify-center gap-2">
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
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                          />
                        </svg>
                        <span>
                          {t("branches.getDirections") || "Get Directions"}
                        </span>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Branches;
