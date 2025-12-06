import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getTranslatedName,
  getTranslatedDescription,
} from "../utils/translations";

const CategoryCard = ({ category }) => {
  const { t } = useTranslation();

  // Get translated category data (computed on each render to reflect language changes)
  const categoryName = getTranslatedName(category);
  const categoryDescription = getTranslatedDescription(category);
  return (
    <Link
      to={`/products?category=${category.id}`}
      className="
        block w-full rounded-2xl overflow-hidden border border-card bg-card shadow-xl group
        backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.03]
        hover:shadow-2xl hover:border-luxury-gold/70 dark:hover:border-luxury-gold-light/70
        card-hover card-shine
      "
    >
      <div
        className="
          relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-t-2xl
          bg-gradient-to-br from-luxury-gold/15 via-transparent to-white
          dark:from-luxury-gold-dark/30 dark:via-[#8f6c33]/10 dark:to-black
        "
      >
        {category.image ? (
          <>
            <img
              src={category.image}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover object-center scale-110 group-hover:scale-115 transition-transform duration-700 ease-out"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute inset-0 backdrop-blur-[3px] glass-surface dark:bg-black/35 group-hover:bg-black/25 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 dark:from-black/50 dark:via-transparent dark:to-black/30"></div>
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white/70 via-transparent to-transparent dark:from-black/70 dark:via-black/30"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/40 via-luxury-gold/20 to-white dark:from-luxury-gold-dark/40 dark:via-[#8f6c33]/30 dark:to-black"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-white/20 to-transparent dark:from-black/70 dark:via-black/30"></div>
      </div>

      <div className="p-7 sm:p-8 md:p-9 space-y-5 bg-card-muted backdrop-blur-sm">
        <h3 className="font-bold text-xl sm:text-2xl md:text-2xl text-primary group-hover:text-luxury-gold-light transition-colors duration-300">
          {categoryName}
        </h3>
        <p className="text-sm sm:text-base line-clamp-2 leading-relaxed text-muted" dangerouslySetInnerHTML={{__html: categoryDescription}}>
          
        </p>
        <div className="pt-4 border-t border-card group-hover:border-luxury-gold/40 transition-colors duration-300">
          <p className="text-luxury-gold text-sm sm:text-base font-semibold group-hover:text-luxury-gold-light transition-colors duration-300">
            {category.products_count}{" "}
            {category.products_count === 1
              ? t("categoryCard.product")
              : t("categoryCard.products")}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
