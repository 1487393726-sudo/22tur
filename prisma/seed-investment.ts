import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始创建投资功能测试数据...\n');

  // 1. 创建测试用户（包含手机号）
  console.log('👤 创建测试用户...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // 创建投资者用户
  const investor1 = await prisma.user.upsert({
    where: { email: 'investor1@example.com' },
    update: {},
    create: {
      email: 'investor1@example.com',
      username: 'investor1',
      password: hashedPassword,
      firstName: '张',
      lastName: '投资者',
      phone: '13800138001',
      phoneVerified: new Date(),
      customUserId: 'UID-INV001',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    },
  });
  console.log(`  ✅ 创建投资者: ${investor1.email} (手机: ${investor1.phone})`);

  const investor2 = await prisma.user.upsert({
    where: { email: 'investor2@example.com' },
    update: {},
    create: {
      email: 'investor2@example.com',
      username: 'investor2',
      password: hashedPassword,
      firstName: '李',
      lastName: '投资人',
      phone: '13800138002',
      phoneVerified: new Date(),
      customUserId: 'UID-INV002',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    },
  });
  console.log(`  ✅ 创建投资者: ${investor2.email} (手机: ${investor2.phone})`);

  // 创建项目创建者
  const projectCreator = await prisma.user.upsert({
    where: { email: 'project.manager@example.com' },
    update: {},
    create: {
      email: 'project.manager@example.com',
      username: 'projectmanager',
      password: hashedPassword,
      firstName: '王',
      lastName: '项目经理',
      phone: '13800138003',
      phoneVerified: new Date(),
      customUserId: 'UID-PM001',
      role: 'MANAGER',
      status: 'ACTIVE',
    },
  });
  console.log(`  ✅ 创建项目经理: ${projectCreator.email}\n`);

  // 2. 创建投资项目
  console.log('💼 创建投资项目...');
  
  const project1 = await prisma.investmentProject.create({
    data: {
      title: '科技创新基金 A 轮',
      description: `
        本项目专注于人工智能和机器学习领域的创新技术投资。
        我们的投资组合包括多家具有高增长潜力的科技初创公司。
        
        投资亮点：
        - 行业领先的技术团队
        - 已获得多项专利
        - 市场前景广阔
        - 预期年化回报率 15%
        
        风险提示：
        - 科技行业竞争激烈
        - 市场波动风险
        - 技术迭代风险
      `,
      shortDesc: '专注于 AI 和机器学习领域的创新技术投资基金',
      investmentAmount: 100000,
      expectedReturn: 15.0,
      duration: 12,
      minInvestment: 10000,
      maxInvestment: 500000,
      targetAmount: 5000000,
      totalRaised: 0,
      status: 'ACTIVE',
      category: '科技创新',
      riskLevel: 'MEDIUM',
      tags: JSON.stringify(['AI', '机器学习', '科技', '创新']),
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后
      createdBy: projectCreator.id,
      viewCount: 0,
      investorCount: 0,
    },
  });
  console.log(`  ✅ 创建项目: ${project1.title}`);

  const project2 = await prisma.investmentProject.create({
    data: {
      title: '绿色能源发展基金',
      description: `
        投资于可再生能源和环保技术领域的优质项目。
        
        投资方向：
        - 太阳能发电
        - 风力发电
        - 储能技术
        - 环保科技
        
        项目优势：
        - 政策支持力度大
        - 市场需求持续增长
        - 社会效益显著
        - 稳定的现金流
      `,
      shortDesc: '投资可再生能源和环保技术的绿色基金',
      investmentAmount: 50000,
      expectedReturn: 12.0,
      duration: 24,
      minInvestment: 5000,
      maxInvestment: 200000,
      targetAmount: 3000000,
      totalRaised: 0,
      status: 'ACTIVE',
      category: '绿色能源',
      riskLevel: 'LOW',
      tags: JSON.stringify(['绿色能源', '环保', '可持续发展']),
      startDate: new Date(),
      endDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2年后
      createdBy: projectCreator.id,
      viewCount: 0,
      investorCount: 0,
    },
  });
  console.log(`  ✅ 创建项目: ${project2.title}`);

  const project3 = await prisma.investmentProject.create({
    data: {
      title: '医疗健康产业基金',
      description: `
        专注于医疗健康产业链的投资机会。
        
        投资领域：
        - 生物医药
        - 医疗器械
        - 健康管理
        - 互联网医疗
        
        核心优势：
        - 刚需市场
        - 政策红利
        - 技术创新
        - 人口老龄化带来的机遇
      `,
      shortDesc: '投资医疗健康产业链的专业基金',
      investmentAmount: 200000,
      expectedReturn: 18.0,
      duration: 18,
      minInvestment: 20000,
      maxInvestment: 1000000,
      targetAmount: 10000000,
      totalRaised: 0,
      status: 'ACTIVE',
      category: '医疗健康',
      riskLevel: 'HIGH',
      tags: JSON.stringify(['医疗', '健康', '生物医药', '医疗器械']),
      startDate: new Date(),
      endDate: new Date(Date.now() + 547 * 24 * 60 * 60 * 1000), // 18个月后
      createdBy: projectCreator.id,
      viewCount: 0,
      investorCount: 0,
    },
  });
  console.log(`  ✅ 创建项目: ${project3.title}\n`);

  // 3. 创建项目文件（锁定状态）
  console.log('📄 创建项目文件...');
  
  // 项目1的文件
  const file1 = await prisma.projectFile.create({
    data: {
      projectId: project1.id,
      fileName: 'investment-plan.pdf',
      originalName: '投资计划书.pdf',
      fileType: 'pdf',
      fileSize: 2048000, // 2MB
      filePath: '/uploads/files/investment-plan.pdf',
      mimeType: 'application/pdf',
      isLocked: true,
      unlockPrice: 0, // 投资即可解锁
      description: '详细的投资计划书，包含项目分析、财务预测和风险评估',
      order: 1,
      pageCount: 25,
    },
  });
  console.log(`  ✅ 创建文件: ${file1.fileName} (锁定)`);

  const file2 = await prisma.projectFile.create({
    data: {
      projectId: project1.id,
      fileName: 'financial-report.pdf',
      originalName: '财务报告.pdf',
      fileType: 'pdf',
      fileSize: 1536000, // 1.5MB
      filePath: '/uploads/files/financial-report.pdf',
      mimeType: 'application/pdf',
      isLocked: true,
      unlockPrice: 0,
      description: '最新的财务报告和审计结果',
      order: 2,
      pageCount: 15,
    },
  });
  console.log(`  ✅ 创建文件: ${file2.fileName} (锁定)`);

  const file3 = await prisma.projectFile.create({
    data: {
      projectId: project1.id,
      fileName: 'presentation.pptx',
      originalName: '项目介绍.pptx',
      fileType: 'pptx',
      fileSize: 5120000, // 5MB
      filePath: '/uploads/files/presentation.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      isLocked: true,
      unlockPrice: 0,
      description: '项目路演演示文稿',
      order: 3,
    },
  });
  console.log(`  ✅ 创建文件: ${file3.fileName} (锁定)`);

  // 项目2的文件
  const file4 = await prisma.projectFile.create({
    data: {
      projectId: project2.id,
      fileName: 'project-overview.pdf',
      originalName: '项目概览.pdf',
      fileType: 'pdf',
      fileSize: 3072000, // 3MB
      filePath: '/uploads/files/project-overview.pdf',
      mimeType: 'application/pdf',
      isLocked: true,
      unlockPrice: 0,
      description: '绿色能源项目的详细概览和技术分析',
      order: 1,
      pageCount: 30,
    },
  });
  console.log(`  ✅ 创建文件: ${file4.fileName} (锁定)`);

  // 项目3的文件
  const file5 = await prisma.projectFile.create({
    data: {
      projectId: project3.id,
      fileName: 'market-analysis.pdf',
      originalName: '市场分析报告.pdf',
      fileType: 'pdf',
      fileSize: 4096000, // 4MB
      filePath: '/uploads/files/market-analysis.pdf',
      mimeType: 'application/pdf',
      isLocked: true,
      unlockPrice: 0,
      description: '医疗健康产业市场分析和趋势预测',
      order: 1,
      pageCount: 40,
    },
  });
  console.log(`  ✅ 创建文件: ${file5.fileName} (锁定)\n`);

  // 4. 创建示例投资记录
  console.log('💰 创建示例投资记录...');
  
  const investment1 = await prisma.projectInvestment.create({
    data: {
      userId: investor1.id,
      projectId: project1.id,
      amount: 50000,
      status: 'COMPLETED',
      paymentMethod: 'ALIPAY',
      transactionId: 'TXN-' + Date.now() + '-001',
      paymentGateway: 'alipay',
      investedAt: new Date(),
      completedAt: new Date(),
    },
  });
  console.log(`  ✅ ${investor1.firstName}${investor1.lastName} 投资 ¥${investment1.amount} 到 ${project1.title}`);

  // 更新项目统计
  await prisma.investmentProject.update({
    where: { id: project1.id },
    data: {
      totalRaised: 50000,
      investorCount: 1,
    },
  });

  const investment2 = await prisma.projectInvestment.create({
    data: {
      userId: investor2.id,
      projectId: project2.id,
      amount: 10000,
      status: 'COMPLETED',
      paymentMethod: 'WECHAT',
      transactionId: 'TXN-' + Date.now() + '-002',
      paymentGateway: 'wechat',
      investedAt: new Date(),
      completedAt: new Date(),
    },
  });
  console.log(`  ✅ ${investor2.firstName}${investor2.lastName} 投资 ¥${investment2.amount} 到 ${project2.title}`);

  // 更新项目统计
  await prisma.investmentProject.update({
    where: { id: project2.id },
    data: {
      totalRaised: 10000,
      investorCount: 1,
    },
  });

  // 创建待处理的投资
  const investment3 = await prisma.projectInvestment.create({
    data: {
      userId: investor1.id,
      projectId: project3.id,
      amount: 100000,
      status: 'PENDING',
      paymentMethod: 'STRIPE',
      investedAt: new Date(),
    },
  });
  console.log(`  ✅ ${investor1.firstName}${investor1.lastName} 创建待支付投资 ¥${investment3.amount} 到 ${project3.title}\n`);

  // 5. 创建文件访问日志
  console.log('📊 创建文件访问日志...');
  
  await prisma.fileAccessLog.create({
    data: {
      fileId: file1.id,
      userId: investor1.id,
      action: 'VIEW',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      success: true,
      accessedAt: new Date(),
      duration: 45000, // 45秒
    },
  });
  console.log(`  ✅ 记录文件访问: ${investor1.firstName}${investor1.lastName} 查看 ${file1.fileName}`);

  await prisma.fileAccessLog.create({
    data: {
      fileId: file1.id,
      userId: investor1.id,
      action: 'DOWNLOAD',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      success: true,
      accessedAt: new Date(),
      duration: 2000, // 2秒
    },
  });
  console.log(`  ✅ 记录文件下载: ${investor1.firstName}${investor1.lastName} 下载 ${file1.fileName}`);

  // 更新文件统计
  await prisma.projectFile.update({
    where: { id: file1.id },
    data: {
      viewCount: 1,
      downloadCount: 1,
    },
  });

  console.log('\n✨ 投资功能测试数据创建完成！');
  console.log('\n📋 数据摘要：');
  console.log(`  - 用户: 3 个（包含手机号和自定义ID）`);
  console.log(`  - 投资项目: 3 个`);
  console.log(`  - 项目文件: 5 个（全部锁定）`);
  console.log(`  - 投资记录: 3 个（2个已完成，1个待支付）`);
  console.log(`  - 访问日志: 2 条`);
  console.log('\n🔐 测试账号：');
  console.log(`  投资者1: investor1@example.com / password123 (手机: 13800138001, ID: UID-INV001)`);
  console.log(`  投资者2: investor2@example.com / password123 (手机: 13800138002, ID: UID-INV002)`);
  console.log(`  项目经理: project.manager@example.com / password123 (手机: 13800138003, ID: UID-PM001)`);
}

main()
  .catch((e) => {
    console.error('❌ 创建测试数据时出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
