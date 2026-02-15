// 访客追踪系统
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface VisitorStats {
  dailyVisitors: number;
  onlineUsers: number;
  totalPageViews: number;
  uniqueVisitors: number;
  lastUpdated: Date;
}

export interface VisitorSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
  city?: string;
  firstVisit: Date;
  lastActivity: Date;
  pageViews: number;
  isOnline: boolean;
}

export class VisitorTracker {
  private static instance: VisitorTracker;
  private onlineThreshold = 5 * 60 * 1000; // 5分钟内活跃算在线

  static getInstance(): VisitorTracker {
    if (!VisitorTracker.instance) {
      VisitorTracker.instance = new VisitorTracker();
    }
    return VisitorTracker.instance;
  }

  // 记录访客访问
  async trackVisitor(ipAddress: string, userAgent: string, page: string): Promise<void> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // 获取访客地理位置信息（可选）
      const geoInfo = await this.getGeoLocation(ipAddress);

      // 查找或创建访客会话
      let visitor = await prisma.visitorSession.findFirst({
        where: {
          ipAddress,
          createdAt: {
            gte: today
          }
        }
      });

      if (visitor) {
        // 更新现有访客
        await prisma.visitorSession.update({
          where: { id: visitor.id },
          data: {
            lastActivity: now,
            pageViews: { increment: 1 },
            isOnline: true
          }
        });
      } else {
        // 创建新访客记录
        await prisma.visitorSession.create({
          data: {
            ipAddress,
            userAgent,
            country: geoInfo?.country,
            city: geoInfo?.city,
            firstVisit: now,
            lastActivity: now,
            pageViews: 1,
            isOnline: true
          }
        });
      }

      // 记录页面访问
      await prisma.pageView.create({
        data: {
          ipAddress,
          page,
          userAgent,
          timestamp: now,
          country: geoInfo?.country,
          city: geoInfo?.city
        }
      });

    } catch (error) {
      console.error('访客追踪错误:', error);
    }
  }

  // 获取当前统计数据
  async getStats(): Promise<VisitorStats> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const onlineThreshold = new Date(now.getTime() - this.onlineThreshold);

      // 今日访客数
      const dailyVisitors = await prisma.visitorSession.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      });

      // 在线用户数
      const onlineUsers = await prisma.visitorSession.count({
        where: {
          lastActivity: {
            gte: onlineThreshold
          },
          isOnline: true
        }
      });

      // 今日页面浏览量
      const totalPageViews = await prisma.pageView.count({
        where: {
          timestamp: {
            gte: today
          }
        }
      });

      // 今日独立访客数
      const uniqueVisitors = await prisma.visitorSession.count({
        where: {
          firstVisit: {
            gte: today
          }
        }
      });

      return {
        dailyVisitors,
        onlineUsers,
        totalPageViews,
        uniqueVisitors,
        lastUpdated: now
      };

    } catch (error) {
      console.error('获取统计数据错误:', error);
      return {
        dailyVisitors: 0,
        onlineUsers: 0,
        totalPageViews: 0,
        uniqueVisitors: 0,
        lastUpdated: new Date()
      };
    }
  }

  // 清理离线用户
  async cleanupOfflineUsers(): Promise<void> {
    try {
      const offlineThreshold = new Date(Date.now() - this.onlineThreshold);
      
      await prisma.visitorSession.updateMany({
        where: {
          lastActivity: {
            lt: offlineThreshold
          },
          isOnline: true
        },
        data: {
          isOnline: false
        }
      });
    } catch (error) {
      console.error('清理离线用户错误:', error);
    }
  }

  // 获取地理位置信息（简化版本）
  private async getGeoLocation(ipAddress: string): Promise<{country?: string, city?: string} | null> {
    try {
      // 这里可以集成第三方地理位置API，如ipapi.co, ipinfo.io等
      // 为了演示，返回模拟数据
      if (ipAddress.startsWith('127.') || ipAddress.startsWith('192.168.')) {
        return { country: 'Local', city: 'Local' };
      }
      
      // 实际项目中可以调用真实的地理位置API
      return { country: 'Unknown', city: 'Unknown' };
    } catch (error) {
      return null;
    }
  }

  // 获取历史统计数据
  async getHistoricalStats(days: number = 7): Promise<Array<{date: string, visitors: number, pageViews: number}>> {
    try {
      const stats = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        const visitors = await prisma.visitorSession.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        });

        const pageViews = await prisma.pageView.count({
          where: {
            timestamp: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        });

        stats.push({
          date: startOfDay.toISOString().split('T')[0],
          visitors,
          pageViews
        });
      }

      return stats;
    } catch (error) {
      console.error('获取历史统计错误:', error);
      return [];
    }
  }
}

export default VisitorTracker;