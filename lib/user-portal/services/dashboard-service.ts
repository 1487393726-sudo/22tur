/**
 * Dashboard Service
 * Aggregates data for the user dashboard
 */

import { DashboardData } from '../types'
import { userService } from './user-service'
import { orderService } from './order-service'
import { cartService } from './cart-service'

export class DashboardService {
  /**
   * Get dashboard data for user
   */
  async getDashboard(userId: string): Promise<DashboardData> {
    try {
      // Fetch all required data in parallel
      const [user, recentOrders, cart] = await Promise.all([
        userService.getProfile(userId),
        orderService.getOrders(userId),
        cartService.getCart(userId),
      ])

      // TODO: Fetch additional data
      // - pendingMessages count
      // - pointsBalance
      // - favorites
      // - pendingReviews

      return {
        user,
        recentOrders: recentOrders.slice(0, 5), // Last 5 orders
        pendingMessages: 0,
        pointsBalance: 0,
        favorites: [],
        pendingReviews: [],
      }
    } catch (error) {
      throw new Error(`Failed to get dashboard data: ${error}`)
    }
  }

  /**
   * Get quick stats
   */
  async getQuickStats(userId: string): Promise<{
    totalOrders: number
    totalSpent: number
    pendingMessages: number
    pointsBalance: number
  }> {
    try {
      const orders = await orderService.getOrders(userId)
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0)

      // TODO: Fetch messages and points
      return {
        totalOrders: orders.length,
        totalSpent,
        pendingMessages: 0,
        pointsBalance: 0,
      }
    } catch (error) {
      throw new Error(`Failed to get quick stats: ${error}`)
    }
  }
}

export const dashboardService = new DashboardService()
