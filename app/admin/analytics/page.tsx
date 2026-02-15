"use client";

import { useState } from "react";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { VisitorStats } from "@/components/analytics/visitor-stats";
import { BarChart3, Users, Eye, TrendingUp } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold theme-gradient-text">网站数据分析</h1>
          <p className="text-gray-400 mt-1">实时访客统计和网站分析数据</p>
        </div>
      </div>

      {/* 实时统计卡片 */}
      <div className="bg-white/10 backdrop-blur-sm border-white/20 border rounded-xl p-6">
        <h2 className="text-xl font-semibold theme-gradient-text mb-6 flex items-center gap-2">
          <Users className="w-5 h-5" />
          实时访客统计
        </h2>
        <VisitorStats />
      </div>

      {/* 详细分析面板 */}
      <div className="bg-white/10 backdrop-blur-sm border-white/20 border rounded-xl p-6">
        <AnalyticsDashboard />
      </div>

      {/* 使用说明 */}
      <div className="bg-white/10 backdrop-blur-sm border-white/20 border rounded-xl p-6">
        <h3 className="text-lg font-semibold theme-gradient-text mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          统计说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">数据更新频率</h4>
            <ul className="space-y-1">
              <li>• 实时统计：每30秒自动更新</li>
              <li>• 在线用户：5分钟内活跃算在线</li>
              <li>• 历史数据：每小时汇总一次</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">统计指标说明</h4>
            <ul className="space-y-1">
              <li>• 今日访客：当天首次访问的用户数</li>
              <li>• 当前在线：最近5分钟内有活动的用户</li>
              <li>• 页面浏览：所有页面访问次数总和</li>
              <li>• 独立访客：去重后的访问用户数</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}