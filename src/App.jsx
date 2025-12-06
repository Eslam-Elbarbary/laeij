import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { CartProvider } from "./contexts/CartContext";
import { ToastProvider } from "./contexts/ToastContext";
import { OffersProvider } from "./contexts/OffersContext";
import "./i18n";
import Home from "./pages/Home";
import Login from "./pages/Login";
import OTPVerification from "./pages/OTPVerification";
import ProfileSetup from "./pages/ProfileSetup";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Account from "./pages/Account";
import Addresses from "./pages/Addresses";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import Branches from "./pages/Branches";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import BookingLists from "./pages/BookingLists";
import BookingListDetail from "./pages/BookingListDetail";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <OffersProvider>
            <CartProvider>
              <WishlistProvider>
                <BrowserRouter>
                  <div className="App">
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/otp-verification"
                        element={<OTPVerification />}
                      />
                      <Route path="/profile-setup" element={<ProfileSetup />} />
                      <Route path="/" element={<Home />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route
                        path="/order-detail/:id"
                        element={<OrderDetail />}
                      />
                      <Route path="/account" element={<Account />} />
                      <Route path="/addresses" element={<Addresses />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/branches" element={<Branches />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route
                        path="/transaction/:id"
                        element={<TransactionDetail />}
                      />
                      <Route path="/tickets" element={<Tickets />} />
                      <Route path="/ticket/:id" element={<TicketDetail />} />
                      <Route path="/booking-lists" element={<BookingLists />} />
                      <Route
                        path="/booking-list/:id"
                        element={<BookingListDetail />}
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </BrowserRouter>
              </WishlistProvider>
            </CartProvider>
          </OffersProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
