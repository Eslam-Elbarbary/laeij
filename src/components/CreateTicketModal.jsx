import { useState, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";

const CreateTicketModal = ({ onClose, onSuccess }) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        showToast(
          t("tickets.invalidFileType") ||
            "Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG",
          "error"
        );
        return false;
      }

      if (file.size > maxSize) {
        showToast(
          t("tickets.fileTooLarge") || "File size must be less than 2MB",
          "error"
        );
        return false;
      }

      return true;
    });

    setAttachments([...attachments, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      showToast(t("tickets.subjectRequired") || "Subject is required", "error");
      return;
    }

    if (!formData.description.trim()) {
      showToast(
        t("tickets.descriptionRequired") || "Description is required",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare ticket data with attachments
      const ticketData = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      };

      // Add attachments as array
      attachments.forEach((file, index) => {
        ticketData[`attachments[${index}]`] = file;
      });

      const response = await apiService.createTicket(ticketData);

      if (response.success) {
        showToast(response.message || t("tickets.createSuccess"), "success");
        // Reset form
        setFormData({ subject: "", description: "" });
        setAttachments([]);
        if (onSuccess) onSuccess();
      } else {
        // Handle validation errors
        if (response.errors) {
          const errorMessages = Object.values(response.errors).flat();
          showToast(errorMessages[0] || response.message, "error");
        } else {
          showToast(response.message || t("tickets.createFailed"), "error");
        }
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      showToast(t("tickets.createFailed"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

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
            {t("tickets.createTicket") || "Create Support Ticket"}
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
          {/* Subject */}
          <div>
            <label
              className={`block text-base md:text-lg font-semibold mb-2 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
              }`}
            >
              {t("tickets.subject") || "Subject"} *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              maxLength={255}
              className={`w-full px-4 py-3 rounded-xl ${inputClasses}`}
              placeholder={
                t("tickets.subjectPlaceholder") || "Enter ticket subject"
              }
            />
            <p
              className={`text-xs mt-1 ${
                isDark
                  ? "text-luxury-brown-light/60"
                  : "text-luxury-brown-text/60"
              }`}
            >
              {formData.subject.length}/255
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              className={`block text-base md:text-lg font-semibold mb-2 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
              }`}
            >
              {t("tickets.description") || "Description"} *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className={`w-full px-4 py-3 rounded-xl resize-none ${inputClasses}`}
              placeholder={
                t("tickets.descriptionPlaceholder") ||
                "Describe your issue or inquiry in detail"
              }
            />
          </div>

          {/* Attachments */}
          <div>
            <label
              className={`block text-base md:text-lg font-semibold mb-2 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text"
              }`}
            >
              {t("tickets.attachments") || "Attachments"} (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark
                  ? "border-luxury-gold-dark/40 hover:border-luxury-gold/60 text-luxury-brown-light hover:bg-luxury-brown-dark/60"
                  : "border-luxury-gold-light/40 hover:border-luxury-gold/60 text-luxury-brown-text hover:bg-luxury-gold/10"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
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
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                <span>
                  {t("tickets.selectFiles") || "Select Files"} (PDF, DOC, DOCX,
                  JPG, PNG - Max 2MB each)
                </span>
              </div>
            </button>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      isDark ? "bg-luxury-brown-dark/60" : "bg-luxury-cream/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg
                        className="w-5 h-5 text-luxury-gold flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isDark ? "text-white" : "text-luxury-brown-text"
                          }`}
                        >
                          {file.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isDark
                              ? "text-luxury-brown-light/70"
                              : "text-luxury-brown-text/60"
                          }`}
                        >
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        isDark
                          ? "hover:bg-red-500/20 text-red-400"
                          : "hover:bg-red-100 text-red-600"
                      }`}
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {attachments.length >= 5 && (
              <p
                className={`text-xs mt-2 ${
                  isDark ? "text-yellow-400" : "text-yellow-600"
                }`}
              >
                {t("tickets.maxFilesReached") || "Maximum 5 files allowed"}
              </p>
            )}
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
              {t("tickets.cancel") || "Cancel"}
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
                  <span>{t("tickets.creating") || "Creating..."}</span>
                </div>
              ) : (
                t("tickets.create") || "Create Ticket"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
