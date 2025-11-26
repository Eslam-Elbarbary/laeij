import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.png";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login"); // login, signup, forgot
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { login, signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(() => {
    // Check if we have a saved email/phone for remember me
    const savedEmail = localStorage.getItem("rememberedEmail");
    return !!savedEmail;
  });

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setLoginData((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  // Sign up form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [signupErrors, setSignupErrors] = useState({});

  // Forgot password form state
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
  });
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+971|0)?[2-9]\d{8}$/;
    const cleanPhone = phone.replace(/\s/g, "");
    return phoneRegex.test(cleanPhone) || cleanPhone.length >= 9;
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  // Login validation
  const validateLogin = () => {
    const errors = {};

    if (!loginData.email.trim()) {
      errors.email = "البريد الإلكتروني أو رقم الجوال مطلوب";
    } else if (
      !validateEmail(loginData.email) &&
      !validatePhone(loginData.email)
    ) {
      errors.email = "البريد الإلكتروني أو رقم الجوال غير صحيح";
    }

    if (!loginData.password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (loginData.password.length < 6) {
      errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Signup validation
  const validateSignup = () => {
    const errors = {};

    if (!signupData.name.trim()) {
      errors.name = "الاسم مطلوب";
    } else if (!validateName(signupData.name)) {
      errors.name = "الاسم يجب أن يكون حرفين على الأقل";
    }

    if (!signupData.email.trim()) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!validateEmail(signupData.email)) {
      errors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!signupData.phone.trim()) {
      errors.phone = "رقم الجوال مطلوب";
    } else if (!validatePhone(signupData.phone)) {
      errors.phone = "رقم الجوال غير صحيح";
    }

    if (!signupData.password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (!validatePassword(signupData.password)) {
      errors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    }

    if (!signupData.confirmPassword) {
      errors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    if (!signupData.agreeToTerms) {
      errors.agreeToTerms = "يجب الموافقة على الشروط والأحكام";
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateLogin()) {
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const result = login(loginData.email, loginData.password);
      setIsLoading(false);

      if (result.success) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", loginData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        
        showToast("تم تسجيل الدخول بنجاح!", "success");
        setTimeout(() => navigate("/"), 500);
      } else {
        showToast(result.message || "فشل تسجيل الدخول", "error");
      }
    }, 1000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateSignup()) {
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const result = signup({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone.replace(/\s/g, ""),
        password: signupData.password,
      });

      setIsLoading(false);

      if (result.success) {
        showToast("تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول", "success");
        // Clear signup form
        setSignupData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false,
        });
        setSignupErrors({});
        // Switch to login tab and pre-fill email
        setActiveTab("login");
        setLoginData({
          email: result.email || signupData.email,
          password: "",
        });
      } else {
        showToast(result.message || "فشل إنشاء الحساب", "error");
      }
    }, 1000);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();

    if (!forgotPasswordData.email.trim()) {
      setForgotPasswordError("البريد الإلكتروني مطلوب");
      return;
    }

    if (!validateEmail(forgotPasswordData.email)) {
      setForgotPasswordError("البريد الإلكتروني غير صحيح");
      return;
    }

    setForgotPasswordError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showToast(
        "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        "success"
      );
      setActiveTab("login");
      setForgotPasswordData({ email: "" });
    }, 1000);
  };

  const panelClasses = isDark
    ? "bg-card border-2 border-card text-primary"
    : "bg-card border-2 border-card text-primary";

  const inputClasses = isDark
    ? "bg-card-muted text-primary placeholder-luxury-brown-light/60 border-2 border-card focus:border-luxury-gold focus:ring-4 focus:ring-luxury-gold/30"
    : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border-2 border-luxury-gold-light/50 focus:border-luxury-gold focus:ring-4 focus:ring-luxury-gold/30";

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-surface text-primary">
      {/* Left Side - Decorative Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image/Pattern */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1595425970377-c970029bf65e?w=1920&h=1080&fit=crop&q=80&auto=format"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/85 via-amber-800/70 to-black/80"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 xl:p-16 text-white w-full">
          <div className="max-w-lg text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative flex items-center justify-center transition-transform hover:scale-105 duration-300">
                <img
                  src={logo}
                  alt="لاعج - Laeij"
                  className="h-32 w-32 xl:h-40 xl:w-40 object-contain transition-all duration-300 hover:brightness-110 hover:drop-shadow-2xl filter drop-shadow-xl"
                  loading="eager"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "block";
                  }}
                />
                <div className="text-8xl xl:text-9xl hidden">🐴</div>
              </div>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold mb-6 drop-shadow-2xl">
              مرحباً بك في لاعج
            </h1>
            <p className="text-xl xl:text-2xl opacity-90 leading-relaxed drop-shadow-lg mb-8">
              اكتشف عالماً من العطور الفاخرة والزيوت الطبيعية
            </p>
            <div className="flex flex-col gap-4 text-lg opacity-80">
              <div className="flex items-center gap-3 justify-center">
                <svg
                  className="w-6 h-6 text-luxury-gold-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>عطور حصرية بإصدارات محدودة</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <svg
                  className="w-6 h-6 text-luxury-gold-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>زيوت طبيعية نقية</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <svg
                  className="w-6 h-6 text-luxury-gold-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>توصيل سريع وآمن</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-12 xl:p-16 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-luxury-gold/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg">
          {/* Logo for Mobile/Tablet */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative flex items-center justify-center transition-transform hover:scale-105 duration-300">
                <img
                  src={logo}
                  alt="لاعج - Laeij"
                  className="h-20 w-20 md:h-24 md:w-24 object-contain transition-all duration-300 hover:brightness-110 hover:drop-shadow-2xl filter drop-shadow-xl"
                  loading="eager"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "block";
                  }}
                />
                <div className="text-6xl md:text-7xl hidden">🐴</div>
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8 lg:mb-10">
            <h2
              className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              {activeTab === "login" && "مرحباً بعودتك"}
              {activeTab === "signup" && "إنشاء حساب جديد"}
              {activeTab === "forgot" && "إعادة تعيين كلمة المرور"}
            </h2>
            <p
              className={`text-lg md:text-xl ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              {activeTab === "login" && "سجل دخولك للوصول إلى حسابك"}
              {activeTab === "signup" && "انضم إلينا وابدأ رحلتك معنا"}
              {activeTab === "forgot" &&
                "أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-card-muted p-1.5 rounded-2xl border-2 border-card">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${
                activeTab === "login"
                  ? isDark
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-luxury-brown-darker shadow-xl shadow-amber-900/50"
                    : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-xl shadow-amber-900/50"
                  : isDark
                  ? "text-luxury-brown-light hover:bg-card hover:text-luxury-gold-light"
                  : "text-luxury-brown-text hover:bg-card hover:text-luxury-gold"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${
                activeTab === "signup"
                  ? isDark
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-luxury-brown-darker shadow-xl shadow-amber-900/50"
                    : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-xl shadow-amber-900/50"
                  : isDark
                  ? "text-luxury-brown-light hover:bg-card hover:text-luxury-gold-light"
                  : "text-luxury-brown-text hover:bg-card hover:text-luxury-gold"
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form
              onSubmit={handleLogin}
              className={`${panelClasses} rounded-3xl p-8 md:p-10 lg:p-12 space-y-6 shadow-2xl backdrop-blur-sm`}
            >
              <div>
                <label
                  className={`block text-base md:text-lg font-semibold mb-3 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  البريد الإلكتروني أو رقم الجوال
                </label>
                <input
                  type="text"
                  value={loginData.email}
                  onChange={(e) => {
                    setLoginData({ ...loginData, email: e.target.value });
                    if (loginErrors.email) {
                      setLoginErrors({ ...loginErrors, email: "" });
                    }
                  }}
                  onBlur={() => {
                    if (
                      loginData.email &&
                      !validateEmail(loginData.email) &&
                      !validatePhone(loginData.email)
                    ) {
                      setLoginErrors({
                        ...loginErrors,
                        email: "البريد الإلكتروني أو رقم الجوال غير صحيح",
                      });
                    }
                  }}
                  placeholder="example@email.com أو 56 123 4567"
                  className={`w-full px-5 py-4 rounded-2xl text-lg transition-all ${
                    loginErrors.email
                      ? isDark
                        ? "bg-card-muted text-primary placeholder-luxury-brown-light/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                        : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                      : inputClasses
                  }`}
                />
                {loginErrors.email && (
                  <p className="text-red-500 text-sm mt-2">
                    {loginErrors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label
                    className={`block text-base md:text-lg font-semibold ${
                      isDark
                        ? "text-luxury-brown-light"
                        : "text-luxury-brown-text"
                    }`}
                  >
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab("forgot")}
                    className={`text-sm md:text-base font-semibold hover:underline transition-colors ${
                      isDark
                        ? "text-amber-400 hover:text-amber-300"
                        : "text-amber-600 hover:text-amber-700"
                    }`}
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => {
                    setLoginData({ ...loginData, password: e.target.value });
                    if (loginErrors.password) {
                      setLoginErrors({ ...loginErrors, password: "" });
                    }
                  }}
                  onBlur={() => {
                    if (loginData.password && loginData.password.length < 6) {
                      setLoginErrors({
                        ...loginErrors,
                        password: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
                      });
                    }
                  }}
                  placeholder="أدخل كلمة المرور"
                  className={`w-full px-5 py-4 rounded-2xl text-lg transition-all ${
                    loginErrors.password
                      ? isDark
                        ? "bg-card-muted text-primary placeholder-luxury-brown-light/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                        : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                      : inputClasses
                  }`}
                />
                {loginErrors.password && (
                  <p className="text-red-500 text-sm mt-2">
                    {loginErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-card text-luxury-gold focus:ring-luxury-gold focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className={`text-sm md:text-base cursor-pointer ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  تذكرني
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-extrabold text-xl transition-all shadow-2xl hover:shadow-amber-900/60 hover:scale-[1.02] transform duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/50 border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  isDark
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-luxury-brown-darker border-amber-600 shadow-amber-900/60"
                    : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-white border-amber-700 shadow-amber-900/50"
                }`}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === "signup" && (
            <form
              onSubmit={handleSignup}
              className={`${panelClasses} rounded-3xl p-8 md:p-10 lg:p-12 space-y-6 shadow-2xl backdrop-blur-sm`}
            >
              <div>
                <label
                  className={`block text-base md:text-lg font-semibold mb-3 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={signupData.name}
                  onChange={(e) => {
                    setSignupData({ ...signupData, name: e.target.value });
                    if (signupErrors.name) {
                      setSignupErrors({ ...signupErrors, name: "" });
                    }
                  }}
                  onBlur={() => {
                    if (signupData.name && !validateName(signupData.name)) {
                      setSignupErrors({
                        ...signupErrors,
                        name: "الاسم يجب أن يكون حرفين على الأقل",
                      });
                    }
                  }}
                  placeholder="أدخل اسمك الكامل"
                  className={`w-full px-5 py-4 rounded-2xl text-lg transition-all ${
                    signupErrors.name
                      ? isDark
                        ? "bg-card-muted text-primary placeholder-luxury-brown-light/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                        : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                      : inputClasses
                  }`}
                />
                {signupErrors.name && (
                  <p className="text-red-500 text-sm mt-2">
                    {signupErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block text-base md:text-lg font-semibold mb-3 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => {
                    setSignupData({ ...signupData, email: e.target.value });
                    if (signupErrors.email) {
                      setSignupErrors({ ...signupErrors, email: "" });
                    }
                  }}
                  onBlur={() => {
                    if (signupData.email && !validateEmail(signupData.email)) {
                      setSignupErrors({
                        ...signupErrors,
                        email: "البريد الإلكتروني غير صحيح",
                      });
                    }
                  }}
                  placeholder="example@email.com"
                  className={`w-full px-5 py-4 rounded-2xl text-lg transition-all ${
                    signupErrors.email
                      ? isDark
                        ? "bg-card-muted text-primary placeholder-luxury-brown-light/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                        : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                      : inputClasses
                  }`}
                />
                {signupErrors.email && (
                  <p className="text-red-500 text-sm mt-2">
                    {signupErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block text-base md:text-lg font-semibold mb-3 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  رقم الجوال
                </label>
                <div
                  className={`flex items-center rounded-2xl overflow-hidden border-2 transition-all focus-within:border-luxury-gold focus-within:ring-4 focus-within:ring-luxury-gold/30 ${
                    isDark
                      ? "border-card bg-card-muted"
                      : "border-luxury-gold-light/50 bg-white"
                  }`}
                >
                  <div
                    className={`px-5 py-4 flex items-center gap-3 border-l-2 ${
                      isDark
                        ? "bg-card-muted text-luxury-brown-light border-card"
                        : "bg-luxury-cream text-luxury-brown-text border-luxury-gold-light/50"
                    }`}
                  >
                    <span className="text-2xl">🇦🇪</span>
                    <span className="font-semibold text-lg">+971</span>
                  </div>
                  <input
                    type="tel"
                    value={signupData.phone}
                    onChange={(e) => {
                      setSignupData({ ...signupData, phone: e.target.value });
                      if (signupErrors.phone) {
                        setSignupErrors({ ...signupErrors, phone: "" });
                      }
                    }}
                    onBlur={() => {
                      if (
                        signupData.phone &&
                        !validatePhone(signupData.phone)
                      ) {
                        setSignupErrors({
                          ...signupErrors,
                          phone: "رقم الجوال غير صحيح",
                        });
                      }
                    }}
                    placeholder="56 123 4567"
                    className={`flex-1 px-5 py-4 border-0 focus:outline-none text-lg ${
                      signupErrors.phone
                        ? isDark
                          ? "bg-card-muted text-primary placeholder-luxury-brown-light/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                          : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                        : inputClasses
                    }`}
                  />
                </div>
                {signupErrors.phone && (
                  <p className="text-red-500 text-sm mt-2">
                    {signupErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block text-base md:text-lg font-semibold mb-3 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => {
                    setSignupData({ ...signupData, password: e.target.value });
                    if (signupErrors.password) {
                      setSignupErrors({ ...signupErrors, password: "" });
                    }
                    if (
                      signupData.confirmPassword &&
                      e.target.value !== signupData.confirmPassword
                    ) {
                      setSignupErrors({
                        ...signupErrors,
                        confirmPassword: "كلمات المرور غير متطابقة",
                      });
                    } else if (
                      signupData.confirmPassword &&
                      e.target.value === signupData.confirmPassword
                    ) {
                      setSignupErrors({ ...signupErrors, confirmPassword: "" });
                    }
                  }}
                  onBlur={() => {
                    if (
                      signupData.password &&
                      !validatePassword(signupData.password)
                    ) {
                      setSignupErrors({
                        ...signupErrors,
                        password: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
                      });
                    }
                  }}
                  placeholder="أدخل كلمة مرور قوية"
                  className={`w-full px-5 py-4 rounded-2xl text-lg transition-all ${
                    signupErrors.password
                      ? isDark
                        ? "bg-card-muted text-primary placeholder-luxury-brown-light/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                        : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                      : inputClasses
                  }`}
                />
                {signupErrors.password ? (
                  <p className="text-red-500 text-sm mt-2">
                    {signupErrors.password}
                  </p>
                ) : (
                  <p
                    className={`text-xs md:text-sm mt-2 ${
                      isDark
                        ? "text-luxury-brown-light/70"
                        : "text-luxury-brown-text/60"
                    }`}
                  >
                    يجب أن تكون 8 أحرف على الأقل
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block text-base md:text-lg font-semibold mb-3 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => {
                    setSignupData({
                      ...signupData,
                      confirmPassword: e.target.value,
                    });
                    if (signupErrors.confirmPassword) {
                      if (e.target.value === signupData.password) {
                        setSignupErrors({
                          ...signupErrors,
                          confirmPassword: "",
                        });
                      } else {
                        setSignupErrors({
                          ...signupErrors,
                          confirmPassword: "كلمات المرور غير متطابقة",
                        });
                      }
                    }
                  }}
                  onBlur={() => {
                    if (
                      signupData.confirmPassword &&
                      signupData.confirmPassword !== signupData.password
                    ) {
                      setSignupErrors({
                        ...signupErrors,
                        confirmPassword: "كلمات المرور غير متطابقة",
                      });
                    }
                  }}
                  placeholder="أعد إدخال كلمة المرور"
                  className={`w-full px-5 py-4 rounded-2xl text-lg transition-all ${
                    signupErrors.confirmPassword
                      ? isDark
                        ? "bg-card-muted text-primary placeholder-luxury-brown-light/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                        : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                      : inputClasses
                  }`}
                />
                {signupErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2">
                    {signupErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  checked={signupData.agreeToTerms}
                  onChange={(e) => {
                    setSignupData({
                      ...signupData,
                      agreeToTerms: e.target.checked,
                    });
                    if (signupErrors.agreeToTerms) {
                      setSignupErrors({ ...signupErrors, agreeToTerms: "" });
                    }
                  }}
                  className={`w-5 h-5 mt-1 rounded border-2 ${
                    signupErrors.agreeToTerms ? "border-red-500" : "border-card"
                  } text-luxury-gold focus:ring-luxury-gold focus:ring-offset-0`}
                />
                <label
                  htmlFor="agree"
                  className={`text-sm md:text-base cursor-pointer ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  أوافق على{" "}
                  <a href="/terms" className="text-luxury-gold hover:underline">
                    شروط الاستخدام
                  </a>{" "}
                  و{" "}
                  <a
                    href="/privacy"
                    className="text-luxury-gold hover:underline"
                  >
                    سياسة الخصوصية
                  </a>
                </label>
              </div>
              {signupErrors.agreeToTerms && (
                <p className="text-red-500 text-sm -mt-2">
                  {signupErrors.agreeToTerms}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-extrabold text-xl transition-all shadow-2xl hover:shadow-amber-900/60 hover:scale-[1.02] transform duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/50 border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  isDark
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-luxury-brown-darker border-amber-600 shadow-amber-900/60"
                    : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-white border-amber-700 shadow-amber-900/50"
                }`}
              >
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {activeTab === "forgot" && (
            <form
              onSubmit={handleForgotPassword}
              className={`${panelClasses} rounded-3xl p-8 md:p-10 lg:p-12 space-y-6 shadow-2xl backdrop-blur-sm`}
            >
              <div>
                <label
                  className={`block text-base md:text-lg font-semibold mb-3 ${
                    isDark
                      ? "text-luxury-brown-light"
                      : "text-luxury-brown-text"
                  }`}
                >
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={forgotPasswordData.email}
                  onChange={(e) => {
                    setForgotPasswordData({ email: e.target.value });
                    setForgotPasswordError("");
                  }}
                  onBlur={() => {
                    if (
                      forgotPasswordData.email &&
                      !validateEmail(forgotPasswordData.email)
                    ) {
                      setForgotPasswordError("البريد الإلكتروني غير صحيح");
                    }
                  }}
                  placeholder="example@email.com"
                  className={`w-full px-5 py-4 rounded-2xl text-lg transition-all ${
                    forgotPasswordError
                      ? isDark
                        ? "bg-card-muted text-primary placeholder-luxury-brown-light/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                        : "bg-white text-luxury-brown-text placeholder-luxury-brown-text/60 border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30"
                      : inputClasses
                  }`}
                />
                {forgotPasswordError ? (
                  <p className="text-red-500 text-sm mt-2">
                    {forgotPasswordError}
                  </p>
                ) : (
                  <p
                    className={`text-sm md:text-base mt-3 ${
                      isDark
                        ? "text-luxury-brown-light/70"
                        : "text-luxury-brown-text/60"
                    }`}
                  >
                    سنرسل رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-extrabold text-xl transition-all shadow-2xl hover:shadow-amber-900/60 hover:scale-[1.02] transform duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/50 border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  isDark
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-luxury-brown-darker border-amber-600 shadow-amber-900/60"
                    : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-white border-amber-700 shadow-amber-900/50"
                }`}
              >
                {isLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all border-2 hover:scale-[1.01] transform duration-300 ${
                  isDark
                    ? "border-luxury-gold-dark/50 text-luxury-brown-light hover:bg-card-muted hover:border-luxury-gold-dark/70"
                    : "border-luxury-gold-light/50 text-luxury-brown-text hover:bg-card-muted hover:border-luxury-gold-light/70"
                }`}
              >
                العودة لتسجيل الدخول
              </button>
            </form>
          )}

          {/* Footer Links */}
          {activeTab !== "forgot" && (
            <p
              className={`text-sm md:text-base text-center mt-8 ${
                isDark
                  ? "text-luxury-brown-light/70"
                  : "text-luxury-brown-text/60"
              }`}
            >
              {activeTab === "login" ? (
                <>
                  ليس لديك حساب؟{" "}
                  <button
                    onClick={() => setActiveTab("signup")}
                    className={`font-bold underline transition-colors ${
                      isDark
                        ? "text-amber-400 hover:text-amber-300"
                        : "text-amber-600 hover:text-amber-700"
                    }`}
                  >
                    إنشاء حساب جديد
                  </button>
                </>
              ) : (
                <>
                  لديك حساب بالفعل؟{" "}
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`font-bold underline transition-colors ${
                      isDark
                        ? "text-amber-400 hover:text-amber-300"
                        : "text-amber-600 hover:text-amber-700"
                    }`}
                  >
                    تسجيل الدخول
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
