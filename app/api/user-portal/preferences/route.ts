/**
 * User Preferences API Endpoints
 * GET /api/user-portal/preferences - Get user preferences
 * PUT /api/user-portal/preferences - Update user preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationMiddleware } from '@/lib/user-portal/authorization-middleware'
import { userService } from '@/lib/user-portal/services/user-service'

/**
 * GET /api/user-portal/preferences
 * Get user preferences
 */
export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: any) => {
    try {
      const userId = context.userId

      const preferences = await userService.getPreferences(userId)

      return NextResponse.json({
        success: true,
        data: preferences,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get preferences',
        },
        { status: 500 }
      )
    }
  }
)

/**
 * PUT /api/user-portal/preferences
 * Update user preferences
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

      const preferences = await userService.updatePreferences(userId, body)

      return NextResponse.json({
        success: true,
        data: preferences,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to update preferences',
        },
        { status: 500 }
      )
    }
  }
)
