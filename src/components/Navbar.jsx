import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import logo from "../assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const { showToast } = useToast();
  const { t, i18n: i18nInstance } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const userMenuRef = useRef(null);
  const languageMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: t("navbar.home") },
    { path: "/categories", label: t("navbar.categories") },
    { path: "/products", label: t("navbar.products") },
    { path: "/branches", label: t("navbar.branches") },
    { path: "/contact", label: t("navbar.contact") },
  ];

  // Reverse nav items for RTL (Arabic) to match reading order
  const displayNavItems =
    i18n.language === "ar" ? [...navItems].reverse() : navItems;

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput("");
      setIsSearchOpen(false);
    }
  };

  // Change language handler
  const changeLanguage = (lng) => {
    i18nInstance.changeLanguage(lng);
    setIsLanguageMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        isLanguageMenuOpen &&
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target)
      ) {
        setIsLanguageMenuOpen(false);
      }
      if (
        isMenuOpen &&
        !event.target.closest(".mobile-menu-button") &&
        !event.target.closest(".mobile-menu")
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, isMenuOpen, isLanguageMenuOpen]);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 w-full ${
        isDark
          ? isScrolled
            ? "bg-luxury-brown-dark/98 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4),0_8px_40px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(229,193,88,0.1)] border-b-2 border-luxury-gold-dark/50"
            : "bg-luxury-brown-dark/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(229,193,88,0.05)] border-b border-luxury-gold-dark/30"
          : isScrolled
          ? "bg-luxury-cream/98 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.15),0_8px_40px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(229,193,88,0.2)] border-b-2 border-luxury-gold-light/50"
          : "bg-luxury-cream/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(229,193,88,0.1)] border-b border-luxury-gold-light/40"
      }`}
    >
      <div
        className={`w-full max-w-[1920px] mx-auto ${
          i18n.language === "ar"
            ? "pr-4 sm:pr-6 md:pr-8 lg:pr-12 xl:pr-16 2xl:pr-20 pl-8 sm:pl-10 md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-24"
            : "pl-4 sm:pl-6 md:pl-8 lg:pl-12 xl:pl-16 2xl:pl-20 pr-8 sm:pr-10 md:pr-12 lg:pr-16 xl:pr-20 2xl:pr-24"
        }`}
      >
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24 py-2">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-luxury-gold/50 rounded-xl p-1 ${
              i18n.language === "ar" ? "order-3" : "order-1"
            }`}
          >
            <div className="relative flex items-center justify-center h-full">
              <img
                src={logo}
                alt="لاعج - Laeij"
                className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-[4.5rem] lg:w-[4.5rem] xl:h-20 xl:w-20 object-contain filter drop-shadow-md"
                loading="eager"
                style={{ maxHeight: "100%" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "block";
                }}
              />
              {/* Fallback emoji if image fails */}
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl hidden">
                🐴
              </div>
            </div>
          </Link>
          {/* Desktop Navigation */}
          <div
            className={`hidden md:flex items-center gap-1.5 lg:gap-2 order-2 ${
              i18n.language === "ar" ? "flex-row-reverse" : ""
            }`}
          >
            {displayNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 lg:px-7 xl:px-8 py-3 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group ${
                  isActive(item.path)
                    ? isDark
                      ? "bg-gradient-to-br from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-[0_8px_25px_rgba(229,193,88,0.4),0_4px_10px_rgba(229,193,88,0.3),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.1)] scale-[1.04] font-bold"
                      : "bg-gradient-to-br from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-[0_8px_25px_rgba(229,193,88,0.4),0_4px_10px_rgba(229,193,88,0.3),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1)] scale-[1.04] font-bold"
                    : isDark
                    ? "text-luxury-brown-light hover:text-luxury-gold-light hover:bg-luxury-brown-darker/60 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                    : "text-luxury-brown-text hover:text-luxury-gold hover:bg-luxury-gold/10 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                }`}
              >
                {isActive(item.path) && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/5 rounded-xl"></div>
                  </>
                )}
                {!isActive(item.path) && (
                  <div
                    className={`absolute inset-0 ${
                      i18n.language === "ar"
                        ? "bg-gradient-to-l"
                        : "bg-gradient-to-r"
                    } from-luxury-gold/0 to-luxury-gold-light/0 group-hover:from-luxury-gold/10 group-hover:to-luxury-gold-light/5 rounded-xl transition-all duration-300`}
                  ></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {item.label}
                  {isActive(item.path) && (
                    <span className="w-2 h-2 rounded-full bg-luxury-brown-darker shadow-[0_0_8px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.3)]"></span>
                  )}
                </span>
                {!isActive(item.path) && (
                  <span
                    className={`absolute bottom-0 ${
                      i18n.language === "ar"
                        ? "right-1/2 translate-x-1/2"
                        : "left-1/2 -translate-x-1/2"
                    } w-0 h-0.5 ${
                      i18n.language === "ar"
                        ? "bg-gradient-to-l"
                        : "bg-gradient-to-r"
                    } from-transparent via-luxury-gold to-transparent transition-all duration-300 group-hover:w-3/4`}
                  ></span>
                )}
                {isActive(item.path) && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-1 ${
                      i18n.language === "ar"
                        ? "bg-gradient-to-l"
                        : "bg-gradient-to-r"
                    } from-transparent via-luxury-gold-light/80 to-transparent shadow-[0_2px_8px_rgba(229,193,88,0.5)]`}
                  ></span>
                )}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div
            className={`flex ${
              i18n.language === "ar" ? "flex-row-reverse" : ""
            } ${
              i18n.language === "ar" ? "order-1" : "order-3"
            } items-center gap-2.5 sm:gap-3 lg:gap-4`}
          >
            {/* Language Switcher */}
            <div
              className={`relative ${
                i18n.language === "ar" ? "order-6" : "order-1"
              }`}
              ref={languageMenuRef}
            >
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                aria-label={t("common.language")}
                className={`p-2.5 sm:p-3 rounded-xl bg-card/80 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] hover:scale-110 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group ${
                  isDark
                    ? "text-luxury-gold-light hover:bg-luxury-brown-darker/80"
                    : "text-luxury-gold hover:bg-luxury-gold/15"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </button>
              {isLanguageMenuOpen && (
                <div
                  className={`absolute top-full ${
                    i18n.language === "ar" ? "right-0" : "left-0"
                  } mt-2 w-40 rounded-xl shadow-2xl backdrop-blur-xl border-2 overflow-hidden z-50 ${
                    isDark
                      ? "bg-luxury-brown-darker/95 border-luxury-gold-dark/50"
                      : "bg-white/95 border-luxury-gold-light/50"
                  }`}
                >
                  <button
                    onClick={() => changeLanguage("ar")}
                    className={`w-full ${
                      i18n.language === "ar" ? "text-right" : "text-left"
                    } px-4 py-3 flex ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    } items-center justify-between gap-3 transition-all duration-300 ${
                      i18nInstance.language === "ar"
                        ? isDark
                          ? "bg-luxury-gold-dark/30 text-luxury-gold-light"
                          : "bg-luxury-gold/20 text-luxury-gold"
                        : isDark
                        ? "text-luxury-brown-light hover:bg-luxury-brown-dark/80"
                        : "text-luxury-brown-text hover:bg-luxury-gold/10"
                    }`}
                  >
                    <span className="font-semibold">{t("common.arabic")}</span>
                    {i18nInstance.language === "ar" && (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`w-full ${
                      i18n.language === "ar" ? "text-right" : "text-left"
                    } px-4 py-3 flex ${
                      i18n.language === "ar" ? "flex-row-reverse" : ""
                    } items-center justify-between gap-3 transition-all duration-300 border-t ${
                      i18nInstance.language === "en"
                        ? isDark
                          ? "bg-luxury-gold-dark/30 text-luxury-gold-light border-luxury-gold-dark/30"
                          : "bg-luxury-gold/20 text-luxury-gold border-luxury-gold-light/30"
                        : isDark
                        ? "text-luxury-brown-light hover:bg-luxury-brown-dark/80 border-luxury-gold-dark/30"
                        : "text-luxury-brown-text hover:bg-luxury-gold/10 border-luxury-gold-light/30"
                    }`}
                  >
                    <span className="font-semibold">{t("common.english")}</span>
                    {i18nInstance.language === "en" && (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={t("navbar.toggleTheme")}
              className={`p-2.5 sm:p-3 rounded-xl bg-card/80 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] hover:scale-110 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group ${
                i18n.language === "ar" ? "order-5" : "order-2"
              } ${
                isDark
                  ? "text-luxury-gold-light hover:bg-luxury-brown-darker/80"
                  : "text-luxury-gold hover:bg-luxury-gold/15"
              }`}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95 5.636 18.364" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" />
                </svg>
              )}
            </button>

            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label={t("navbar.openSearch")}
              className={`p-2.5 sm:p-3 rounded-xl bg-card/80 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] hover:scale-110 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group ${
                i18n.language === "ar" ? "order-4" : "order-3"
              } ${
                isDark
                  ? "text-luxury-brown-light hover:text-luxury-gold-light hover:bg-luxury-brown-darker/80"
                  : "text-luxury-brown-text hover:text-luxury-gold hover:bg-luxury-gold/15"
              }`}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Wishlist Icon - Only show when authenticated */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className={`relative p-2.5 sm:p-3 rounded-xl bg-card/80 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] group focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 hover:scale-110 transform transition-all duration-300 overflow-visible ${
                  i18n.language === "ar" ? "order-3" : "order-4"
                } ${
                  isDark
                    ? "text-luxury-brown-light hover:text-red-400 hover:bg-luxury-brown-darker/80"
                    : "text-luxury-brown-text hover:text-red-500 hover:bg-luxury-gold/15"
                }`}
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 relative z-10"
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span
                    className={`absolute -top-1.5 ${
                      i18n.language === "ar" ? "-left-1.5" : "-right-1.5"
                    } bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-extrabold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300 shadow-xl group-hover:scale-110 animate-pulse-gold`}
                  >
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Icon - Only show when authenticated */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className={`relative p-2.5 sm:p-3 rounded-xl bg-card/80 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] group focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 hover:scale-110 transform transition-all duration-300 overflow-visible ${
                  i18n.language === "ar" ? "order-2" : "order-5"
                } ${
                  isDark
                    ? "text-luxury-brown-light hover:text-luxury-gold-light hover:bg-luxury-brown-darker/80"
                    : "text-luxury-brown-text hover:text-luxury-gold hover:bg-luxury-gold/15"
                }`}
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-1.5 ${
                      i18n.language === "ar" ? "-left-1.5" : "-right-1.5"
                    } bg-gradient-to-br from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker text-xs font-extrabold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center group-hover:from-luxury-gold-light group-hover:to-luxury-gold transition-all duration-300 shadow-xl group-hover:scale-110 animate-pulse-gold`}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}
            {/* Login Button - Show when not authenticated */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className={`flex items-center gap-2.5 transition-all duration-300 px-4 py-2.5 rounded-xl bg-card/80 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group ${
                  i18n.language === "ar" ? "order-1" : "order-6"
                } ${
                  isDark
                    ? "text-luxury-brown-light hover:text-luxury-gold-light hover:bg-luxury-brown-darker/80"
                    : "text-luxury-brown-text hover:text-luxury-gold hover:bg-luxury-gold/15"
                }`}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="hidden sm:inline-block font-semibold text-sm lg:text-base">
                  {t("navbar.login")}
                </span>
              </Link>
            ) : (
              /* User Menu - Show when authenticated */
              <div
                className={`relative user-menu ${
                  i18n.language === "ar" ? "order-1" : "order-6"
                }`}
                ref={userMenuRef}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className={`flex ${
                    i18n.language === "ar" ? "flex-row-reverse" : ""
                  } items-center gap-2.5 transition-all duration-300 p-2 rounded-xl bg-card/80 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group ${
                    isUserMenuOpen
                      ? isDark
                        ? "bg-luxury-gold-dark/40 shadow-[0_6px_20px_rgba(229,193,88,0.3),inset_0_2px_4px_rgba(255,255,255,0.1)] text-luxury-gold-light scale-105"
                        : "bg-luxury-gold/20 shadow-[0_6px_20px_rgba(229,193,88,0.25),inset_0_2px_4px_rgba(255,255,255,0.2)] text-luxury-gold scale-105"
                      : isDark
                      ? "text-luxury-brown-light hover:text-luxury-gold-light hover:bg-luxury-brown-darker/80"
                      : "text-luxury-brown-text hover:text-luxury-gold hover:bg-luxury-gold/15"
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-gold-dark flex items-center justify-center transition-all duration-300 shadow-[0_4px_12px_rgba(229,193,88,0.4),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.2)] ring-2 ring-white/20 ${
                      isUserMenuOpen
                        ? "ring-4 ring-luxury-gold-light/60 scale-110 bg-gradient-to-br from-luxury-gold-light to-luxury-gold shadow-[0_6px_20px_rgba(229,193,88,0.5),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)]"
                        : "hover:from-luxury-gold-light hover:to-luxury-gold hover:scale-105 hover:shadow-[0_6px_20px_rgba(229,193,88,0.5),inset_0_2px_4px_rgba(255,255,255,0.25)]"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-luxury-brown-darker"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span
                    className={`hidden lg:inline-block font-bold text-base lg:text-lg relative z-10 transition-transform duration-300 ${
                      i18n.language === "ar"
                        ? "group-hover:translate-x-[4px]"
                        : "group-hover:translate-x-[-4px]"
                    }`}
                  >
                    {user?.name || t("navbar.account")}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 hidden sm:block ${
                      isUserMenuOpen
                        ? "rotate-180 text-luxury-gold-light"
                        : "text-luxury-brown-light/60"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={
                        i18n.language === "ar"
                          ? "M5 15l7-7 7 7"
                          : "M19 9l-7 7-7-7"
                      }
                    />
                  </svg>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div
                    className={`absolute ${
                      i18n.language === "ar" ? "right-0" : "right-[-50px]"
                    } top-full mt-3 w-64 rounded-2xl shadow-2xl border-2 py-3 z-[100] animate-scale-in overflow-visible backdrop-blur-xl ${
                      isDark
                        ? "bg-card border-card shadow-amber-900/30"
                        : "bg-card border-card shadow-amber-900/20"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 mb-2 ${
                        i18n.language === "ar" ? "text-right" : "text-left"
                      } border-b border-card`}
                    >
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                          isDark ? "text-luxury-gold-dark" : "text-luxury-gold"
                        }`}
                      >
                        {i18n.language === "ar" ? "القائمة" : "Menu"}
                      </p>
                      {user && (
                        <p
                          className={`text-sm font-bold ${
                            isDark
                              ? "text-luxury-brown-light"
                              : "text-luxury-brown-text"
                          }`}
                        >
                          {user.name || t("navbar.user")}
                        </p>
                      )}
                    </div>
                    <Link
                      to="/account"
                      className={`flex items-center gap-3 px-5 py-3.5 text-base font-semibold transition-all duration-300 rounded-xl mx-2 mb-1 focus:outline-none group relative overflow-hidden text-right ${
                        isDark
                          ? "text-primary hover:bg-amber-500/20 hover:text-amber-300 focus:bg-amber-500/20"
                          : "text-primary hover:bg-amber-500/20 hover:text-amber-700 focus:bg-amber-500/20"
                      }`}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-amber-500/5 transition-all duration-300"></div>
                      <svg
                        className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span
                        className={`relative z-10 flex-1 ${
                          i18n.language === "ar"
                            ? "text-right group-hover:translate-x-[4px]"
                            : "text-left group-hover:translate-x-[-4px]"
                        } transition-transform duration-300`}
                      >
                        {t("navbar.account")}
                      </span>
                    </Link>
                    <Link
                      to="/orders"
                      className={`flex ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      } items-center gap-3 px-5 py-3.5 text-base font-semibold transition-all duration-300 rounded-xl mx-2 mb-1 focus:outline-none group relative overflow-hidden ${
                        i18n.language === "ar" ? "text-right" : "text-left"
                      } ${
                        isDark
                          ? "text-primary hover:bg-amber-500/20 hover:text-amber-300 focus:bg-amber-500/20"
                          : "text-primary hover:bg-amber-500/20 hover:text-amber-700 focus:bg-amber-500/20"
                      }`}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-amber-500/5 transition-all duration-300"></div>
                      <svg
                        className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span
                        className={`relative z-10 flex-1 ${
                          i18n.language === "ar"
                            ? "text-right group-hover:translate-x-[4px]"
                            : "text-left group-hover:translate-x-[-4px]"
                        } transition-transform duration-300`}
                      >
                        {t("navbar.orders")}
                      </span>
                    </Link>
                    <Link
                      to="/addresses"
                      className={`flex ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      } items-center gap-3 px-5 py-3.5 text-base font-semibold transition-all duration-300 rounded-xl mx-2 mb-1 focus:outline-none group relative overflow-hidden ${
                        i18n.language === "ar" ? "text-right" : "text-left"
                      } ${
                        isDark
                          ? "text-primary hover:bg-amber-500/20 hover:text-amber-300 focus:bg-amber-500/20"
                          : "text-primary hover:bg-amber-500/20 hover:text-amber-700 focus:bg-amber-500/20"
                      }`}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-amber-500/5 transition-all duration-300"></div>
                      <svg
                        className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                      <span
                        className={`relative z-10 flex-1 ${
                          i18n.language === "ar"
                            ? "text-right group-hover:translate-x-[4px]"
                            : "text-left group-hover:translate-x-[-4px]"
                        } transition-transform duration-300`}
                      >
                        {t("navbar.addresses")}
                      </span>
                    </Link>
                    <Link
                      to="/tickets"
                      className={`flex ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      } items-center gap-3 px-5 py-3.5 text-base font-semibold transition-all duration-300 rounded-xl mx-2 mb-1 focus:outline-none group relative overflow-hidden ${
                        i18n.language === "ar" ? "text-right" : "text-left"
                      } ${
                        isDark
                          ? "text-primary hover:bg-amber-500/20 hover:text-amber-300 focus:bg-amber-500/20"
                          : "text-primary hover:bg-amber-500/20 hover:text-amber-700 focus:bg-amber-500/20"
                      }`}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-amber-500/5 transition-all duration-300"></div>
                      <svg
                        className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      <span
                        className={`relative z-10 flex-1 ${
                          i18n.language === "ar"
                            ? "text-right group-hover:translate-x-[4px]"
                            : "text-left group-hover:translate-x-[-4px]"
                        } transition-transform duration-300`}
                      >
                        {t("navbar.tickets") || "Support Tickets"}
                      </span>
                    </Link>
                    <Link
                      to="/booking-lists"
                      className={`flex ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      } items-center gap-3 px-5 py-3.5 text-base font-semibold transition-all duration-300 rounded-xl mx-2 mb-1 focus:outline-none group relative overflow-hidden ${
                        i18n.language === "ar" ? "text-right" : "text-left"
                      } ${
                        isDark
                          ? "text-primary hover:bg-amber-500/20 hover:text-amber-300 focus:bg-amber-500/20"
                          : "text-primary hover:bg-amber-500/20 hover:text-amber-700 focus:bg-amber-500/20"
                      }`}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-amber-500/5 transition-all duration-300"></div>
                      <svg
                        className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                      <span
                        className={`relative z-10 flex-1 ${
                          i18n.language === "ar"
                            ? "text-right group-hover:translate-x-[4px]"
                            : "text-left group-hover:translate-x-[-4px]"
                        } transition-transform duration-300`}
                      >
                        {t("navbar.bookingLists") || "Booking Lists"}
                      </span>
                    </Link>
                    <hr
                      className={`my-3 mx-4 ${
                        isDark
                          ? "border-luxury-gold-dark/30"
                          : "border-luxury-gold-light/30"
                      }`}
                    />
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        showToast(t("navbar.logoutSuccess"), "success");
                        navigate("/");
                      }}
                      className={`flex ${
                        i18n.language === "ar" ? "flex-row-reverse" : ""
                      } items-center gap-3 w-full ${
                        i18n.language === "ar" ? "text-right" : "text-left"
                      } px-5 py-3.5 text-base font-semibold transition-all duration-300 rounded-xl mx-2 focus:outline-none group relative overflow-hidden ${
                        isDark
                          ? "text-red-400 hover:bg-red-500/25 hover:text-red-300 focus:bg-red-500/25"
                          : "text-red-600 hover:bg-red-100 hover:text-red-700 focus:bg-red-100"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/15 group-hover:to-red-500/5 transition-all duration-300"></div>
                      <svg
                        className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span
                        className={`relative z-10 flex-1 ${
                          i18n.language === "ar"
                            ? "text-right group-hover:translate-x-[4px]"
                            : "text-left group-hover:translate-x-[-4px]"
                        } transition-transform duration-300`}
                      >
                        {t("navbar.logout")}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl bg-card/80 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 mobile-menu-button relative overflow-hidden group ${
                isDark
                  ? "text-luxury-brown-light hover:text-luxury-gold-light hover:bg-luxury-brown-darker/80"
                  : "text-luxury-brown-text hover:text-luxury-gold hover:bg-luxury-gold/15"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden py-5 border-t-2 animate-slide-in space-y-2.5 mobile-menu backdrop-blur-xl ${
              isDark ? "border-card bg-card" : "border-card bg-card"
            }`}
          >
            {displayNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-6 py-4 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group mx-2 ${
                  i18n.language === "ar" ? "text-right" : "text-left"
                } ${
                  isActive(item.path)
                    ? `${
                        i18n.language === "ar"
                          ? "bg-gradient-to-l"
                          : "bg-gradient-to-r"
                      } from-amber-500 to-amber-400 text-luxury-brown-darker shadow-lg shadow-amber-900/50 scale-105`
                    : isDark
                    ? "text-primary hover:text-amber-300 hover:bg-amber-500/20 hover:scale-[1.02]"
                    : "text-primary hover:text-amber-700 hover:bg-amber-500/20 hover:scale-[1.02]"
                }`}
              >
                <div
                  className={`absolute inset-0 ${
                    i18n.language === "ar"
                      ? "bg-gradient-to-l"
                      : "bg-gradient-to-r"
                  } from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-amber-500/5 transition-all duration-300`}
                ></div>
                <span
                  className={`relative z-10 transition-transform duration-300 ${
                    i18n.language === "ar"
                      ? "group-hover:-translate-x-[4px]"
                      : "group-hover:translate-x-[4px]"
                  }`}
                >
                  {item.label}
                </span>
                {!isActive(item.path) && (
                  <span
                    className={`absolute bottom-0 ${
                      i18n.language === "ar" ? "left-0" : "right-0"
                    } w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-full`}
                  ></span>
                )}
              </Link>
            ))}
            {/* Mobile Login/Logout */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={`flex ${
                  i18n.language === "ar" ? "flex-row-reverse" : ""
                } items-center gap-3 px-6 py-4 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group mx-2 ${
                  i18n.language === "ar" ? "text-right" : "text-left"
                } ${
                  isDark
                    ? "text-primary hover:text-amber-300 hover:bg-amber-500/20 hover:scale-[1.02]"
                    : "text-primary hover:text-amber-700 hover:bg-amber-500/20 hover:scale-[1.02]"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span
                  className={`relative z-10 ${
                    i18n.language === "ar"
                      ? "group-hover:-translate-x-[4px]"
                      : "group-hover:translate-x-[4px]"
                  } transition-transform duration-300`}
                >
                  {t("navbar.login")}
                </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex ${
                    i18n.language === "ar" ? "flex-row-reverse" : ""
                  } items-center gap-3 px-6 py-4 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group mx-2 ${
                    i18n.language === "ar" ? "text-right" : "text-left"
                  } ${
                    isDark
                      ? "text-primary hover:text-amber-300 hover:bg-amber-500/20 hover:scale-[1.02]"
                      : "text-primary hover:text-amber-700 hover:bg-amber-500/20 hover:scale-[1.02]"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span
                    className={`relative z-10 ${
                      i18n.language === "ar"
                        ? "group-hover:-translate-x-[4px]"
                        : "group-hover:translate-x-[4px]"
                    } transition-transform duration-300`}
                  >
                    {t("navbar.account")}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    showToast(t("navbar.logoutSuccess"), "success");
                    navigate("/");
                  }}
                  className={`flex ${
                    i18n.language === "ar" ? "flex-row-reverse" : ""
                  } items-center gap-3 w-full ${
                    i18n.language === "ar" ? "text-right" : "text-left"
                  } px-6 py-4 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none group relative overflow-hidden mx-2 ${
                    isDark
                      ? "text-red-400 hover:bg-red-500/25 hover:text-red-300"
                      : "text-red-600 hover:bg-red-100 hover:text-red-700"
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span
                    className={`relative z-10 ${
                      i18n.language === "ar"
                        ? "group-hover:-translate-x-[4px]"
                        : "group-hover:translate-x-[4px]"
                    } transition-transform duration-300`}
                  >
                    {t("navbar.logout")}
                  </span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Search Modal */}
        {isSearchOpen && (
          <div
            className={`py-5 border-t-2 backdrop-blur-xl animate-fade-in shadow-inner ${
              isDark
                ? "border-luxury-gold-dark/40 bg-luxury-brown-dark/98"
                : "border-luxury-gold-light/50 bg-luxury-cream/98"
            }`}
          >
            <form
              onSubmit={handleSearch}
              className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 flex gap-3"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("common.searchPlaceholder")}
                  autoFocus
                  className={`w-full rounded-xl px-5 md:px-7 py-4 md:py-5 pr-12 border-2 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 transition-all shadow-lg ${
                    isDark
                      ? "bg-luxury-brown-darker/95 text-white placeholder-luxury-brown-light border-luxury-gold-dark/40 focus:border-luxury-gold hover:border-luxury-gold-dark/60"
                      : "bg-white/95 text-luxury-brown-text placeholder-luxury-brown-light/50 border-luxury-gold-light/60 focus:border-luxury-gold hover:border-luxury-gold-light/70"
                  }`}
                />
                <svg
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? "text-luxury-gold-dark" : "text-luxury-gold"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-luxury-gold to-luxury-gold-light hover:from-luxury-gold-light hover:to-luxury-gold text-luxury-brown-darker px-8 md:px-10 py-4 md:py-5 rounded-xl font-bold text-sm md:text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 whitespace-nowrap shadow-xl hover:shadow-2xl hover:scale-105 transform relative overflow-hidden group"
              >
                <span className="relative z-10">{t("common.search")}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className={`px-5 md:px-7 py-4 md:py-5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group shadow-lg hover:shadow-xl hover:scale-105 transform ${
                  isDark
                    ? "bg-luxury-brown-darker/95 hover:bg-luxury-brown-text text-white border-luxury-gold-dark/40 hover:border-luxury-gold-dark/60"
                    : "bg-white/95 hover:bg-luxury-cream-dark text-luxury-brown-text border-luxury-gold-light/40 hover:border-luxury-gold-light/60"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
