// Helper function to get translated text from mock data based on current language
import i18n from "../i18n";
import { mockCategories, mockProducts } from "../services/mockData";

/**
 * Get translated name from product/category object
 * @param {Object} item - Product or category object with name and nameEn
 * @returns {string} Translated name
 */
export const getTranslatedName = (item) => {
    if (!item) return "";
    const currentLang = i18n.language || "ar";

    // If nameEn exists, use it for English
    if (currentLang === "en" && item.nameEn) {
        return item.nameEn;
    }

    // If nameEn doesn't exist but we have an ID, try to look up the product
    if (currentLang === "en" && item.id && !item.nameEn) {
        const product = mockProducts.find((p) => p.id === parseInt(item.id));
        if (product && product.nameEn) {
            return product.nameEn;
        }
    }

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
 * @param {string|Object|number} category - Category string, object, or categoryId
 * @param {number} [categoryId] - Optional category ID to look up
 * @returns {string} Translated category name
 */
export const getTranslatedCategory = (category, categoryId = null) => {
    if (!category && !categoryId) return "";
    const currentLang = i18n.language || "ar";

    // If category is an object with name and nameEn
    if (typeof category === "object" && category !== null) {
        return currentLang === "en" && category.nameEn ? category.nameEn : category.name || "";
    }

    // Look up category by ID or name in mockCategories
    let categoryObj = null;
    if (categoryId) {
        categoryObj = mockCategories.find((cat) => cat.id === parseInt(categoryId));
    } else if (typeof category === "string") {
        categoryObj = mockCategories.find((cat) => cat.name === category || cat.nameEn === category);
    } else if (typeof category === "number") {
        categoryObj = mockCategories.find((cat) => cat.id === parseInt(category));
    }

    if (categoryObj) {
        return currentLang === "en" && categoryObj.nameEn ? categoryObj.nameEn : categoryObj.name;
    }

    // Fallback: return category as string if not found
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

