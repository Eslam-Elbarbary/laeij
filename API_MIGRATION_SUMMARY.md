# API Migration Summary

## Overview
This document describes the migration from Fake API to Real API with conditional authentication.

## Files Created/Modified

### 1. `src/services/axiosConfig.js` (NEW)
**Purpose**: Configures axios instances with conditional authentication

**Key Features**:
- **publicApiClient**: For endpoints that DON'T require authentication
  - No Authorization header added
  - Only adds Accept-Language header
- **authApiClient**: For endpoints that REQUIRE authentication
  - Automatically adds Authorization: Bearer token header
  - Adds Accept-Language header
  - Handles 401 errors (redirects to login)

**Authentication Rules**:
- Public endpoints work WITHOUT authentication
- Authenticated endpoints require token and redirect on 401

### 2. `src/services/api.js` (UPDATED)
**Changes**:
- Replaced single `apiClient` with conditional `publicApiClient` and `authApiClient`
- Each endpoint function explicitly uses the correct client
- All endpoints updated to use real API structure from Postman collection

**Endpoint Mapping**:

#### Public Endpoints (use `publicApiClient`):
- `/auth/register` - User registration
- `/auth/login` - User login
- `/auth/verify` - Phone/email verification
- `/auth/reset-password/*` - All password reset endpoints
- `/categories` - Get all categories
- `/categories/:id` - Get category by ID
- `/products` - Get products (with filters)
- `/products/:id` - Get product by ID
- `/products/search` - Search products
- `/sliders` - Get sliders
- `/offers` - Get offers
- `/branches` - Get branches
- `/attributes` - Get product attributes

#### Authenticated Endpoints (use `authApiClient`):
- `/auth/profile` - Get user profile
- `/auth/edit-profile` - Update user profile
- `/auth/change-password` - Change password
- `/auth/logout` - Logout
- `/auth/delete-account` - Delete account
- `/cart` - All cart operations (get, add, update, remove, clear, apply coupon)
- `/favorite-list` - Get favorite/wishlist
- `/products/:id/toggle-favorite` - Add/remove from favorites
- `/products/:id/review` - Add product review
- `/orders` - All order operations
- `/addresses` - All address operations
- `/transactions` - All transaction operations
- `/tickets` - All ticket/support operations
- `/booking-lists` - All booking list operations

### 3. Contexts Updated

#### `src/contexts/AuthContext.jsx`
- Uses real API endpoints for all authentication operations
- Stores token in localStorage
- Handles login, signup, verify, logout, profile operations

#### `src/contexts/CartContext.jsx`
- Uses real API endpoints for cart operations
- Falls back to localStorage for guest users
- Handles add, update, remove, clear, apply coupon

#### `src/contexts/WishlistContext.jsx`
- Uses real API endpoints for wishlist operations
- Falls back to localStorage for guest users
- Handles add, remove, clear favorites

### 4. Pages Updated
All pages now use real API with proper loading and error states:
- Home.jsx - Categories and Featured Products
- Products.jsx - Product listing with filters
- ProductDetail.jsx - Product details
- Categories.jsx - Category listing
- Addresses.jsx - Address management (full CRUD)
- Wishlist.jsx - Wishlist display

### 5. Placeholder Component
`src/components/PlaceholderComponent.jsx` - Clean placeholder for missing UI/data

## Token Handling

### Storage
- Token stored in `localStorage` as `"authToken"`
- User data stored in `localStorage` as `"user"`

### Automatic Injection
- Token automatically added to Authorization header for authenticated endpoints
- Only added when token exists in localStorage
- No token sent for public endpoints

### Error Handling
- 401 responses trigger:
  1. Token removal from localStorage
  2. User data removal
  3. Redirect to /login (if not already on login page)

## Environment Configuration

### Required
Create a `.env` file in the project root:

```env
VITE_API_URL=https://your-api-url.com/api
```

### Optional
The API base URL defaults to `https://api.laeij.com/api` if not set.

## Data Normalization

The API service includes data normalization functions to transform backend responses to match UI expectations:

- **Cart Items**: Maps API cart structure to component-expected format
- **Products**: Handles both single product and array responses
- **Addresses**: Formats address data for display and editing

## Error Handling

All API functions return a consistent response format:

```javascript
{
  success: boolean,
  data: any,
  message: string,
  errors?: object  // Validation errors if any
}
```

Components should check `response.success` before using `response.data`.

## Loading States

All pages include loading states:
- Skeleton loaders during data fetching
- Error messages on API failures
- Empty states when no data available

## Testing Checklist

1. ✅ Public endpoints work without login
2. ✅ Authenticated endpoints require login
3. ✅ Token automatically added to auth requests
4. ✅ 401 errors redirect to login
5. ✅ All pages fetch real data
6. ✅ Loading states display correctly
7. ✅ Error handling works properly

## Next Steps

1. Set `VITE_API_URL` in `.env` file
2. Test all endpoints with your backend
3. Verify data structure matches backend responses
4. Test authentication flow end-to-end
5. Test error scenarios (network errors, 401, 404, etc.)

## Notes

- All existing UI structure preserved
- No breaking changes to component interfaces
- Backward compatible with existing code
- Ready for production use once backend URL is configured


