import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// 会员等级配置
const MEMBER_LEVELS = [
  { id: 'bronze', name: '青铜会员', minPoints: 0, multiplier: 1 },
  { id: 'silver', name: '白银会员', minPoints: 1000, multiplier: 1.2 },
  { id: 'gold', name: '黄金会员', minPoints: 5000, multiplier: 1.5 },
  { id: 'platinum', name: '铂金会员', minPoints: 20000, multiplier: 2 },
  { id: 'diamond', name: '钻石会员', minPoints: 50000, multiplier: 3 }
];

// 根据积分获取等级
function getLevelByPoints(points: number) {
  for (let i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
    if (points >= MEMBER_LEVELS[i].minPoints) {
      return MEMBER_LEVELS[i];
    }
  }
  return MEMBER_LEVELS[0];
}

// 获取下一等级
function getNextLevel(currentLevelId: string) {
  const currentIndex = MEMBER_LEVELS.findIndex(l => l.id === currentLevelId);
  if (currentIndex < MEMBER_LEVELS.length - 1) {
    return MEMBER_LEVELS[currentIndex + 1];
  }
  return null;
}

// GET /api/miniprogram/membership - 获取会员信息
export async function GET(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 获取会员历史记录
    if (type === 'history') {
      const history = await prisma.membershipHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return NextResponse.json({
        success: true,
        history: history.map(h => ({
          id: h.id,
          title: h.title,
          description: h.description,
          type: h.type,
          createdAt: h.createdAt.toISOString().slice(0, 16).replace('T', ' ')
        }))
      });
    }

    // 获取用户积分
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id }
    });

    const totalPoints = userPoints?.totalEarned || 0;
    const currentLevel = getLevelByPoints(totalPoints);
    const nextLevel = getNextLevel(currentLevel.id);

    // 计算升级进度
    let progress = 100;
    let pointsToNext = 0;
    if (nextLevel) {
      const currentMin = currentLevel.minPoints;
      const nextMin = nextLevel.minPoints;
      const range = nextMin - currentMin;
      const earned = totalPoints - currentMin;
      progress = Math.min(Math.floor((earned / range) * 100), 99);
      pointsToNext = nextMin - totalPoints;
    }

    // 获取会员信息
    const membership = await prisma.membership.findUnique({
      where: { userId: user.id }
    });

    const memberInfo = {
      level: currentLevel.id,
      levelName: currentLevel.name,
      points: userPoints?.balance || 0,
      totalPoints,
      expireDate: membership?.expireDate?.toISOString().slice(0, 10) || '',
      progress,
      nextLevel: nextLevel?.id || null,
      nextLevelName: nextLevel?.name || null,
      pointsToNext,
      multiplier: currentLevel.multiplier
    };

    // 当前等级权益
    const benefits = getBenefitsByLevel(currentLevel.id);

    return NextResponse.json({
      success: true,
      memberInfo,
      benefits
    });
  } catch (error) {
    console.error('获取会员信息失败:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}

// 根据等级获取权益
function getBenefitsByLevel(levelId: string): any[] {
  const allBenefits = [
    { id: '1', icon: '💰', name: '积分加倍', description: '消费积分加倍', levels: ['silver', 'gold', 'platinum', 'diamond'] },
    { id: '2', icon: '🎁', name: '生日礼包', description: '专属生日礼物', levels: ['silver', 'gold', 'platinum', 'diamond'] },
    { id: '3', icon: '🎫', name: '专属优惠', description: '会员专享折扣', levels: ['gold', 'platinum', 'diamond'] },
    { id: '4', icon: '🚚', name: '免费配送', description: '订单免运费', levels: ['gold', 'platinum', 'diamond'] },
    { id: '5', icon: '📞', name: '优先客服', description: '专属客服通道', levels: ['platinum', 'diamond'] },
    { id: '6', icon: '🔔', name: '新品优先', description: '新品抢先购', levels: ['diamond'] },
    { id: '7', icon: '👑', name: '专属活动', description: '会员专属活动', levels: ['platinum', 'diamond'] },
    { id: '8', icon: '🎯', name: '积分翻倍日', description: '每月积分翻倍', levels: ['diamond'] }
  ];

  return allBenefits.filter(b => b.levels.includes(levelId));
}
