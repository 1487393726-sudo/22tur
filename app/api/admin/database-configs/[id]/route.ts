/**
 * 单个数据库配置管理 API
 *
 * GET /api/admin/database-configs/[id] - 获取配置详情
 * PUT /api/admin/database-configs/[id] - 更新配置
 * DELETE /api/admin/database-configs/[id] - 删除配置
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// 加密密钥
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

// GET: 获取配置详情
export async function GET(
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

    const config = await prisma.databaseConfig.findUnique({
      where: { id },
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
      },
    });

    if (!config) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("获取数据库配置失败:", error);
    return NextResponse.json({ error: "获取配置失败" }, { status: 500 });
  }
}

// PUT: 更新配置
export async function PUT(
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

    // 检查配置是否存在
    const existing = await prisma.databaseConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
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
      sslEnabled,
      poolSize,
    } = body;

    // 验证必填字段
    if (!name || !database) {
      return NextResponse.json({ error: "名称和数据库是必填项" }, { status: 400 });
    }

    // 检查名称是否与其他配置冲突
    if (name !== existing.name) {
      const nameConflict = await prisma.databaseConfig.findUnique({
        where: { name },
      });
      if (nameConflict) {
        return NextResponse.json({ error: "配置名称已存在" }, { status: 400 });
      }
    }

    // 准备更新数据
    const updateData: any = {
      name,
      type,
      host: type === "sqlite" ? null : host || "localhost",
      port: type === "sqlite" ? null : parseInt(port) || null,
      database,
      username: type === "sqlite" ? null : username || null,
      sslEnabled: sslEnabled ?? existing.sslEnabled,
      poolSize: poolSize ?? existing.poolSize,
    };

    // 只有提供了新密码才更新
    if (password) {
      updateData.password = encryptPassword(password);
    }

    const config = await prisma.databaseConfig.update({
      where: { id },
      data: updateData,
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
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("更新数据库配置失败:", error);
    return NextResponse.json({ error: "更新配置失败" }, { status: 500 });
  }
}

// DELETE: 删除配置
export async function DELETE(
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

    // 检查配置是否存在
    const config = await prisma.databaseConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
    }

    // 不允许删除活跃配置
    if (config.isActive) {
      return NextResponse.json(
        { error: "不能删除当前活跃的数据库配置" },
        { status: 400 }
      );
    }

    // 删除配置
    await prisma.databaseConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "配置已删除" });
  } catch (error) {
    console.error("删除数据库配置失败:", error);
    return NextResponse.json({ error: "删除配置失败" }, { status: 500 });
  }
}
