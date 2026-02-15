/**
 * User Profile API Routes
 * GET /api/user/profile - Get user profile
 * PUT /api/user/profile - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { userService } from '@/lib/user-portal/services'
import { createAuthenticatedResponse, createErrorResponse } from '@/lib/user-portal/middleware'

/**
 * GET /api/user/profile
 * Get user profile
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken({ req: request as any })

    if (!token) {
      return createErrorResponse('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const userId = (token as any).userId || (token as any).sub
    const profile = await userService.getProfile(userId)

    return createAuthenticatedResponse(profile)
  } catch (error) {
    console.error('Error getting user profile:', error)
    return createErrorResponse('Failed to get user profile', 500, 'INTERNAL_ERROR')
  }
}

/**
 * PUT /api/user/profile
 * Update user profile
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken({ req: request as any })

    if (!token) {
      return createErrorResponse('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const userId = (token as any).userId || (token as any).sub
    const data = await request.json()

    const profile = await userService.updateProfile(userId, data)

    return createAuthenticatedResponse(profile)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return createErrorResponse('Failed to update user profile', 500, 'INTERNAL_ERROR')
  }
}
