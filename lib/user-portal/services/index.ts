/**
 * User Portal Services
 * Central export point for all services
 */

export { UserService, userService } from './user-service'
export { OrderService, orderService } from './order-service'
export { CartService, cartService } from './cart-service'
export { DashboardService, dashboardService } from './dashboard-service'

// Export all services as a namespace
export * as services from './index'
