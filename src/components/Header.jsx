import { Link } from "react-router-dom";

const Header = ({ title, showBack = false, showUser = false, user }) => {
  return (
    <header className="sticky top-0 z-40 bg-luxury-brown-dark border-b border-luxury-gold/20">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        {showBack && (
          <Link
            to=".."
            className="text-luxury-cream-light hover:text-luxury-gold transition-colors"
          >
            <span className="text-2xl">←</span>
          </Link>
        )}
        <h1 className="text-luxury-cream-light text-xl font-bold flex-1 text-center">
          {title}
        </h1>
        {showUser && user ? (
          <div className="flex items-center gap-2">
            <span className="text-luxury-cream-light text-sm">مرحباً، {user.name}</span>
            <div className="w-10 h-10 rounded-full bg-luxury-gold flex items-center justify-center">
              <span className="text-luxury-brown-dark">👤</span>
            </div>
          </div>
        ) : (
          <div className="w-8"></div>
        )}
      </div>
    </header>
  );
};

export default Header;
