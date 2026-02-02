# Public Endpoints (No Authentication Required)

This document lists all API endpoints that currently **DO NOT require authentication**. These endpoints should be changed to **REQUIRE authentication** on the backend.

## Authentication Endpoints

### Registration & Login
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify` - Phone/email verification with OTP

### Password Reset
- `POST /auth/reset-password/send-otp` - Send OTP for password reset
- `POST /auth/reset-password/verify-otp` - Verify OTP for password reset
- `POST /auth/reset-password/set-new-password` - Set new password after OTP verification

## Categories Endpoints

- `GET /front/categories` - Get all categories (with optional limit parameter)
- `GET /front/categories/:id` - Get category by ID

## Products Endpoints

- `GET /front/products` - Get products with filters and pagination
  - Supports query parameters: page, limit, category_id, featured, new, price_min, price_max, attribute_options[], sort
- `GET /front/products/:id` - Get product by ID
- `GET /front/products?featured=true` - Get featured products
- `GET /front/products/search?query=...` - Search products

## Attributes Endpoints

- `GET /front/attributes` - Get product attributes (for filters)

## Branches Endpoints

- `GET /branches` - Get all branches

## Offers Endpoints

- `GET /offers` - Get all offers

## Sliders Endpoints

- `GET /sliders` - Get all sliders

---

## Summary

**Total: 16 endpoints** that currently don't require authentication:

1. `POST /auth/register`
2. `POST /auth/verify`
3. `POST /auth/login`
4. `POST /auth/reset-password/send-otp`
5. `POST /auth/reset-password/verify-otp`
6. `POST /auth/reset-password/set-new-password`
7. `GET /front/categories`
8. `GET /front/categories/:id`
9. `GET /front/products`
10. `GET /front/products/:id`
11. `GET /front/products?featured=true` (same as #9 with filter)
12. `GET /front/products/search`
13. `GET /front/attributes`
14. `GET /branches`
15. `GET /offers`
16. `GET /sliders`

---

## Notes for Backend Team

- All these endpoints currently use `publicApiClient` in the frontend, which means they don't send an Authorization header.
- After the backend changes these endpoints to require authentication, the frontend will need to be updated to use `authApiClient` instead.
- The frontend code is located in `src/services/api.js` - each endpoint function has a comment indicating whether it uses `publicApiClient` or `authApiClient`.
