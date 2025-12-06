import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

const OffersContext = createContext();

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (!context) {
    // Return default values if context is not available
    return {
      offers: [],
      loading: false,
      getProductOffer: () => null,
      getDiscountedPrice: () => null,
      formatDiscount: () => "",
      hasOffer: () => false,
    };
  }
  return context;
};

export const OffersProvider = ({ children }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsWithOffers, setProductsWithOffers] = useState(new Map());

  // Check if offer is currently active
  const isOfferActive = (offer) => {
    // Check is_active flag - handle boolean, string, or number
    const isActive =
      offer.is_active === true ||
      offer.is_active === 1 ||
      offer.is_active === "1" ||
      offer.is_active === "true";

    if (!isActive) {
      console.log("Offer inactive - is_active:", offer.is_active, offer.id);
      return false;
    }

    const now = new Date();

    // Handle start_date - be flexible with date formats
    let startDate = null;
    if (offer.start_date) {
      startDate = new Date(offer.start_date);
      // Check if date is valid
      if (isNaN(startDate.getTime())) {
        console.warn(
          "Invalid start_date for offer:",
          offer.id,
          offer.start_date
        );
        startDate = null;
      }
    }

    // Handle end_date - be flexible with date formats
    let endDate = null;
    if (offer.end_date) {
      endDate = new Date(offer.end_date);
      // Check if date is valid
      if (isNaN(endDate.getTime())) {
        console.warn("Invalid end_date for offer:", offer.id, offer.end_date);
        endDate = null;
      }
    }

    // Check if current date is before start date
    if (startDate && now < startDate) {
      console.log("Offer not started yet:", offer.id, "Start:", startDate);
      return false;
    }

    // Check if current date is after end date
    if (endDate && now > endDate) {
      console.log("Offer expired:", offer.id, "End:", endDate);
      return false;
    }

    return true;
  };

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await apiService.getOffers();

        console.log("🔍 Offers API Response:", response);

        if (response.success && response.data && Array.isArray(response.data)) {
          console.log(`📦 Total offers from API: ${response.data.length}`);

          // Filter only active offers
          const activeOffers = response.data.filter((offer) =>
            isOfferActive(offer)
          );

          console.log(
            `✅ Active offers after filtering: ${activeOffers.length}`
          );
          console.log("Active offers:", activeOffers);

          setOffers(activeOffers);

          // Create a map of product IDs to their offers
          const productOffersMap = new Map();
          activeOffers.forEach((offer) => {
            // Handle different possible structures for product_id
            let productId = null;

            // Try different possible paths for product_id
            if (offer.type === "product") {
              if (offer.condition?.product_id) {
                productId = parseInt(offer.condition.product_id);
              } else if (offer.product_id) {
                productId = parseInt(offer.product_id);
              } else if (offer.condition?.product?.id) {
                productId = parseInt(offer.condition.product.id);
              }

              if (productId && !isNaN(productId)) {
                if (!productOffersMap.has(productId)) {
                  productOffersMap.set(productId, []);
                }
                productOffersMap.get(productId).push(offer);
              }
            }
          });
          console.log(
            "📌 Product offers map:",
            Array.from(productOffersMap.entries())
          );
          setProductsWithOffers(productOffersMap);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
        setOffers([]);
        setProductsWithOffers(new Map());
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();

    // Refresh offers every 5 minutes to check for expired/new offers
    const interval = setInterval(fetchOffers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get offer for a specific product
  const getProductOffer = (productId) => {
    const productOffers = productsWithOffers.get(parseInt(productId));
    if (productOffers && productOffers.length > 0) {
      // Return the best offer (highest discount)
      return productOffers.sort((a, b) => {
        const discountA = parseFloat(a.discount_value) || 0;
        const discountB = parseFloat(b.discount_value) || 0;
        return discountB - discountA;
      })[0];
    }
    return null;
  };

  // Calculate discounted price for a product
  const getDiscountedPrice = (product, offer) => {
    if (!offer || !product.price) return null;

    const originalPrice = parseFloat(product.price) || 0;
    const discountValue = parseFloat(offer.discount_value) || 0;

    if (offer.discount_type === "percentage") {
      const discountAmount = (originalPrice * discountValue) / 100;
      return originalPrice - discountAmount;
    } else if (offer.discount_type === "fixed") {
      return Math.max(0, originalPrice - discountValue);
    }

    return null;
  };

  // Format discount text
  const formatDiscount = (offer) => {
    if (!offer) return "";
    const value = parseFloat(offer.discount_value) || 0;
    if (offer.discount_type === "percentage") {
      return `${value}%`;
    }
    return `${value} OFF`;
  };

  const value = {
    offers,
    loading,
    getProductOffer,
    getDiscountedPrice,
    formatDiscount,
    hasOffer: (productId) => productsWithOffers.has(parseInt(productId)),
  };

  return (
    <OffersContext.Provider value={value}>{children}</OffersContext.Provider>
  );
};
