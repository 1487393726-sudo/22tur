/**
 * API 路由类型定义
 * 用于 Next.js 15 的 Promise params 类型
 */

import { NextRequest } from "next/server";

// 单个 ID 参数
export interface RouteParams {
  params: { id: string };
}

// 双参数路由
export interface RouteParamsWithMemberId {
  params: { id: string; memberId: string };
}

export interface RouteParamsWithShareId {
  params: { id: string; shareId: string };
}

export interface RouteParamsWithImageId {
  params: { id: string; imageId: string };
}

// 通用的路由处理器类型
export type RouteHandler<T = unknown> = (
  request: NextRequest,
  context: RouteParams
) => Promise<Response>;

export type RouteHandlerWithMemberId<T = unknown> = (
  request: NextRequest,
  context: RouteParamsWithMemberId
) => Promise<Response>;

// 辅助函数：从 context 中获取 params
export function getParams<T extends Record<string, string>>(
  context: { params: T }
): T {
  return context.params;
}
