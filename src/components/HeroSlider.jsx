import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";

const HeroSlider = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default fallback slides
  const defaultSlides = [
    {
      title: t("hero.slide1Title"),
      description: t("hero.slide1Description"),
      primaryButton: { text: t("hero.slide1PrimaryButton"), link: "/products" },
      secondaryButton: {
        text: t("hero.slide1SecondaryButton"),
        link: "/categories",
      },
      image:
        "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1920&h=1080&fit=crop&q=90&auto=format",
      overlay: "from-black/70 via-black/50 to-black/60",
    },
    {
      title: t("hero.slide2Title"),
      description: t("hero.slide2Description"),
      primaryButton: { text: t("hero.slide2PrimaryButton"), link: "/products" },
      secondaryButton: {
        text: t("hero.slide2SecondaryButton"),
        link: "/categories",
      },
      image:
        "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1920&h=1080&fit=crop&q=90&auto=format",
      overlay: "from-luxury-gold-dark/80 via-luxury-gold/60 to-black/70",
    },
    {
      title: t("hero.slide3Title"),
      description: t("hero.slide3Description"),
      primaryButton: {
        text: t("hero.slide3PrimaryButton"),
        link: "/products?category=4",
      },
      secondaryButton: {
        text: t("hero.slide3SecondaryButton"),
        link: "/categories",
      },
      image:
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1920&h=1080&fit=crop&q=90&auto=format",
      overlay: "from-black/70 via-luxury-gold-dark/50 to-black/60",
    },
  ];

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
    if (imagePath && typeof imagePath === "object" && imagePath.path) {
      return getImageUrl(imagePath.path);
    }
    return null;
  };

  // Fetch sliders from API
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const response = await apiService.getSliders();

        if (
          response.success &&
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          // Filter active sliders and map to component format
          const formattedSlides = response.data
            .filter(
              (slider) => slider.is_active !== false && slider.is_active !== 0
            )
            .sort(
              (a, b) =>
                (a.order || a.position || 0) - (b.order || b.position || 0)
            )
            .map((slider) => {
              // Get title (support both Arabic and English)
              const title =
                (i18n.language === "ar" && slider.title_ar
                  ? slider.title_ar
                  : slider.title) ||
                slider.name ||
                "";

              // Get description (support both Arabic and English)
              const description =
                (i18n.language === "ar" && slider.description_ar
                  ? slider.description_ar
                  : slider.description) || "";

              // Get image URL
              const image = getImageUrl(
                slider.image ||
                  slider.image_path ||
                  slider.path ||
                  slider.url ||
                  slider.thumb_image
              );

              // Get button links
              const primaryLink =
                slider.link ||
                slider.url ||
                slider.button_link ||
                slider.primary_link ||
                "/products";
              const secondaryLink =
                slider.secondary_link || slider.secondary_url || "/categories";

              // Get button texts
              const primaryButtonText =
                (i18n.language === "ar" && slider.button_text_ar
                  ? slider.button_text_ar
                  : slider.button_text) ||
                slider.primary_button_text ||
                t("hero.slide1PrimaryButton");
              const secondaryButtonText =
                slider.secondary_button_text || t("hero.slide1SecondaryButton");

              return {
                id: slider.id,
                title,
                description,
                primaryButton: {
                  text: primaryButtonText,
                  link: primaryLink,
                },
                secondaryButton: {
                  text: secondaryButtonText,
                  link: secondaryLink,
                },
                image: image || defaultSlides[0].image,
                overlay:
                  slider.overlay || "from-black/70 via-black/50 to-black/60",
              };
            });

          if (formattedSlides.length > 0) {
            setSlides(formattedSlides);
          } else {
            // Fallback to default slides if no valid sliders
            setSlides(defaultSlides);
          }
        } else {
          // Fallback to default slides if API fails or returns no data
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.error("Error fetching sliders:", error);
        // Fallback to default slides on error
        setSlides(defaultSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, [t, i18n.language]);

  useEffect(() => {
    if (isPaused || !slides || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, slides]);

  const goToSlide = (index) => {
    if (slides.length === 0) return;
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Don't render if loading and no slides
  if (loading && slides.length === 0) {
    return (
      <section className="w-screen relative left-1/2 -translate-x-1/2 h-[650px] md:h-[750px] lg:h-[850px] xl:h-[950px] mb-16 md:mb-20 lg:mb-24 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </section>
    );
  }

  // Don't render if no slides available
  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <section
      className="w-screen relative left-1/2 -translate-x-1/2 h-[650px] md:h-[750px] lg:h-[850px] xl:h-[950px] mb-16 md:mb-20 lg:mb-24 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-full">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image Container */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Main Image with Enhanced Effects */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform ease-out"
                  style={{
                    transitionDuration: "3000ms",
                    transform:
                      index === currentSlide ? "scale(1.05)" : "scale(1.15)",
                  }}
                  loading={index === 0 ? "eager" : "lazy"}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                {/* Subtle Blur Effect on Edges */}
                <div className="absolute inset-0 backdrop-blur-[1px] opacity-30"></div>
              </div>

              {/* Vignette Effect */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)",
                }}
              ></div>

              {/* Gradient Overlay with Better Blending */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${slide.overlay} mix-blend-multiply`}
              ></div>

              {/* Additional Dark Overlay for Text Readability */}
              <div className="absolute inset-0 bg-black/40"></div>

              {/* Decorative Geometric Shapes */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-luxury-gold-dark/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

              {/* Subtle Pattern Overlay */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)",
                  backgroundSize: "50px 50px",
                }}
              ></div>

              {/* Light Rays Effect */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/30 to-transparent transform -skew-x-12"></div>
                <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-luxury-gold-light/20 to-transparent transform skew-x-12"></div>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
                <div className="text-center w-full">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 md:mb-12 lg:mb-16 leading-tight drop-shadow-2xl animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-gray-200 text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto mb-12 md:mb-16 lg:mb-20 leading-relaxed px-4 drop-shadow-lg animate-fade-in">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in">
                    <Link
                      to={slide.primaryButton.link}
                      className="w-full sm:w-auto bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white px-10 sm:px-12 py-4 sm:py-5 rounded-xl font-semibold text-lg sm:text-xl hover:from-luxury-gold-light hover:to-luxury-gold-light transition-all shadow-2xl hover:shadow-3xl hover:shadow-luxury-gold/60 hover:scale-110 transform duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/70 relative overflow-hidden group"
                    >
                      {slide.primaryButton.text}
                    </Link>
                    <Link
                      to={slide.secondaryButton.link}
                      className="w-full sm:w-auto bg-white/15 backdrop-blur-md text-white px-10 sm:px-12 py-4 sm:py-5 rounded-xl font-semibold text-lg sm:text-xl hover:bg-white/30 transition-all border-2 border-white/40 hover:border-white/60 shadow-lg hover:shadow-2xl hover:shadow-white/30 transform duration-300 focus:outline-none focus:ring-4 focus:ring-white/50 relative overflow-hidden group"
                    >
                      {slide.secondaryButton.text}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md text-white p-3 md:p-4 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/30"
          aria-label={t("hero.previousSlide")}
        >
          <svg
            className="w-6 h-6 md:w-8 md:h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md text-white p-3 md:p-4 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/30"
          aria-label={t("hero.nextSlide")}
        >
          <svg
            className="w-6 h-6 md:w-8 md:h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-4 focus:ring-luxury-gold/70 ${
                index === currentSlide
                  ? "w-10 md:w-12 h-3 md:h-4 bg-luxury-gold shadow-lg shadow-luxury-gold/60 animate-pulse-gold"
                  : "w-3 md:w-4 h-3 md:h-4 bg-white/50 hover:bg-white/80 hover:scale-125 transform"
              }`}
              aria-label={`${t("hero.goToSlide")} ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
