import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";

/**
 * Addresses Page
 * 
 * Manages user's saved addresses using the real API.
 * Supports creating, updating, and deleting addresses.
 */
const Addresses = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const hasShownToast = useRef(false);
  
  // State management
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    state: "",
    postal_code: "",
  });

  /**
   * Fetch addresses from API
   */
  useEffect(() => {
    const fetchAddresses = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          setError(null);
          const response = await apiService.getAddresses();
          
          if (response.success && response.data) {
            // Transform API response to match our address structure
            const formattedAddresses = Array.isArray(response.data)
              ? response.data.map((addr) => ({
                  id: addr.id,
                  type: addr.name || addr.type || t("addresses.home"),
                  location: `${addr.city || ""}, ${addr.country || ""}`.trim(),
                  details: addr.address || "",
                  // Store full data for editing
                  fullData: {
                    name: addr.name || "",
                    phone: addr.phone || "",
                    address: addr.address || "",
                    city: addr.city || "",
                    country: addr.country || "",
                    state: addr.state || "",
                    postal_code: addr.postal_code || "",
                  },
                }))
              : [];
            setAddresses(formattedAddresses);
          } else {
            setAddresses([]);
          }
        } catch (err) {
          console.error("Error fetching addresses:", err);
          setError(t("addresses.errorLoading"));
          setAddresses([]);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, t]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast(t("addresses.pleaseLogin"), "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  /**
   * Delete address
   * Note: Backend may not support DELETE endpoint yet
   */
  const handleDelete = async (id) => {
    if (window.confirm(t("addresses.deleteConfirm"))) {
      try {
        const response = await apiService.deleteAddress(id);
        if (response.success) {
          setAddresses(addresses.filter((addr) => addr.id !== id));
          showToast(t("addresses.addressDeleted"), "success");
        } else {
          // Check if it's a route not found error
          const errorMessage = response.message || "";
          if (errorMessage.includes("could not be found") || errorMessage.includes("route") || response.routeNotFound) {
            showToast(t("addresses.featureNotAvailable") || "Delete address feature is not available yet", "error");
          } else {
            showToast(errorMessage || t("addresses.errorDeleting"), "error");
          }
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "";
        if (errorMessage.includes("could not be found") || errorMessage.includes("route") || err.response?.status === 404) {
          showToast(t("addresses.featureNotAvailable") || "Delete address feature is not available yet", "error");
          // Don't log route-not-found errors to console (they're expected)
        } else {
          console.error("Error deleting address:", err);
          showToast(t("addresses.errorDeleting"), "error");
        }
      }
    }
  };

  /**
   * Start editing address
   */
  const handleEdit = (address) => {
    setEditingId(address.id);
    setIsAddingNew(false);
    setEditForm(address.fullData || {
      name: address.type || "",
      phone: "",
      address: address.details || "",
      city: address.location?.split(",")[0]?.trim() || "",
      country: address.location?.split(",")[1]?.trim() || "",
      state: "",
      postal_code: "",
    });
  };

  /**
   * Save address (create or update)
   * POST /addresses or PUT /addresses/:id
   */
  const handleSaveEdit = async () => {
    try {
      // Validate required fields
      if (!editForm.name || !editForm.phone || !editForm.address || !editForm.city || !editForm.country) {
        showToast(t("addresses.fillRequiredFields"), "error");
        return;
      }

      let response;
      if (isAddingNew) {
        // Create new address
        response = await apiService.createAddress(editForm);
      } else {
        // Update existing address
        response = await apiService.updateAddress(editingId, editForm);
      }

      if (response.success) {
        // Refresh addresses list
        const addressesResponse = await apiService.getAddresses();
        if (addressesResponse.success && addressesResponse.data) {
          const formattedAddresses = Array.isArray(addressesResponse.data)
            ? addressesResponse.data.map((addr) => ({
                id: addr.id,
                type: addr.name || addr.type || t("addresses.home"),
                location: `${addr.city || ""}, ${addr.country || ""}`.trim(),
                details: addr.address || "",
                fullData: {
                  name: addr.name || "",
                  phone: addr.phone || "",
                  address: addr.address || "",
                  city: addr.city || "",
                  country: addr.country || "",
                  state: addr.state || "",
                  postal_code: addr.postal_code || "",
                },
              }))
            : [];
          setAddresses(formattedAddresses);
        }
        setEditingId(null);
        setIsAddingNew(false);
        setEditForm({
          name: "",
          phone: "",
          address: "",
          city: "",
          country: "",
          state: "",
          postal_code: "",
        });
        showToast(
          isAddingNew 
            ? t("addresses.addressAdded") 
            : t("addresses.addressUpdated"), 
          "success"
        );
      } else {
        // Check if it's a route not found error
        const errorMessage = response.message || "";
        if (errorMessage.includes("could not be found") || errorMessage.includes("route") || response.routeNotFound) {
          showToast(t("addresses.featureNotAvailable") || "Update address feature is not available yet", "error");
        } else {
          showToast(errorMessage || t("addresses.errorSaving"), "error");
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "";
      if (errorMessage.includes("could not be found") || errorMessage.includes("route") || err.response?.status === 404) {
        showToast(t("addresses.featureNotAvailable") || "Update address feature is not available yet", "error");
        // Don't log route-not-found errors to console (they're expected)
      } else {
        console.error("Error saving address:", err);
        showToast(t("addresses.errorSaving"), "error");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ type: "", location: "", details: "" });
  };

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/90 border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";

  const buttonClasses = isDark
    ? "bg-luxury-brown-darker/80 hover:bg-luxury-brown-darker text-luxury-brown-light border border-luxury-gold-dark/40"
    : "bg-white hover:bg-luxury-cream text-luxury-brown-text border border-luxury-gold-light/40";

  const inputClasses = isDark
    ? "bg-luxury-brown-darker/80 text-luxury-brown-light placeholder-luxury-brown-light/60 border border-luxury-gold-dark/40 focus:border-luxury-gold"
    : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border border-luxury-gold-light/60 focus:border-luxury-gold";

  return (
    <PageLayout>
      <div className={`max-w-4xl mx-auto space-y-6 px-4 sm:px-6 md:px-0`}>
        <div className={i18n.language === "ar" ? "text-right" : "text-left"}>
          <h1 className="text-2xl mt-[100px] md:text-3xl font-bold text-primary mb-2">
            {t("addresses.title")}
          </h1>
          <p className="text-muted">{t("addresses.subtitle")}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
            <p className="mt-4 text-muted">{t("common.loading")}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Add New Address Form */}
            {isAddingNew && (
              <div className={`${panelClasses} rounded-2xl p-4 md:p-6 transition-shadow shadow-md`}>
                <div className={`space-y-4 ${i18n.language === "ar" ? "text-right" : "text-left"}`}>
                  <h3 className="text-lg font-semibold mb-4">{t("addresses.addNewAddress")}</h3>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                    placeholder={t("addresses.addressType")}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                    placeholder={t("addresses.phone")}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                    placeholder={t("addresses.address")}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                      placeholder={t("addresses.city")}
                      dir={i18n.language === "ar" ? "rtl" : "ltr"}
                    />
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                      placeholder={t("addresses.country")}
                      dir={i18n.language === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                  <div className={`flex gap-2 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-luxury-gold hover:bg-luxury-gold-light text-luxury-brown-darker py-2 rounded-lg font-semibold transition-colors"
                    >
                      {t("addresses.save")}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditForm({
                          name: "",
                          phone: "",
                          address: "",
                          city: "",
                          country: "",
                          state: "",
                          postal_code: "",
                        });
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors"
                    >
                      {t("addresses.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Addresses */}
            <div className="space-y-4">
              {addresses.length === 0 && !isAddingNew ? (
                <div className="text-center py-12 text-muted">
                  <p>{t("addresses.noAddresses")}</p>
                </div>
              ) : (
                addresses.map((address) => (
            <div
              key={address.id}
              className={`${panelClasses} rounded-2xl p-4 md:p-6 transition-shadow shadow-md hover:shadow-xl`}
            >
              {editingId === address.id ? (
                <div className={`space-y-4 ${i18n.language === "ar" ? "text-right" : "text-left"}`}>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                    placeholder={t("addresses.addressType")}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                    placeholder={t("addresses.phone")}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                    placeholder={t("addresses.address")}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                      placeholder={t("addresses.city")}
                      dir={i18n.language === "ar" ? "rtl" : "ltr"}
                    />
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                      placeholder={t("addresses.country")}
                      dir={i18n.language === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                  <div className={`flex gap-2 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-luxury-gold hover:bg-luxury-gold-light text-luxury-brown-darker py-2 rounded-lg font-semibold transition-colors"
                    >
                      {t("addresses.save")}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors"
                    >
                      {t("addresses.cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`flex items-start justify-between mb-3 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-1 ${i18n.language === "ar" ? "text-right" : "text-left"}`}>
                    <div className={`flex items-center gap-2 mb-2 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}>
                      <span className="text-amber-500">📍</span>
                      <h3 className="text-primary font-semibold">
                        {address.type}
                      </h3>
                    </div>
                    <p className="text-secondary mb-1">{address.location}</p>
                    <p className="text-muted text-sm">{address.details}</p>
                  </div>
                  <div className={`flex gap-2 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}>
                    <button
                      onClick={() => handleEdit(address)}
                      aria-label={t("addresses.edit")}
                      className="text-amber-500 hover:text-amber-400 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      aria-label={t("addresses.delete")}
                      className="text-red-500 hover:text-red-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/40"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
                ))
              )}
            </div>
          </>
        )}

        <button
          onClick={() => {
            setIsAddingNew(true);
            setEditingId(null);
            setEditForm({
              name: "",
              phone: "",
              address: "",
              city: "",
              country: "",
              state: "",
              postal_code: "",
            });
          }}
          className={`w-full mb-[100px] ${buttonClasses} py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-4 focus:ring-luxury-gold/40 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
        >
          <span>+</span>
          <span>{t("addresses.addNewAddress")}</span>
        </button>
      </div>
    </PageLayout>
  );
};

export default Addresses;
