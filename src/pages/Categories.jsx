import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import PageLayout from "../components/PageLayout";
import { CategoriesGridSkeleton } from "../components/LoadingSkeleton";
import apiService from "../services/api";
import { useTranslation } from "react-i18next";

const Categories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getCategories();
        if (response.success) {
          setCategories(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(t("categories.errorLoading"));
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout>
      <div className="w-full">
        {/* Header Section - Full Width Edge to Edge */}
        <section className="w-screen relative left-1/2 -translate-x-1/2 h-64 md:h-80 lg:h-96 xl:h-[500px] overflow-hidden mb-16 md:mb-20 lg:mb-24 shadow-2xl border-b-2 border-amber-900/20">
          {/* Background Image Container */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Main Image with Enhanced Effects */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1920&h=1080&fit=crop&q=80&auto=format"
                alt={t("categories.allCategories")}
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
                  "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.55) 100%)",
              }}
            ></div>

            {/* Gradient Overlay with Better Blending */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-amber-800/60 to-black/80 mix-blend-multiply"></div>

            {/* Additional Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Decorative Geometric Shapes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/8 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-amber-800/8 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>

            {/* Light Rays Effect */}
            <div className="absolute inset-0 opacity-12">
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-400/35 to-transparent transform -skew-x-12"></div>
              <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-white/25 to-transparent transform skew-x-12"></div>
            </div>

            {/* Subtle Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)",
                backgroundSize: "55px 55px",
              }}
            ></div>
          </div>
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white mb-6 md:mb-8 drop-shadow-2xl animate-fade-in">
                {t("categories.allCategories")}
              </h1>
              <p className="text-gray-200 text-lg md:text-xl lg:text-2xl xl:text-3xl max-w-3xl mx-auto drop-shadow-lg animate-fade-in">
                {t("categories.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid - Full Width */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 md:py-20 lg:py-24 pb-20 md:pb-24 lg:pb-28">
          <div className="w-full max-w-7xl mx-auto">
            {loading ? (
              <CategoriesGridSkeleton count={6} />
            ) : error ? (
              <div className="text-center py-12 text-red-400">
                <p className="text-lg">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Categories;
