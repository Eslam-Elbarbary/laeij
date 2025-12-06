import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import apiService from "../services/api";
import logo from "../assets/logo.png";

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { verifyPhone } = useAuth();
  const { showToast } = useToast();

  // Get email/phone from location state or navigate back if missing
  const email = location.state?.email || location.state?.phone || "";
  const phone = location.state?.phone || location.state?.phoneNumber || "";
  const registrationData = location.state?.registrationData || null; // For resend OTP

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef = useRef(null);

  // Redirect to login if no email/phone provided
  useEffect(() => {
    if (!email && !phone) {
      showToast(t("otpVerification.emailRequired"), "error");
      navigate("/login");
    }
  }, [email, phone, navigate, showToast, t]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, []);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      resendTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    }
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    setError(null); // Clear error when user types

    // Auto-focus next input
    if (numericValue && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    // Allow paste
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      setTimeout(() => {
        const pastedValue =
          e.target.value || document.getElementById(`otp-${index}`).value;
        if (
          pastedValue &&
          pastedValue.length === 6 &&
          /^\d+$/.test(pastedValue)
        ) {
          const digits = pastedValue.split("");
          const newOtp = [...otp];
          digits.forEach((digit, i) => {
            if (i < 6) newOtp[i] = digit;
          });
          setOtp(newOtp);
          document.getElementById(`otp-5`)?.focus();
        }
      }, 0);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = (e.clipboardData || window.clipboardData).getData(
      "text"
    );
    if (pastedData && pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = digits.map((digit, i) => (i < 6 ? digit : ""));
      setOtp(newOtp);
      document.getElementById(`otp-5`)?.focus();
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate OTP
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError(t("otpVerification.incompleteCode"));
      return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      setError(t("otpVerification.invalidCode"));
      return;
    }

    // Check if we have email (required for API)
    if (!email) {
      setError(t("otpVerification.emailRequired"));
      return;
    }

    setIsLoading(true);

    try {
      // Call verification API
      const result = await verifyPhone(email, otpCode);

      if (result.success) {
        showToast(result.message || t("otpVerification.success"), "success");

        // Redirect based on verification result
        // If user data is returned, they're authenticated
        if (result.user) {
          // User is now authenticated, redirect to home or profile setup
          setTimeout(() => {
            navigate("/profile-setup", { replace: true });
          }, 1000);
        } else {
          // Verification successful but need to complete profile
          setTimeout(() => {
            navigate("/profile-setup", { replace: true });
          }, 1000);
        }
      } else {
        setError(result.message || t("otpVerification.failed"));
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        document.getElementById(`otp-0`)?.focus();
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(t("otpVerification.error"));
      setOtp(["", "", "", "", "", ""]);
      document.getElementById(`otp-0`)?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setError(null);

    // If we have registration data, resend by calling register again
    if (registrationData) {
      setIsResending(true);
      try {
        const response = await apiService.register(registrationData);
        if (response.success) {
          showToast(t("otpVerification.codeResent"), "success");
          setResendCooldown(60); // 60 second cooldown
        } else {
          setError(response.message || t("otpVerification.resendFailed"));
        }
      } catch (err) {
        console.error("Resend OTP error:", err);
        setError(t("otpVerification.resendFailed"));
      } finally {
        setIsResending(false);
      }
    } else {
      // If no registration data, redirect back to signup
      showToast(t("otpVerification.pleaseRegister"), "error");
      setTimeout(() => {
        navigate("/login", { state: { tab: "signup", email } });
      }, 1500);
    }
  };

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/90 border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/50 text-luxury-brown-text";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-surface text-primary">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-luxury-gold/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative flex items-center justify-center">
              <img
                src={logo}
                alt="لاعج - Laeij"
                className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 object-contain filter drop-shadow-xl"
                loading="eager"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "block";
                }}
              />
              {/* Fallback emoji if image fails */}
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl hidden">
                🐴
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`${panelClasses} rounded-2xl p-8 md:p-10 space-y-6 shadow-2xl backdrop-blur`}
        >
          <div
            className={`text-center mb-6 ${
              i18n.language === "ar" ? "text-right" : "text-left"
            }`}
          >
            <h2 className={`text-secondary text-xl md:text-2xl font-bold mb-2`}>
              {t("otpVerification.title")}
            </h2>
            <p
              className={`text-muted text-sm md:text-base ${
                i18n.language === "ar" ? "" : ""
              }`}
            >
              {t("otpVerification.subtitle")}
            </p>
          </div>

          {/* Display Email/Phone */}
          <div
            className={`text-center mb-6 ${
              i18n.language === "ar" ? "text-right" : "text-left"
            }`}
          >
            <p
              className={`text-sm md:text-base mb-2 ${
                isDark
                  ? "text-luxury-brown-light/70"
                  : "text-luxury-brown-text/70"
              }`}
            >
              {t("otpVerification.sentTo")}
            </p>
            <p
              className={`text-base md:text-lg font-semibold ltr ${
                isDark ? "text-luxury-gold-light" : "text-luxury-gold"
              }`}
            >
              {email ||
                phone ||
                location.state?.phoneNumber ||
                "+971 56 123 4567"}
            </p>
          </div>

          {/* OTP Input Fields */}
          <div
            className="flex justify-center gap-2 md:gap-3 mb-6"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                dir="ltr"
                className={`w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                  error
                    ? isDark
                      ? "bg-luxury-brown-darker text-luxury-brown-light border-red-500/60 focus:border-red-500"
                      : "bg-white text-luxury-brown-text border-red-400/60 focus:border-red-500"
                    : isDark
                    ? "bg-luxury-brown-darker text-luxury-brown-light border-luxury-gold-dark/40 focus:border-luxury-gold"
                    : "bg-white text-luxury-brown-text border-luxury-gold-light/60 focus:border-luxury-gold"
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`text-center p-3 md:p-4 rounded-xl ${
                isDark
                  ? "bg-red-900/30 border border-red-500/50 text-red-300"
                  : "bg-red-50 border border-red-300 text-red-600"
              }`}
            >
              <p className="text-sm md:text-base font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || otp.join("").length !== 6}
            className={`w-full py-4 rounded-xl font-semibold text-base md:text-lg transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-luxury-gold/50 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
                : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker hover:from-luxury-gold-light hover:to-luxury-gold"
            }`}
          >
            {isLoading ? (
              <span
                className={`flex items-center justify-center gap-2 ${
                  i18n.language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
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
                {t("otpVerification.verifying")}
              </span>
            ) : (
              t("otpVerification.confirm")
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div
          className={`text-center mt-6 ${
            i18n.language === "ar" ? "text-right" : "text-left"
          }`}
        >
          <p
            className={`text-sm md:text-base ${
              isDark
                ? "text-luxury-brown-light/70"
                : "text-luxury-brown-text/70"
            } mb-2`}
          >
            {t("otpVerification.didntReceive")}
          </p>
          <button
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || isResending || isLoading}
            className={`text-sm md:text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? "text-luxury-gold hover:text-luxury-gold-light"
                : "text-luxury-gold hover:text-luxury-gold-dark"
            }`}
          >
            {isResending ? (
              <span
                className={`flex items-center justify-center gap-2 ${
                  i18n.language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
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
                {t("otpVerification.resending")}
              </span>
            ) : resendCooldown > 0 ? (
              t("otpVerification.resendIn", { seconds: resendCooldown })
            ) : (
              t("otpVerification.resend")
            )}
          </button>
        </div>

        {/* Back to Login */}
        <div
          className={`text-center mt-4 ${
            i18n.language === "ar" ? "text-right" : "text-left"
          }`}
        >
          <button
            onClick={() => navigate("/login")}
            className={`text-sm md:text-base transition-colors ${
              isDark
                ? "text-luxury-brown-light/70 hover:text-luxury-brown-light"
                : "text-luxury-brown-text/70 hover:text-luxury-brown-text"
            }`}
          >
            {t("otpVerification.backToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
