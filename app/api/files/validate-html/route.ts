import { NextRequest, NextResponse } from "next/server";
import {
  validateHtmlContent,
  containsMaliciousContent,
} from "@/lib/html-sanitizer";

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json();

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "无效的 HTML 内容" },
        { status: 400 }
      );
    }

    // 验证 HTML 内容
    const validation = validateHtmlContent(html);

    if (!validation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // 返回验证结果
    return NextResponse.json({
      valid: true,
      sanitized: validation.sanitized,
      hasMaliciousContent: containsMaliciousContent(html),
    });
  } catch (error) {
    console.error("HTML 验证失败:", error);
    return NextResponse.json(
      { error: "HTML 验证失败" },
      { status: 500 }
    );
  }
}
