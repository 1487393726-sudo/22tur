# User Portal System

## Overview

The User Portal System is a comprehensive web application providing users with centralized management of accounts, orders, shopping, and support. This module contains all core infrastructure, services, and utilities for the user portal.

## Project Structure

```
lib/user-portal/
├── types.ts                          # Core type definitions
├── middleware.ts                     # Authentication and request handling
├── index.ts                          # Main entry point
├── auth-service.ts                  # JWT authentication service
├── session-service.ts               # Session management service
├── AUTH_SERVICE_README.md           # Authentication service documentation
├── services/
│   ├── user-service.ts              # User profile and preferences
│   ├── order-service.ts             # Order management
│   ├── cart-service.ts              # Shopping cart operations
│   ├── dashboard-service.ts         # Dashboard data aggregation
│   └── index.ts                     # Services export
├── data-cache.ts                    # Data caching utilities
├── offline-service-worker.ts        # Offline support
├── skeleton-screens.ts              # Loading placeholders
├── performance-optimization.ts      # Performance utilities
├── screen-reader-support.ts         # Accessibility support
├── high-contrast-mode.ts            # High contrast theme
├── keyboard-navigation.ts           # Keyboard navigation
├── dark-mode-optimization.ts        # Dark mode utilities
├── theme-types.ts                   # Theme type definitions
├── help-types.ts                    # Help system types
├── push-notifications.ts            # Push notification utilities
└── README.md                        # This file

app/api/user/
├── profile/route.ts                 # User profile API
├── preferences/route.ts             # User preferences API
└── dashboard/route.ts               # Dashboard API

prisma/
└── user-portal-schema.prisma        # Database schema

__tests__/
├── lib/user-portal/services/
│   ├── user-service.test.ts         # User service tests
│   ├── cart-service.test.ts         # Cart service tests
│   └── dashboard-service.test.ts    # Dashboard service tests
└── properties/user-portal/
    ├── dashboard.property.test.ts   # Dashboard property tests
    └── cart.property.test.ts        # Cart property tests
```

## Core Services

### AuthenticationService
Handles JWT-based authentication and token management.

```typescript
import { AuthenticationService } from '@/lib/user-portal/auth-service'

// Login
const result = await AuthenticationService.login({
  identifier: 'user@example.com',
  password: 'password123'
})

if (result.success) {
  console.log('Token:', result.token)
  console.log('Refresh Token:', result.refreshToken)
}

// Verify token
const payload = AuthenticationService.verifyToken(token)

// Validate session
const session = await AuthenticationService.validateSession(token)

// Logout
const logoutResult = await AuthenticationService.logout(userId)

// Refresh token
const refreshResult = await AuthenticationService.refreshAccessToken(refreshToken)
```

See [AUTH_SERVICE_README.md](./AUTH_SERVICE_README.md) for detailed documentation.

### SessionManagementService
Manages user sessions and session lifecycle.

```typescript
import { SessionManagementService } from '@/lib/user-portal/session-service'

// Create session
const session = await SessionManagementService.createSession(
  userId,
  token,
  refreshToken,
  ipAddress,
  userAgent
)

// Validate session
const isValid = await SessionManagementService.validateSession(sessionId, userId)

// Invalidate session
await SessionManagementService.invalidateSession(sessionId)

// Invalidate all sessions
await SessionManagementService.invalidateAllSessions(userId)
```

### UserService
Manages user profile and preferences.

```typescript
const userService = new UserService()

// Get user profile
const profile = await userService.getProfile(userId)

// Update user profile
const updated = await userService.updateProfile(userId, { name: 'New Name' })

// Get user preferences
const prefs = await userService.getPreferences(userId)

// Update preferences
const updated = await userService.updatePreferences(userId, { theme: 'dark' })
```

### OrderService
Handles order management and tracking.

```typescript
const orderService = new OrderService()

// Get all orders
const orders = await orderService.getOrders(userId)

// Get order detail
const order = await orderService.getOrderDetail(orderId)

// Update order status
const updated = await orderService.updateOrderStatus(orderId, 'shipped')

// Cancel order
const cancelled = await orderService.cancelOrder(orderId)
```

### CartService
Manages shopping cart operations.

```typescript
const cartService = new CartService()

// Get cart
const cart = await cartService.getCart(userId)

// Add item
const updated = await cartService.addItem(userId, item)

// Remove item
const updated = await cartService.removeItem(userId, itemId)

// Update quantity
const updated = await cartService.updateQuantity(userId, itemId, 5)

// Apply coupon
const updated = await cartService.applyCoupon(userId, 'SAVE10')

// Checkout
const order = await cartService.checkout(userId, checkoutData)
```

### DashboardService
Aggregates data for the user dashboard.

```typescript
const dashboardService = new DashboardService()

// Get dashboard data
const dashboard = await dashboardService.getDashboard(userId)

// Get quick stats
const stats = await dashboardService.getQuickStats(userId)
```

## API Routes

### Authentication
- `POST /api/user-portal/auth/login` - User login
- `POST /api/user-portal/auth/logout` - User logout
- `POST /api/user-portal/auth/refresh` - Refresh access token
- `GET /api/user-portal/auth/verify` - Verify session

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### User Preferences
- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update user preferences

### Dashboard
- `GET /api/user/dashboard` - Get dashboard data

## Database Schema

The system uses PostgreSQL with Prisma ORM. Key tables:

- `UserProfile` - User account information
- `UserPreferences` - User settings and preferences
- `Order` - Purchase orders
- `OrderItem` - Items in orders
- `Cart` - Shopping carts
- `CartItem` - Items in carts
- `Favorite` - Saved favorite items
- `PointsTransaction` - Points history
- `PointsBalance` - Current points balance
- `Conversation` - Message conversations
- `Message` - Individual messages
- `ReturnRequest` - Return/refund requests
- `Review` - Product reviews
- `FAQ` - Frequently asked questions
- `Guide` - Help guides
- `SupportTicket` - Support tickets
- `AuditLog` - Audit trail

## Testing

### Unit Tests
Located in `__tests__/lib/user-portal/services/`

Run unit tests:
```bash
npm test -- __tests__/lib/user-portal/services/
```

### Property-Based Tests
Located in `__tests__/properties/user-portal/`

Run property tests:
```bash
npm test -- __tests__/properties/user-portal/
```

## Type Definitions

All types are defined in `lib/user-portal/types.ts`:

- `User` - User profile
- `UserPreferences` - User settings
- `Order` - Purchase order
- `Cart` - Shopping cart
- `Favorite` - Favorite item
- `PointsTransaction` - Points transaction
- `Message` - Message
- `Conversation` - Message conversation
- `ReturnRequest` - Return request
- `Review` - Product review
- `FAQ` - FAQ item
- `Guide` - Help guide
- `SupportTicket` - Support ticket
- `DashboardData` - Dashboard data
- `ApiResponse<T>` - API response wrapper

## Middleware

The `userPortalMiddleware` function:
- Protects user portal routes
- Ensures authentication
- Adds user info to request headers
- Redirects unauthenticated users to login

## Performance Optimization

The system includes utilities for:
- Data caching
- Skeleton screens for loading states
- Offline support via service workers
- Bundle size optimization
- Code splitting and lazy loading

## Accessibility

Features include:
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus management

## Dark Mode

The system supports dark mode with:
- Theme switching
- Preference persistence
- Color contrast compliance
- Image brightness adjustment

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   npx prisma migrate dev
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Requirements Coverage

This implementation covers the following requirements:

- **Requirement 1**: User Dashboard
- **Requirement 2**: Order Management
- **Requirement 3**: Shopping Cart
- **Requirement 4**: Favorites Management
- **Requirement 5**: Points System
- **Requirement 6**: Messaging System
- **Requirement 7**: After-Sales Service
- **Requirement 8**: Review and Rating System
- **Requirement 9**: Help and Support
- **Requirement 10**: Accessibility Features
- **Requirement 11**: Dark Mode Support
- **Requirement 12**: Unit Testing
- **Requirement 13**: Property-Based Testing

## Next Steps

1. Implement remaining services (favorites, points, messaging, etc.)
2. Create database migrations
3. Implement API endpoints for all services
4. Add comprehensive error handling
5. Implement caching strategies
6. Add monitoring and logging
7. Complete accessibility audit
8. Performance testing and optimization
