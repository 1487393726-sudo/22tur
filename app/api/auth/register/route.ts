import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateCustomUserId } from "@/lib/auth-utils";

/**
 * 用户注册 API
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password, firstName, lastName, username } = body;

    // 验证必填字段
    if (!email || !password || !firstName || !lastName || !username) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // 验证手机号格式（如果提供）
    if (phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { error: "手机号格式不正确" },
          { status: 400 }
        );
      }
    }

    // 验证密码长度
    if (password.length < 6 || password.length > 50) {
      return NextResponse.json(
        { error: "密码长度必须在6-50个字符之间" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "该用户名已被使用" },
        { status: 409 }
      );
    }

    // 检查手机号是否已存在（如果提供）
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "该手机号已被注册" },
          { status: 409 }
        );
      }
    }

    // 生成唯一的自定义用户ID
    const customUserId = await generateCustomUserId();

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        phoneVerified: phone ? null : undefined, // 如果提供手机号，需要验证
        customUserId,
        role: "EMPLOYEE", // 默认角色
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        customUserId: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "注册成功",
        user: {
          ...user,
          // 不返回密码
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
