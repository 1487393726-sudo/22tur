/**
 * Dashboard API Endpoint
 * GET /api/user-portal/dashboard - Get user dashboard data
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationMiddleware } from '@/lib/user-portal/authorization-middleware'
import { dashboardService } from '@/lib/user-portal/services/dashboard-service'

/**
 * GET /api/user-portal/dashboard
 * Get user dashboard data with aggregated information
 */
export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId

      const dashboardData = await dashboardService.getDashboard(userId)

      return NextResponse.json({
        success: true,
        data: dashboardData,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get dashboard data',
        },
        { status: 500 }
      )
    }
  }
)
