/**
 * Cart Item API Endpoint
 * PUT /api/user-portal/cart/items/[id] - Update item quantity
 * DELETE /api/user-portal/cart/items/[id] - Remove item from cart
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationMiddleware } from '@/lib/user-portal/authorization-middleware'
import { cartService } from '@/lib/user-portal/services/cart-service'

/**
 * PUT /api/user-portal/cart/items/[id]
 * Update item quantity
 */
export const PUT = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId
      const itemId = context.params?.id
      const body = await request.json()

      if (!itemId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Item ID is required',
          },
          { status: 400 }
        )
      }

      if (body.quantity === undefined || body.quantity < 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Valid quantity is required',
          },
          { status: 400 }
        )
      }

      const cart = await cartService.updateQuantity(userId, itemId, body.quantity)

      return NextResponse.json({
        success: true,
        data: cart,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to update item quantity',
        },
        { status: 500 }
      )
    }
  }
)

/**
 * DELETE /api/user-portal/cart/items/[id]
 * Remove item from cart
 */
export const DELETE = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId
      const itemId = context.params?.id

      if (!itemId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Item ID is required',
          },
          { status: 400 }
        )
      }

      const cart = await cartService.removeItem(userId, itemId)

      return NextResponse.json({
        success: true,
        data: cart,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to remove item from cart',
        },
        { status: 500 }
      )
    }
  }
)
