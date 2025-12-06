# Complete API Integration Plan

## Summary
This document outlines all changes needed to complete API integration across the entire project.

## Pages Requiring API Integration

### 1. Orders.jsx ⚠️ PRIORITY
**Current State**: Uses hardcoded mock orders array
**Required Changes**:
- Import `apiService` from `../services/api`
- Add `loading` and `error` states
- Add `useEffect` to fetch orders on mount
- Map API response to UI format (normalize data structure)
- Add loading skeleton component
- Add error display component
- Add empty state component
- Handle order status mapping (API status → UI status)

**API Endpoint**: `apiService.getOrders()`

### 2. OrderDetail.jsx ⚠️ PRIORITY  
**Current State**: Uses hardcoded mock order object
**Required Changes**:
- Import `apiService` from `../services/api`
- Get order ID from URL params
- Add `loading` and `error` states
- Add `useEffect` to fetch order by ID
- Map API response to UI format
- Add loading skeleton
- Add error display (404 handling)
- Add empty state

**API Endpoint**: `apiService.getOrderById(id)`

### 3. Checkout.jsx ⚠️ PRIORITY
**Current State**: Uses setTimeout to simulate order creation
**Required Changes**:
- Import `apiService` from `../services/api`
- Get addresses from API (or use addresses context)
- Replace setTimeout with `apiService.createOrder()`
- Handle order creation response
- Handle errors with proper error messages
- Redirect to order detail page on success
- Clear cart after successful order

**API Endpoint**: `apiService.createOrder(orderData)`
**Required Data**:
- shipping_address_id
- billing_address_id  
- payment_method
- coupon_code (optional)

### 4. Contact.jsx
**Current State**: Uses setTimeout to simulate ticket creation
**Required Changes**:
- Import `apiService` from `../services/api`
- Replace setTimeout with `apiService.createTicket()`
- Handle file attachments if needed
- Show success/error messages
- Reset form on success

**API Endpoint**: `apiService.createTicket(ticketData)`
**Required Data**:
- subject (derived from form data)
- description (formData.message)
- attachments (optional)

## Additional Features to Activate

### 5. Order Cancellation
**Location**: OrderDetail.jsx
**Required Changes**:
- Add cancel button for pending orders
- Call `apiService.cancelOrder(orderId)`
- Refresh order data after cancellation
- Show confirmation dialog

### 6. Transaction History (Future Enhancement)
**Location**: Account.jsx or new Transactions page
**Required Changes**:
- Create transactions page component
- Fetch transactions using `apiService.getTransactions()`
- Display transaction history
- Add transaction detail view

### 7. Support Tickets List (Future Enhancement)
**Location**: Account.jsx or new Tickets page
**Required Changes**:
- Fetch tickets using `apiService.getTickets()`
- Display ticket list
- Add ticket detail view with replies
- Implement ticket reply functionality

## Data Normalization Requirements

### Order Data Mapping
API Response → UI Format:
```javascript
{
  id: order.id || order.order_number,
  status: mapOrderStatus(order.status), // Map API status to UI status
  date: formatOrderDate(order.created_at),
  total: order.total || order.final_total,
  productCount: order.items?.length || 0,
  items: order.items?.map(item => ({
    id: item.product_id || item.id,
    name: item.product?.name || item.name,
    nameEn: item.product?.nameEn || item.nameEn,
    image: item.product?.image || item.image,
    quantity: item.quantity,
    price: item.price || item.unit_price,
    size: item.size || item.variant?.name
  })) || []
}
```

### Status Mapping
- API: "pending" → UI: "in-progress"
- API: "processing" → UI: "in-progress"
- API: "completed" → UI: "completed"
- API: "delivered" → UI: "delivered"
- API: "cancelled" → UI: "cancelled"

## Loading & Error States

### Loading States
- Use existing `LoadingSkeleton` components
- Create order-specific skeletons if needed
- Show loading state during initial fetch
- Show loading state during mutations (create, cancel)

### Error States
- Network errors: Show retry button
- 404 errors: Show "Not Found" message
- 401 errors: Redirect to login (handled by interceptor)
- Validation errors: Show field-specific errors
- Generic errors: Show user-friendly message

### Empty States
- No orders: Show "No orders yet" with link to products
- No order found: Show "Order not found" with link to orders
- Empty cart on checkout: Redirect to cart

## Implementation Order

1. ✅ Remove mock data files
2. 🔄 Update Orders.jsx (HIGH PRIORITY)
3. 🔄 Update OrderDetail.jsx (HIGH PRIORITY)
4. 🔄 Update Checkout.jsx (HIGH PRIORITY)
5. ⏳ Update Contact.jsx
6. ⏳ Add order cancellation feature
7. ⏳ Clean up unused code
8. ⏳ Add comprehensive error handling
9. ⏳ Test all flows end-to-end

## Notes

- All API endpoints are already defined in `api.js`
- Authentication is handled automatically via `authApiClient`
- Token management is handled in `axiosConfig.js`
- Error handling (401) is handled globally in interceptors

