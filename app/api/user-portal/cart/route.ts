/**
 * Shopping Cart API Endpoints
 * GET /api/user-portal/cart - Get user cart
 * POST /api/user-portal/cart - Add item to cart
 * DELETE /api/user-portal/cart - Clear cart
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationMiddleware } from '@/lib/user-portal/authorization-middleware'
import { cartService } from '@/lib/user-portal/services/cart-service'

/**
 * GET /api/user-portal/cart
 * Get user's shopping cart
 */
export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId

      const cart = await cartService.getCart(userId)

      return NextResponse.json({
        success: true,
        data: cart,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get cart',
        },
        { status: 500 }
      )
    }
  }
)

/**
 * POST /api/user-portal/cart
 * Add item to cart or apply coupon
 */
export const POST = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId
      const body = await request.json()

      if (body.action === 'add-item') {
        const cart = await cartService.addItem(userId, body.item)
        return NextResponse.json({
          success: true,
          data: cart,
        })
      }

      if (body.action === 'apply-coupon') {
        const cart = await cartService.applyCoupon(userId, body.couponCode)
        return NextResponse.json({
          success: true,
          data: cart,
        })
      }

      if (body.action === 'checkout') {
        const order = await cartService.checkout(userId, body.checkoutData)
        return NextResponse.json({
          success: true,
          data: order,
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action',
        },
        { status: 400 }
      )
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to process cart action',
        },
        { status: 500 }
      )
    }
  }
)

/**
 * DELETE /api/user-portal/cart
 * Clear cart
 */
export const DELETE = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId

      const cart = await cartService.clearCart(userId)

      return NextResponse.json({
        success: true,
        data: cart,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to clear cart',
        },
        { status: 500 }
      )
    }
  }
)
