import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const footerLinks = {
    shop: [
      { label: "المنتجات", path: "/products" },
      { label: "الأقسام", path: "/categories" },
      { label: "العروض", path: "/products?offers=true" },
      { label: "الأكثر رواجًا", path: "/products?popular=true" },
    ],
    account: [
      { label: "حسابي", path: "/account" },
      { label: "طلباتي", path: "/orders" },
      { label: "العناوين", path: "/addresses" },
      { label: "المفضلة", path: "/favorites" },
    ],
    support: [
      { label: "تواصل معنا", path: "/contact" },
      { label: "الأسئلة الشائعة", path: "/faq" },
      { label: "سياسة الإرجاع", path: "/return-policy" },
      { label: "شروط الاستخدام", path: "/terms" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      url: "#",
      icon: (
        <svg
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Instagram",
      url: "#",
      icon: (
        <svg
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Twitter",
      url: "#",
      icon: (
        <svg
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      url: "#",
      icon: (
        <svg
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="w-full bg-surface-alt border-t-2 border-card text-primary mt-auto relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-luxury-gold-dark rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
        <div className="max-w-7xl mx-auto py-20 md:py-24 lg:py-28">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-20 lg:gap-24 mb-20 md:mb-24">
            {/* Brand Section */}
            <div className="space-y-8 md:space-y-10 text-right">
              <Link
                to="/"
                onClick={scrollToTop}
                className="flex items-center justify-center group transition-transform hover:scale-105 duration-300"
              >
                <div className="relative flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                  <img
                    src={logo}
                    alt="لاعج - Laeij"
                    className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 xl:h-36 xl:w-36 2xl:h-40 2xl:w-40 object-contain transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-2xl filter drop-shadow-xl"
                    loading="eager"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "block";
                    }}
                  />
                  {/* Fallback emoji if image fails */}
                  <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] hidden">
                    🐴
                  </div>
                </div>
              </Link>
              <p className="text-secondary text-sm md:text-base lg:text-lg leading-relaxed max-w-sm font-medium">
                متجرك المميز للعطور الفاخرة والزيوت الطبيعية والعود الأصيل.
                اكتشف روائح فريدة تعكس شخصيتك.
              </p>
              {/* Social Media */}
              <div className="flex items-center gap-4 pt-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={scrollToTop}
                    className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-luxury-gold-dark/20 to-luxury-gold/20 hover:from-luxury-gold hover:to-luxury-gold-light rounded-xl flex items-center justify-center text-luxury-gold hover:text-white transition-all duration-300 hover:scale-125 transform hover:shadow-2xl hover:shadow-luxury-gold/60 focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 relative overflow-hidden group border border-luxury-gold-dark/30 hover:border-luxury-gold"
                    aria-label={social.name}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/0 to-luxury-gold-light/0 group-hover:from-luxury-gold/100 group-hover:to-luxury-gold-light/100 transition-all duration-300"></div>
                    <div className="relative z-10 w-6 h-6 md:w-7 md:h-7">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div className="text-right">
              <h3 className="text-primary dark:text-white font-bold text-xl md:text-2xl lg:text-3xl mb-8 md:mb-10 pb-4 border-b-2 border-luxury-gold-dark/40 dark:border-luxury-gold/40 relative">
                <span className="absolute bottom-0 right-0 w-16 h-0.5 bg-gradient-to-r from-luxury-gold to-transparent"></span>
                التسوق
              </h3>
              <ul className="space-y-5 md:space-y-6">
                {footerLinks.shop.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      onClick={scrollToTop}
                      className="text-secondary hover:text-luxury-gold text-sm md:text-base lg:text-lg font-medium transition-all duration-300 flex items-center gap-4 group py-2 text-right"
                    >
                      <span className="text-luxury-gold-dark group-hover:text-luxury-gold-light group-hover:translate-x-[-8px] transition-all duration-300 text-base md:text-lg font-bold flex-shrink-0">
                        ←
                      </span>
                      <span className="flex-1 group-hover:translate-x-[-4px] transition-transform duration-300 relative">
                        {link.label}
                        <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-luxury-gold group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account Links */}
            <div className="text-right">
              <h3 className="text-primary dark:text-white font-bold text-xl md:text-2xl lg:text-3xl mb-8 md:mb-10 pb-4 border-b-2 border-luxury-gold-dark/40 dark:border-luxury-gold/40 relative">
                <span className="absolute bottom-0 right-0 w-16 h-0.5 bg-gradient-to-r from-luxury-gold to-transparent"></span>
                حسابي
              </h3>
              <ul className="space-y-5 md:space-y-6">
                {footerLinks.account.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      onClick={scrollToTop}
                      className="text-secondary hover:text-luxury-gold text-sm md:text-base lg:text-lg font-medium transition-all duration-300 flex items-center gap-4 group py-2 text-right"
                    >
                      <span className="text-luxury-gold-dark group-hover:text-luxury-gold-light group-hover:translate-x-[-8px] transition-all duration-300 text-base md:text-lg font-bold flex-shrink-0">
                        ←
                      </span>
                      <span className="flex-1 group-hover:translate-x-[-4px] transition-transform duration-300 relative">
                        {link.label}
                        <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-luxury-gold group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Contact */}
            <div className="text-right">
              <h3 className="text-primary dark:text-white font-bold text-xl md:text-2xl lg:text-3xl mb-8 md:mb-10 pb-4 border-b-2 border-luxury-gold-dark/40 dark:border-luxury-gold/40 relative">
                <span className="absolute bottom-0 right-0 w-16 h-0.5 bg-gradient-to-r from-luxury-gold to-transparent"></span>
                الدعم والمساعدة
              </h3>
              {/* Contact Info */}
              <div className="space-y-6 md:space-y-8">
                <div className="flex ltr  items-start gap-5 group justify-end">
                  <div className="flex-1  text-right order-2">
                    <p className="text-muted text-xs md:text-sm mb-2 font-medium">
                      الهاتف
                    </p>
                    <a
                      href="tel:+971501234567"
                      onClick={scrollToTop}
                      className="text-luxury-gold hover:text-luxury-gold-light text-base md:text-lg lg:text-xl font-bold transition-colors duration-300 block"
                    >
                      +971 50 123 4567
                    </a>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-luxury-gold-dark/20 to-luxury-gold/20 group-hover:from-luxury-gold group-hover:to-luxury-gold-light rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 border border-luxury-gold-dark/30 group-hover:border-luxury-gold group-hover:shadow-lg group-hover:shadow-luxury-gold/40 order-1">
                    <svg
                      className="w-7 h-7 md:w-8 md:h-8 text-luxury-gold group-hover:text-white transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex ltr items-start gap-5 group justify-end">
                  <div className="flex-1 text-right order-2">
                    <p className="text-muted text-xs md:text-sm mb-2 font-medium">
                      البريد الإلكتروني
                    </p>
                    <a
                      href="mailto:info@laeij.com"
                      onClick={scrollToTop}
                      className="text-luxury-gold hover:text-luxury-gold-light text-base md:text-lg lg:text-xl font-bold transition-colors duration-300 break-all block"
                    >
                      info@laeij.com
                    </a>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-luxury-gold-dark/20 to-luxury-gold/20 group-hover:from-luxury-gold group-hover:to-luxury-gold-light rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 border border-luxury-gold-dark/30 group-hover:border-luxury-gold group-hover:shadow-lg group-hover:shadow-luxury-gold/40 order-1">
                    <svg
                      className="w-7 h-7 md:w-8 md:h-8 text-luxury-gold group-hover:text-white transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex ltr items-start gap-5 group justify-end">
                  <div className="flex-1 text-right order-2">
                    <p className="text-muted text-xs md:text-sm mb-2 font-medium">
                      العنوان
                    </p>
                    <p className="text-luxury-gold text-base md:text-lg lg:text-xl font-bold">
                      أبو ظبي، الإمارات العربية المتحدة
                    </p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-luxury-gold-dark/20 to-luxury-gold/20 group-hover:from-luxury-gold group-hover:to-luxury-gold-light rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 border border-luxury-gold-dark/30 group-hover:border-luxury-gold group-hover:shadow-lg group-hover:shadow-luxury-gold/40 order-1">
                    <svg
                      className="w-7 h-7 md:w-8 md:h-8 text-luxury-gold group-hover:text-white transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          {/* <div className="border-t border-amber-900/30 pt-12 md:pt-16 mb-12 md:mb-16">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8 md:mb-10">
                <h3 className="text-white font-bold text-2xl md:text-3xl mb-3 md:mb-4">
                  اشترك في نشرتنا الإخبارية
                </h3>
                <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                  احصل على آخر العروض والمنتجات الجديدة مباشرة في بريدك
                  الإلكتروني
                </p>
              </div>
              <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                <input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  className="flex-1 bg-gray-800/80 text-white placeholder-gray-500 rounded-xl px-6 md:px-8 py-4 md:py-5 text-sm md:text-base border-2 border-amber-900/30 focus:border-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-700/30 transition-all hover:border-amber-800/50"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-900/50 hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-amber-700/50 whitespace-nowrap"
                >
                  اشترك الآن
                </button>
              </form>
            </div>
          </div> */}

          {/* Bottom Bar */}
          <div className="border-t-2 border-luxury-gold-dark/40 dark:border-luxury-gold/40 pt-10 md:pt-12 relative">
            {/* Decorative gradient line */}
            <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
              <div className="text-center md:text-right">
                <p className="text-muted text-xs md:text-sm lg:text-base mb-3 font-medium">
                  © {currentYear} لاعج (Laeij). جميع الحقوق محفوظة.
                </p>
                <p className="text-muted text-xs md:text-sm">
                  مصمم ومطور بعناية لراحتك
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                <Link
                  to="/privacy"
                  onClick={scrollToTop}
                  className="text-secondary hover:text-luxury-gold text-xs md:text-sm lg:text-base font-medium transition-all duration-300 hover:underline relative group"
                >
                  <span className="relative z-10">سياسة الخصوصية</span>
                  <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-luxury-gold group-hover:w-full transition-all duration-300"></span>
                </Link>
                <span className="text-luxury-gold-dark/50 dark:text-luxury-gold/50 hidden sm:inline text-base">
                  •
                </span>
                <Link
                  to="/terms"
                  onClick={scrollToTop}
                  className="text-secondary hover:text-luxury-gold text-xs md:text-sm lg:text-base font-medium transition-all duration-300 hover:underline relative group"
                >
                  <span className="relative z-10">شروط الاستخدام</span>
                  <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-luxury-gold group-hover:w-full transition-all duration-300"></span>
                </Link>
                <span className="text-luxury-gold-dark/50 dark:text-luxury-gold/50 hidden sm:inline text-base">
                  •
                </span>
                <Link
                  to="/shipping"
                  onClick={scrollToTop}
                  className="text-secondary hover:text-luxury-gold text-xs md:text-sm lg:text-base font-medium transition-all duration-300 hover:underline relative group"
                >
                  <span className="relative z-10">سياسة الشحن</span>
                  <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-luxury-gold group-hover:w-full transition-all duration-300"></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
