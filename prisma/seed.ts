import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据...')

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      firstName: '管理员',
      lastName: '用户',
      role: 'ADMIN',
      position: '系统管理员',
      hireDate: new Date('2024-01-01')
    }
  })

  console.log('管理员用户创建成功:', adminUser.email)

  // 创建部门
  const techDept = await prisma.department.create({
    data: {
      name: '技术部',
      description: '负责技术开发和维护',
      managerId: adminUser.id
    }
  })

  const designDept = await prisma.department.create({
    data: {
      name: '设计部',
      description: '负责创意设计工作'
    }
  })

  console.log('部门创建成功')

  // 创建更多测试用户
  const employeePassword = await bcrypt.hash('emp123', 10)
  
  const techLead = await prisma.user.create({
    data: {
      email: 'techlead@example.com',
      username: 'techlead',
      password: employeePassword,
      firstName: '张',
      lastName: '技术主管',
      role: 'MANAGER',
      position: '技术主管',
      departmentId: techDept.id,
      hireDate: new Date('2024-02-01')
    }
  })

  const designer = await prisma.user.create({
    data: {
      email: 'designer@example.com',
      username: 'designer',
      password: employeePassword,
      firstName: '李',
      lastName: '设计师',
      role: 'EMPLOYEE',
      position: 'UI设计师',
      departmentId: designDept.id,
      hireDate: new Date('2024-03-01')
    }
  })

  console.log('测试用户创建成功')

  // 创建客户
  const client1 = await prisma.client.create({
    data: {
      name: '科技创新公司',
      email: 'client1@techcorp.com',
      phone: '13800138001',
      company: '科技创新有限公司',
      address: '北京市朝阳区科技园区',
      industry: '软件开发',
      status: 'ACTIVE'
    }
  })

  const client2 = await prisma.client.create({
    data: {
      name: '金融服务集团',
      email: 'client2@finance.com',
      phone: '13800138002',
      company: '金融服务集团有限公司',
      address: '上海市浦东新区金融街',
      industry: '金融服务',
      status: 'ACTIVE'
    }
  })

  console.log('客户创建成功')

  // 创建项目
  const project1 = await prisma.project.create({
    data: {
      name: '企业官网重构',
      description: '为科技创新公司重新设计和开发官方网站',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      budget: 150000,
      clientId: client1.id,
      departmentId: techDept.id
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: '移动银行APP设计',
      description: '为金融服务集团设计新一代移动银行应用',
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-01'),
      budget: 200000,
      clientId: client2.id,
      departmentId: designDept.id
    }
  })

  console.log('项目创建成功')

  // 添加项目成员
  await prisma.projectMember.createMany({
    data: [
      {
        projectId: project1.id,
        userId: techLead.id,
        role: 'LEAD'
      },
      {
        projectId: project2.id,
        userId: designer.id,
        role: 'LEAD'
      }
    ]
  })

  // 创建任务
  await prisma.task.createMany({
    data: [
      {
        title: '完成前端页面开发',
        description: '开发企业官网的所有前端页面',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project1.id,
        assigneeId: techLead.id,
        creatorId: adminUser.id,
        dueDate: new Date('2024-02-28')
      },
      {
        title: 'UI设计稿制作',
        description: '制作移动银行APP的UI设计稿',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project2.id,
        assigneeId: designer.id,
        creatorId: adminUser.id,
        dueDate: new Date('2024-03-15')
      }
    ]
  })

  console.log('任务创建成功')

  // 创建合同
  await prisma.contract.create({
    data: {
      number: 'CT2024001',
      title: '企业官网重构合同',
      clientId: client1.id,
      projectId: project1.id,
      amount: 150000,
      status: 'SIGNED',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      description: '企业官网重构项目合同'
    }
  })

  console.log('合同创建成功')

  // 创建发票
  await prisma.invoice.create({
    data: {
      number: 'INV2024001',
      clientId: client1.id,
      projectId: project1.id,
      amount: 75000,
      status: 'SENT',
      dueDate: new Date('2024-02-15'),
      description: '企业官网重构项目首期付款'
    }
  })

  console.log('发票创建成功')

  // 创建支出记录
  await prisma.expense.createMany({
    data: [
      {
        title: '服务器购买费用',
        description: '购买项目服务器',
        amount: 5000,
        category: '硬件',
        projectId: project1.id,
        userId: techLead.id,
        date: new Date('2024-01-20')
      },
      {
        title: '设计软件订阅',
        description: 'Figma年度订阅费用',
        amount: 1200,
        category: '软件',
        userId: designer.id,
        date: new Date('2024-01-15')
      }
    ]
  })

  console.log('支出记录创建成功')

  // 创建文档
  await prisma.document.create({
    data: {
      title: '项目需求文档',
      description: '企业官网重构项目需求规格说明书',
      filePath: '/uploads/requirements.pdf',
      category: 'technical',
      type: 'pdf',
      size: '1 MB',
      projectId: project1.id,
      authorId: adminUser.id,
      isPublic: true
    }
  })

  console.log('文档创建成功')
  console.log('种子数据创建完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })