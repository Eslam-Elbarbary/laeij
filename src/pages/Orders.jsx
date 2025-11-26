import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const Orders = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const hasShownToast = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast("يرجى تسجيل الدخول لعرض الطلبات", "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const orders = [
    {
      id: "D2235",
      category: "عطور - أزياء",
      productCount: 4,
      total: 2450,
      status: "in-progress",
      date: "02:30 ص - 12 نوفمبر 2025",
      items: [
        {
          id: 1,
          name: "روح الورد الساحر",
          image:
            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format",
          quantity: 1,
          price: 1200,
        },
        {
          id: 2,
          name: "عود كمبودي ملكي",
          image:
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop&q=80&auto=format",
          quantity: 1,
          price: 1200,
        },
        {
          id: 3,
          name: "زيت الياسمين النقي",
          image:
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop&q=80&auto=format",
          quantity: 2,
          price: 50,
        },
      ],
    },
    {
      id: "D2236",
      category: "عطور - أزياء",
      productCount: 2,
      total: 1200,
      status: "completed",
      date: "10:15 ص - 10 نوفمبر 2025",
      items: [
        {
          id: 1,
          name: "عطر لاعج الملكي",
          image:
            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format",
          quantity: 1,
          price: 850,
        },
        {
          id: 2,
          name: "عود هندي أصيل",
          image:
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop&q=80&auto=format",
          quantity: 1,
          price: 950,
        },
      ],
    },
    {
      id: "D2234",
      category: "عطور",
      productCount: 1,
      total: 1350,
      status: "delivered",
      date: "03:45 م - 8 نوفمبر 2025",
      items: [
        {
          id: 1,
          name: "عود كمبودي ملكي",
          image:
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop&q=80&auto=format",
          quantity: 1,
          price: 1350,
        },
      ],
    },
  ];

  const panelClasses = isDark
    ? "bg-card border border-card text-primary"
    : "bg-card border border-card text-primary";
  const inactiveTabClasses = isDark
    ? "bg-card-muted text-secondary border border-card hover:text-primary"
    : "bg-card-muted text-secondary border border-card hover:text-primary";

  const formatPrice = (price) => {
    return price.toLocaleString("ar-AE");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "in-progress": {
        label: "قيد التنفيذ",
        bg: isDark ? "bg-amber-900/40" : "bg-amber-100",
        text: isDark ? "text-amber-300" : "text-amber-700",
        border: isDark ? "border-amber-600/60" : "border-amber-400/60",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      completed: {
        label: "أكتملت",
        bg: isDark ? "bg-blue-900/40" : "bg-blue-100",
        text: isDark ? "text-blue-300" : "text-blue-700",
        border: isDark ? "border-blue-600/60" : "border-blue-400/60",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      delivered: {
        label: "تم التوصيل",
        bg: isDark ? "bg-green-900/40" : "bg-green-100",
        text: isDark ? "text-green-300" : "text-green-700",
        border: isDark ? "border-green-600/60" : "border-green-400/60",
        icon: (
          <svg
            className="w-4 h-4"
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
        ),
      },
    };

    const config = statusConfig[status] || statusConfig["in-progress"];

    return (
      <span
        className={`${config.bg} ${config.text} ${config.border} border-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2`}
      >
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : activeTab === "قيد التنفيذ"
      ? orders.filter((o) => o.status === "in-progress")
      : orders.filter(
          (o) => o.status === "completed" || o.status === "delivered"
        );

  return (
    <PageLayout>
      <div className="w-full ltr max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center md:text-right mb-8 md:mb-12">
          <h1
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 ${
              isDark ? "text-white" : "text-luxury-brown-text"
            }`}
          >
            طلباتي
          </h1>
          <p
            className={`text-lg md:text-xl ${
              isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/80"
            }`}
          >
            تتبع جميع طلباتك وتاريخ الشراء
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 md:gap-4 mb-8 md:mb-12 overflow-x-auto scrollbar-hide pb-2">
          {["الكل", "قيد التنفيذ", "أكتملت"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base whitespace-nowrap transition-all duration-300 shadow-lg hover:scale-105 transform ${
                activeTab === tab
                  ? isDark
                    ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-brown-darker shadow-luxury-gold/40"
                    : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-[#1A1410] shadow-luxury-gold/40"
                  : `${inactiveTabClasses}`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div
            className={`${panelClasses} backdrop-blur-sm rounded-2xl p-12 md:p-16 text-center shadow-lg`}
          >
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isDark ? "bg-luxury-gold/10" : "bg-luxury-gold/15"
              }`}
            >
              <svg
                className={`w-10 h-10 md:w-12 md:h-12 ${
                  isDark
                    ? "text-luxury-brown-light"
                    : "text-luxury-brown-text/60"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3
              className={`font-bold text-xl md:text-2xl mb-3 ${
                isDark ? "text-white" : "text-luxury-brown-text"
              }`}
            >
              لا توجد طلبات
            </h3>
            <p
              className={`text-base md:text-lg mb-6 ${
                isDark ? "text-luxury-brown-light" : "text-luxury-brown-text/70"
              }`}
            >
              لم تقم بأي طلبات بعد
            </p>
            <Link
              to="/products"
              className={`inline-block px-8 py-4 rounded-xl font-semibold text-base md:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 transform ${
                isDark
                  ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-light hover:to-luxury-gold text-luxury-brown-darker"
                  : "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-light hover:to-luxury-gold text-white"
              }`}
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 ${
                  isDark
                    ? "hover:border-luxury-gold/60 shadow-lg"
                    : "hover:border-luxury-gold/50 shadow-md"
                }`}
              >
                {/* Order Header */}
                <div
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b ${
                    isDark
                      ? "border-luxury-gold-dark/30"
                      : "border-luxury-gold-light/30"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 md:gap-4 mb-2">
                      <div className="text-right flex-1">
                        <h3
                          className={`font-bold text-lg md:text-xl ${
                            isDark ? "text-white" : "text-luxury-brown-text"
                          }`}
                        >
                          طلب #{order.id}
                        </h3>
                        <p
                          className={`text-sm md:text-base mt-1 ${
                            isDark
                              ? "text-luxury-brown-light"
                              : "text-luxury-brown-text/70"
                          }`}
                        >
                          {order.date}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isDark
                            ? "bg-luxury-gold-dark/20"
                            : "bg-luxury-gold/20"
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 md:w-6 md:h-6 ${
                            isDark
                              ? "text-luxury-gold-light"
                              : "text-luxury-gold"
                          }`}
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
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <p
                        className={`text-xs md:text-sm mb-1 ${
                          isDark
                            ? "text-luxury-brown-light"
                            : "text-luxury-brown-text/70"
                        }`}
                      >
                        الإجمالي
                      </p>
                      <p
                        className={`font-bold text-lg md:text-xl ${
                          isDark ? "text-luxury-gold-light" : "text-luxury-gold"
                        }`}
                      >
                        {formatPrice(order.total)} درهم
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mb-6">
                  <div
                    className={`flex items-center gap-2 mb-4 ${
                      isDark ? "text-white" : "text-luxury-brown-text"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        isDark
                          ? "text-luxury-brown-light"
                          : "text-luxury-brown-text/60"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <h4
                      className={`font-semibold text-base md:text-lg ${
                        isDark ? "text-white" : "text-luxury-brown-text"
                      }`}
                    >
                      {order.productCount} منتج
                    </h4>
                  </div>
                  <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border ${
                          isDark
                            ? "bg-black border-luxury-gold-dark/40"
                            : "bg-luxury-cream border-luxury-gold-light/40"
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format";
                          }}
                        />
                        {item.quantity > 1 && (
                          <div
                            className={`absolute top-1 left-1 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                              isDark ? "bg-luxury-gold" : "bg-luxury-gold-dark"
                            }`}
                          >
                            {item.quantity}
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div
                        className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center border ${
                          isDark
                            ? "bg-card-muted border-luxury-gold-dark/30"
                            : "bg-card-muted border-luxury-gold-light/40"
                        }`}
                      >
                        <span
                          className={`font-bold text-sm md:text-base ${
                            isDark
                              ? "text-luxury-gold-light"
                              : "text-luxury-gold"
                          }`}
                        >
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div
                  className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4 pt-6 border-t ${
                    isDark
                      ? "border-luxury-gold-dark/30"
                      : "border-luxury-gold-light/30"
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <button
                      onClick={() => navigate(`/order-detail/${order.id}`)}
                      className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 transform flex items-center justify-center gap-2 border ${
                        isDark
                          ? "bg-card-muted text-primary hover:bg-card-muted/80 border-card hover:border-luxury-gold/50"
                          : "bg-card text-primary hover:bg-card-muted border-card hover:border-luxury-gold/50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>عرض التفاصيل</span>
                    </button>
                    {order.status === "completed" && (
                      <button
                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 transform flex items-center justify-center gap-2 border-2 ${
                          isDark
                            ? "bg-blue-900/30 hover:bg-blue-900/40 text-blue-300 border-blue-600/50"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-400/60"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span>إعادة الطلب</span>
                      </button>
                    )}
                  </div>
                  {order.status === "in-progress" && (
                    <Link
                      to={`/order-detail/${order.id}`}
                      className={`flex-1 sm:flex-none px-8 py-4 rounded-xl font-extrabold text-lg md:text-xl transition-all duration-300 shadow-2xl hover:shadow-2xl hover:scale-110 transform flex items-center justify-center gap-3 border-[3px] ${
                        isDark
                          ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-luxury-brown-darker border-amber-600 shadow-amber-900/60"
                          : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-white border-amber-700 shadow-amber-900/50"
                      }`}
                    >
                      <svg
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span className="font-black tracking-wide">
                        تتبع الطلب
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Orders;
