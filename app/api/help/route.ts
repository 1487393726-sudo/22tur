// 帮助中心 API
import { NextRequest, NextResponse } from 'next/server';

// 帮助分类和问题数据
const helpData = {
  categories: [
    {
      id: 'account',
      name: '账户相关',
      icon: 'user',
      questions: [
        {
          id: 'account-1',
          question: '如何注册账户？',
          answer: '您可以通过微信一键登录或手机号验证码登录来注册账户。首次登录即自动完成注册。',
        },
        {
          id: 'account-2',
          question: '如何修改个人信息？',
          answer: '进入"我的"页面，点击头像区域即可进入个人信息编辑页面，修改昵称、头像等信息。',
        },
        {
          id: 'account-3',
          question: '如何绑定/更换手机号？',
          answer: '进入"我的" > "设置" > "账户安全" > "手机号"，按提示操作即可绑定或更换手机号。',
        },
        {
          id: 'account-4',
          question: '忘记密码怎么办？',
          answer: '本平台使用微信登录或手机验证码登录，无需记忆密码。如遇登录问题，请联系客服。',
        },
      ],
    },
    {
      id: 'investment',
      name: '投资相关',
      icon: 'investment',
      questions: [
        {
          id: 'investment-1',
          question: '如何进行投资？',
          answer: '1. 浏览项目列表，选择感兴趣的项目\n2. 查看项目详情，了解收益和风险\n3. 点击"立即投资"，输入投资金额\n4. 完成支付即可',
        },
        {
          id: 'investment-2',
          question: '投资有什么门槛？',
          answer: '不同项目有不同的起投金额，一般从1000元起。具体请查看各项目详情页。',
        },
        {
          id: 'investment-3',
          question: '投资收益如何计算？',
          answer: '收益按年化收益率计算，每日结算。您可以在"我的投资"中查看实时收益情况。',
        },
        {
          id: 'investment-4',
          question: '投资后可以提前退出吗？',
          answer: '根据项目类型不同，部分项目支持提前退出，可能会收取一定手续费。具体请查看项目协议。',
        },
      ],
    },
    {
      id: 'kyc',
      name: '实名认证',
      icon: 'shield',
      questions: [
        {
          id: 'kyc-1',
          question: '为什么需要实名认证？',
          answer: '根据相关法规要求，投资者需完成实名认证才能进行投资操作，这也是为了保护您的资金安全。',
        },
        {
          id: 'kyc-2',
          question: '实名认证需要哪些材料？',
          answer: '需要提供：\n1. 真实姓名\n2. 身份证号码\n3. 身份证正反面照片\n4. 手持身份证自拍照',
        },
        {
          id: 'kyc-3',
          question: '认证审核需要多长时间？',
          answer: '一般1-3个工作日内完成审核，审核结果会通过消息通知您。',
        },
        {
          id: 'kyc-4',
          question: '认证失败怎么办？',
          answer: '请根据失败原因重新提交认证材料。常见原因：照片模糊、信息不匹配等。如有疑问请联系客服。',
        },
      ],
    },
    {
      id: 'payment',
      name: '支付相关',
      icon: 'wallet',
      questions: [
        {
          id: 'payment-1',
          question: '支持哪些支付方式？',
          answer: '目前支持微信支付。后续将开放更多支付方式。',
        },
        {
          id: 'payment-2',
          question: '支付失败怎么办？',
          answer: '请检查：\n1. 网络是否正常\n2. 支付账户余额是否充足\n3. 是否超出支付限额\n如仍有问题请联系客服。',
        },
        {
          id: 'payment-3',
          question: '如何申请退款？',
          answer: '如需退款，请在"我的订单"中找到对应订单，点击"申请退款"并填写原因。审核通过后将原路退回。',
        },
      ],
    },
    {
      id: 'other',
      name: '其他问题',
      icon: 'help',
      questions: [
        {
          id: 'other-1',
          question: '如何联系客服？',
          answer: '您可以通过以下方式联系我们：\n1. 在线客服：工作日 9:00-18:00\n2. 客服电话：400-XXX-XXXX\n3. 邮箱：support@creative-journey.com',
        },
        {
          id: 'other-2',
          question: '如何提交意见反馈？',
          answer: '进入"我的" > "意见反馈"，填写您的建议或问题，我们会认真处理每一条反馈。',
        },
        {
          id: 'other-3',
          question: '如何注销账户？',
          answer: '如需注销账户，请确保账户内无未完成的投资和待处理的资金，然后联系客服申请注销。',
        },
      ],
    },
  ],
};

// 获取帮助分类和问题
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const keyword = searchParams.get('keyword');

    let result = helpData.categories;

    // 按分类筛选
    if (categoryId) {
      result = result.filter(c => c.id === categoryId);
    }

    // 按关键词搜索
    if (keyword) {
      result = result.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.question.includes(keyword) || q.answer.includes(keyword)
        ),
      })).filter(c => c.questions.length > 0);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get help error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
