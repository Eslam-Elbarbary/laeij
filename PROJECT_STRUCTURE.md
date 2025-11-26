# Laeij E-Commerce Frontend

A responsive React e-commerce application for luxury perfumes, oud, oils, and fashion items with Arabic (RTL) support.

## Project Structure

```
laeij/
├── src/
│   ├── components/          # Reusable components
│   │   ├── BottomNav.jsx    # Bottom navigation bar
│   │   ├── CategoryCard.jsx # Category display card
│   │   ├── Header.jsx       # Page header component
│   │   └── ProductCard.jsx  # Product display card
│   │
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Home page with categories
│   │   ├── Login.jsx        # Login/Phone number entry
│   │   ├── OTPVerification.jsx # OTP verification screen
│   │   ├── ProfileSetup.jsx # User profile setup
│   │   ├── Categories.jsx   # Categories listing
│   │   ├── Products.jsx     # Products listing
│   │   ├── ProductDetail.jsx # Product details page
│   │   ├── Cart.jsx         # Shopping cart
│   │   ├── Checkout.jsx     # Checkout/Payment
│   │   ├── Orders.jsx       # Order history
│   │   ├── OrderDetail.jsx  # Order details
│   │   ├── Account.jsx      # User account page
│   │   ├── Addresses.jsx    # Saved addresses
│   │   └── Contact.jsx     # Contact information
│   │
│   ├── App.jsx              # Main app with routing
│   ├── App.css              # App-specific styles
│   ├── index.css            # Global styles & Tailwind
│   └── main.jsx             # Entry point
│
├── index.html               # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
└── vite.config.js           # Vite configuration
```

## Features

- ✅ **Responsive Design**: Mobile-first, works on mobile, tablet, and desktop
- ✅ **RTL Support**: Full right-to-left layout for Arabic content
- ✅ **React Router**: Navigation between all pages
- ✅ **Tailwind CSS v4**: Modern styling with Tailwind CSS
- ✅ **Arabic Typography**: Cairo font for beautiful Arabic text
- ✅ **Dark Theme**: Luxury dark theme with amber/gold accents

## Routes

- `/` - Home page
- `/login` - Login/Phone entry
- `/otp-verification` - OTP verification
- `/profile-setup` - Profile completion
- `/categories` - All categories
- `/products?category=X` - Products by category
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Payment checkout
- `/orders` - Order history
- `/order-detail/:id` - Order details
- `/account` - User account
- `/addresses` - Saved addresses
- `/contact` - Contact information

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Styling

The project uses Tailwind CSS v4 with custom configuration:
- Dark theme: `bg-gray-900`, `bg-gray-800`
- Accent colors: `amber-500`, `amber-600`, `amber-700`, `amber-800`
- Responsive breakpoints: `md:`, `lg:`

## Components

### BottomNav
Bottom navigation bar with 4 main sections: Home, Categories, Cart, Account

### ProductCard
Displays product information with image, name, description, size, and price

### CategoryCard
Shows category with image, name, description, and product count

### Header
Page header with title, back button, and optional user info

## Notes

- All text is in Arabic (RTL)
- Icons are emoji-based (can be replaced with icon library)
- Product images use placeholders (replace with actual images)
- Form validation is basic (add proper validation as needed)
- State management is local (consider Context API or Redux for larger apps)

