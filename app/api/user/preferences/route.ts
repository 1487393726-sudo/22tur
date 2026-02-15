/**
 * User Preferences API Routes
 * GET /api/user/preferences - Get user preferences
 * PUT /api/user/preferences - Update user preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { userService } from '@/lib/user-portal/services'
import { createAuthenticatedResponse, createErrorResponse } from '@/lib/user-portal/middleware'

/**
 * GET /api/user/preferences
 * Get user preferences
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken({ req: request as any })

    if (!token) {
      return createErrorResponse('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const userId = (token as any).userId || (token as any).sub
    const preferences = await userService.getPreferences(userId)

    return createAuthenticatedResponse(preferences)
  } catch (error) {
    console.error('Error getting user preferences:', error)
    return createErrorResponse('Failed to get user preferences', 500, 'INTERNAL_ERROR')
  }
}

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken({ req: request as any })

    if (!token) {
      return createErrorResponse('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const userId = (token as any).userId || (token as any).sub
    const data = await request.json()

    const preferences = await userService.updatePreferences(userId, data)

    return createAuthenticatedResponse(preferences)
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return createErrorResponse('Failed to update user preferences', 500, 'INTERNAL_ERROR')
  }
}
