import { useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const hasShownToast = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      showToast("يرجى تسجيل الدخول لعرض تفاصيل الطلب", "error");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showToast]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const order = {
    id: id || "D2235",
    status: "in-progress",
    productCount: 4,
    date: "02:30 ص - 12 نوفمبر 2025",
    deliveryDate: "15 نوفمبر 2025",
    products: [
      {
        id: 1,
        name: "روح الورد الساحر",
        size: "30 جم",
        price: 1200,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format",
      },
      {
        id: 2,
        name: "عود كمبودي ملكي",
        size: "25 جم",
        price: 1200,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop&q=80&auto=format",
      },
      {
        id: 3,
        name: "زيت الياسمين النقي",
        size: "12 مل",
        price: 750,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop&q=80&auto=format",
      },
      {
        id: 4,
        name: "عطر المسك الأسود",
        size: "50 جم",
        price: 1250,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format",
      },
    ],
    payment: {
      method: "بطاقة ائتمانية",
      cardNumber: "25** *** *** *** ***",
    },
    address: {
      type: "المنزل",
      location: "أبو ظبي – حي النرجس",
      details: "طريق الكورنيش الشمالي، بجانب رد سي مول",
    },
    subtotal: 4400,
    discount: 180,
    delivery: 50,
    total: 4270,
  };

  const formatPrice = (price) => {
    return price.toLocaleString("ar-AE");
  };
  const panelClasses = isDark
    ? "bg-luxury-brown-darker/90 border border-luxury-gold-dark/40 text-luxury-brown-light"
    : "bg-white border border-luxury-gold-light/40 text-luxury-brown-text";
  const nestedPanelClasses = isDark
    ? "bg-luxury-brown-darker/75 border border-luxury-gold-dark/30 text-luxury-brown-light"
    : "bg-luxury-cream border border-luxury-gold-light/30 text-luxury-brown-text";

  const getStatusBadge = (status) => {
    if (status === "in-progress") {
      return (
        <span className="bg-amber-900/30 text-amber-400 border-2 border-amber-700/50 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
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
          <span>قيد التنفيذ</span>
        </span>
      );
    }
    return (
      <span className="bg-green-900/30 text-green-400 border-2 border-green-700/50 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
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
        <span>أكتملت</span>
      </span>
    );
  };

  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 md:mb-3">
              تفاصيل الطلب
            </h1>
            <p className="text-muted text-base md:text-lg">
              رقم الطلب:{" "}
              <span className="text-amber-500 font-semibold">#{order.id}</span>
            </p>
          </div>
          <Link
            to="/orders"
            className="text-amber-500 hover:text-amber-400 text-base md:text-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>العودة إلى الطلبات</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Order Status Card */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-muted text-sm md:text-base mb-2">
                    تاريخ الطلب
                  </p>
                  <p className="text-primary font-semibold text-base md:text-lg">
                    {order.date}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>
              {order.status === "in-progress" && (
                <div className="bg-amber-900/10 border border-amber-700/30 rounded-xl p-4 md:p-5 flex items-start gap-3 md:gap-4">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-amber-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-amber-400 font-semibold text-sm md:text-base mb-1">
                      متوقع التوصيل: {order.deliveryDate}
                    </p>
                    <p className="text-muted text-xs md:text-sm">
                      سيتم تحديث حالة الطلب عند الشحن
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Products List */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg`}
            >
              <div className="flex items-center gap-3 md:gap-4 mb-6 pb-4 border-b border-card">
                <h2 className="text-primary font-bold text-xl md:text-2xl text-right flex-1">
                  المنتجات ({order.productCount})
                </h2>
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-amber-500 flex-shrink-0"
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
              </div>
              <div className="space-y-4 md:space-y-6">
                {order.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 md:gap-6 pb-4 md:pb-6 border-b border-card last:border-0 last:pb-0"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="text-amber-500 hover:text-amber-400 transition-colors p-2 hover:bg-amber-500/10 rounded-lg flex-shrink-0"
                    >
                      <svg
                        className="w-5 h-5"
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
                    </Link>
                    <div className="flex-1 min-w-0 text-right">
                      <h3 className="text-primary font-semibold text-base md:text-lg mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-muted text-sm md:text-base mb-2">
                        الحجم: {product.size}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-amber-500 font-bold text-base md:text-lg">
                          {formatPrice(product.price * product.quantity)} درهم
                        </p>
                        <p className="text-muted text-sm">
                          الكمية: {product.quantity}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`relative w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border ${
                        isDark
                          ? "bg-black border-luxury-gold-dark/40"
                          : "bg-luxury-cream border-luxury-gold-light/40"
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80&auto=format";
                        }}
                      />
                      {product.quantity > 1 && (
                        <div className="absolute top-1 right-1 bg-amber-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                          {product.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg`}
            >
              <div className="flex items-center gap-3 md:gap-4 mb-6">
                <h2 className="text-primary font-bold text-xl md:text-2xl text-right flex-1">
                  عنوان التوصيل
                </h2>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
              <div className={`${nestedPanelClasses} rounded-xl p-4 md:p-6`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-primary font-semibold text-base md:text-lg mb-1">
                      {order.address.type}
                    </p>
                    <p className="text-secondary text-sm md:text-base mb-1">
                      {order.address.location}
                    </p>
                    <p className="text-muted text-sm">
                      {order.address.details}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* Order Summary */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg lg:sticky lg:top-24`}
            >
              <h3 className="text-primary font-bold text-xl md:text-2xl mb-6 pb-4 border-b border-card">
                ملخص الطلب
              </h3>
              <div className="space-y-4 md:space-y-5">
                <div className="flex justify-between text-secondary text-base md:text-lg">
                  <span>المجموع الجزئي</span>
                  <span>{formatPrice(order.subtotal)} درهم</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-400 text-base md:text-lg font-semibold">
                    <span>الخصم</span>
                    <span>-{formatPrice(order.discount)} درهم</span>
                  </div>
                )}
                <div className="flex justify-between text-secondary text-base md:text-lg">
                  <span>التوصيل</span>
                  <span>{formatPrice(order.delivery)} درهم</span>
                </div>
                <div className="border-t border-card pt-4 md:pt-5 flex justify-between text-primary font-bold text-xl md:text-2xl">
                  <span>الإجمالي</span>
                  <span className="text-amber-500">
                    {formatPrice(order.total)} درهم
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div
              className={`${panelClasses} backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg`}
            >
              <div className="flex ltr items-center gap-3 md:gap-4 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-primary font-bold text-lg md:text-xl">
                  بيانات الدفع
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-muted text-sm md:text-base mb-2">
                    طريقة الدفع
                  </p>
                  <p className="text-primary font-semibold text-base md:text-lg">
                    {order.payment.method}
                  </p>
                </div>
                <div>
                  <p className="text-muted text-sm md:text-base mb-2">
                    بيانات البطاقة
                  </p>
                  <p className="text-primary font-medium text-base md:text-lg">
                    {order.payment.cardNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 md:space-y-4">
              {order.status === "in-progress" && (
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg hover:from-amber-700 hover:to-amber-900 transition-all shadow-2xl hover:shadow-amber-900/50 hover:scale-[1.02] transform duration-300 focus:outline-none focus:ring-4 focus:ring-amber-700/50 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>تتبع الطلب</span>
                </button>
              )}
              <Link
                to="/products"
                className={`block w-full text-center py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 hover:scale-[1.02] transform border ${
                  isDark
                    ? "bg-luxury-brown-darker/70 text-luxury-brown-light hover:bg-luxury-brown-darker/50 border-luxury-gold-dark/40"
                    : "bg-white text-luxury-brown-text hover:bg-luxury-cream border-luxury-gold-light/40"
                }`}
              >
                متابعة التسوق
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderDetail;
