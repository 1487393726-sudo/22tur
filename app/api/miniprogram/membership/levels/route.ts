import { NextRequest, NextResponse } from 'next/server';

// GET /api/miniprogram/membership/levels - 获取会员等级配置
export async function GET(request: NextRequest) {
  try {
    // 会员等级列表
    const levels = [
      { id: 'bronze', name: '青铜', minPoints: 0 },
      { id: 'silver', name: '白银', minPoints: 1000 },
      { id: 'gold', name: '黄金', minPoints: 5000 },
      { id: 'platinum', name: '铂金', minPoints: 20000 },
      { id: 'diamond', name: '钻石', minPoints: 50000 }
    ];

    // 权益对比表
    const comparison = [
      { 
        name: '积分倍率', 
        values: { bronze: '1x', silver: '1.2x', gold: '1.5x', platinum: '2x', diamond: '3x' } 
      },
      { 
        name: '生日礼包', 
        values: { bronze: false, silver: true, gold: true, platinum: true, diamond: true } 
      },
      { 
        name: '专属优惠', 
        values: { bronze: false, silver: false, gold: true, platinum: true, diamond: true } 
      },
      { 
        name: '免费配送', 
        values: { bronze: false, silver: false, gold: true, platinum: true, diamond: true } 
      },
      { 
        name: '优先客服', 
        values: { bronze: false, silver: false, gold: false, platinum: true, diamond: true } 
      },
      { 
        name: '新品优先', 
        values: { bronze: false, silver: false, gold: false, platinum: false, diamond: true } 
      },
      { 
        name: '专属活动', 
        values: { bronze: false, silver: false, gold: false, platinum: true, diamond: true } 
      },
      { 
        name: '积分翻倍日', 
        values: { bronze: false, silver: false, gold: false, platinum: false, diamond: true } 
      }
    ];

    // 升级提示
    const upgradeTips = [
      '完成订单可获得消费金额等值积分',
      '每日签到可获得5积分，连续签到7天额外获得50积分',
      '邀请好友注册可获得50积分，好友首单再得100积分',
      '参与活动可获得额外积分奖励',
      '完善个人资料可获得50积分',
      '评价订单可获得10积分'
    ];

    return NextResponse.json({
      success: true,
      levels,
      comparison,
      upgradeTips
    });
  } catch (error) {
    console.error('获取会员等级配置失败:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}
