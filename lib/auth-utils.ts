/**
 * 认证工具函数
 * 用于识别登录标识符类型和查找用户
 */

import { prisma } from "@/lib/prisma"

/**
 * 登录标识符类型
 */
export enum IdentifierType {
  EMAIL = "email",
  PHONE = "phone",
  CUSTOM_USER_ID = "customUserId",
  UNKNOWN = "unknown",
}

/**
 * 识别登录标识符类型
 * @param identifier 用户输入的标识符
 * @returns 标识符类型
 */
export function identifyLoginType(identifier: string): IdentifierType {
  // 去除首尾空格
  const trimmed = identifier.trim()

  // 检查是否为邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(trimmed)) {
    return IdentifierType.EMAIL
  }

  // 检查是否为手机号格式（11位数字）
  const phoneRegex = /^1[3-9]\d{9}$/
  if (phoneRegex.test(trimmed)) {
    return IdentifierType.PHONE
  }

  // 检查是否为自定义用户ID格式（UID-开头）
  const userIdRegex = /^UID-[A-Z0-9]{7,}$/i
  if (userIdRegex.test(trimmed)) {
    return IdentifierType.CUSTOM_USER_ID
  }

  return IdentifierType.UNKNOWN
}

/**
 * 根据标识符查找用户
 * @param identifier 登录标识符
 * @returns 用户对象或null
 */
export async function findUserByIdentifier(identifier: string) {
  const trimmed = identifier.trim()
  const type = identifyLoginType(trimmed)

  switch (type) {
    case IdentifierType.EMAIL:
      return await prisma.user.findUnique({
        where: { email: trimmed },
      })

    case IdentifierType.PHONE:
      return await prisma.user.findFirst({
        where: { phone: trimmed },
      })

    case IdentifierType.CUSTOM_USER_ID:
      return await prisma.user.findUnique({
        where: { customUserId: trimmed.toUpperCase() },
      })

    default:
      return null
  }
}

/**
 * 获取标识符类型的显示名称
 * @param type 标识符类型
 * @returns 显示名称
 */
export function getIdentifierTypeName(type: IdentifierType): string {
  switch (type) {
    case IdentifierType.EMAIL:
      return "邮箱"
    case IdentifierType.PHONE:
      return "手机号"
    case IdentifierType.CUSTOM_USER_ID:
      return "用户ID"
    default:
      return "未知"
  }
}

/**
 * 获取标识符输入提示
 * @param identifier 当前输入的标识符
 * @returns 提示文本
 */
export function getIdentifierPlaceholder(identifier: string): string {
  if (!identifier) {
    return "邮箱 / 手机号 / 用户ID"
  }

  const type = identifyLoginType(identifier)
  return getIdentifierTypeName(type)
}

/**
 * 生成唯一的自定义用户ID
 * @returns 格式为 UID-XXXXXXXX 的用户ID
 */
export async function generateCustomUserId(): Promise<string> {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let customUserId: string

  // 循环直到生成唯一ID
  do {
    let randomPart = ""
    for (let i = 0; i < 8; i++) {
      randomPart += characters.charAt(
        Math.floor(Math.random() * characters.length)
      )
    }
    customUserId = `UID-${randomPart}`

    // 检查是否已存在
    const existing = await prisma.user.findUnique({
      where: { customUserId },
    })

    if (!existing) {
      break
    }
  } while (true)

  return customUserId
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone.trim())
}

/**
 * 验证自定义用户ID格式
 * @param userId 用户ID
 * @returns 是否有效
 */
export function isValidCustomUserId(userId: string): boolean {
  if (!userId) return false
  const userIdRegex = /^UID-[A-Z0-9]{8}$/i
  return userIdRegex.test(userId.trim())
}

/**
 * 格式化手机号（隐藏中间4位）
 * @param phone 手机号
 * @returns 格式化后的手机号
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return phone.slice(0, 3) + "****" + phone.slice(7)
}
