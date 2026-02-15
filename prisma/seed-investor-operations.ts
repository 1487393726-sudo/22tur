/**
 * 投资者运营监控系统种子数据
 * Investor Operations Monitoring Seed Data
 * 
 * 用于填充测试数据到数据库
 * 
 * 使用步骤:
 * 1. 先运行数据库迁移: npx prisma migrate dev
 * 2. 生成 Prisma Client: npx prisma generate
 * 3. 运行种子脚本: npx ts-node prisma/seed-investor-operations.ts
 * 
 * 注意: TypeScript 错误是因为 Prisma Client 需要重新生成
 * 运行 `npx prisma generate` 后错误会消失
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充投资者运营监控测试数据...');

  // 1. 创建测试用户（投资者）
  // 密码: password123 (bcrypt hash)
  const investor = await prisma.user.upsert({
    where: { email: 'investor@test.com' },
    update: {
      // 更新密码以确保正确
      password: '$2b$10$nr5EhTWkp7EyMQkzkvrBNuWUg7XJiGSHOgIM97n2GAk6L7BCPY2LK',
    },
    create: {
      email: 'investor@test.com',
      username: 'test_investor',
      password: '$2b$10$nr5EhTWkp7EyMQkzkvrBNuWUg7XJiGSHOgIM97n2GAk6L7BCPY2LK',
      firstName: '张',
      lastName: '投资',
      role: 'INVESTOR',
      userType: 'INVESTOR',
      status: 'ACTIVE',
    },
  });
  console.log('✅ 创建测试投资者:', investor.email);

  // 2. 创建投资项目
  const project1 = await prisma.investmentProject.upsert({
    where: { id: 'proj-seed-001' },
    update: {},
    create: {
      id: 'proj-seed-001',
      title: '星光餐饮连锁店',
      description: '高端餐饮连锁品牌，主打中式融合菜',
      shortDesc: '高端中式融合餐饮',
      investmentAmount: 800000,
      expectedReturn: 15,
      duration: 36,
      minInvestment: 50000,
      targetAmount: 800000,
      totalRaised: 800000,
      projectType: 'PHYSICAL',
      industryType: 'CATERING',
      location: '北京市朝阳区建国路88号',
      currentPhase: 'OPERATING',
      phaseProgress: 100,
      status: 'ACTIVE',
      riskLevel: 'MEDIUM',
      createdBy: investor.id,
    },
  });
  console.log('✅ 创建投资项目1:', project1.title);


  const project2 = await prisma.investmentProject.upsert({
    where: { id: 'proj-seed-002' },
    update: {},
    create: {
      id: 'proj-seed-002',
      title: '智慧科技创新中心',
      description: 'SaaS云服务平台，提供企业数字化解决方案',
      shortDesc: 'SaaS企业数字化平台',
      investmentAmount: 600000,
      expectedReturn: 20,
      duration: 24,
      minInvestment: 30000,
      targetAmount: 600000,
      totalRaised: 600000,
      projectType: 'ONLINE',
      industryType: 'TECHNOLOGY',
      platform: 'SaaS云服务平台',
      currentPhase: 'OPERATING',
      phaseProgress: 100,
      status: 'ACTIVE',
      riskLevel: 'MEDIUM',
      createdBy: investor.id,
    },
  });
  console.log('✅ 创建投资项目2:', project2.title);

  // 3. 创建投资者项目访问权限
  await prisma.investorProjectAccess.upsert({
    where: {
      investorId_projectId: {
        investorId: investor.id,
        projectId: project1.id,
      },
    },
    update: {},
    create: {
      investorId: investor.id,
      projectId: project1.id,
      accessLevel: 'FULL',
      shareholdingRatio: 85,
      grantedBy: investor.id,
    },
  });

  await prisma.investorProjectAccess.upsert({
    where: {
      investorId_projectId: {
        investorId: investor.id,
        projectId: project2.id,
      },
    },
    update: {},
    create: {
      investorId: investor.id,
      projectId: project2.id,
      accessLevel: 'FULL',
      shareholdingRatio: 82,
      grantedBy: investor.id,
    },
  });
  console.log('✅ 创建投资者访问权限');

  // 4. 创建项目阶段记录
  const today = new Date();
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  await prisma.projectPhaseRecord.upsert({
    where: { id: 'phase-seed-001' },
    update: {},
    create: {
      id: 'phase-seed-001',
      projectId: project1.id,
      phase: 'OPERATING',
      startDate: new Date('2024-12-01'),
      expectedEndDate: oneYearLater,
      progress: 100,
      notes: '项目已正式运营',
    },
  });

  await prisma.projectPhaseRecord.upsert({
    where: { id: 'phase-seed-002' },
    update: {},
    create: {
      id: 'phase-seed-002',
      projectId: project2.id,
      phase: 'OPERATING',
      startDate: new Date('2024-09-01'),
      expectedEndDate: oneYearLater,
      progress: 100,
      notes: '平台已上线运营',
    },
  });
  console.log('✅ 创建项目阶段记录');


  // 5. 创建项目员工
  const employees = [
    {
      id: 'emp-seed-001',
      projectId: project1.id,
      name: '张伟',
      position: '店长',
      department: '管理层',
      hireDate: new Date('2024-06-15'),
      tenureCategory: 'NEW',
      recruitmentChannel: '内部推荐',
      status: 'ACTIVE',
    },
    {
      id: 'emp-seed-002',
      projectId: project1.id,
      name: '王芳',
      position: '主厨',
      department: '厨房',
      hireDate: new Date('2024-07-01'),
      tenureCategory: 'NEW',
      recruitmentChannel: '招聘网站',
      status: 'ACTIVE',
    },
    {
      id: 'emp-seed-003',
      projectId: project2.id,
      name: '李明',
      position: '技术总监',
      department: '技术部',
      hireDate: new Date('2024-03-15'),
      tenureCategory: 'NEW',
      recruitmentChannel: '猎头推荐',
      status: 'ACTIVE',
    },
  ];

  for (const emp of employees) {
    await prisma.projectEmployee.upsert({
      where: { id: emp.id },
      update: {},
      create: emp,
    });
  }
  console.log('✅ 创建项目员工:', employees.length, '人');

  // 6. 创建员工薪资记录
  const salaries = [
    { employeeId: 'emp-seed-001', baseSalary: 12000, bonus: 3000, allowance: 1500, overtimePay: 0 },
    { employeeId: 'emp-seed-002', baseSalary: 10000, bonus: 2000, allowance: 1000, overtimePay: 500 },
    { employeeId: 'emp-seed-003', baseSalary: 25000, bonus: 8000, allowance: 3000, overtimePay: 0 },
  ];

  for (const salary of salaries) {
    await prisma.employeeSalary.create({
      data: {
        ...salary,
        effectiveDate: new Date('2024-06-01'),
      },
    });
  }
  console.log('✅ 创建员工薪资记录');


  // 7. 创建每日运营数据（最近30天）- 使用 upsert 避免重复
  let operationsCreated = 0;
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // 项目1的运营数据
    const revenue1 = 25000 + Math.random() * 10000;
    const expenses1 = [
      { category: 'RAW_MATERIALS', amount: 8000 + Math.random() * 2000, description: '食材采购' },
      { category: 'LABOR', amount: 5000 + Math.random() * 500, description: '员工工资' },
      { category: 'UTILITIES', amount: 1500 + Math.random() * 500, description: '水电费' },
      { category: 'RENT', amount: 1500, description: '日均租金' },
      { category: 'MARKETING', amount: 500 + Math.random() * 500, description: '营销推广' },
    ];
    const totalExpenses1 = expenses1.reduce((sum, e) => sum + e.amount, 0);

    // 先删除已存在的记录（包括关联的支出记录）
    await prisma.dailyOperations.deleteMany({
      where: { projectId: project1.id, date },
    });

    await prisma.dailyOperations.create({
      data: {
        projectId: project1.id,
        date,
        revenue: revenue1,
        totalExpenses: totalExpenses1,
        profit: revenue1 - totalExpenses1,
        customerCount: Math.floor(120 + Math.random() * 60),
        createdBy: investor.id,
        expenses: {
          create: expenses1,
        },
      },
    });
    operationsCreated++;

    // 项目2的运营数据
    const revenue2 = 40000 + Math.random() * 15000;
    const expenses2 = [
      { category: 'LABOR', amount: 15000 + Math.random() * 5000, description: '技术团队工资' },
      { category: 'EQUIPMENT', amount: 4000 + Math.random() * 2000, description: '服务器费用' },
      { category: 'MARKETING', amount: 2000 + Math.random() * 2000, description: '市场推广' },
      { category: 'OTHER', amount: 1000 + Math.random() * 1000, description: '其他支出' },
    ];
    const totalExpenses2 = expenses2.reduce((sum, e) => sum + e.amount, 0);

    // 先删除已存在的记录
    await prisma.dailyOperations.deleteMany({
      where: { projectId: project2.id, date },
    });

    await prisma.dailyOperations.create({
      data: {
        projectId: project2.id,
        date,
        revenue: revenue2,
        totalExpenses: totalExpenses2,
        profit: revenue2 - totalExpenses2,
        customerCount: Math.floor(60 + Math.random() * 40),
        createdBy: investor.id,
        expenses: {
          create: expenses2,
        },
      },
    });
    operationsCreated++;
  }
  console.log('✅ 创建每日运营数据:', operationsCreated, '条记录（2个项目 x 30天）');

  // 8. 创建培训记录
  const trainingRecords = [
    { employeeId: 'emp-seed-001', trainingName: '管理培训', trainingType: 'MANAGEMENT', startDate: new Date('2024-07-01') },
    { employeeId: 'emp-seed-001', trainingName: '食品安全培训', trainingType: 'SAFETY', startDate: new Date('2024-07-15') },
    { employeeId: 'emp-seed-002', trainingName: '厨艺培训', trainingType: 'SKILL', startDate: new Date('2024-08-01') },
    { employeeId: 'emp-seed-003', trainingName: '技术管理培训', trainingType: 'MANAGEMENT', startDate: new Date('2024-04-01') },
  ];

  for (const record of trainingRecords) {
    await prisma.trainingRecord.create({
      data: record,
    });
  }
  console.log('✅ 创建培训记录');

  console.log('\n🎉 投资者运营监控测试数据填充完成！');
  console.log('\n📋 测试账号信息:');
  console.log('   邮箱: investor@test.com');
  console.log('   密码: password123');
  console.log('\n📊 已创建数据:');
  console.log('   - 2 个投资项目');
  console.log('   - 3 名项目员工');
  console.log('   - 60 条每日运营记录');
  console.log('   - 4 条培训记录');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
