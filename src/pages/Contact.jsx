import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const Contact = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      showToast(t("contact.sent"), "success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClasses = isDark
    ? "bg-luxury-brown-darker/80 text-luxury-brown-light placeholder-luxury-brown-light/60 border border-luxury-gold-dark/40 focus:border-luxury-gold"
    : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border border-luxury-gold-light/60 focus:border-luxury-gold";
  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
        <div className="space-y-8 md:space-y-12">
          {/* Header Section */}
          <div className={`text-center ${i18n.language === "ar" ? "md:text-right" : "md:text-left"} mb-8 md:mb-12`}>
            <h1
              className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 ${
                isDark ? "text-luxury-gold" : "text-luxury-brown-dark"
              }`}
            >
              {t("contact.title")}
            </h1>
            <p
              className={`text-lg md:text-xl ${
                isDark ? "text-luxury-cream/80" : "text-luxury-brown-text"
              }`}
            >
              {t("contact.subtitle")}
            </p>
          </div>

          {/* Contact Information Grid */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
            {/* Phone Number */}
            <div
              className={`backdrop-blur-sm ltr rounded-2xl p-6 md:p-8 border-2 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                isDark
                  ? "bg-luxury-brown-darker/90 border-luxury-gold-dark/20 hover:border-luxury-gold/50"
                  : "bg-luxury-cream/95 border-luxury-gold-light/40 hover:border-luxury-gold-light/70"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDark ? "bg-luxury-gold/20" : "bg-luxury-gold/20"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${
                      isDark ? "text-luxury-gold" : "text-luxury-gold"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    className={`font-semibold text-lg md:text-xl mb-1 ${
                      isDark ? "text-luxury-gold" : "text-luxury-brown-dark"
                    }`}
                  >
                    {t("contact.phoneLabel")}
                  </h3>
                  <a
                    href="tel:+971561234567"
                    className={`text-base md:text-lg font-medium transition-colors ${
                      isDark
                        ? "text-luxury-cream hover:text-luxury-gold"
                        : "text-luxury-brown-text hover:text-luxury-gold"
                    }`}
                  >
                    +971 56 123 4567
                  </a>
                </div>
              </div>
            </div>

            {/* Address */}
            <div
              className={`backdrop-blur-sm ltr rounded-2xl p-6 md:p-8 border-2 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                isDark
                  ? "bg-luxury-brown-darker/90 border-luxury-gold-dark/20 hover:border-luxury-gold/50"
                  : "bg-luxury-cream/95 border-luxury-gold-light/40 hover:border-luxury-gold-light/70"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDark ? "bg-luxury-gold/20" : "bg-luxury-gold/20"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${
                      isDark ? "text-luxury-gold" : "text-luxury-gold"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    className={`font-semibold text-lg md:text-xl mb-1 ${
                      isDark ? "text-luxury-gold" : "text-luxury-brown-dark"
                    }`}
                  >
                    {t("contact.address")}
                  </h3>
                  <p
                    className={`text-base md:text-lg mb-1 ${
                      isDark ? "text-luxury-cream" : "text-luxury-brown-text"
                    }`}
                  >
                    {t("contact.addressLocation")}
                  </p>
                  <p
                    className={`text-sm md:text-base ${
                      isDark
                        ? "text-luxury-cream/70"
                        : "text-luxury-brown-text/70"
                    }`}
                  >
                    {t("contact.addressStreet")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
            <h2
              className={`text-2xl md:text-3xl font-bold text-center ${i18n.language === "ar" ? "md:text-right" : "md:text-left"} ${
                isDark ? "text-luxury-gold" : "text-luxury-brown-dark"
              }`}
            >
              {t("contact.sendUsMessage")}
            </h2>
            <form
              onSubmit={handleSubmit}
              className={`backdrop-blur-sm rounded-2xl p-6 md:p-8 border-2 shadow-lg ${
                isDark
                  ? "bg-luxury-brown-darker/90 border-luxury-gold-dark/20"
                  : "bg-luxury-cream/95 border-luxury-gold-light/40"
              }`}
            >
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <div>
                  <label
                    className={`block text-base md:text-lg font-semibold mb-2 ${
                      isDark
                        ? "text-luxury-brown-light"
                        : "text-luxury-brown-text"
                    }`}
                  >
                    {t("contact.name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl ${inputClasses}`}
                    placeholder={t("contact.namePlaceholder")}
                  />
                </div>
                <div>
                  <label
                    className={`block text-base md:text-lg font-semibold mb-2 ${
                      isDark
                        ? "text-luxury-brown-light"
                        : "text-luxury-brown-text"
                    }`}
                  >
                    {t("contact.email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl ${inputClasses}`}
                    placeholder={t("contact.emailPlaceholder")}
                  />
                </div>
              </div>
              <div className="mb-4 md:mb-6">
                <label
                  className={`block text-base md:text-lg font-semibold mb-2 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  {t("contact.phone")}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl ${inputClasses}`}
                  placeholder={t("contact.phonePlaceholder")}
                />
              </div>
              <div className="mb-6 md:mb-8">
                <label
                  className={`block text-base md:text-lg font-semibold mb-2 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  {t("contact.message")}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 rounded-xl resize-none ${inputClasses}`}
                  placeholder={t("contact.messagePlaceholder")}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-luxury-gold-dark/40 hover:scale-[1.02] transform duration-300 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold hover:from-luxury-gold-light hover:via-luxury-gold hover:to-luxury-gold-light text-luxury-brown-darker border-luxury-gold-dark shadow-luxury-gold-dark/50"
                    : "bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold hover:from-luxury-gold-light hover:via-luxury-gold hover:to-luxury-gold-light text-luxury-brown-darker border-luxury-gold-dark shadow-luxury-gold-dark/30"
                }`}
              >
                {isSubmitting ? t("contact.sending") : t("contact.sendMessage")}
              </button>
            </form>
          </div>

          {/* Map Section */}
          <div className="space-y-4 md:space-y-6">
            <h2
              className={`text-2xl md:text-3xl font-bold text-center ${i18n.language === "ar" ? "md:text-right" : "md:text-left"} ${
                isDark ? "text-luxury-gold" : "text-luxury-brown-dark"
              }`}
            >
              {t("contact.mapTitle")}
            </h2>
            <div
              className={`backdrop-blur-sm rounded-2xl overflow-hidden h-64 md:h-96 lg:h-[500px] border-2 shadow-2xl hover:shadow-2xl transition-all duration-300 ${
                isDark
                  ? "bg-luxury-brown-darker/90 border-luxury-gold-dark/20 hover:shadow-luxury-gold/20"
                  : "bg-luxury-cream/95 border-luxury-gold-light/40 hover:shadow-luxury-gold-light/20"
              }`}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3630.5!2d54.3773!3d24.4539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5e66b8b8b8b8b9%3A0x3e5e66b8b8b8b8b9!2sAbu%20Dhabi%2C%20United%20Arab%20Emirates!5e0!3m2!1sen!2sae!4v1234567890123!5m2!1sen!2sae"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title={t("contact.mapIframeTitle")}
              ></iframe>
            </div>
            <div
              className={`rounded-xl p-4 md:p-6 flex items-start gap-3 md:gap-4 border ${
                isDark
                  ? "bg-luxury-gold/10 border-luxury-gold/30"
                  : "bg-luxury-gold/10 border-luxury-gold/30"
              }`}
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-luxury-gold flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p
                className={`text-sm md:text-base leading-relaxed ${
                  isDark ? "text-[#f7f2ef]" : "text-luxury-brown-text"
                }`}
              >
                {t("contact.mapInfo")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
