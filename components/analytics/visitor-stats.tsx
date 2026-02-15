"use client";

import { useState, useEffect } from "react";
import { Users, Eye, TrendingUp, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface VisitorStats {
  dailyVisitors: number;
  onlineUsers: number;
  totalPageViews: number;
  uniqueVisitors: number;
  lastUpdated: string;
}

export function VisitorStats() {
  const { locale } = useLanguage();
  const [stats, setStats] = useState<VisitorStats>({
    dailyVisitors: 0,
    onlineUsers: 0,
    totalPageViews: 0,
    uniqueVisitors: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/track');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 追踪当前页面访问
  const trackPageView = async () => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: window.location.pathname
        })
      });
    } catch (error) {
      console.error('页面追踪失败:', error);
    }
  };

  useEffect(() => {
    // 初始加载
    trackPageView();
    fetchStats();

    // 定期更新统计数据（每30秒）
    const interval = setInterval(fetchStats, 30000);

    // 页面可见性变化时更新
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-white/20 border">
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-6 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      icon: <Users className="w-5 h-5" />,
      label: locale === "en" ? "Today's Visitors" : "今日访客",
      value: stats.dailyVisitors.toLocaleString(),
      color: "text-blue-500"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      label: locale === "en" ? "Online Now" : "当前在线",
      value: stats.onlineUsers.toLocaleString(),
      color: "text-green-500"
    },
    {
      icon: <Eye className="w-5 h-5" />,
      label: locale === "en" ? "Page Views" : "页面浏览",
      value: stats.totalPageViews.toLocaleString(),
      color: "text-white"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: locale === "en" ? "Unique Visitors" : "独立访客",
      value: stats.uniqueVisitors.toLocaleString(),
      color: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-white/20 border hover:bg-white/20 transition-colors duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-sm text-gray-300">
                {stat.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-300">
          {locale === "en" ? "Last updated" : "最后更新"}: {" "}
          {new Date(stats.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}