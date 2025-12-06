import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";

const CreateBookingListModal = ({
  onClose,
  onSuccess,
  productId = null,
  initialQuantity = 1,
}) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    product_id: productId || "",
    quantity: initialQuantity,
  });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products if productId is not provided
  useEffect(() => {
    if (!productId) {
      fetchProducts();
    }
  }, [productId]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await apiService.getProducts({ page: 1, per_page: 100 });
      if (response.success && response.data) {
        const productsList = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setProducts(productsList);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_id) {
      showToast(
        t("bookingLists.productRequired") || "Please select a product",
        "error"
      );
      return;
    }

    if (!formData.quantity || formData.quantity < 1) {
      showToast(
        t("bookingLists.quantityMin") || "Quantity must be at least 1",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.createBookingList(
        parseInt(formData.product_id),
        parseInt(formData.quantity)
      );

      if (response.success) {
        showToast(
          response.message || t("bookingLists.createSuccess"),
          "success"
        );
        if (onSuccess) onSuccess();
      } else {
        // Handle validation errors
        if (response.errors) {
          const errorMessages = Object.values(response.errors).flat();
          showToast(errorMessages[0] || response.message, "error");
        } else {
          showToast(
            response.message || t("bookingLists.createFailed"),
            "error"
          );
        }
      }
    } catch (error) {
      console.error("Error creating booking list:", error);
      showToast(t("bookingLists.createFailed"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const name = product.name || product.nameEn || "";
    const nameEn = product.nameEn || "";
    const searchLower = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(searchLower) ||
      nameEn.toLowerCase().includes(searchLower)
    );
  });

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/95 backdrop-blur-md border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";

  const inputClasses = isDark
    ? "bg-luxury-brown-darker/80 text-luxury-brown-light placeholder-luxury-brown-light/60 border border-luxury-gold-dark/40 focus:border-luxury-gold"
    : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border border-luxury-gold-light/60 focus:border-luxury-gold";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`${panelClasses} rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-2xl md:text-3xl font-bold ${
              isDark ? "text-white" : "text-luxury-brown-text"
            }`}
          >
            {t("bookingLists.createBookingList") || "Create Booking List"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-300 ${
              isDark
                ? "hover:bg-luxury-brown-dark/60 text-luxury-brown-light hover:text-luxury-gold-light"
                : "hover:bg-luxury-gold/10 text-luxury-brown-text hover:text-luxury-gold"
            }`}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          {!productId ? (
            <div>
              <label
                className={`block text-base md:text-lg font-semibold mb-2 ${
                  isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
                }`}
              >
                {t("bookingLists.product") || "Product"} *
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  t("bookingLists.searchProduct") || "Search products..."
                }
                className={`w-full px-4 py-3 rounded-xl mb-2 ${inputClasses}`}
              />
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl ${inputClasses}`}
              >
                <option value="">
                  {t("bookingLists.selectProduct") || "Select a product"}
                </option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name || product.nameEn || `Product #${product.id}`}
                  </option>
                ))}
              </select>
              {loadingProducts && (
                <p
                  className={`text-sm mt-2 ${
                    isDark
                      ? "text-luxury-brown-light/60"
                      : "text-luxury-brown-text/60"
                  }`}
                >
                  {t("bookingLists.loadingProducts") || "Loading products..."}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label
                className={`block text-base md:text-lg font-semibold mb-2 ${
                  isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
                }`}
              >
                {t("bookingLists.product") || "Product"}
              </label>
              <input
                type="text"
                value={`Product ID: ${productId}`}
                disabled
                className={`w-full px-4 py-3 rounded-xl ${inputClasses} opacity-60 cursor-not-allowed`}
              />
              <input type="hidden" name="product_id" value={productId} />
            </div>
          )}

          {/* Quantity */}
          <div>
            <label
              className={`block text-base md:text-lg font-semibold mb-2 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
              }`}
            >
              {t("bookingLists.quantity") || "Quantity"} *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              className={`w-full px-4 py-3 rounded-xl ${inputClasses}`}
              placeholder={
                t("bookingLists.quantityPlaceholder") || "Enter quantity"
              }
            />
            <p
              className={`text-xs mt-1 ${
                isDark
                  ? "text-luxury-brown-light/60"
                  : "text-luxury-brown-text/60"
              }`}
            >
              {t("bookingLists.quantityHint") || "Minimum quantity is 1"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-luxury-brown-dark/60 hover:bg-luxury-brown-dark/80 text-luxury-brown-light border border-luxury-gold-dark/40"
                  : "bg-luxury-cream/60 hover:bg-luxury-cream/80 text-luxury-brown-text border border-luxury-gold-light/40"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t("bookingLists.cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white hover:from-luxury-gold-light hover:to-luxury-gold"
              } hover:scale-105 transform shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>{t("bookingLists.creating") || "Creating..."}</span>
                </div>
              ) : (
                t("bookingLists.create") || "Create Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookingListModal;
