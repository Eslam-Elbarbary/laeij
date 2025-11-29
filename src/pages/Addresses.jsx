import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const Addresses = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const hasShownToast = useRef(false);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: t("addresses.demoAddress1.type"),
      location: t("addresses.demoAddress1.location"),
      details: t("addresses.demoAddress1.details"),
    },
    {
      id: 2,
      type: t("addresses.demoAddress2.type"),
      location: t("addresses.demoAddress2.location"),
      details: t("addresses.demoAddress2.details"),
    },
  ]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    type: "",
    location: "",
    details: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast(t("addresses.pleaseLogin"), "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast, t]);

  // Update demo addresses when language changes (preserve other addresses)
  useEffect(() => {
    setAddresses((prevAddresses) => {
      const otherAddresses = prevAddresses.filter((addr) => addr.id !== 1 && addr.id !== 2);
      return [
        {
          id: 1,
          type: t("addresses.demoAddress1.type"),
          location: t("addresses.demoAddress1.location"),
          details: t("addresses.demoAddress1.details"),
        },
        {
          id: 2,
          type: t("addresses.demoAddress2.type"),
          location: t("addresses.demoAddress2.location"),
          details: t("addresses.demoAddress2.details"),
        },
        ...otherAddresses,
      ];
    });
  }, [i18n.language, t]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleDelete = (id) => {
    if (window.confirm(t("addresses.deleteConfirm"))) {
      setAddresses(addresses.filter((addr) => addr.id !== id));
      showToast(t("addresses.addressDeleted"), "success");
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setEditForm({
      type: address.type,
      location: address.location,
      details: address.details,
    });
  };

  const handleSaveEdit = () => {
    setAddresses(
      addresses.map((addr) =>
        addr.id === editingId ? { ...addr, ...editForm } : addr
      )
    );
    setEditingId(null);
    setEditForm({ type: "", location: "", details: "" });
    showToast(t("addresses.addressUpdated"), "success");
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

        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`${panelClasses} rounded-2xl p-4 md:p-6 transition-shadow shadow-md hover:shadow-xl`}
            >
              {editingId === address.id ? (
                <div className={`space-y-4 ${i18n.language === "ar" ? "text-right" : "text-left"}`}>
                  <input
                    type="text"
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({ ...editForm, type: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                    placeholder={t("addresses.addressType")}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                    placeholder={t("addresses.location")}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
                  <textarea
                    value={editForm.details}
                    onChange={(e) =>
                      setEditForm({ ...editForm, details: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg ${inputClasses} ${i18n.language === "ar" ? "text-right" : "text-left"}`}
                    placeholder={t("addresses.details")}
                    rows={3}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
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
          ))}
        </div>

        <button
          onClick={() => {
            const newAddress = {
              id: Date.now(),
              type: t("addresses.newAddress"),
              location: t("addresses.enterLocation"),
              details: t("addresses.enterDetails"),
            };
            setAddresses([...addresses, newAddress]);
            setEditingId(newAddress.id);
            setEditForm({ type: "", location: "", details: "" });
            showToast(t("addresses.addressAdded"), "success");
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
