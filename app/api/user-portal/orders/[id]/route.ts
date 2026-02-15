/**
 * Order Detail API Endpoint
 * GET /api/user-portal/orders/[id] - Get order detail
 * PUT /api/user-portal/orders/[id] - Update order
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationMiddleware } from '@/lib/user-portal/authorization-middleware'
import { orderService } from '@/lib/user-portal/services/order-service'

/**
 * GET /api/user-portal/orders/[id]
 * Get order detail
 */
export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const orderId = context.params?.id

      if (!orderId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Order ID is required',
          },
          { status: 400 }
        )
      }

      const order = await orderService.getOrderDetail(orderId)

      return NextResponse.json({
        success: true,
        data: order,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get order detail',
        },
        { status: 500 }
      )
    }
  }
)

/**
 * PUT /api/user-portal/orders/[id]
 * Update order (e.g., cancel order)
 */
export const PUT = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const orderId = context.params?.id
      const body = await request.json()

      if (!orderId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Order ID is required',
          },
          { status: 400 }
        )
      }

      if (body.action === 'cancel') {
        const order = await orderService.cancelOrder(orderId)
        return NextResponse.json({
          success: true,
          data: order,
        })
      }

      if (body.status) {
        const order = await orderService.updateOrderStatus(orderId, body.status)
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
          error: error.message || 'Failed to update order',
        },
        { status: 500 }
      )
    }
  }
)
