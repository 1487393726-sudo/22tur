import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  
  // Redirect to login page with error message
  const errorMessages: Record<string, string> = {
    'Configuration': '服务器配置错误',
    'AccessDenied': '访问被拒绝',
    'Verification': '验证链接已过期或无效',
    'OAuthSignin': '登录失败',
    'OAuthCallback': '登录回调失败',
    'OAuthCreateAccount': '创建账户失败',
    'EmailCreateAccount': '创建账户失败',
    'Callback': '回调错误',
    'OAuthAccountNotLinked': '该邮箱已被其他账户使用',
    'EmailSignin': '邮箱登录失败',
    'CredentialsSignin': '用户名或密码错误',
    'SessionRequired': '请先登录',
    'Default': '登录时发生错误',
  };

  const message = errorMessages[error || 'Default'] || errorMessages['Default'];
  
  // Redirect to admin-login with error
  return NextResponse.redirect(
    new URL(`/admin-login?error=${encodeURIComponent(message)}`, request.url)
  );
}
