import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: "🏠", label: "الرئيسية", name: "home" },
    { path: "/categories", icon: "📋", label: "الأقسام", name: "categories" },
    { path: "/cart", icon: "🛒", label: "السلة", name: "cart" },
    { path: "/account", icon: "👤", label: "حسابي", name: "account" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-luxury-cream-dark border-t-2 border-luxury-gold-light/60 rounded-t-3xl shadow-2xl backdrop-blur-md">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-4 focus:ring-luxury-gold/60 ${
              isActive(item.path)
                ? "bg-luxury-gold text-white shadow-lg shadow-luxury-gold/50 scale-110"
                : "text-luxury-gold hover:text-luxury-gold-light hover:bg-luxury-gold/10 hover:scale-105"
            }`}
          >
            <span className="text-2xl mb-1 transition-transform duration-300 group-hover:scale-125">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
            {isActive(item.path) && (
              <div className="w-8 h-1 bg-luxury-gold mt-1 rounded-full shadow-lg animate-pulse-gold"></div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
