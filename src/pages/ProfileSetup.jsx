import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import logo from "../assets/logo.png";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const panelClasses = isDark
    ? "bg-luxury-brown-darker/90 border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/50 text-luxury-brown-text";

  const inputClasses = isDark
    ? "bg-luxury-brown-darker/80 text-luxury-brown-light placeholder-luxury-brown-light/60 border border-luxury-gold-dark/40 focus:border-luxury-gold"
    : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border border-luxury-gold-light/60 focus:border-luxury-gold";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-surface text-primary">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-luxury-gold/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
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

        <form
          onSubmit={handleSubmit}
          className={`${panelClasses} rounded-2xl p-8 md:p-10 space-y-6 shadow-2xl backdrop-blur`}
        >
          <p className="text-secondary text-center text-lg mb-6">أكمل بياناتك</p>

          <div>
            <label className="block text-primary text-sm mb-2">الإسم</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أكتب اسمك"
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 ${inputClasses}`}
              required
            />
          </div>

          <div>
            <label className="block text-primary text-sm mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="أكتب بريدك الإلكتروني (إختباري)"
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 ${inputClasses}`}
            />
          </div>

          <div>
            <label className="block text-primary text-sm mb-2">تاريخ الميلاد</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-luxury-gold/30 ${inputClasses}`}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker py-4 rounded-xl font-semibold text-lg hover:from-luxury-gold-light hover:to-luxury-gold transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-luxury-gold/50"
          >
            تأكيد البيانات
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-6">
          باستمرارك، أنت توافق على سياسة الخصوصية وشروط الاستخدام.
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;

