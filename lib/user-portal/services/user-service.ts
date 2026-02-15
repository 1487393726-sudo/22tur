/**
 * User Service
 * Handles user profile and preferences management
 */

import { User, UserPreferences, ApiResponse } from '../types'
import { prisma } from '@/lib/prisma'

export class UserService {
  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error}`)
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      const updateData: any = {}

      if (data.name !== undefined) updateData.name = data.name
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.avatar !== undefined) updateData.avatar = data.avatar

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      })

      return {
        id: user.id,
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error}`)
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Parse preferences from user metadata or return defaults
      const preferences = user.preferences as any || {}

      return {
        userId,
        theme: preferences.theme || 'light',
        language: preferences.language || 'en',
        notifications: preferences.notifications !== false,
        emailNotifications: preferences.emailNotifications !== false,
        pushNotifications: preferences.pushNotifications !== false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    } catch (error) {
      throw new Error(`Failed to get user preferences: ${error}`)
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    data: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      const currentPreferences = user.preferences as any || {}
      const updatedPreferences = {
        ...currentPreferences,
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.language !== undefined && { language: data.language }),
        ...(data.notifications !== undefined && { notifications: data.notifications }),
        ...(data.emailNotifications !== undefined && { emailNotifications: data.emailNotifications }),
        ...(data.pushNotifications !== undefined && { pushNotifications: data.pushNotifications }),
      }

      await prisma.user.update({
        where: { id: userId },
        data: { preferences: updatedPreferences },
      })

      return {
        userId,
        theme: updatedPreferences.theme || 'light',
        language: updatedPreferences.language || 'en',
        notifications: updatedPreferences.notifications !== false,
        emailNotifications: updatedPreferences.emailNotifications !== false,
        pushNotifications: updatedPreferences.pushNotifications !== false,
        createdAt: user.createdAt,
        updatedAt: new Date(),
      }
    } catch (error) {
      throw new Error(`Failed to update user preferences: ${error}`)
    }
  }
}

export const userService = new UserService()
