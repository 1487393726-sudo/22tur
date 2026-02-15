// 微信小程序订阅消息服务
import { prisma } from '@/lib/prisma';

const WECHAT_APPID = process.env.WECHAT_MINIPROGRAM_APPID || '';
const WECHAT_SECRET = process.env.WECHAT_MINIPROGRAM_SECRET || '';

// 订阅消息模板 ID（需要在微信公众平台配置）
export const TEMPLATE_IDS = {
  // 投资成功通知
  INVESTMENT_SUCCESS: process.env.WX_TEMPLATE_INVESTMENT_SUCCESS || '',
  // 收益到账通知
  PROFIT_RECEIVED: process.env.WX_TEMPLATE_PROFIT_RECEIVED || '',
  // 项目状态更新
  PROJECT_UPDATE: process.env.WX_TEMPLATE_PROJECT_UPDATE || '',
  // 文档签署提醒
  DOCUMENT_SIGN: process.env.WX_TEMPLATE_DOCUMENT_SIGN || '',
  // KYC 审核结果
  KYC_RESULT: process.env.WX_TEMPLATE_KYC_RESULT || '',
  // 系统通知
  SYSTEM_NOTICE: process.env.WX_TEMPLATE_SYSTEM_NOTICE || '',
  // 服务订单状态更新
  SERVICE_ORDER_UPDATE: process.env.WX_TEMPLATE_SERVICE_ORDER_UPDATE || '',
  // 服务里程碑更新
  SERVICE_MILESTONE_UPDATE: process.env.WX_TEMPLATE_SERVICE_MILESTONE_UPDATE || '',
  // 服务交付物通知
  SERVICE_DELIVERABLE: process.env.WX_TEMPLATE_SERVICE_DELIVERABLE || '',
};

export type TemplateType = keyof typeof TEMPLATE_IDS;

interface SubscribeMessageData {
  [key: string]: {
    value: string;
  };
}

interface SendMessageParams {
  userId: string;
  templateType: TemplateType;
  data: SubscribeMessageData;
  page?: string;
  miniprogramState?: 'developer' | 'trial' | 'formal';
}

interface SendMessageResult {
  success: boolean;
  errcode?: number;
  errmsg?: string;
}

// 获取 access_token
let accessToken: string | null = null;
let tokenExpireTime: number = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  if (accessToken && tokenExpireTime > now) {
    return accessToken;
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(data.errmsg || '获取 access_token 失败');
  }

  accessToken = data.access_token;
  tokenExpireTime = now + (data.expires_in - 300) * 1000; // 提前5分钟过期

  return accessToken;
}

// 发送订阅消息
export async function sendSubscribeMessage(params: SendMessageParams): Promise<SendMessageResult> {
  const { userId, templateType, data, page, miniprogramState = 'formal' } = params;

  try {
    // 获取用户的 openid
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wechatOpenId: true },
    });

    if (!user?.wechatOpenId) {
      return { success: false, errcode: -1, errmsg: '用户未绑定微信' };
    }

    // 检查用户是否订阅了该模板
    const subscription = await prisma.subscribeMessageRecord?.findFirst({
      where: {
        userId,
        templateId: TEMPLATE_IDS[templateType],
        status: 'SUBSCRIBED',
      },
    });

    if (!subscription) {
      return { success: false, errcode: -2, errmsg: '用户未订阅该消息' };
    }

    // 获取 access_token
    const token = await getAccessToken();

    // 发送消息
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        touser: user.wechatOpenId,
        template_id: TEMPLATE_IDS[templateType],
        page: page || '',
        miniprogram_state: miniprogramState,
        lang: 'zh_CN',
        data,
      }),
    });

    const result = await response.json();

    // 更新订阅记录
    if (result.errcode === 0) {
      await prisma.subscribeMessageRecord?.update({
        where: { id: subscription.id },
        data: { 
          status: 'SENT',
          sentAt: new Date(),
        },
      }).catch(() => {});
    }

    // 记录发送日志
    await prisma.subscribeMessageLog?.create({
      data: {
        userId,
        templateId: TEMPLATE_IDS[templateType],
        templateType,
        data: JSON.stringify(data),
        page: page || '',
        errcode: result.errcode,
        errmsg: result.errmsg,
        sentAt: new Date(),
      },
    }).catch(() => {});

    return {
      success: result.errcode === 0,
      errcode: result.errcode,
      errmsg: result.errmsg,
    };
  } catch (error: any) {
    console.error('发送订阅消息失败:', error);
    return { success: false, errcode: -999, errmsg: error.message };
  }
}

// 批量发送订阅消息
export async function sendBatchSubscribeMessages(
  userIds: string[],
  templateType: TemplateType,
  data: SubscribeMessageData,
  page?: string
): Promise<{ total: number; success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const userId of userIds) {
    const result = await sendSubscribeMessage({
      userId,
      templateType,
      data,
      page,
    });

    if (result.success) {
      success++;
    } else {
      failed++;
    }

    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { total: userIds.length, success, failed };
}

// 发送投资成功通知
export async function sendInvestmentSuccessMessage(
  userId: string,
  projectName: string,
  amount: number,
  investmentId: string
): Promise<SendMessageResult> {
  return sendSubscribeMessage({
    userId,
    templateType: 'INVESTMENT_SUCCESS',
    data: {
      thing1: { value: projectName.slice(0, 20) },
      amount2: { value: `¥${amount.toLocaleString()}` },
      time3: { value: new Date().toLocaleString('zh-CN') },
    },
    page: `/pages/investment-detail/investment-detail?id=${investmentId}`,
  });
}

// 发送收益到账通知
export async function sendProfitReceivedMessage(
  userId: string,
  projectName: string,
  amount: number,
  period: string
): Promise<SendMessageResult> {
  return sendSubscribeMessage({
    userId,
    templateType: 'PROFIT_RECEIVED',
    data: {
      thing1: { value: projectName.slice(0, 20) },
      amount2: { value: `¥${amount.toLocaleString()}` },
      thing3: { value: period },
      time4: { value: new Date().toLocaleString('zh-CN') },
    },
    page: '/pages/investments/investments',
  });
}

// 发送项目状态更新通知
export async function sendProjectUpdateMessage(
  userId: string,
  projectName: string,
  status: string,
  remark: string,
  projectId: string
): Promise<SendMessageResult> {
  return sendSubscribeMessage({
    userId,
    templateType: 'PROJECT_UPDATE',
    data: {
      thing1: { value: projectName.slice(0, 20) },
      phrase2: { value: status },
      thing3: { value: remark.slice(0, 20) },
      time4: { value: new Date().toLocaleString('zh-CN') },
    },
    page: `/pages/investment-detail/investment-detail?projectId=${projectId}`,
  });
}

// 发送文档签署提醒
export async function sendDocumentSignMessage(
  userId: string,
  documentTitle: string,
  deadline: Date,
  signToken: string
): Promise<SendMessageResult> {
  return sendSubscribeMessage({
    userId,
    templateType: 'DOCUMENT_SIGN',
    data: {
      thing1: { value: documentTitle.slice(0, 20) },
      time2: { value: deadline.toLocaleString('zh-CN') },
      thing3: { value: '请尽快完成签署' },
    },
    page: `/pages/webview/webview?url=${encodeURIComponent(`/sign/${signToken}`)}`,
  });
}

// 发送 KYC 审核结果通知
export async function sendKYCResultMessage(
  userId: string,
  result: 'APPROVED' | 'REJECTED',
  reason?: string
): Promise<SendMessageResult> {
  return sendSubscribeMessage({
    userId,
    templateType: 'KYC_RESULT',
    data: {
      phrase1: { value: result === 'APPROVED' ? '审核通过' : '审核未通过' },
      thing2: { value: reason?.slice(0, 20) || (result === 'APPROVED' ? '恭喜您通过认证' : '请重新提交资料') },
      time3: { value: new Date().toLocaleString('zh-CN') },
    },
    page: '/pages/profile/profile',
  });
}

// 发送系统通知
export async function sendSystemNoticeMessage(
  userId: string,
  title: string,
  content: string,
  page?: string
): Promise<SendMessageResult> {
  return sendSubscribeMessage({
    userId,
    templateType: 'SYSTEM_NOTICE',
    data: {
      thing1: { value: title.slice(0, 20) },
      thing2: { value: content.slice(0, 20) },
      time3: { value: new Date().toLocaleString('zh-CN') },
    },
    page,
  });
}

// 发送服务订单状态更新通知
export async function sendServiceOrderUpdateMessage(
  userId: string,
  orderNumber: string,
  serviceName: string,
  status: string,
  orderId: string
): Promise<SendMessageResult> {
  const statusText: Record<string, string> = {
    CONFIRMED: '已确认',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };

  return sendSubscribeMessage({
    userId,
    templateType: 'SERVICE_ORDER_UPDATE',
    data: {
      character_string1: { value: orderNumber },
      thing2: { value: serviceName.slice(0, 20) },
      phrase3: { value: statusText[status] || status },
      time4: { value: new Date().toLocaleString('zh-CN') },
    },
    page: `/pages/service-progress/service-progress?id=${orderId}`,
  });
}

// 发送服务里程碑更新通知
export async function sendServiceMilestoneUpdateMessage(
  userId: string,
  orderNumber: string,
  milestoneName: string,
  status: 'STARTED' | 'COMPLETED',
  orderId: string
): Promise<SendMessageResult> {
  return sendSubscribeMessage({
    userId,
    templateType: 'SERVICE_MILESTONE_UPDATE',
    data: {
      character_string1: { value: orderNumber },
      thing2: { value: milestoneName.slice(0, 20) },
      phrase3: { value: status === 'STARTED' ? '已开始' : '已完成' },
      time4: { value: new Date().toLocaleString('zh-CN') },
    },
    page: `/pages/service-progress/service-progress?id=${orderId}`,
  });
}

// 发送服务交付物通知
export async function sendServiceDeliverableMessage(
  userId: string,
  orderNumber: string,
  deliverableName: string,
  orderId: string
): Promise<SendMessageResult> {
  return sendSubscribeMessage({
    userId,
    templateType: 'SERVICE_DELIVERABLE',
    data: {
      character_string1: { value: orderNumber },
      thing2: { value: deliverableName.slice(0, 20) },
      thing3: { value: '请查看并确认' },
      time4: { value: new Date().toLocaleString('zh-CN') },
    },
    page: `/pages/service-progress/service-progress?id=${orderId}`,
  });
}

export default {
  TEMPLATE_IDS,
  sendSubscribeMessage,
  sendBatchSubscribeMessages,
  sendInvestmentSuccessMessage,
  sendProfitReceivedMessage,
  sendProjectUpdateMessage,
  sendDocumentSignMessage,
  sendKYCResultMessage,
  sendSystemNoticeMessage,
  sendServiceOrderUpdateMessage,
  sendServiceMilestoneUpdateMessage,
  sendServiceDeliverableMessage,
};
