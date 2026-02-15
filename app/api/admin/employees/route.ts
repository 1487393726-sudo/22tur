import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, requireRole, AuthenticatedRequest } from '@/lib/middleware/auth'
import { z } from 'zod'

const createEmployeeSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN']),
  departmentId: z.string(),
  position: z.string(),
  salary: z.number().optional(),
  hireDate: z.string(),
  emergencyContact: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
})

// 获取员工列表
async function getEmployees(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (department) {
      where.employeeProfile = {
        departmentId: department
      }
    }
    
    if (status) {
      where.employeeProfile = {
        ...where.employeeProfile,
        status: status
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeProfile: { position: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const [employees, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          employeeProfile: {
            include: {
              department: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get employees error:', error)
    return NextResponse.json(
      { error: '获取员工列表失败' },
      { status: 500 }
    )
  }
}

// 创建员工
async function createEmployee(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const validatedData = createEmployeeSchema.parse(body)

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 生成员工ID
    const employeeCount = await prisma.employee.count()
    const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`

    // 创建用户和员工档案
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: await bcrypt.hash(validatedData.password, 10),
          phone: validatedData.phone,
          role: validatedData.role,
          status: 'ACTIVE',
        }
      })

      const employee = await tx.employee.create({
        data: {
          employeeId,
          userId: user.id,
          departmentId: validatedData.departmentId,
          position: validatedData.position,
          salary: validatedData.salary,
          hireDate: new Date(validatedData.hireDate),
          emergencyContact: validatedData.emergencyContact,
          address: validatedData.address,
          birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
          gender: validatedData.gender,
        }
      })

      return { user, employee }
    })

    return NextResponse.json({
      message: '员工创建成功',
      employee: result.user
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create employee error:', error)
    return NextResponse.json(
      { error: '创建员工失败' },
      { status: 500 }
    )
  }
}

// 导出路由处理器
export const GET = requireRole(['ADMIN', 'MANAGER'])(getEmployees)
export const POST = requireRole(['ADMIN'])(createEmployee)

// 临时导入bcrypt，在实际使用时应该放在文件顶部
import bcrypt from 'bcryptjs'