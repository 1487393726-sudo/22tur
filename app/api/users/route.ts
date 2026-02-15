import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  createGetHandler,
  createPostHandler,
  getPaginationParams,
  getSearchParams,
  createPaginatedResponse
} from '@/lib/api-handler'
import { 
  validationError,
  notFoundError,
  forbiddenError,
  createError,
  ErrorCode
} from '@/lib/errors'

// GET请求处理函数 - 获取用户列表
const getUsersHandler = async (request: NextRequest) => {
  const pagination = getPaginationParams(request)
  const searchParams = getSearchParams(request)
  const { search, role, departmentId } = searchParams

  const where = {
    ...(search && {
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } }
      ]
    }),
    ...(role && { role: role as any }),
    ...(departmentId && { departmentId })
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        department: true
      },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.user.count({ where })
  ])

  // 移除密码字段
  const usersWithoutPasswords = users.map(({ password, ...user }) => user)

  return createPaginatedResponse(usersWithoutPasswords, total, pagination)
}

// POST请求处理函数 - 创建用户
const createUserHandler = async (request: NextRequest) => {
  const body = await request.json()
  const {
    email,
    username,
    password,
    firstName,
    lastName,
    phone,
    role,
    departmentId,
    position,
    hireDate
  } = body

  // 验证必填字段
  if (!email || !username || !password || !firstName || !lastName) {
    throw validationError('required_fields', '邮箱、用户名、密码、姓名是必填字段')
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw validationError('email', '邮箱格式不正确')
  }

  // 检查邮箱和用户名是否已存在
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  })

  if (existingUser) {
    throw createError(
      ErrorCode.RESOURCE_ALREADY_EXISTS,
      existingUser.email === email ? '邮箱已存在' : '用户名已存在'
    )
  }

  // 加密密码
  const bcrypt = require('bcryptjs')
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'EMPLOYEE',
      departmentId: departmentId || null,
      position,
      hireDate: hireDate ? new Date(hireDate) : null
    },
    include: {
      department: true
    }
  })

  // 移除密码字段
  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword
}

// 创建API处理函数
export const GET = createGetHandler(getUsersHandler, {
  requireAuth: true
})

export const POST = createPostHandler(createUserHandler, {
  requireAuth: true,
  requireRole: 'ADMIN',
  validation: async (data) => {
    const errors: string[] = []
    
    if (!data.email) errors.push('邮箱是必填字段')
    if (!data.username) errors.push('用户名是必填字段')
    if (!data.password) errors.push('密码是必填字段')
    if (!data.firstName) errors.push('名字是必填字段')
    if (!data.lastName) errors.push('姓氏是必填字段')
    
    // 验证密码强度
    if (data.password && data.password.length < 6) {
      errors.push('密码长度至少6位')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
})