import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

/**
 * Placeholder Component
 * 
 * A clean and professional placeholder component for missing UI or data
 * that doesn't have a design yet. Can be used throughout the application.
 * 
 * @param {string} title - Title text to display
 * @param {string} description - Description text to display
 * @param {string} icon - Optional icon (emoji or text)
 */
const PlaceholderComponent = ({ 
  title = "Coming Soon", 
  description = "This feature is under development",
  icon = "🚧"
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <div className={`w-full py-16 md:py-24 flex items-center justify-center ${
      isDark ? "bg-luxury-brown-dark" : "bg-luxury-cream"
    }`}>
      <div className={`max-w-md mx-auto text-center px-4 ${
        isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
      }`}>
        <div className="text-6xl md:text-8xl mb-6">{icon}</div>
        <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${
          isDark ? "text-white" : "text-luxury-brown-text"
        }`}>
          {title}
        </h2>
        <p className={`text-lg md:text-xl ${
          isDark ? "text-luxury-brown-light/80" : "text-luxury-brown-text/70"
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default PlaceholderComponent;


