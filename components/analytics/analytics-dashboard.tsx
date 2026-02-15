"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users, Eye } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface HistoricalData {
  date: string;
  visitors: number;
  pageViews: number;
}

export function AnalyticsDashboard() {
  const { locale } = useLanguage();
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/history?days=${days}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHistoricalData(result.data);
        }
      }
    } catch (error) {
      console.error('获取历史数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [days]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "en" ? "en-US" : "zh-CN", {
      month: 'short',
      day: 'numeric'
    });
  };

  const totalVisitors = historicalData.reduce((sum, day) => sum + day.visitors, 0);
  const totalPageViews = historicalData.reduce((sum, day) => sum + day.pageViews, 0);
  const avgVisitorsPerDay = totalVisitors / (historicalData.length || 1);

  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Calendar className="w-5 h-5" />
          {locale === "en" ? "Analytics Dashboard" : "数据分析面板"}
        </h3>
        <div className="flex gap-2">
          {[7, 14, 30].map((period) => (
            <button
              key={period}
              onClick={() => setDays(period)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                days === period
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15 border-white/20 border'
              }`}
            >
              {period}{locale === "en" ? "d" : "天"}
            </button>
          ))}
        </div>
      </div>

      {/* 概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-white/20 border">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-300">
              {locale === "en" ? "Total Visitors" : "总访客数"}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{totalVisitors.toLocaleString()}</div>
          <div className="text-xs text-gray-300 mt-1">
            {locale === "en" ? `Last ${days} days` : `过去${days}天`}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-white/20 border">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-white" />
            <span className="text-sm text-gray-300">
              {locale === "en" ? "Total Page Views" : "总页面浏览"}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{totalPageViews.toLocaleString()}</div>
          <div className="text-xs text-gray-300 mt-1">
            {locale === "en" ? `Last ${days} days` : `过去${days}天`}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-white/20 border">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-300">
              {locale === "en" ? "Avg. Daily Visitors" : "日均访客"}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{Math.round(avgVisitorsPerDay).toLocaleString()}</div>
          <div className="text-xs text-gray-300 mt-1">
            {locale === "en" ? "Per day" : "每天"}
          </div>
        </div>
      </div>

      {/* 图表 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border-white/20 border">
        <h4 className="text-md font-semibold mb-4 text-white">
          {locale === "en" ? "Visitor Trends" : "访客趋势"}
        </h4>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historicalData}>
              <defs>
                {/* 访客数渐变 - 蓝色到紫色 */}
                <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                </linearGradient>
                {/* 页面浏览渐变 - 紫色到粉色 */}
                <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <YAxis 
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  color: '#fff'
                }}
                labelStyle={{ color: '#fff' }}
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value, name) => [
                  value,
                  name === 'visitors' 
                    ? (locale === "en" ? "Visitors" : "访客")
                    : (locale === "en" ? "Page Views" : "页面浏览")
                ]}
              />
              <Bar 
                dataKey="visitors" 
                fill="url(#visitorsGradient)" 
                radius={[4, 4, 0, 0]}
                name="visitors"
              />
              <Bar 
                dataKey="pageViews" 
                fill="url(#pageViewsGradient)" 
                radius={[4, 4, 0, 0]}
                name="pageViews"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}