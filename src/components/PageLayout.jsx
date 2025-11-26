import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";

const PageLayout = ({ children, showBottomNav = true }) => {
  // Hide bottom nav on desktop
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-surface text-primary transition-colors duration-300">
      <Navbar />
      <main className="w-full pb-20 md:pb-0 flex-1">{children}</main>
      {showBottomNav && isMobile && <BottomNav />}
      <Footer />
    </div>
  );
};

export default PageLayout;
