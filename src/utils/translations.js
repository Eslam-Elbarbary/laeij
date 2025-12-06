// Helper functions to get translated text based on current language
import i18n from "../i18n";

/**
 * Get translated name from product/category object
 * @param {Object} item - Product or category object with name and nameEn
 * @returns {string} Translated name
 */
export const getTranslatedName = (item) => {
    if (!item) return "";
    const currentLang = i18n.language || "ar";

    // Use nameEn for English, name for Arabic
    if (currentLang === "en" && item.nameEn) {
        return item.nameEn;
    }

    // Fallback to name if nameEn doesn't exist
    return item.name || "";
};

/**
 * Get translated description from product/category object
 * @param {Object} item - Product or category object with description and descriptionEn
 * @returns {string} Translated description
 */
export const getTranslatedDescription = (item) => {
    if (!item) return "";
    const currentLang = i18n.language || "ar";
    return currentLang === "en" && item.descriptionEn ? item.descriptionEn : item.description;
};

/**
 * Get translated category name
 * @param {string|Object} category - Category string or object with name and nameEn
 * @returns {string} Translated category name
 */
export const getTranslatedCategory = (category) => {
    if (!category) return "";
    const currentLang = i18n.language || "ar";

    // If category is an object with name and nameEn
    if (typeof category === "object" && category !== null) {
        return currentLang === "en" && category.nameEn ? category.nameEn : category.name || "";
    }

    // Fallback: return category as string
    return typeof category === "string" ? category : "";
};

/**
 * Get translated size with proper units
 * @param {string} size - Size string like "10 مل" or "30 جم"
 * @returns {string} Translated size with proper units
 */
export const getTranslatedSize = (size) => {
    if (!size) return "";
    const currentLang = i18n.language || "ar";

    // If already in English format, return as is
    if (currentLang === "en") {
        // Replace Arabic units with English units
        return size
            .replace(/مل/g, "ml")
            .replace(/جم/g, "g");
    }

    // For Arabic, return as is
    return size;
};

