import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const CancelOrderModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading,
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const [selectedReason, setSelectedReason] = useState("");

  if (!isOpen) return null;

  const cancellationReasons = [
    {
      value: "changed_mind",
      label: t("cancelOrder.reasons.changedMind") || "Changed my mind",
      labelAr: "غيرت رأيي",
    },
    {
      value: "found_cheaper",
      label:
        t("cancelOrder.reasons.foundCheaper") ||
        "Found a better price elsewhere",
      labelAr: "وجدت سعراً أفضل في مكان آخر",
    },
    {
      value: "wrong_item",
      label:
        t("cancelOrder.reasons.wrongItem") || "Ordered wrong item by mistake",
      labelAr: "طلبت المنتج الخطأ بالخطأ",
    },
    {
      value: "duplicate_order",
      label: t("cancelOrder.reasons.duplicateOrder") || "Duplicate order",
      labelAr: "طلب مكرر",
    },
    {
      value: "shipping_too_long",
      label:
        t("cancelOrder.reasons.shippingTooLong") || "Shipping takes too long",
      labelAr: "التوصيل يستغرق وقتاً طويلاً",
    },
    {
      value: "other",
      label: t("cancelOrder.reasons.other") || "Other reason",
      labelAr: "سبب آخر",
    },
  ];

  const handleConfirm = () => {
    onConfirm(selectedReason || "other");
  };

  const modalClasses = isDark
    ? "bg-luxury-brown-darker/95 backdrop-blur-md border-2 border-luxury-gold-dark/50 text-luxury-brown-light shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
    : "bg-white border-2 border-luxury-gold-light/50 text-luxury-brown-text shadow-[0_20px_60px_rgba(0,0,0,0.15)]";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" />

      {/* Modal */}
      <div
        className={`${modalClasses} relative rounded-3xl max-w-lg w-full p-8 md:p-10 animate-scale-in ${
          i18n.language === "ar" ? "rtl" : "ltr"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 ${
            i18n.language === "ar" ? "left-5" : "right-5"
          } w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            isDark
              ? "hover:bg-red-900/30 text-luxury-brown-light hover:text-red-400"
              : "hover:bg-red-100 text-luxury-brown-text hover:text-red-600"
          }`}
          disabled={isLoading}
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
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(239,68,68,0.3)]">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2
            className={`text-3xl md:text-4xl font-bold mb-3 ${
              isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
            }`}
          >
            {t("cancelOrder.title") || "Cancel Order"}
          </h2>
          <p
            className={`text-base md:text-lg ${
              isDark
                ? "text-luxury-brown-light/70"
                : "text-luxury-brown-text/70"
            }`}
          >
            {t("cancelOrder.subtitle") || "Order"} #{orderNumber}
          </p>
        </div>

        {/* Warning Message */}
        <div
          className={`mb-7 p-5 rounded-2xl border-2 ${
            isDark
              ? "bg-amber-900/25 border-amber-700/40"
              : "bg-amber-50 border-amber-200/60"
          }`}
        >
          <p
            className={`text-sm md:text-base leading-relaxed ${
              i18n.language === "ar" ? "text-right" : "text-left"
            } ${isDark ? "text-amber-300" : "text-amber-800"}`}
          >
            {t("cancelOrder.warning") ||
              "Are you sure you want to cancel this order? This action cannot be undone."}
          </p>
        </div>

        {/* Cancellation Reason - Radio Buttons */}
        <div className="mb-8">
          <label
            className={`block text-base md:text-lg font-bold mb-4 ${
              i18n.language === "ar" ? "text-right" : "text-left"
            } ${isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"}`}
          >
            {t("cancelOrder.selectReason") ||
              "Reason for cancellation (Optional)"}
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-luxury-gold scrollbar-track-transparent pr-2">
            {cancellationReasons.map((reason) => {
              const isSelected = selectedReason === reason.value;
              const reasonText =
                i18n.language === "ar" ? reason.labelAr : reason.label;
              return (
                <label
                  key={reason.value}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? isDark
                        ? "bg-red-900/30 border-2 border-red-600/50"
                        : "bg-red-50 border-2 border-red-400/60"
                      : isDark
                      ? "bg-luxury-brown-darker/50 border-2 border-transparent hover:bg-luxury-brown-darker/70 hover:border-luxury-gold-dark/30"
                      : "bg-luxury-cream border-2 border-transparent hover:bg-luxury-cream/80 hover:border-luxury-gold-light/30"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <input
                      type="radio"
                      name="cancellation-reason"
                      value={reason.value}
                      checked={isSelected}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      disabled={isLoading}
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? "border-red-500 bg-red-500"
                          : isDark
                          ? "border-luxury-gold-dark/50"
                          : "border-luxury-gold-light/60"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`flex-1 text-sm md:text-base ${
                      i18n.language === "ar" ? "text-right" : "text-left"
                    } ${
                      isSelected
                        ? isDark
                          ? "text-red-300 font-semibold"
                          : "text-red-700 font-semibold"
                        : isDark
                        ? "text-luxury-brown-light"
                        : "text-luxury-brown-text"
                    }`}
                  >
                    {reasonText}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex gap-4 ${
            i18n.language === "ar" ? "flex-row-reverse" : ""
          }`}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-6 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-[1.02] ${
              isDark
                ? "bg-luxury-brown-darker/60 hover:bg-luxury-brown-darker/80 text-luxury-brown-light border-2 border-luxury-gold-dark/40 hover:border-luxury-gold-dark/60"
                : "bg-luxury-cream hover:bg-luxury-cream/90 text-luxury-brown-text border-2 border-luxury-gold-light/50 hover:border-luxury-gold-light/70"
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {t("cancelOrder.cancel") || "Keep Order"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
              isDark
                ? "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white border-2 border-red-600 shadow-[0_8px_25px_rgba(239,68,68,0.3)] hover:shadow-[0_12px_35px_rgba(239,68,68,0.4)]"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white border-2 border-red-600 shadow-[0_8px_25px_rgba(239,68,68,0.2)] hover:shadow-[0_12px_35px_rgba(239,68,68,0.3)]"
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{t("cancelOrder.processing") || "Processing..."}</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>
                  {t("cancelOrder.confirm") || "Confirm Cancellation"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
