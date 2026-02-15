/**
 * 激活数据库配置 API
 *
 * POST /api/admin/database-configs/[id]/activate - 激活指定配置
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// 加密密钥
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-encryption-key-32-bytes!";
const ALGORITHM = "aes-256-cbc";

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

// 生成数据库连接 URL
function generateDatabaseUrl(config: {
  type: string;
  host: string | null;
  port: number | null;
  database: string;
  username: string | null;
  password: string | null;
  sslEnabled: boolean;
}): string {
  const password = config.password ? decryptPassword(config.password) : "";

  switch (config.type) {
    case "sqlite":
      return `file:${config.database}`;

    case "postgresql": {
      let url = "postgresql://";
      if (config.username) {
        url += config.username;
        if (password) {
          url += `:${encodeURIComponent(password)}`;
        }
        url += "@";
      }
      url += `${config.host || "localhost"}:${config.port || 5432}/${config.database}`;
      if (config.sslEnabled) {
        url += "?sslmode=require";
      }
      return url;
    }

    case "mysql": {
      let url = "mysql://";
      if (config.username) {
        url += config.username;
        if (password) {
          url += `:${encodeURIComponent(password)}`;
        }
        url += "@";
      }
      url += `${config.host || "localhost"}:${config.port || 3306}/${config.database}`;
      if (config.sslEnabled) {
        url += "?ssl=true";
      }
      return url;
    }

    case "mongodb": {
      let url = "mongodb://";
      if (config.username) {
        url += config.username;
        if (password) {
          url += `:${encodeURIComponent(password)}`;
        }
        url += "@";
      }
      url += `${config.host || "localhost"}:${config.port || 27017}/${config.database}`;
      if (config.sslEnabled) {
        url += "?ssl=true";
      }
      return url;
    }

    default:
      throw new Error(`不支持的数据库类型: ${config.type}`);
  }
}

// 更新 .env 文件
async function updateEnvFile(databaseUrl: string): Promise<void> {
  const envPath = path.join(process.cwd(), ".env");
  
  try {
    let envContent = "";
    try {
      envContent = await fs.readFile(envPath, "utf-8");
    } catch {
      // 文件不存在，创建新文件
    }

    // 更新或添加 DATABASE_URL
    const lines = envContent.split("\n");
    let found = false;
    const newLines = lines.map((line) => {
      if (line.startsWith("DATABASE_URL=")) {
        found = true;
        return `DATABASE_URL="${databaseUrl}"`;
      }
      return line;
    });

    if (!found) {
      newLines.push(`DATABASE_URL="${databaseUrl}"`);
    }

    await fs.writeFile(envPath, newLines.join("\n"));
  } catch (error) {
    console.error("更新 .env 文件失败:", error);
    throw new Error("更新环境配置失败");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    // 获取要激活的配置
    const config = await prisma.databaseConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
    }

    // 如果已经是活跃状态，直接返回
    if (config.isActive) {
      return NextResponse.json({
        success: true,
        message: "配置已经是活跃状态",
        requiresRestart: false,
      });
    }

    // 生成数据库连接 URL
    const databaseUrl = generateDatabaseUrl({
      type: config.type,
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      sslEnabled: config.sslEnabled,
    });

    // 使用事务更新配置状态
    await prisma.$transaction(async (tx) => {
      // 取消所有其他配置的活跃状态
      await tx.databaseConfig.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // 激活当前配置
      await tx.databaseConfig.update({
        where: { id },
        data: { isActive: true },
      });
    });

    // 更新 .env 文件
    try {
      await updateEnvFile(databaseUrl);
    } catch (error) {
      console.error("更新 .env 文件失败:", error);
      // 即使更新 .env 失败，数据库状态已更新
    }

    return NextResponse.json({
      success: true,
      message: "配置已激活",
      requiresRestart: true,
      note: "请重启应用以使新的数据库配置生效",
    });
  } catch (error) {
    console.error("激活数据库配置失败:", error);
    return NextResponse.json({ error: "激活配置失败" }, { status: 500 });
  }
}
