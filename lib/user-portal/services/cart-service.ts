/**
 * Cart Service
 * Handles shopping cart operations
 */

import { Cart, CartItem, CheckoutData, Order } from '../types'
import { prisma } from '@/lib/prisma'

export class CartService {
  /**
   * Get user's cart
   */
  async getCart(userId: string): Promise<Cart> {
    try {
      let cart = await prisma.cart.findUnique({
        where: { userId },
      })

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId,
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0,
          },
        })
      }

      return {
        id: cart.id,
        userId: cart.userId,
        items: (cart.items as any) || [],
        subtotal: cart.subtotal,
        discount: cart.discount,
        total: cart.total,
        couponCode: cart.couponCode || undefined,
        updatedAt: cart.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to get cart: ${error}`)
    }
  }

  /**
   * Add item to cart
   */
  async addItem(userId: string, item: CartItem): Promise<Cart> {
    try {
      const cart = await this.getCart(userId)
      const items = cart.items || []
      
      // Check if item already exists
      const existingItem = items.find(i => i.id === item.id)
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        items.push(item)
      }

      this.recalculateTotal(cart)

      const updated = await prisma.cart.update({
        where: { userId },
        data: {
          items,
          subtotal: cart.subtotal,
          total: cart.total,
        },
      })

      return {
        id: updated.id,
        userId: updated.userId,
        items: (updated.items as any) || [],
        subtotal: updated.subtotal,
        discount: updated.discount,
        total: updated.total,
        couponCode: updated.couponCode || undefined,
        updatedAt: updated.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to add item to cart: ${error}`)
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<Cart> {
    try {
      const cart = await this.getCart(userId)
      const items = (cart.items || []).filter(item => item.id !== itemId)

      this.recalculateTotal(cart)

      const updated = await prisma.cart.update({
        where: { userId },
        data: {
          items,
          subtotal: cart.subtotal,
          total: cart.total,
        },
      })

      return {
        id: updated.id,
        userId: updated.userId,
        items: (updated.items as any) || [],
        subtotal: updated.subtotal,
        discount: updated.discount,
        total: updated.total,
        couponCode: updated.couponCode || undefined,
        updatedAt: updated.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to remove item from cart: ${error}`)
    }
  }

  /**
   * Update item quantity
   */
  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
    try {
      const cart = await this.getCart(userId)
      const items = cart.items || []
      const item = items.find(i => i.id === itemId)
      
      if (item) {
        item.quantity = quantity
      }

      this.recalculateTotal(cart)

      const updated = await prisma.cart.update({
        where: { userId },
        data: {
          items,
          subtotal: cart.subtotal,
          total: cart.total,
        },
      })

      return {
        id: updated.id,
        userId: updated.userId,
        items: (updated.items as any) || [],
        subtotal: updated.subtotal,
        discount: updated.discount,
        total: updated.total,
        couponCode: updated.couponCode || undefined,
        updatedAt: updated.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to update quantity: ${error}`)
    }
  }

  /**
   * Apply coupon code
   */
  async applyCoupon(userId: string, couponCode: string): Promise<Cart> {
    try {
      const cart = await this.getCart(userId)
      
      // TODO: Validate coupon in database
      // For now, just apply a fixed discount
      cart.couponCode = couponCode
      cart.discount = cart.subtotal * 0.1 // 10% discount

      this.recalculateTotal(cart)

      const updated = await prisma.cart.update({
        where: { userId },
        data: {
          couponCode,
          discount: cart.discount,
          total: cart.total,
        },
      })

      return {
        id: updated.id,
        userId: updated.userId,
        items: (updated.items as any) || [],
        subtotal: updated.subtotal,
        discount: updated.discount,
        total: updated.total,
        couponCode: updated.couponCode || undefined,
        updatedAt: updated.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to apply coupon: ${error}`)
    }
  }

  /**
   * Checkout
   */
  async checkout(userId: string, checkoutData: CheckoutData): Promise<Order> {
    try {
      const cart = await this.getCart(userId)
      if (!cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty')
      }

      // Create order from cart
      const order = await prisma.order.create({
        data: {
          userId,
          items: cart.items,
          status: 'pending',
          totalAmount: cart.total,
          shippingAddress: checkoutData.shippingAddress,
        },
      })

      // Clear cart
      await this.clearCart(userId)

      return {
        id: order.id,
        userId: order.userId,
        items: (order.items as any) || [],
        status: order.status as any,
        totalAmount: order.totalAmount,
        shippingAddress: (order.shippingAddress as any) || {},
        trackingNumber: order.trackingNumber || undefined,
        estimatedDelivery: order.estimatedDelivery || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to checkout: ${error}`)
    }
  }

  /**
   * Clear cart
   */
  async clearCart(userId: string): Promise<Cart> {
    try {
      const updated = await prisma.cart.update({
        where: { userId },
        data: {
          items: [],
          subtotal: 0,
          discount: 0,
          total: 0,
          couponCode: null,
        },
      })

      return {
        id: updated.id,
        userId: updated.userId,
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        updatedAt: updated.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to clear cart: ${error}`)
    }
  }

  /**
   * Recalculate cart total
   */
  private recalculateTotal(cart: Cart): void {
    const items = cart.items || []
    cart.subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    cart.total = cart.subtotal - (cart.discount || 0)
  }
}

export const cartService = new CartService()
