'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Lock,
  Eye,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

interface ScanResult {
  id: string;
  name: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  progress: number;
  issues: number;
  startTime: string;
  endTime?: string;
}

export default function SecurityScanPage() {
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([
    {
      id: '1',
      name: '恶意软件检测',
      status: 'completed',
      progress: 100,
      issues: 0,
      startTime: '2024-01-15 10:00:00',
      endTime: '2024-01-15 10:15:00',
    },
    {
      id: '2',
      name: '漏洞扫描',
      status: 'completed',
      progress: 100,
      issues: 2,
      startTime: '2024-01-15 10:15:00',
      endTime: '2024-01-15 10:30:00',
    },
    {
      id: '3',
      name: '配置审计',
      status: 'completed',
      progress: 100,
      issues: 1,
      startTime: '2024-01-15 10:30:00',
      endTime: '2024-01-15 10:45:00',
    },
  ]);

  const handleStartScan = async () => {
    setScanning(true);
    toast.loading('开始安全扫描...');

    try {
      // 模拟扫描过程
      for (let i = 0; i <= 100; i += 10) {
        setScanResults((prev) =>
          prev.map((result) =>
            result.id === '1'
              ? { ...result, progress: i, status: i === 100 ? 'completed' : 'scanning' }
              : result
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast.success('安全扫描完成');
    } catch (error) {
      toast.error('扫描失败');
    } finally {
      setScanning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'scanning':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* 扫描控制 */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            安全扫描
          </CardTitle>
          <CardDescription className="text-gray-300">
            定期扫描系统安全漏洞和威胁
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-300">上次扫描</p>
              <p className="text-white font-medium">2024-01-15 10:45:00</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-300">发现问题</p>
              <p className="text-white font-medium">3 个</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-300">已修复</p>
              <p className="text-white font-medium">2 个</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-300">安全评分</p>
              <p className="text-white font-medium">92/100</p>
            </div>
          </div>

          <Button
            onClick={handleStartScan}
            disabled={scanning}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                扫描中...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                立即扫描
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 扫描结果 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">扫描结果</h2>
        {scanResults.map((result) => (
          <Card key={result.id} className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="text-white font-medium">{result.name}</p>
                      <p className="text-sm text-gray-400">
                        {result.startTime} - {result.endTime || '进行中'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      result.issues === 0
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }
                  >
                    {result.issues} 个问题
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">进度</span>
                    <span className="text-white">{result.progress}%</span>
                  </div>
                  <Progress value={result.progress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DDoS 防护 */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5" />
            DDoS 防护配置
          </CardTitle>
          <CardDescription className="text-gray-300">
            配置和管理 DDoS 防护策略
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 防护状态 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">防护状态</p>
                <Badge className="bg-green-500/20 text-green-300">✓ 已启用</Badge>
              </div>
              <p className="text-2xl font-bold text-white">100%</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">当前请求速率</p>
                <Lock className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">1,234</p>
              <p className="text-xs text-gray-300">req/s</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">已阻止请求</p>
                <Eye className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">45</p>
              <p className="text-xs text-gray-300">今天</p>
            </div>
          </div>

          {/* 防护规则 */}
          <div className="space-y-3">
            <h3 className="text-white font-medium">防护规则</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white text-sm font-medium">速率限制</p>
                  <p className="text-xs text-gray-300">限制每个 IP 的请求速率</p>
                </div>
                <Badge className="bg-green-500/20 text-green-300">已启用</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white text-sm font-medium">地理位置过滤</p>
                  <p className="text-xs text-gray-300">阻止来自特定地区的请求</p>
                </div>
                <Badge className="bg-green-500/20 text-green-300">已启用</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white text-sm font-medium">IP 黑名单</p>
                  <p className="text-xs text-gray-300">阻止已知恶意 IP</p>
                </div>
                <Badge className="bg-green-500/20 text-green-300">已启用</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white text-sm font-medium">验证码挑战</p>
                  <p className="text-xs text-gray-300">可疑请求需要验证</p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300">已禁用</Badge>
              </div>
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Settings className="h-4 w-4 mr-2" />
            高级配置
          </Button>
        </CardContent>
      </Card>

      {/* 攻击日志 */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">最近的攻击</CardTitle>
          <CardDescription className="text-gray-300">过去 24 小时内检测到的攻击</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '14:30', type: 'SYN Flood', source: '192.168.1.100', blocked: true },
              { time: '13:45', type: 'HTTP Flood', source: '10.0.0.50', blocked: true },
              { time: '12:20', type: 'DNS Amplification', source: '172.16.0.1', blocked: true },
              { time: '11:15', type: 'UDP Flood', source: '203.0.113.45', blocked: true },
            ].map((attack, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <p className="text-white text-sm font-medium">{attack.type}</p>
                  <p className="text-xs text-gray-300">{attack.source}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-300">{attack.time}</span>
                  {attack.blocked && (
                    <Badge className="bg-green-500/20 text-green-300">已阻止</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
