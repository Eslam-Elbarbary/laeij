import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import ProductCard from "../components/ProductCard";
import PageLayout from "../components/PageLayout";
import { ProductsGridSkeleton } from "../components/LoadingSkeleton";
import apiService from "../services/api";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const Products = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || null;
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("price-low");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });

  // Advanced filters
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const filters = [
    { value: "all", label: t("products.all") },
    { value: "بخاخات السيارات", label: t("products.filters.carSprays") },
    { value: "عطور حصرية", label: t("products.filters.exclusivePerfumes") },
    { value: "تركيبات مميزة", label: t("products.filters.specialBlends") },
    { value: "بخاخات تجميل", label: t("products.filters.cosmeticSprays") },
    { value: "أخرى", label: t("products.filters.other") },
    { value: "عطور كلاسيكية", label: t("products.filters.classicPerfumes") },
  ];

  const brandKeys = [
    "laeij",
    "armani",
    "dolceGabbana",
    "tomFord",
    "christianDior",
    "chanel",
    "versace",
  ];

  // Get translated brand names
  const brands = brandKeys.map((key) => ({
    key,
    name: t(`products.brands.${key}`),
  }));

  const sizes = [
    t("products.sizes.12ml"),
    t("products.sizes.25g"),
    t("products.sizes.30g"),
    t("products.sizes.50g"),
    t("products.sizes.75g"),
    t("products.sizes.100g"),
  ];

  const sortOptions = [
    { value: "price-low", label: t("products.priceLowToHigh") },
    { value: "price-high", label: t("products.priceHighToHigh") },
    { value: "newest", label: t("products.newest") },
    { value: "popular", label: t("products.popular") },
    { value: "rating", label: t("products.rating") },
  ];

  // Format price helper
  const formatPrice = (price) => {
    if (typeof price === "number") {
      return price.toLocaleString(i18n.language === "ar" ? "ar-AE" : "en-US");
    }
    return price;
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          sortBy: sortBy,
          limit: 9,
          page: currentPage,
        };

        // Add category filter
        if (categoryId && categoryId !== "all") {
          filters.categoryId = categoryId;
        }

        // Add tag filter
        if (selectedFilter && selectedFilter !== "all") {
          filters.tag = selectedFilter;
        }

        // Add search query
        if (searchQuery.trim()) {
          filters.search = searchQuery.trim();
        }

        const response = await apiService.getProducts(filters);

        if (response.success) {
          // Format products for display
          const formattedProducts = response.data.map((product) => ({
            ...product,
            price: formatPrice(product.price),
          }));
          setProducts(formattedProducts);

          // Update pagination info
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(t("products.errorLoading"));
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, selectedFilter, sortBy, searchQuery, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, selectedFilter, sortBy, searchQuery]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect when searchQuery changes
  };

  return (
    <PageLayout>
      <div className="w-full ltr">
        {/* Hero Banner - Full Width Edge to Edge */}
        <div className="w-screen relative left-1/2 -translate-x-1/2 h-80 md:h-96 lg:h-[550px] xl:h-[650px] rounded-none overflow-hidden mb-16 md:mb-20 lg:mb-24 shadow-2xl">
          {/* Background Image Container */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Main Image with Enhanced Effects */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1920&h=1080&fit=crop&q=90&auto=format"
                alt={t("products.title")}
                className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform ease-out"
                style={{ transitionDuration: "5000ms" }}
                loading="eager"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              {/* Subtle Blur Effect */}
              <div className="absolute inset-0 backdrop-blur-[0.5px] opacity-20"></div>
            </div>

            {/* Vignette Effect */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)",
              }}
            ></div>

            {/* Gradient Overlay with Better Blending */}
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold-dark/85 via-luxury-gold/70 to-black/80 mix-blend-multiply"></div>

            {/* Additional Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Decorative Geometric Shapes */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-luxury-gold/8 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-luxury-gold-dark/8 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

            {/* Light Rays Effect */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-luxury-gold-light/40 to-transparent transform -skew-x-12"></div>
              <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/30 to-transparent transform skew-x-12"></div>
            </div>

            {/* Subtle Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.25) 1px, transparent 0)",
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 md:mb-8 lg:mb-10 drop-shadow-2xl animate-fade-in">
                {t("products.title")}
              </h1>
              <p className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl opacity-95 leading-relaxed drop-shadow-lg max-w-4xl mx-auto animate-fade-in">
                {t("products.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Filters - Full Width Edge to Edge */}
        <div
          className={`w-[90%]  relative left-1/2 -translate-x-1/2 py-6 md:py-8 mb-16 md:mb-20 lg:mb-24 border-t border-b ${
            isDark
              ? "bg-luxury-brown-darker/30 border-luxury-brown-text/15"
              : "bg-luxury-cream/40 border-gray-300/30"
          }`}
        >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
            <div className="flex justify-center w-[1259px] gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`shrink-0 min-w-fit px-6 md:px-8 lg:px-10 py-3 md:py-4 rounded-lg whitespace-nowrap transition-all duration-200 text-sm md:text-base font-medium snap-start ${
                    selectedFilter === filter.value
                      ? isDark
                        ? "bg-transparent text-white border-[3px] border-white shadow-md"
                        : "bg-transparent text-luxury-brown-darker border-[3px] border-luxury-brown-darker shadow-md"
                      : isDark
                      ? "bg-white/5 text-gray-300 border-2 border-transparent hover:bg-white/10 hover:text-white shadow-sm"
                      : "bg-white/60 text-gray-700 border-2 border-transparent hover:bg-white hover:shadow-sm"
                  } focus:outline-none focus:ring-2 focus:ring-luxury-gold/50`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Sort - Full Width */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mb-16 md:mb-20 lg:mb-24">
          <div className="w-full max-w-7xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch lg:items-center"
            >
              {/* Input */}
              <div className="flex-1 relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("products.searchPlaceholder")}
                  className={`w-full backdrop-blur-sm rounded-2xl px-7 md:px-9 py-5 md:py-6 pr-16 md:pr-18 text-base md:text-lg border-2 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 transition-all shadow-xl hover:shadow-2xl ${
                    isDark
                      ? "bg-luxury-brown-darker/95 text-white placeholder-luxury-brown-light border-luxury-gold-dark/40 focus:border-luxury-gold hover:border-luxury-gold-dark/60"
                      : "bg-luxury-cream/95 text-luxury-brown-text placeholder-luxury-brown-light/50 border-luxury-gold-light/60 focus:border-luxury-gold hover:border-luxury-gold-light/70"
                  }`}
                />
                <button
                  type="submit"
                  className={`absolute right-4 md:right-6 top-1/2 -translate-y-1/2 transition-all duration-300 p-2 rounded-lg hover:scale-110 transform focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 ${
                    isDark
                      ? "text-luxury-brown-light hover:text-luxury-gold-light hover:bg-luxury-gold-light/15"
                      : "text-luxury-brown-light hover:text-luxury-gold hover:bg-luxury-gold/15"
                  }`}
                >
                  <svg
                    className="w-6 h-6 md:w-7 md:h-7"
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
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 md:gap-4 flex-none">
                {/* Mobile Filter Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`lg:hidden backdrop-blur-sm px-7 md:px-9 py-5 md:py-6 rounded-2xl whitespace-nowrap font-semibold text-sm md:text-base transition-all border-2 shadow-lg hover:shadow-xl hover:scale-105 transform duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/50 relative ${
                    isSidebarOpen
                      ? isDark
                        ? "bg-luxury-gold text-luxury-brown-darker border-luxury-gold shadow-xl shadow-luxury-gold/50"
                        : "bg-luxury-gold text-luxury-brown-darker border-luxury-gold shadow-xl shadow-luxury-gold/30"
                      : isDark
                      ? "bg-luxury-brown-darker/95 text-white border-luxury-brown-text hover:bg-luxury-brown-text hover:border-luxury-gold"
                      : "bg-luxury-cream/95 text-luxury-brown-text border-luxury-cream-dark hover:bg-luxury-cream-dark hover:border-luxury-gold"
                  }`}
                >
                  <span className="flex items-center gap-2">
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
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    {t("products.filter")}
                    {(selectedBrands.length > 0 ||
                      selectedSizes.length > 0 ||
                      minRating > 0 ||
                      inStockOnly ||
                      priceRange[0] > 0 ||
                      priceRange[1] < 5000) && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {selectedBrands.length +
                          selectedSizes.length +
                          (minRating > 0 ? 1 : 0) +
                          (inStockOnly ? 1 : 0) +
                          (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0)}
                      </span>
                    )}
                  </span>
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`backdrop-blur-sm px-6 md:px-8 py-4 md:py-5 rounded-2xl whitespace-nowrap font-medium appearance-none cursor-pointer transition-all border-2 shadow-lg hover:shadow-xl hover:scale-105 transform duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/50 pr-10 ${
                      isDark
                        ? "bg-luxury-brown-darker/95 text-white border-luxury-brown-text hover:bg-luxury-brown-text hover:border-luxury-gold"
                        : "bg-luxury-cream/95 text-luxury-brown-text border-luxury-cream-dark hover:bg-luxury-cream-dark hover:border-luxury-gold"
                    }`}
                    style={{
                      color: isDark ? "#F3EDE6" : "#1A1410",
                    }}
                  >
                    {sortOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        style={{
                          backgroundColor: isDark ? "#231F1F" : "#F5F1ED",
                          color: isDark ? "#F3EDE6" : "#1A1410",
                        }}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
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
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Products Section with Sidebar */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-16 md:pb-20 lg:pb-24">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex gap-6 md:gap-8 lg:gap-10">
              {/* Sidebar Filter - Desktop */}
              <aside
                className={`hidden lg:block w-80 xl:w-96 flex-shrink-0 ${
                  isDark ? "bg-luxury-brown-darker/95" : "bg-luxury-cream/95"
                } backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border-2 ${
                  isDark
                    ? "border-luxury-gold-dark/40"
                    : "border-luxury-gold-light/40"
                } h-fit sticky top-24`}
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b-2 border-card">
                  <h3 className="text-xl md:text-2xl font-bold text-primary">
                    {t("products.filter")}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedBrands([]);
                      setSelectedSizes([]);
                      setMinRating(0);
                      setInStockOnly(false);
                      setPriceRange([0, 5000]);
                    }}
                    className="text-sm text-luxury-gold hover:text-luxury-gold-light font-semibold transition-colors"
                  >
                    {t("products.clearAll")}
                  </button>
                </div>

                <div className="space-y-6 md:space-y-8">
                  {/* Price Range */}
                  <div>
                    <label className="block text-base md:text-lg font-semibold text-primary mb-4">
                      {t("products.priceRange")}
                    </label>
                    <div className="space-y-4">
                      <div
                        className={`text-center text-sm md:text-base font-semibold mb-2 px-4 py-2 rounded-lg ${
                          isDark
                            ? "bg-luxury-gold/20 text-luxury-gold-light border border-luxury-gold/40"
                            : "bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/40"
                        }`}
                      >
                        {priceRange[0].toLocaleString(
                          i18n.language === "ar" ? "ar-AE" : "en-US"
                        )}{" "}
                        -{" "}
                        {priceRange[1].toLocaleString(
                          i18n.language === "ar" ? "ar-AE" : "en-US"
                        )}{" "}
                        {t("productCard.currency")}
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="50"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([
                            parseInt(e.target.value),
                            priceRange[1],
                          ])
                        }
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                          isDark
                            ? "bg-gray-700 accent-luxury-gold"
                            : "bg-gray-300 accent-luxury-gold"
                        }`}
                      />
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="50"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                          isDark
                            ? "bg-gray-700 accent-luxury-gold"
                            : "bg-gray-300 accent-luxury-gold"
                        }`}
                      />
                      <div className="flex gap-3">
                        <input
                          type="number"
                          min="0"
                          max="5000"
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([
                              parseInt(e.target.value) || 0,
                              priceRange[1],
                            ])
                          }
                          className={`flex-1 px-4 py-2 rounded-xl border-2 text-sm ${
                            isDark
                              ? "bg-luxury-brown-darker/80 text-white border-luxury-gold-dark/40"
                              : "bg-white text-luxury-brown-text border-luxury-gold-light/50"
                          }`}
                          placeholder={t("products.from")}
                        />
                        <input
                          type="number"
                          min="0"
                          max="5000"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              parseInt(e.target.value) || 5000,
                            ])
                          }
                          className={`flex-1 px-4 py-2 rounded-xl border-2 text-sm ${
                            isDark
                              ? "bg-luxury-brown-darker/80 text-white border-luxury-gold-dark/40"
                              : "bg-white text-luxury-brown-text border-luxury-gold-light/50"
                          }`}
                          placeholder={t("products.to")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <label className="block text-base md:text-lg font-semibold text-primary mb-4">
                      {t("products.brand")}
                    </label>
                    <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-luxury-gold scrollbar-track-transparent">
                      {brands.map((brand) => (
                        <label
                          key={brand.key}
                          className="flex items-center gap-3 cursor-pointer group hover:bg-card-muted p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([
                                  ...selectedBrands,
                                  brand.name,
                                ]);
                              } else {
                                setSelectedBrands(
                                  selectedBrands.filter((b) => b !== brand.name)
                                );
                              }
                            }}
                            className="w-5 h-5 rounded border-2 border-luxury-gold text-luxury-gold focus:ring-luxury-gold focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-sm md:text-base text-primary group-hover:text-luxury-gold transition-colors">
                            {brand.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="block text-base md:text-lg font-semibold text-primary mb-4">
                      {t("products.size")}
                    </label>
                    <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-luxury-gold scrollbar-track-transparent">
                      {sizes.map((size) => (
                        <label
                          key={size}
                          className="flex items-center gap-3 cursor-pointer group hover:bg-card-muted p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSizes.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSizes([...selectedSizes, size]);
                              } else {
                                setSelectedSizes(
                                  selectedSizes.filter((s) => s !== size)
                                );
                              }
                            }}
                            className="w-5 h-5 rounded border-2 border-luxury-gold text-luxury-gold focus:ring-luxury-gold focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-sm md:text-base text-primary group-hover:text-luxury-gold transition-colors">
                            {size}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-base md:text-lg font-semibold text-primary mb-4">
                      {t("products.minRating")}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setMinRating(minRating === rating ? 0 : rating)
                          }
                          className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                            minRating >= rating
                              ? "bg-luxury-gold text-luxury-brown-darker shadow-lg shadow-luxury-gold/50"
                              : isDark
                              ? "bg-luxury-brown-darker/80 text-luxury-brown-light border-2 border-luxury-gold-dark/40 hover:border-luxury-gold"
                              : "bg-white text-luxury-brown-text border-2 border-luxury-gold-light/50 hover:border-luxury-gold"
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    {minRating > 0 && (
                      <p className="text-sm text-muted mt-2 text-center">
                        {minRating}+ ⭐ {t("products.minRatingAndAbove")}
                      </p>
                    )}
                  </div>

                  {/* In Stock Only */}
                  <div>
                    <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-xl hover:bg-card-muted transition-colors">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-6 h-6 rounded border-2 border-luxury-gold text-luxury-gold focus:ring-luxury-gold focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-base md:text-lg font-semibold text-primary group-hover:text-luxury-gold transition-colors">
                        {t("products.inStockOnly")}
                      </span>
                    </label>
                  </div>
                </div>
              </aside>

              {/* Mobile Sidebar Overlay */}
              {isSidebarOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                  ></div>
                  <aside
                    className={`fixed right-0 top-0 h-full w-80 md:w-96 z-50 lg:hidden overflow-y-auto ${
                      isDark
                        ? "bg-luxury-brown-darker/98"
                        : "bg-luxury-cream/98"
                    } backdrop-blur-xl shadow-2xl border-l-2 ${
                      isDark
                        ? "border-luxury-gold-dark/40"
                        : "border-luxury-gold-light/40"
                    } p-6`}
                  >
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-card">
                      <h3 className="text-xl font-bold text-primary">
                        {t("products.filter")}
                      </h3>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-primary hover:text-luxury-gold transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
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
                    </div>
                    {/* Same filter content as desktop sidebar */}
                    <div className="space-y-6">
                      {/* Price Range */}
                      <div>
                        <label className="block text-base font-semibold text-primary mb-4">
                          {t("products.priceRange")}
                        </label>
                        <div className="space-y-4">
                          <div
                            className={`text-center text-sm font-semibold mb-2 px-4 py-2 rounded-lg ${
                              isDark
                                ? "bg-luxury-gold/20 text-luxury-gold-light border border-luxury-gold/40"
                                : "bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/40"
                            }`}
                          >
                            {priceRange[0].toLocaleString(
                              i18n.language === "ar" ? "ar-AE" : "en-US"
                            )}{" "}
                            -{" "}
                            {priceRange[1].toLocaleString(
                              i18n.language === "ar" ? "ar-AE" : "en-US"
                            )}{" "}
                            {t("productCard.currency")}
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="5000"
                            step="50"
                            value={priceRange[0]}
                            onChange={(e) =>
                              setPriceRange([
                                parseInt(e.target.value),
                                priceRange[1],
                              ])
                            }
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                              isDark
                                ? "bg-gray-700 accent-luxury-gold"
                                : "bg-gray-300 accent-luxury-gold"
                            }`}
                          />
                          <input
                            type="range"
                            min="0"
                            max="5000"
                            step="50"
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([
                                priceRange[0],
                                parseInt(e.target.value),
                              ])
                            }
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                              isDark
                                ? "bg-gray-700 accent-luxury-gold"
                                : "bg-gray-300 accent-luxury-gold"
                            }`}
                          />
                          <div className="flex gap-3">
                            <input
                              type="number"
                              min="0"
                              max="5000"
                              value={priceRange[0]}
                              onChange={(e) =>
                                setPriceRange([
                                  parseInt(e.target.value) || 0,
                                  priceRange[1],
                                ])
                              }
                              className={`flex-1 px-4 py-2 rounded-xl border-2 text-sm ${
                                isDark
                                  ? "bg-luxury-brown-darker/80 text-white border-luxury-gold-dark/40"
                                  : "bg-white text-luxury-brown-text border-luxury-gold-light/50"
                              }`}
                              placeholder={t("products.from")}
                            />
                            <input
                              type="number"
                              min="0"
                              max="5000"
                              value={priceRange[1]}
                              onChange={(e) =>
                                setPriceRange([
                                  priceRange[0],
                                  parseInt(e.target.value) || 5000,
                                ])
                              }
                              className={`flex-1 px-4 py-2 rounded-xl border-2 text-sm ${
                                isDark
                                  ? "bg-luxury-brown-darker/80 text-white border-luxury-gold-dark/40"
                                  : "bg-white text-luxury-brown-text border-luxury-gold-light/50"
                              }`}
                              placeholder={t("products.to")}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Brands */}
                      <div>
                        <label className="block text-base font-semibold text-primary mb-4">
                          {t("products.brand")}
                        </label>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {brands.map((brand) => (
                            <label
                              key={brand.key}
                              className="flex items-center gap-3 cursor-pointer group hover:bg-card-muted p-2 rounded-lg transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBrands([
                                      ...selectedBrands,
                                      brand.name,
                                    ]);
                                  } else {
                                    setSelectedBrands(
                                      selectedBrands.filter(
                                        (b) => b !== brand.name
                                      )
                                    );
                                  }
                                }}
                                className="w-5 h-5 rounded border-2 border-luxury-gold text-luxury-gold focus:ring-luxury-gold focus:ring-offset-0 cursor-pointer"
                              />
                              <span className="text-sm text-primary group-hover:text-luxury-gold transition-colors">
                                {brand.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {/* Sizes */}
                      <div>
                        <label className="block text-base font-semibold text-primary mb-4">
                          {t("products.size")}
                        </label>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {sizes.map((size) => (
                            <label
                              key={size}
                              className="flex items-center gap-3 cursor-pointer group hover:bg-card-muted p-2 rounded-lg transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSizes.includes(size)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSizes([...selectedSizes, size]);
                                  } else {
                                    setSelectedSizes(
                                      selectedSizes.filter((s) => s !== size)
                                    );
                                  }
                                }}
                                className="w-5 h-5 rounded border-2 border-luxury-gold text-luxury-gold focus:ring-luxury-gold focus:ring-offset-0 cursor-pointer"
                              />
                              <span className="text-sm text-primary group-hover:text-luxury-gold transition-colors">
                                {size}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {/* Rating */}
                      <div>
                        <label className="block text-base font-semibold text-primary mb-4">
                          {t("products.minRating")}
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() =>
                                setMinRating(minRating === rating ? 0 : rating)
                              }
                              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                                minRating >= rating
                                  ? "bg-luxury-gold text-luxury-brown-darker shadow-lg shadow-luxury-gold/50"
                                  : isDark
                                  ? "bg-luxury-brown-darker/80 text-luxury-brown-light border-2 border-luxury-gold-dark/40"
                                  : "bg-white text-luxury-brown-text border-2 border-luxury-gold-light/50"
                              }`}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* In Stock */}
                      <div>
                        <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-xl hover:bg-card-muted transition-colors">
                          <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                            className="w-6 h-6 rounded border-2 border-luxury-gold text-luxury-gold focus:ring-luxury-gold focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-base font-semibold text-primary group-hover:text-luxury-gold transition-colors">
                            {t("products.inStockOnly")}
                          </span>
                        </label>
                      </div>
                      {/* Clear All Button */}
                      <button
                        onClick={() => {
                          setSelectedBrands([]);
                          setSelectedSizes([]);
                          setMinRating(0);
                          setInStockOnly(false);
                          setPriceRange([0, 5000]);
                        }}
                        className="w-full py-3 rounded-xl font-semibold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-brown-darker transition-all border-2 border-luxury-gold"
                      >
                        {t("products.clearAll")}
                      </button>
                    </div>
                  </aside>
                </>
              )}

              {/* Products Grid */}
              <div className="flex-1 min-w-0">
                {loading ? (
                  <ProductsGridSkeleton count={8} />
                ) : error ? (
                  <div
                    className={`text-center py-12 ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    <p className="text-lg">{error}</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <p
                      className={`text-lg ${
                        isDark
                          ? "text-luxury-brown-light"
                          : "text-luxury-brown-text/70"
                      }`}
                    >
                      {t("products.noProducts")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 md:gap-8">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-12 md:mt-16 flex items-center justify-between gap-4 md:gap-6 flex-wrap">
                        <nav
                          className={`flex items-center gap-2 md:gap-3 ${
                            i18n.language === "ar" ? "flex-row-reverse" : ""
                          } ${i18n.language === "ar" ? "order-2" : "order-1"}`}
                          aria-label="Pagination"
                        >
                          {/* Previous Button */}
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/50 ${
                              currentPage === 1
                                ? "opacity-50 cursor-not-allowed"
                                : isDark
                                ? "bg-luxury-brown-darker/90 text-luxury-brown-light hover:bg-luxury-brown-text hover:text-luxury-gold-light border-2 border-luxury-gold-dark/40"
                                : "bg-luxury-cream/80 text-luxury-brown-text hover:bg-luxury-cream-dark hover:text-luxury-gold border-2 border-luxury-gold-light/50"
                            }`}
                          >
                            <span
                              className={`flex items-center gap-2 ${
                                i18n.language === "ar" ? "flex-row-reverse" : ""
                              }`}
                            >
                              <svg
                                className="w-4 h-4 md:w-5 md:h-5"
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
                                      ? "M9 5l7 7-7 7"
                                      : "M15 19l-7-7 7-7"
                                  }
                                />
                              </svg>
                              {t("common.previous")}
                            </span>
                          </button>

                          {/* Page Numbers */}
                          <div
                            className={`flex items-center gap-1 md:gap-2 ${
                              i18n.language === "ar" ? "flex-row-reverse" : ""
                            }`}
                          >
                            {Array.from(
                              { length: pagination.totalPages },
                              (_, i) => i + 1
                            ).map((page) => {
                              // Show first page, last page, current page, and pages around current
                              const showPage =
                                page === 1 ||
                                page === pagination.totalPages ||
                                (page >= currentPage - 1 &&
                                  page <= currentPage + 1);

                              if (!showPage) {
                                // Show ellipsis
                                if (
                                  page === currentPage - 2 ||
                                  page === currentPage + 2
                                ) {
                                  return (
                                    <span
                                      key={page}
                                      className={`px-2 md:px-3 py-2 text-sm md:text-base ${
                                        isDark
                                          ? "text-luxury-brown-light"
                                          : "text-luxury-brown-text"
                                      }`}
                                    >
                                      ...
                                    </span>
                                  );
                                }
                                return null;
                              }

                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`min-w-[40px] md:min-w-[48px] px-3 md:px-4 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/50 ${
                                    currentPage === page
                                      ? isDark
                                        ? "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-xl shadow-luxury-gold/50 font-bold scale-105"
                                        : "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-brown-darker shadow-xl shadow-luxury-gold/30 font-bold scale-105"
                                      : isDark
                                      ? "bg-luxury-brown-darker/90 text-luxury-brown-light hover:bg-luxury-brown-text hover:text-luxury-gold-light border-2 border-luxury-gold-dark/40"
                                      : "bg-luxury-cream/80 text-luxury-brown-text hover:bg-luxury-cream-dark hover:text-luxury-gold border-2 border-luxury-gold-light/50"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            })}
                          </div>

                          {/* Next Button */}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                            className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/50 ${
                              currentPage === pagination.totalPages
                                ? "opacity-50 cursor-not-allowed"
                                : isDark
                                ? "bg-luxury-brown-darker/90 text-luxury-brown-light hover:bg-luxury-brown-text hover:text-luxury-gold-light border-2 border-luxury-gold-dark/40"
                                : "bg-luxury-cream/80 text-luxury-brown-text hover:bg-luxury-cream-dark hover:text-luxury-gold border-2 border-luxury-gold-light/50"
                            }`}
                          >
                            <span
                              className={`flex items-center gap-2 ${
                                i18n.language === "ar" ? "flex-row-reverse" : ""
                              }`}
                            >
                              {t("common.next")}
                              <svg
                                className="w-4 h-4 md:w-5 md:h-5"
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
                                      ? "M15 19l-7-7 7-7"
                                      : "M9 5l7 7-7 7"
                                  }
                                />
                              </svg>
                            </span>
                          </button>
                        </nav>

                        {/* Pagination Info */}
                        <div
                          className={`text-sm md:text-base ${
                            isDark
                              ? "text-luxury-brown-light"
                              : "text-luxury-brown-text"
                          } ${
                            i18n.language === "ar"
                              ? "text-right order-1"
                              : "text-left order-2"
                          }`}
                        >
                          <span className="font-semibold">
                            {t("products.page")} {currentPage}{" "}
                            {t("products.of")} {pagination.totalPages}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="text-muted">
                            {pagination.total}{" "}
                            {pagination.total === 1
                              ? t("productCard.product")
                              : t("categoryCard.products")}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Products;
