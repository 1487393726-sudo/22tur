import { NextRequest, NextResponse } from 'next/server';

// GET /api/miniprogram/points/rules - 获取积分规则
export async function GET(request: NextRequest) {
  try {
    // 积分规则配置
    const rules = [
      {
        category: '购物奖励',
        items: [
          { action: '每消费1元', points: 1 },
          { action: '首次下单', points: 100 },
          { action: '评价订单', points: 10 },
          { action: '晒单分享', points: 20 }
        ]
      },
      {
        category: '互动奖励',
        items: [
          { action: '每日签到', points: 5 },
          { action: '连续签到7天', points: 50 },
          { action: '分享商品', points: 5 },
          { action: '邀请好友注册', points: 50 },
          { action: '好友首次下单', points: 100 }
        ]
      },
      {
        category: '会员专享',
        items: [
          { action: '生日礼包', points: 200 },
          { action: '会员升级奖励', points: 500 },
          { action: '年度会员回馈', points: 1000 }
        ]
      },
      {
        category: '特殊活动',
        items: [
          { action: '参与问卷调查', points: 30 },
          { action: '完善个人资料', points: 50 },
          { action: '绑定手机号', points: 20 }
        ]
      }
    ];

    // 积分使用说明
    const usage = {
      exchangeRate: '100积分 = 1元',
      minExchange: 100,
      validity: '积分有效期为获取后12个月',
      notes: [
        '积分不可转让、不可提现',
        '退款订单将扣除相应积分',
        '积分兑换商品不参与积分累计'
      ]
    };

    return NextResponse.json({
      success: true,
      rules,
      usage
    });
  } catch (error) {
    console.error('获取积分规则失败:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}
