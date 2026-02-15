/**
 * Orders API Endpoints
 * GET /api/user-portal/orders - Get user orders
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationMiddleware } from '@/lib/user-portal/authorization-middleware'
import { orderService } from '@/lib/user-portal/services/order-service'

/**
 * GET /api/user-portal/orders
 * Get user orders with optional filtering
 */
export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId
      const { searchParams } = new URL(request.url)

      const filters = {
        status: searchParams.get('status') || undefined,
        limit: parseInt(searchParams.get('limit') || '50'),
        offset: parseInt(searchParams.get('offset') || '0'),
      }

      const orders = await orderService.getOrders(userId, filters)

      return NextResponse.json({
        success: true,
        data: orders,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get orders',
        },
        { status: 500 }
      )
    }
  }
)
