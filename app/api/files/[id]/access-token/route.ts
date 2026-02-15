import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { checkFileAccess } from "@/lib/file-access";
import crypto from "crypto";

/**
 * 令牌配置
 */
const TOKEN_CONFIG = {
  // 默认有效期（1小时）
  DEFAULT_EXPIRY_SECONDS: 3600,
  // 最大有效期（24小时）
  MAX_EXPIRY_SECONDS: 86400,
  // 最小有效期（5分钟）
  MIN_EXPIRY_SECONDS: 300,
  // 签名算法
  ALGORITHM: "sha256",
};

// 签名密钥（应该从环境变量获取）
const FILE_SECRET =
  process.env.FILE_SECRET || "default-file-secret-key-change-in-production";

/**
 * 访问令牌载荷接口
 */
interface TokenPayload {
  fileId: string;
  userId: string;
  action: "VIEW" | "DOWNLOAD" | "PREVIEW";
  expiresAt: number;
  issuedAt: number;
  nonce: string;
}

/**
 * 生成文件访问令牌
 * 
 * @param fileId 文件ID
 * @param userId 用户ID
 * @param action 操作类型
 * @param expirySeconds 有效期（秒）
 * @returns 令牌和过期时间
 */
function generateFileAccessToken(
  fileId: string,
  userId: string,
  action: "VIEW" | "DOWNLOAD" | "PREVIEW",
  expirySeconds: number = TOKEN_CONFIG.DEFAULT_EXPIRY_SECONDS
): { token: string; expiresAt: Date; issuedAt: Date } {
  const now = Date.now();
  const issuedAt = new Date(now);
  const expiresAt = new Date(now + expirySeconds * 1000);

  // 生成随机 nonce 防止重放攻击
  const nonce = crypto.randomBytes(16).toString("hex");

  const payload: TokenPayload = {
    fileId,
    userId,
    action,
    expiresAt: expiresAt.getTime(),
    issuedAt: now,
    nonce,
  };

  // 生成签名
  const signature = crypto
    .createHmac(TOKEN_CONFIG.ALGORITHM, FILE_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  // 组合令牌（使用 base64url 编码）
  const token = Buffer.from(
    JSON.stringify({ ...payload, signature })
  ).toString("base64url");

  return { token, expiresAt, issuedAt };
}

/**
 * 验证文件访问令牌
 * 
 * @param token 访问令牌
 * @returns 验证结果
 */
export function verifyFileAccessToken(token: string): {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
} {
  try {
    // 解码令牌
    const decoded = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );

    const { fileId, userId, action, expiresAt, issuedAt, nonce, signature } =
      decoded;

    // 检查必要字段
    if (!fileId || !userId || !action || !expiresAt || !signature) {
      return { valid: false, error: "令牌格式不完整" };
    }

    // 检查是否过期
    if (Date.now() > expiresAt) {
      return { valid: false, error: "令牌已过期" };
    }

    // 重建载荷并验证签名
    const payload: TokenPayload = {
      fileId,
      userId,
      action,
      expiresAt,
      issuedAt,
      nonce,
    };

    const expectedSignature = crypto
      .createHmac(TOKEN_CONFIG.ALGORITHM, FILE_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, error: "无效的签名" };
    }

    return {
      valid: true,
      payload,
    };
  } catch (error) {
    return { valid: false, error: "无效的令牌格式" };
  }
}

/**
 * 生成签名 URL
 * 
 * @param baseUrl 基础 URL
 * @param token 访问令牌
 * @returns 签名 URL
 */
export function generateSignedUrl(baseUrl: string, token: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

/**
 * 生成文件访问令牌
 * POST /api/files/[id]/access-token
 * 
 * 请求体：
 * - action: "VIEW" | "DOWNLOAD" | "PREVIEW" (默认 "VIEW")
 * - expiresIn: 有效期（秒），范围 300-86400，默认 3600
 * 
 * 响应：
 * - token: 访问令牌
 * - expiresAt: 过期时间 (ISO 8601)
 * - expiresIn: 有效期（秒）
 * - action: 操作类型
 * - signedUrls: 签名 URL（预览和下载）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const userId = session.user.id;
    const fileId = params.id;

    // 获取请求参数
    const body = await request.json().catch(() => ({}));
    
    // 验证操作类型
    const validActions = ["VIEW", "DOWNLOAD", "PREVIEW"];
    const action = validActions.includes(body.action?.toUpperCase())
      ? (body.action.toUpperCase() as "VIEW" | "DOWNLOAD" | "PREVIEW")
      : "VIEW";

    // 验证有效期
    let expiresIn = parseInt(body.expiresIn) || TOKEN_CONFIG.DEFAULT_EXPIRY_SECONDS;
    expiresIn = Math.max(
      TOKEN_CONFIG.MIN_EXPIRY_SECONDS,
      Math.min(TOKEN_CONFIG.MAX_EXPIRY_SECONDS, expiresIn)
    );

    // 检查文件是否存在
    const file = await prisma.projectFile.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        isLocked: true,
        projectId: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    // 检查访问权限
    const accessCheck = await checkFileAccess(fileId, userId);
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        {
          error: accessCheck.reason || "无权限访问此文件",
          requiresInvestment: true,
          projectId: file.projectId,
        },
        { status: 403 }
      );
    }

    // 生成访问令牌
    const { token, expiresAt, issuedAt } = generateFileAccessToken(
      fileId,
      userId,
      action,
      expiresIn
    );

    // 生成签名 URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const signedUrls = {
      preview: `${baseUrl}/api/files/${fileId}/preview?token=${token}`,
      download: `${baseUrl}/api/files/${fileId}/download?token=${token}`,
    };

    return NextResponse.json({
      token,
      expiresAt: expiresAt.toISOString(),
      issuedAt: issuedAt.toISOString(),
      expiresIn,
      action,
      file: {
        id: file.id,
        name: file.originalName || file.fileName,
        isLocked: file.isLocked,
      },
      signedUrls,
      accessType: accessCheck.accessType,
    });
  } catch (error) {
    console.error("生成访问令牌失败:", error);
    return NextResponse.json(
      { error: "生成访问令牌失败" },
      { status: 500 }
    );
  }
}

/**
 * 验证访问令牌
 * GET /api/files/[id]/access-token?token=xxx
 * 
 * 用于验证令牌是否有效
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "缺少令牌参数" }, { status: 400 });
    }

    // 验证令牌
    const result = verifyFileAccessToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 401 }
      );
    }

    // 检查文件 ID 是否匹配
    if (result.payload?.fileId !== params.id) {
      return NextResponse.json(
        { valid: false, error: "令牌与文件不匹配" },
        { status: 401 }
      );
    }

    // 计算剩余有效时间
    const remainingSeconds = Math.max(
      0,
      Math.floor((result.payload.expiresAt - Date.now()) / 1000)
    );

    return NextResponse.json({
      valid: true,
      action: result.payload.action,
      expiresAt: new Date(result.payload.expiresAt).toISOString(),
      remainingSeconds,
      issuedAt: new Date(result.payload.issuedAt).toISOString(),
    });
  } catch (error) {
    console.error("验证访问令牌失败:", error);
    return NextResponse.json(
      { error: "验证访问令牌失败" },
      { status: 500 }
    );
  }
}
