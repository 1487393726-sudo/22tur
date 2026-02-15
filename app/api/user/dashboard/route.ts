/**
 * Dashboard API Route
 * GET /api/user/dashboard - Get dashboard data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { dashboardService } from '@/lib/user-portal/services'
import { createAuthenticatedResponse, createErrorResponse } from '@/lib/user-portal/middleware'

/**
 * GET /api/user/dashboard
 * Get dashboard data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken({ req: request as any })

    if (!token) {
      return createErrorResponse('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const userId = (token as any).userId || (token as any).sub
    const dashboardData = await dashboardService.getDashboard(userId)

    return createAuthenticatedResponse(dashboardData)
  } catch (error) {
    console.error('Error getting dashboard data:', error)
    return createErrorResponse('Failed to get dashboard data', 500, 'INTERNAL_ERROR')
  }
}
