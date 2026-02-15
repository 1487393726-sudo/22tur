/**
 * Order Service
 * Handles order management and tracking
 */

import { Order, OrderDetail, OrderFilters, OrderStatus, ApiResponse } from '../types'
import { prisma } from '@/lib/prisma'

export class OrderService {
  /**
   * Get all orders for a user
   */
  async getOrders(userId: string, filters?: OrderFilters): Promise<Order[]> {
    try {
      const where: any = { userId }

      if (filters?.status) {
        where.status = filters.status
      }

      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      })

      return orders.map(order => ({
        id: order.id,
        userId: order.userId,
        items: order.items as any || [],
        status: order.status as OrderStatus,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress as any || {},
        trackingNumber: order.trackingNumber || undefined,
        estimatedDelivery: order.estimatedDelivery || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }))
    } catch (error) {
      throw new Error(`Failed to get orders: ${error}`)
    }
  }

  /**
   * Get order detail
   */
  async getOrderDetail(orderId: string): Promise<OrderDetail> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      })

      if (!order) {
        throw new Error('Order not found')
      }

      return {
        id: order.id,
        userId: order.userId,
        items: order.items as any || [],
        status: order.status as OrderStatus,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress as any || {},
        trackingNumber: order.trackingNumber || undefined,
        estimatedDelivery: order.estimatedDelivery || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to get order detail: ${error}`)
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
      })

      return {
        id: order.id,
        userId: order.userId,
        items: order.items as any || [],
        status: order.status as OrderStatus,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress as any || {},
        trackingNumber: order.trackingNumber || undefined,
        estimatedDelivery: order.estimatedDelivery || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to update order status: ${error}`)
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' },
      })

      return {
        id: order.id,
        userId: order.userId,
        items: order.items as any || [],
        status: order.status as OrderStatus,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress as any || {},
        trackingNumber: order.trackingNumber || undefined,
        estimatedDelivery: order.estimatedDelivery || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error}`)
    }
  }

  /**
   * Get order by tracking number
   */
  async getOrderByTracking(trackingNumber: string): Promise<Order | null> {
    try {
      const order = await prisma.order.findFirst({
        where: { trackingNumber },
      })

      if (!order) {
        return null
      }

      return {
        id: order.id,
        userId: order.userId,
        items: order.items as any || [],
        status: order.status as OrderStatus,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress as any || {},
        trackingNumber: order.trackingNumber || undefined,
        estimatedDelivery: order.estimatedDelivery || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to get order by tracking: ${error}`)
    }
  }
}

export const orderService = new OrderService()
