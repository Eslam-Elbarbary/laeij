import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import OffersSection from "../components/OffersSection";
import PageLayout from "../components/PageLayout";
import {
  CategoriesGridSkeleton,
  ProductsGridSkeleton,
} from "../components/LoadingSkeleton";
import apiService from "../services/api";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  // Format price helper
  const formatPrice = (price) => {
    if (typeof price === "number") {
      return price.toLocaleString("ar-AE");
    }
    return price;
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await apiService.getCategories();
        if (response.success) {
          setCategories(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(t("common.error"));
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await apiService.getFeaturedProducts(4);
        if (response.success) {
          // Format products for display
          const formattedProducts = response.data.map((product) => ({
            ...product,
            price: formatPrice(product.price),
          }));
          setFeaturedProducts(formattedProducts);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(t("common.error"));
        console.error("Error fetching featured products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <PageLayout>
      <div className="w-full">
        {/* Hero Slider Section */}
        <HeroSlider />

        {/* Offers Section */}
        <OffersSection />

        {/* CTA Section - Full Width Edge to Edge */}
        <section
          className={`w-screen flex flex-col items-center justify-center relative left-1/2 -translate-x-1/2 backdrop-blur-md py-24 md:py-28 lg:py-32 border-y-2 shadow-2xl transition-all duration-300 ${
            isDark
              ? "bg-gradient-to-r from-luxury-gold-dark/40 to-luxury-gold/40 border-luxury-gold-dark/30"
              : "bg-gradient-to-r from-luxury-gold/10 to-luxury-gold/5 border-luxury-gold-light/50"
          }`}
        >
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 text-center">
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-12 md:mb-16 drop-shadow-2xl ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {t("home.startJourney")}
            </h2>
            <p
              className={`text-lg sm:text-xl md:text-2xl lg:text-3xl mb-16 md:mb-20 leading-relaxed drop-shadow-lg ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/80"
              }`}
            >
              {t("home.joinFamily")}
            </p>
            {/* <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-[#E5C158] px-14 sm:px-18 py-6 sm:py-7 rounded-xl font-bold text-lg sm:text-xl md:text-2xl hover:from-luxury-gold-light hover:to-luxury-gold transition-all shadow-2xl hover:shadow-luxury-gold-dark/50 hover:scale-105 transform duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/50
             drop-shadow-md"
            >
              تسوق الآن
            </Link> */}
          </div>
        </section>
        {/* Search Bar - Full Width Edge to Edge */}
        <section
          className={`w-screen relative left-1/2 -translate-x-1/2 backdrop-blur-md py-10 md:py-12 mb-16 md:mb-20 lg:mb-24 border-y transition-all duration-300 ${
            isDark
              ? "bg-luxury-brown-darker/60 border-luxury-gold-dark/20"
              : "bg-luxury-gold/10 border-luxury-gold-light/40"
          }`}
        >
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 relative">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("common.searchPlaceholder")}
                className={`w-full backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-4 sm:py-5 pr-14 sm:pr-14 text-base sm:text-lg border-2 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 transition-all shadow-xl hover:shadow-2xl ${
                  isDark
                    ? "bg-luxury-brown-darker/95 text-white placeholder-luxury-brown-light border-luxury-gold-dark/40 focus:border-luxury-gold hover:border-luxury-gold-dark/60"
                    : "bg-luxury-cream/95 text-luxury-brown-text placeholder-luxury-brown-light/50 border-luxury-gold-light/60 focus:border-luxury-gold hover:border-luxury-gold-light/70"
                }`}
              />
              <button
                type="submit"
                className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-lg hover:scale-110 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 ${
                  isDark
                    ? "text-luxury-brown-light hover:text-luxury-gold-light hover:bg-luxury-gold-light/15"
                    : "text-luxury-brown-light hover:text-luxury-gold hover:bg-luxury-gold/15"
                }`}
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7"
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
            </form>
          </div>
        </section>

        {/* Categories Section - Full Width */}
        <section
          className={`w-full  px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 md:py-20 lg:py-24 mb-16 md:mb-20 lg:mb-24 transition-all duration-300 ${
            isDark ? "bg-luxury-brown-dark" : "bg-luxury-cream-dark/30"
          }`}
        >
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex  items-center justify-between mb-12 md:mb-16 lg:mb-20">
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold drop-shadow-lg ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {t("home.categories")}
              </h2>
              <Link
                to="/categories"
                className="text-luxury-gold ltr hover:text-luxury-gold-light text-base md:text-lg font-semibold flex items-center gap-2 transition-all px-4 py-2 rounded-lg hover:bg-luxury-gold/15 hover:scale-105 transform duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group"
              >
                {t("home.viewAll")}
                <span className="text-xl">→</span>
              </Link>
            </div>
            {/* Horizontal Scroll on Mobile, Grid on Desktop */}
            {loadingCategories ? (
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-4 md:pb-0">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="shrink-0 w-[300px] sm:w-[320px] md:w-full"
                  >
                    <div className="w-full bg-luxury-brown-dark/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border-2 border-luxury-gold-dark/30 animate-pulse">
                      <div className="relative h-48 sm:h-56 md:h-64 bg-gray-800"></div>
                      <div className="p-6 sm:p-7 md:p-8 space-y-3 sm:space-y-4">
                        <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-800 rounded w-full"></div>
                        <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                        <div className="pt-3 border-t border-gray-800">
                          <div className="h-5 bg-gray-800 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">
                <p>{error}</p>
              </div>
            ) : (
              <div
                className="
  flex md:grid 
  md:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4 
  2xl:grid-cols-4 
  gap-6 md:gap-8 
  overflow-x-auto md:overflow-x-visible 
  scrollbar-hide pb-4 md:pb-0
"
              >
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="shrink-0 w-[300px] sm:w-[320px] md:w-full"
                  >
                    <CategoryCard category={category} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Products Section - Full Width */}
        <section
          className={`w-full flex  flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 md:py-20 lg:py-24 mb-16 md:mb-20 lg:mb-24 transition-all duration-300 ${
            isDark ? "bg-luxury-brown-dark" : "bg-luxury-cream"
          }`}
        >
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12 md:mb-16 lg:mb-20">
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold drop-shadow-lg ${
                  isDark ? "text-white" : "text-luxury-brown-text"
                }`}
              >
                {t("home.featuredProducts")}
              </h2>
              <Link
                to="/products"
                className="text-luxury-gold ltr hover:text-luxury-gold-light text-base md:text-lg font-semibold flex items-center gap-2 transition-all px-4 py-2 rounded-lg hover:bg-luxury-gold/10 hover:scale-105 transform duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/50"
              >
                {t("home.viewAll")}
                <span className="text-xl">→</span>
              </Link>
            </div>
            {/* Horizontal Scroll on Mobile, Grid on Desktop */}
            {loadingProducts ? (
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-4 md:pb-0">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="shrink-0 w-[180px] sm:w-[200px] md:w-full"
                  >
                    <div className="bg-luxury-brown-dark/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border-2 border-luxury-gold-dark/30 animate-pulse">
                      <div className="relative bg-black/50 p-4 sm:p-5 md:p-6 flex items-center justify-center min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[240px]">
                        <div className="w-32 h-32 bg-gray-800 rounded"></div>
                      </div>
                      <div className="p-5 sm:p-6 md:p-7 space-y-3 sm:space-y-4">
                        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                        <div className="h-5 bg-gray-800 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-800 rounded w-1/2 hidden sm:block"></div>
                        <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                          <div className="h-6 bg-gray-800 rounded w-24"></div>
                          <div className="w-10 h-10 bg-gray-800 rounded-xl"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">
                <p>{error}</p>
              </div>
            ) : (
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-4 md:pb-0">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="shrink-0 w-[180px] sm:w-[200px] md:w-full"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Home;
