import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

const Account = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Get user-specific preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (!user) return true;
    const saved = localStorage.getItem(`notificationsEnabled_${user.id}`);
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `notificationsEnabled_${user.id}`,
        JSON.stringify(notificationsEnabled)
      );
    }
  }, [notificationsEnabled, user]);

  // Calculate user badge and discount based on account age
  const getUserBadge = () => {
    if (!user || !user.createdAt) {
      return { badge: "عضو جديد", discount: "5%" };
    }

    const accountAge = new Date() - new Date(user.createdAt);
    const daysSinceSignup = Math.floor(accountAge / (1000 * 60 * 60 * 24));

    if (daysSinceSignup >= 365) {
      return { badge: "عائلة لاعج الذهبية", discount: "15%" };
    } else if (daysSinceSignup >= 180) {
      return { badge: "عائلة لاعج الفضية", discount: "10%" };
    } else if (daysSinceSignup >= 90) {
      return { badge: "عضو مميز", discount: "7%" };
    } else {
      return { badge: "عضو جديد", discount: "5%" };
    }
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "";
    // Remove +971 prefix if present
    let cleanPhone = phone.replace(/^\+971/, "").trim();
    // Format as XX XXX XXXX
    if (cleanPhone.length === 9) {
      return cleanPhone.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    return cleanPhone;
  };

  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  const userBadge = getUserBadge();

  const accountItems = [
    {
      icon: "📦",
      label: "طلباتي",
      description: "تتبع سجل الطلبات الحالية والسابقة",
      path: "/orders",
    },
    {
      icon: "🏷️",
      label: "الخصومات",
      description: "استخدم كوبونات الخصم الحالية",
      path: "/discounts",
    },
    {
      icon: "👤",
      label: "المعلومات الشخصية",
      description: "حدث بيانات ملفك الشخصي",
      path: "/profile",
    },
    {
      icon: "📍",
      label: "العناوين المحفوظة",
      description: "المنزل، العمل، والأماكن المفضلة",
      path: "/addresses",
    },
    {
      icon: "💳",
      label: "طرق الدفع",
      description: "إعدادات البطاقات والمحفظة",
      path: "/payment-methods",
    },
  ];

  return (
    <PageLayout>
      <div className="w-full  max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
          {/* User Profile Card */}
          <div
            className="rounded-2xl p-8 md:p-10 border-2 shadow-2xl
            bg-card dark:bg-[#110D0A] 
            border-card dark:border-[#3E2C21]"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-6 md:mb-8">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-xl
                bg-gradient-to-br from-amber-700 to-amber-900"
              >
                <span className="text-5xl md:text-6xl">👤</span>
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 md:mb-3 text-primary dark:text-[#F3EDE6]">
                  {user.name || "مستخدم"}
                </h2>
                <p className="text-base md:text-lg text-muted dark:text-[#BBAA9D]">
                  {user.phone ? `+971 ${formatPhone(user.phone)}` : "لا يوجد"}
                </p>
                <p className="text-base md:text-lg text-muted dark:text-[#BBAA9D]">
                  {user.email || "لا يوجد"}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-3 ltr md:gap-4 p-4 md:p-5 rounded-xl border-2
              bg-card-muted dark:bg-[#2A1F19]
              border-card dark:border-[#5C3D28]"
            >
              <span className="text-3xl md:text-4xl">🏆</span>
              <div>
                <p className="font-semibold text-lg md:text-xl text-luxury-gold dark:text-amber-400">
                  {userBadge.badge}
                </p>
                <p className="text-sm md:text-base text-muted dark:text-[#BBAA9D]">
                  خصم ثابت {userBadge.discount} على جميع المشتريات.
                </p>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-primary dark:text-[#F3EDE6]">
              الحساب
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {accountItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="flex items-center justify-between p-6 md:p-8 rounded-2xl border-2 shadow-lg transition-all
                    bg-card dark:bg-[#1C1613]
                    border-card dark:border-[#3E2C21] hover:border-luxury-gold/50"
                >
                  <span className="text-xl md:text-2xl text-muted dark:text-[#BBAA9D] flex-shrink-0">
                    ←
                  </span>
                  <div className="flex items-center gap-4 md:gap-6 flex-1 justify-end">
                    <div className="text-right">
                      <p className="font-semibold text-lg md:text-xl text-primary dark:text-[#F3EDE6]">
                        {item.label}
                      </p>
                      <p className="text-sm md:text-base text-muted dark:text-[#BBAA9D]">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-3xl md:text-4xl flex-shrink-0">
                      {item.icon}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preferences Section */}
          <div>
            <h3
              className={`text-3xl  md:text-4xl font-bold mb-8 md:mb-10 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              التفضيلات
            </h3>
            <div className="space-y-5 md:space-y-6">
              {/* Notifications */}
              <div
                className={`flex items-center ltr justify-between p-7 md:p-9 rounded-2xl border-2 shadow-xl transition-all hover:shadow-2xl ${
                  isDark
                    ? "bg-card border-card hover:border-luxury-gold/50"
                    : "bg-card border-card hover:border-luxury-gold/50"
                }`}
              >
                <div className="flex items-center gap-5 md:gap-7">
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-3xl md:text-4xl ${
                      isDark ? "bg-luxury-gold/20" : "bg-luxury-gold/15"
                    }`}
                  >
                    🔔
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-xl md:text-2xl mb-2 ${
                        isDark ? "text-white" : "text-luxury-brown-text"
                      }`}
                    >
                      الإشعارات
                    </p>
                    <p
                      className={`text-base md:text-lg ${
                        isDark
                          ? "text-luxury-brown-light"
                          : "text-luxury-brown-text/70"
                      }`}
                    >
                      تحديثات العروض والخصومات
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNotificationsEnabled(!notificationsEnabled);
                    showToast(
                      !notificationsEnabled
                        ? "تم تفعيل الإشعارات"
                        : "تم إيقاف الإشعارات",
                      "success"
                    );
                  }}
                  className={`w-16 h-8 md:w-20 md:h-10 rounded-full relative transition-all duration-300 border-2 shadow-lg ${
                    notificationsEnabled
                      ? isDark
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 shadow-amber-900/50"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 shadow-amber-900/50"
                      : isDark
                      ? "bg-luxury-brown-darker/80 border-luxury-gold-dark/50"
                      : "bg-luxury-cream border-luxury-gold-light/60"
                  }`}
                >
                  <div
                    className={`w-7 h-7 md:w-8 md:h-8 bg-white rounded-full absolute top-0.5 md:top-1 shadow-lg transition-all duration-300 ${
                      notificationsEnabled
                        ? "translate-x-8 md:translate-x-11"
                        : "translate-x-0.5 md:translate-x-1"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Language */}
              <div
                className={`flex ltr  items-center justify-between p-7 md:p-9 rounded-2xl border-2 shadow-xl cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.01] ${
                  isDark
                    ? "bg-card border-card hover:border-luxury-gold/50"
                    : "bg-card border-card hover:border-luxury-gold/50"
                }`}
              >
                <div className="flex items-center gap-5 md:gap-7">
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-3xl md:text-4xl ${
                      isDark ? "bg-luxury-gold/20" : "bg-luxury-gold/15"
                    }`}
                  >
                    🌐
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-xl md:text-2xl mb-2 ${
                        isDark ? "text-white" : "text-luxury-brown-text"
                      }`}
                    >
                      اللغة
                    </p>
                    <p
                      className={`text-base md:text-lg ${
                        isDark
                          ? "text-luxury-brown-light"
                          : "text-luxury-brown-text/70"
                      }`}
                    >
                      العربية
                    </p>
                  </div>
                </div>
                <span
                  className={`text-2xl md:text-3xl font-bold ${
                    isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                  }`}
                >
                  ←
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Account;
