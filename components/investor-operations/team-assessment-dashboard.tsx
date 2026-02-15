/**
 * 团队能力评估仪表板组件
 * Team Assessment Dashboard Component
 * 
 * 展示团队能力评估、能力雷达图、个人评估详情和评估趋势
 * 需求: 7.1, 7.2, 7.4
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  TeamAssessment,
  PerformanceAssessment,
  AssessmentTrend,
  LossAlert
} from '@/types/investor-operations-monitoring';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Target,
  Brain,
  MessageSquare,
  Lightbulb,
  Heart,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

interface TeamAssessmentDashboardProps {
  projectId: string;
  projectName?: string;
}

export function TeamAssessmentDashboard({
  projectId,
  projectName
}: TeamAssessmentDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamAssessment, setTeamAssessment] = useState<TeamAssessment | null>(null);
  const [alerts, setAlerts] = useState<LossAlert[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employeeTrend, setEmployeeTrend] = useState<AssessmentTrend | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAssessmentData();
  }, [projectId]);

  const fetchAssessmentData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [teamRes, alertsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/assessments/team`),
        fetch(`/api/projects/${projectId}/assessments/alerts`)
      ]);

      if (!teamRes.ok || !alertsRes.ok) {
        throw new Error('获取评估数据失败');
      }

      const [teamData, alertsData] = await Promise.all([
        teamRes.json(),
        alertsRes.json()
      ]);

      setTeamAssessment(teamData.data);
      setAlerts(alertsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeTrend = async (employeeId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/employees/${employeeId}/assessments/trend`
      );
      if (res.ok) {
        const data = await res.json();
        setEmployeeTrend(data.data);
      }
    } catch (err) {
      console.error('获取员工趋势失败:', err);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    fetchEmployeeTrend(employeeId);
  };

  if (loading) {
    return <AssessmentDashboardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">能力评估</h2>
          {projectName && (
            <p className="text-white200 mt-1">{projectName}</p>
          )}
        </div>
        <Badge variant="outline" className="text-white200 border-purple-400">
          <Users className="w-4 h-4 mr-1" />
          {teamAssessment?.employeeCount || 0} 名员工
        </Badge>
      </div>

      {/* 预警提示 */}
      {alerts.length > 0 && (
        <Alert className="bg-yellow-900/30 border-yellow-600/50">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            发现 {alerts.length} 条能力预警，请及时关注
          </AlertDescription>
        </Alert>
      )}

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ScoreCard
          title="综合评分"
          score={teamAssessment?.averageScores.overall || 0}
          icon={<Target className="h-5 w-5" />}
        />
        <ScoreCard
          title="专业技能"
          score={teamAssessment?.averageScores.professionalSkills || 0}
          icon={<Brain className="h-5 w-5" />}
        />
        <ScoreCard
          title="工作态度"
          score={teamAssessment?.averageScores.workAttitude || 0}
          icon={<Heart className="h-5 w-5" />}
        />
        <ScoreCard
          title="团队协作"
          score={teamAssessment?.averageScores.teamwork || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <ScoreCard
          title="问题解决"
          score={teamAssessment?.averageScores.problemSolving || 0}
          icon={<Lightbulb className="h-5 w-5" />}
        />
      </div>

      {/* 详细信息标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-purple-900/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            能力雷达
          </TabsTrigger>
          <TabsTrigger value="performers" className="data-[state=active]:bg-purple-600">
            员工表现
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-600">
            预警信息
          </TabsTrigger>
        </TabsList>

        {/* 能力雷达图 */}
        <TabsContent value="overview">
          <RadarChartCard assessment={teamAssessment} />
        </TabsContent>

        {/* 员工表现 */}
        <TabsContent value="performers">
          <PerformersCard
            topPerformers={teamAssessment?.topPerformers || []}
            needsImprovement={teamAssessment?.needsImprovement || []}
            onEmployeeSelect={handleEmployeeSelect}
          />
        </TabsContent>

        {/* 预警信息 */}
        <TabsContent value="alerts">
          <AlertsCard alerts={alerts} />
        </TabsContent>
      </Tabs>

      {/* 员工趋势对话框 */}
      {selectedEmployee && employeeTrend && (
        <EmployeeTrendDialog
          trend={employeeTrend}
          onClose={() => {
            setSelectedEmployee(null);
            setEmployeeTrend(null);
          }}
        />
      )}
    </div>
  );
}

// 评分卡片组件
function ScoreCard({
  title,
  score,
  icon
}: {
  title: string;
  score: number;
  icon: React.ReactNode;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-white200">
          {title}
        </CardTitle>
        <div className="text-white400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </div>
        <div className="h-2 bg-purple-900/50 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// 能力雷达图卡片（简化版，使用进度条代替）
function RadarChartCard({ assessment }: { assessment: TeamAssessment | null }) {
  if (!assessment) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
        <CardContent className="pt-6">
          <p className="text-center text-white300">暂无评估数据</p>
        </CardContent>
      </Card>
    );
  }

  const dimensions = [
    { label: '专业技能', value: assessment.averageScores.professionalSkills, color: 'bg-blue-500' },
    { label: '工作态度', value: assessment.averageScores.workAttitude, color: 'bg-green-500' },
    { label: '团队协作', value: assessment.averageScores.teamwork, color: 'bg-yellow-500' },
    { label: '沟通能力', value: assessment.averageScores.communication, color: 'bg-orange-500' },
    { label: '问题解决', value: assessment.averageScores.problemSolving, color: 'bg-purple-500' }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-white400" />
          团队能力分析
        </CardTitle>
        <CardDescription className="text-white300">
          评估周期: {assessment.assessmentPeriod}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dimensions.map((dim) => (
          <div key={dim.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white200">{dim.label}</span>
              <span className="text-white font-medium">{dim.value.toFixed(1)} / 10</span>
            </div>
            <div className="h-3 bg-purple-900/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${dim.color} transition-all duration-500`}
                style={{ width: `${(dim.value / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-purple-700/50">
          <div className="flex justify-between items-center">
            <span className="text-white200 font-medium">团队综合评分</span>
            <span className="text-2xl font-bold text-white">
              {assessment.averageScores.overall.toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 员工表现卡片
function PerformersCard({
  topPerformers,
  needsImprovement,
  onEmployeeSelect
}: {
  topPerformers: { employeeId: string; name: string; score: number }[];
  needsImprovement: { employeeId: string; name: string; score: number }[];
  onEmployeeSelect: (employeeId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 优秀员工 */}
      <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            优秀员工
          </CardTitle>
          <CardDescription className="text-white300">
            表现最佳的团队成员
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topPerformers.length === 0 ? (
            <p className="text-white300 text-center py-4">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div
                  key={performer.employeeId}
                  className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg cursor-pointer hover:bg-purple-900/50 transition-colors"
                  onClick={() => onEmployeeSelect(performer.employeeId)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                    }`}>
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-white">{performer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">{performer.score.toFixed(1)}</span>
                    <ChevronRight className="h-4 w-4 text-white400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 需要关注 */}
      <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            需要关注
          </CardTitle>
          <CardDescription className="text-white300">
            需要培训和支持的成员
          </CardDescription>
        </CardHeader>
        <CardContent>
          {needsImprovement.length === 0 ? (
            <p className="text-green-400 text-center py-4">
              <TrendingUp className="h-5 w-5 inline mr-2" />
              所有员工表现良好
            </p>
          ) : (
            <div className="space-y-3">
              {needsImprovement.map((employee) => (
                <div
                  key={employee.employeeId}
                  className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-900/30 transition-colors"
                  onClick={() => onEmployeeSelect(employee.employeeId)}
                >
                  <span className="text-white">{employee.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">{employee.score.toFixed(1)}</span>
                    <ChevronRight className="h-4 w-4 text-white400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 预警信息卡片
function AlertsCard({ alerts }: { alerts: LossAlert[] }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          能力预警
        </CardTitle>
        <CardDescription className="text-white300">
          需要关注的能力问题
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-green-400 text-center py-4">
            暂无预警信息
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-purple-900/30 rounded-lg border-l-4"
                style={{ borderLeftColor: getSeverityColor(alert.severity).replace('bg-', '') }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-medium">{alert.title}</h4>
                    <p className="text-white300 text-sm mt-1">{alert.message}</p>
                  </div>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 员工趋势对话框
function EmployeeTrendDialog({
  trend,
  onClose
}: {
  trend: AssessmentTrend;
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-purple-900 border-purple-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">评估趋势</DialogTitle>
          <DialogDescription className="text-white300">
            员工历史评估数据
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {trend.periods.length === 0 ? (
            <p className="text-white300 text-center py-4">暂无历史评估数据</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-purple-700/50">
                  <TableHead className="text-white200">周期</TableHead>
                  <TableHead className="text-white200 text-right">专业技能</TableHead>
                  <TableHead className="text-white200 text-right">工作态度</TableHead>
                  <TableHead className="text-white200 text-right">团队协作</TableHead>
                  <TableHead className="text-white200 text-right">综合评分</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trend.periods.map((period, index) => (
                  <TableRow key={period} className="border-purple-700/50">
                    <TableCell className="text-white">{period}</TableCell>
                    <TableCell className="text-right text-white200">
                      {trend.scores.professionalSkills[index]}
                    </TableCell>
                    <TableCell className="text-right text-white200">
                      {trend.scores.workAttitude[index]}
                    </TableCell>
                    <TableCell className="text-right text-white200">
                      {trend.scores.teamwork[index]}
                    </TableCell>
                    <TableCell className="text-right text-white font-medium">
                      {trend.scores.overall[index].toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 加载骨架屏
function AssessmentDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-purple-800/50" />
        <Skeleton className="h-6 w-24 bg-purple-800/50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-purple-900/40 border-purple-700/50">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20 bg-purple-800/50" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-16 bg-purple-800/50" />
              <Skeleton className="h-2 w-full mt-2 bg-purple-800/50" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-purple-900/40 border-purple-700/50">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-purple-800/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full bg-purple-800/50" />
                <Skeleton className="h-3 w-full bg-purple-800/50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeamAssessmentDashboard;
