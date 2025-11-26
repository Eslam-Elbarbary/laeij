import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import logo from "../assets/logo.png";

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.every((digit) => digit !== "")) {
      navigate("/profile-setup");
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
            <div className="relative flex items-center justify-center transition-transform hover:scale-105 duration-300">
              <img
                src={logo}
                alt="لاعج - Laeij"
                className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 object-contain transition-all duration-300 hover:brightness-110 hover:drop-shadow-2xl filter drop-shadow-xl"
                loading="eager"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "block";
                }}
              />
              {/* Fallback emoji if image fails */}
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl hidden">🐴</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`${panelClasses} rounded-2xl p-8 md:p-10 space-y-6 shadow-2xl backdrop-blur`}>
          <p className="text-secondary text-center text-lg mb-2">
            أرسلنا رمز مكون من 6 أرقام إلى رقمك
          </p>
          <p className="text-muted text-center text-sm mb-8">
            {location.state?.phoneNumber || "+971 56 123 4567"}
          </p>

          <div className="flex justify-center gap-3 mb-8">
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
                className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 ${
                  isDark
                    ? "bg-luxury-brown-darker text-luxury-brown-light border-luxury-gold-dark/40 focus:border-luxury-gold"
                    : "bg-white text-luxury-brown-text border-luxury-gold-light/60 focus:border-luxury-gold"
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker py-4 rounded-xl font-semibold text-lg hover:from-luxury-gold-light hover:to-luxury-gold transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-luxury-gold/50"
          >
            تأكيد الرقم
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-6">
          <button className="text-luxury-gold hover:text-luxury-gold-light">
            لم يصل اليك الكود؟ إعادة الأرسال
          </button>
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;

