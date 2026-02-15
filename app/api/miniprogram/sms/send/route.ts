// 小程序短信验证码发送 API
import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/lib/sms/sms-service';

// 验证码存储 (生产环境应使用 Redis)
const verificationCodes = new Map<string, { code: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的手机号' },
        { status: 400 }
      );
    }

    // 检查发送频率限制
    const existing = verificationCodes.get(phone);
    if (existing && existing.expires > Date.now() - 60000) {
      return NextResponse.json(
        { success: false, message: '请稍后再试，验证码发送过于频繁' },
        { status: 429 }
      );
    }

    // 生成6位验证码
    const code = Math.random().toString().slice(2, 8);
    
    // 存储验证码 (5分钟有效)
    verificationCodes.set(phone, {
      code,
      expires: Date.now() + 5 * 60 * 1000,
    });

    // 发送短信
    try {
      await smsService.send({
        phone,
        templateId: 'SMS_VERIFY_CODE',
        params: { code },
      });
    } catch (smsError) {
      console.error('SMS send error:', smsError);
      // 开发环境下仍然返回成功，方便测试
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Verification code for ${phone}: ${code}`);
      } else {
        return NextResponse.json(
          { success: false, message: '短信发送失败，请稍后重试' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
    });
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 验证验证码 (供其他 API 调用)
export function verifyCode(phone: string, code: string): boolean {
  const stored = verificationCodes.get(phone);
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    verificationCodes.delete(phone);
    return false;
  }
  if (stored.code !== code) return false;
  
  // 验证成功后删除
  verificationCodes.delete(phone);
  return true;
}
