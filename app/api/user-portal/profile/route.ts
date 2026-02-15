/**
 * User Profile API Endpoints
 * GET /api/user-portal/profile - Get user profile
 * PUT /api/user-portal/profile - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationMiddleware } from '@/lib/user-portal/authorization-middleware'
import { userService } from '@/lib/user-portal/services/user-service'

/**
 * GET /api/user-portal/profile
 * Get user profile
 */
export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId

      const profile = await userService.getProfile(userId)

      return NextResponse.json({
        success: true,
        data: profile,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get profile',
        },
        { status: 500 }
      )
    }
  }
)

/**
 * PUT /api/user-portal/profile
 * Update user profile
 */
export const PUT = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId
      const body = await request.json()

      // Validate input
      if (!body || typeof body !== 'object') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request body',
          },
          { status: 400 }
        )
      }

      const profile = await userService.updateProfile(userId, body)

      return NextResponse.json({
        success: true,
        data: profile,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to update profile',
        },
        { status: 500 }
      )
    }
  }
)
