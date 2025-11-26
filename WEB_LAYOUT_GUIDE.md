# Web Layout Implementation Guide

## Overview

The application has been updated with a professional web layout featuring:
- **Top Navigation Bar** (Navbar) - Professional website-style navigation
- **Centered Layout** - Max-width containers (max-w-7xl) centered on the page
- **Responsive Design** - Mobile-first approach with tablet and desktop breakpoints
- **Conditional Bottom Nav** - Only shows on mobile devices (< 768px)

## New Components

### 1. Navbar (`src/components/Navbar.jsx`)
Professional top navigation bar with:
- Logo/Brand on the left
- Desktop navigation menu (hidden on mobile)
- Search icon
- Shopping cart with badge
- User menu dropdown
- Mobile hamburger menu
- Sticky positioning

### 2. PageLayout (`src/components/PageLayout.jsx`)
Wrapper component that provides:
- Consistent layout structure
- Navbar at the top
- Centered content area with max-width
- Conditional bottom navigation (mobile only)
- Responsive padding and spacing

## Layout Structure

```
┌─────────────────────────────────────┐
│         Navbar (Sticky)             │
├─────────────────────────────────────┤
│                                     │
│   ┌───────────────────────────┐    │
│   │  max-w-7xl (centered)     │    │
│   │  px-4 sm:px-6 lg:px-8     │    │
│   │                           │    │
│   │      Page Content         │    │
│   │                           │    │
│   └───────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│   BottomNav (Mobile Only)           │
└─────────────────────────────────────┘
```

## Updated Pages

All pages now use the `PageLayout` component:

- ✅ `Home.jsx` - Hero section, categories grid, featured products
- ✅ `Categories.jsx` - All categories in grid layout
- ✅ `Products.jsx` - Product listing with filters
- ✅ `ProductDetail.jsx` - Two-column product detail page
- ✅ `Cart.jsx` - Two-column cart layout (items + summary)
- ✅ `Checkout.jsx` - Centered checkout form
- ✅ `Orders.jsx` - Order history with tabs
- ✅ `OrderDetail.jsx` - Detailed order information
- ✅ `Account.jsx` - User account and settings
- ✅ `Addresses.jsx` - Saved addresses management
- ✅ `Contact.jsx` - Contact information

## Responsive Breakpoints

- **Mobile**: `< 640px` (sm)
- **Tablet**: `≥ 640px` (sm)
- **Desktop**: `≥ 768px` (md)
- **Large Desktop**: `≥ 1024px` (lg)

## Key Features

### 1. Centered Content
All pages use `max-w-7xl mx-auto` for centered, balanced layout:
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### 2. Responsive Grids
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

Example:
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

### 3. Conditional Bottom Nav
Bottom navigation only appears on mobile devices:
```jsx
{showBottomNav && isMobile && <BottomNav />}
```

### 4. Professional Navbar
- Desktop: Full navigation menu
- Mobile: Hamburger menu
- User dropdown with account options
- Shopping cart with item count badge

## Usage Example

```jsx
import PageLayout from "../components/PageLayout";

const MyPage = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Page Title
        </h1>
        {/* Your content */}
      </div>
    </PageLayout>
  );
};
```

## Styling Guidelines

### Colors
- Background: `bg-gray-900` (main), `bg-gray-800` (cards)
- Accent: `amber-500` to `amber-800`
- Text: `text-white` (primary), `text-gray-400` (secondary)

### Spacing
- Page padding: `py-6 md:py-8`
- Section spacing: `space-y-6` or `space-y-8`
- Card padding: `p-4 md:p-6`

### Typography
- Headings: `text-2xl md:text-3xl font-bold`
- Body: `text-sm md:text-base`
- Secondary: `text-gray-400`

## Notes

- Login, OTP, and Profile Setup pages remain standalone (no Navbar)
- All pages are fully responsive
- RTL support maintained throughout
- Dark theme consistent across all pages

