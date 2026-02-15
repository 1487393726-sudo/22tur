import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// 会员等级配置
const MEMBER_LEVELS = [
  { id: 'bronze', name: '青铜会员', minPoints: 0 },
  { id: 'silver', name: '白银会员', minPoints: 1000 },
  { id: 'gold', name: '黄金会员', minPoints: 5000 },
  { id: 'platinum', name: '铂金会员', minPoints: 20000 },
  { id: 'diamond', name: '钻石会员', minPoints: 50000 }
];

// POST /api/miniprogram/membership/upgrade - 检查并执行升级
export async function POST(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 获取用户积分
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id }
    });

    if (!userPoints) {
      return NextResponse.json({
        success: false,
        error: '暂无积分记录'
      });
    }

    const totalPoints = userPoints.totalEarned;

    // 获取当前会员信息
    const membership = await prisma.membership.findUnique({
      where: { userId: user.id }
    });

    const currentLevelId = membership?.level || 'bronze';

    // 计算应该达到的等级
    let newLevel = MEMBER_LEVELS[0];
    for (let i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
      if (totalPoints >= MEMBER_LEVELS[i].minPoints) {
        newLevel = MEMBER_LEVELS[i];
        break;
      }
    }

    // 检查是否需要升级
    const currentIndex = MEMBER_LEVELS.findIndex(l => l.id === currentLevelId);
    const newIndex = MEMBER_LEVELS.findIndex(l => l.id === newLevel.id);

    if (newIndex <= currentIndex) {
      return NextResponse.json({
        success: true,
        upgraded: false,
        message: '当前等级已是最高或无需升级',
        currentLevel: currentLevelId,
        currentLevelName: MEMBER_LEVELS[currentIndex].name
      });
    }

    // 执行升级
    const now = new Date();
    const expireDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    await prisma.$transaction([
      // 更新会员等级
      prisma.membership.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          level: newLevel.id,
          expireDate
        },
        update: {
          level: newLevel.id,
          expireDate
        }
      }),
      // 记录升级历史
      prisma.membershipHistory.create({
        data: {
          userId: user.id,
          title: '会员升级',
          description: `从${MEMBER_LEVELS[currentIndex].name}升级到${newLevel.name}`,
          type: 'upgrade',
          fromLevel: currentLevelId,
          toLevel: newLevel.id
        }
      }),
      // 发放升级奖励积分
      prisma.userPoints.update({
        where: { userId: user.id },
        data: {
          balance: { increment: 500 },
          totalEarned: { increment: 500 }
        }
      }),
      prisma.pointsRecord.create({
        data: {
          userId: user.id,
          amount: 500,
          type: 'upgrade_reward',
          title: `会员升级奖励 - ${newLevel.name}`
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      upgraded: true,
      message: `恭喜升级到${newLevel.name}！`,
      previousLevel: currentLevelId,
      previousLevelName: MEMBER_LEVELS[currentIndex].name,
      currentLevel: newLevel.id,
      currentLevelName: newLevel.name,
      rewardPoints: 500
    });
  } catch (error) {
    console.error('会员升级失败:', error);
    return NextResponse.json(
      { success: false, error: '升级失败' },
      { status: 500 }
    );
  }
}
