/**
 * 系统优化 API
 * 提供性能优化、安全加固、数据库优化等功能
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getDatabaseOptimizationAdvice,
  generateDatabaseOptimizationReport,
} from "@/lib/database-optimizer";
import {
  globalMonitor,
  globalCache,
  globalDeduplicator,
  globalRateLimiter,
} from "@/lib/performance-optimizer";
import { SECURITY_HEADERS } from "@/lib/security-hardener";

/**
 * GET - 获取优化建议
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 检查管理员权限
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "需要管理员权限" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    let response: any = {};

    if (type === "all" || type === "database") {
      response.database = getDatabaseOptimizationAdvice();
    }

    if (type === "all" || type === "performance") {
      response.performance = {
        cache: {
          size: globalCache.size(),
          status: "active",
        },
        deduplicator: {
          pendingRequests: globalDeduplicator.getPendingCount(),
          status: "active",
        },
        monitor: {
          stats: globalMonitor.getAllStats(),
        },
      };
    }

    if (type === "all" || type === "security") {
      response.security = {
        headers: SECURITY_HEADERS,
        recommendations: [
          "启用 HTTPS",
          "配置 CORS",
          "实施速率限制",
          "启用 2FA",
          "定期安全审计",
        ],
      };
    }

    if (type === "all" || type === "report") {
      response.report = generateDatabaseOptimizationReport();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("获取优化建议失败:", error);
    return NextResponse.json(
      { error: "获取优化建议失败" },
      { status: 500 }
    );
  }
}

/**
 * POST - 执行优化操作
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 检查管理员权限
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "需要管理员权限" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    let result: any = {};

    switch (action) {
      case "clear_cache":
        globalCache.clear();
        result = { message: "缓存已清空" };
        break;

      case "clear_deduplicator":
        globalDeduplicator.clear();
        result = { message: "请求去重缓存已清空" };
        break;

      case "clear_monitor":
        globalMonitor.clear();
        result = { message: "性能监控数据已清空" };
        break;

      case "clear_rate_limiter":
        globalRateLimiter.clear();
        result = { message: "速率限制已重置" };
        break;

      case "cleanup_all":
        globalCache.clear();
        globalDeduplicator.clear();
        globalMonitor.clear();
        globalRateLimiter.clear();
        result = { message: "所有缓存和监控数据已清空" };
        break;

      default:
        return NextResponse.json(
          { error: "未知的操作" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("执行优化操作失败:", error);
    return NextResponse.json(
      { error: "执行优化操作失败" },
      { status: 500 }
    );
  }
}
