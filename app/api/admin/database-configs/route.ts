/**
 * 数据库配置管理 API
 *
 * GET /api/admin/database-configs - 获取所有配置
 * POST /api/admin/database-configs - 创建新配置
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// 加密密钥（生产环境应从环境变量获取）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-encryption-key-32-bytes!";
const ALGORITHM = "aes-256-cbc";

// 加密密码
function encryptPassword(password: string): string {
  if (!password) return "";
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// 解密密码
function decryptPassword(encrypted: string): string {
  if (!encrypted || !encrypted.includes(":")) return "";
  try {
    const [ivHex, encryptedText] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "";
  }
}

// GET: 获取所有数据库配置
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const configs = await prisma.databaseConfig.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        type: true,
        host: true,
        port: true,
        database: true,
        username: true,
        sslEnabled: true,
        poolSize: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        // 不返回密码
      },
    });

    return NextResponse.json({ configs });
  } catch (error) {
    console.error("获取数据库配置失败:", error);
    return NextResponse.json({ error: "获取配置失败" }, { status: 500 });
  }
}

// POST: 创建新数据库配置
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      type,
      host,
      port,
      database,
      username,
      password,
      sslEnabled = false,
      poolSize = 10,
    } = body;

    // 验证必填字段
    if (!name || !database) {
      return NextResponse.json({ error: "名称和数据库是必填项" }, { status: 400 });
    }

    // 验证数据库类型
    const validTypes = ["sqlite", "postgresql", "mysql", "mongodb"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "无效的数据库类型" }, { status: 400 });
    }

    // 检查名称是否已存在
    const existing = await prisma.databaseConfig.findUnique({
      where: { name },
    });
    if (existing) {
      return NextResponse.json({ error: "配置名称已存在" }, { status: 400 });
    }

    // 加密密码
    const encryptedPassword = password ? encryptPassword(password) : null;

    // 创建配置
    const config = await prisma.databaseConfig.create({
      data: {
        name,
        type,
        host: type === "sqlite" ? null : host || "localhost",
        port: type === "sqlite" ? null : parseInt(port) || null,
        database,
        username: type === "sqlite" ? null : username || null,
        password: encryptedPassword,
        sslEnabled,
        poolSize,
        isActive: false,
        isDefault: false,
      },
      select: {
        id: true,
        name: true,
        type: true,
        host: true,
        port: true,
        database: true,
        username: true,
        sslEnabled: true,
        poolSize: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ config }, { status: 201 });
  } catch (error) {
    console.error("创建数据库配置失败:", error);
    return NextResponse.json({ error: "创建配置失败" }, { status: 500 });
  }
}
