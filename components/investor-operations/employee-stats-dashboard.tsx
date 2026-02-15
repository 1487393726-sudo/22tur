'use client';

/**
 * 员工统计仪表板
 * Employee Stats Dashboard Component
 * 
 * 展示员工统计、岗位分布、人员流动分析
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Briefcase,
  Building2,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { 
  EmployeeStats, 
  TurnoverAnalysis,
  ProjectEmployee,
  EmployeeStatus,
  TenureCategory
} from '@/types/investor-operations-monitoring';

interface EmployeeStatsDashboardProps {
  projectId: string;
  projectName?: string;
}

export function EmployeeStatsDashboard({
  projectId,
  projectName
}: EmployeeStatsDashboardProps) {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [turnover, setTurnover] = useState<TurnoverAnalysis | null>(null);
  const [employees, setEmployees] = useState<ProjectEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 加载数据
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 并行加载统计和流动分析数据
      const [statsRes, turnoverRes, employeesRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/employees/stats`),
        fetch(`/api/projects/${projectId}/employees/turnover`),
        fetch(`/api/projects/${projectId}/employees?pageSize=100`)
      ]);

      if (!statsRes.ok || !turnoverRes.ok || !employeesRes.ok) {
        throw new Error('获取员工数据失败');
      }

      const [statsResult, turnoverResult, employeesResult] = await Promise.all([
        statsRes.json(),
        turnoverRes.json(),
        employeesRes.json()
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }
      if (turnoverResult.success) {
        setTurnover(turnoverResult.data);
      }
      if (employeesResult.success) {
        setEmployees(employeesResult.data.employees);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取员工数据失败');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 获取工龄标签颜色
  const getTenureColor = (tenure: TenureCategory) => {
    switch (tenure) {
      case TenureCategory.NEW:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case TenureCategory.REGULAR:
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case TenureCategory.SENIOR:
        return 'bg-purple-500/20 text-white400 border-purple-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case EmployeeStatus.RESIGNED:
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case EmployeeStatus.ON_LEAVE:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // 获取工龄中文名
  const getTenureName = (tenure: TenureCategory) => {
    switch (tenure) {
      case TenureCategory.NEW: return '新员工';
      case TenureCategory.REGULAR: return '普通员工';
      case TenureCategory.SENIOR: return '老员工';
      default: return tenure;
    }
  };

  // 获取状态中文名
  const getStatusName = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: return '在职';
      case EmployeeStatus.RESIGNED: return '离职';
      case EmployeeStatus.ON_LEAVE: return '休假';
      default: return status;
    }
  };

  // 过滤员工列表
  const filteredEmployees = employees.filter(e => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-white400" />
          <span className="ml-3 text-gray-400">加载员工数据中...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-900/20 to-purple-900/20 border-red-500/30">
        <CardContent className="flex items-center justify-center py-12">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <span className="ml-3 text-red-400">{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="ml-4 border-red-500/50"
          >
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {projectName ? `${projectName} - ` : ''}员工透明化
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            查看项目员工信息和人员流动分析
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={loadData}
          className="border-purple-500/50"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 总人数 */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">总人数</p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats?.totalCount || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  在职 {stats?.activeCount || 0} 人
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 入职人数 */}
        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">近期入职</p>
                <p className="text-2xl font-bold text-green-400">
                  {turnover?.hiredCount || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  最近12个月
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <UserPlus className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 离职人数 */}
        <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/20 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">近期离职</p>
                <p className="text-2xl font-bold text-red-400">
                  {turnover?.resignedCount || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  最近12个月
                </p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-full">
                <UserMinus className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 流动率 */}
        <Card className={`bg-gradient-to-br ${
          (turnover?.turnoverRate || 0) > 20 
            ? 'from-orange-900/30 to-red-900/20 border-orange-500/30' 
            : 'from-purple-900/30 to-violet-900/20 border-purple-500/30'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">流动率</p>
                <p className={`text-2xl font-bold ${
                  (turnover?.turnoverRate || 0) > 20 ? 'text-orange-400' : 'text-white400'
                }`}>
                  {turnover?.turnoverRate?.toFixed(1) || 0}%
                </p>
                <div className="flex items-center mt-1">
                  {(turnover?.turnoverRate || 0) > 20 ? (
                    <TrendingUp className="h-3 w-3 text-orange-400 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-green-400 mr-1" />
                  )}
                  <span className="text-xs text-gray-500">
                    {(turnover?.turnoverRate || 0) > 20 ? '偏高' : '正常'}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                (turnover?.turnoverRate || 0) > 20 ? 'bg-orange-500/20' : 'bg-purple-500/20'
              }`}>
                <Clock className={`h-6 w-6 ${
                  (turnover?.turnoverRate || 0) > 20 ? 'text-orange-400' : 'text-white400'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分布图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 岗位分布 */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-white400" />
              岗位分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.positionDistribution && stats.positionDistribution.length > 0 ? (
              <div className="space-y-3">
                {stats.positionDistribution.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{item.position}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ 
                            width: `${(item.count / stats.totalCount) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-white400 min-w-[40px] text-right">
                        {item.count}人
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>暂无岗位数据</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 工龄分布 */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-white400" />
              工龄分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.tenureDistribution && stats.tenureDistribution.length > 0 ? (
              <div className="space-y-4">
                {stats.tenureDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={getTenureColor(item.tenure)}
                      >
                        {getTenureName(item.tenure)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.tenure === TenureCategory.NEW ? 'bg-blue-500' :
                            item.tenure === TenureCategory.REGULAR ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}
                          style={{ 
                            width: `${stats.totalCount > 0 ? (item.count / stats.totalCount) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 min-w-[60px] text-right">
                        {item.count}人 ({stats.totalCount > 0 ? ((item.count / stats.totalCount) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>暂无工龄数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 员工列表 */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-white400" />
              员工列表
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-gray-800/50 border-purple-500/30">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value={EmployeeStatus.ACTIVE}>在职</SelectItem>
                <SelectItem value={EmployeeStatus.RESIGNED}>离职</SelectItem>
                <SelectItem value={EmployeeStatus.ON_LEAVE}>休假</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-white400 font-medium">
                        {employee.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{employee.name}</p>
                      <p className="text-xs text-gray-400">{employee.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getTenureColor(employee.tenure)}
                    >
                      {getTenureName(employee.tenure)}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(employee.status)}
                    >
                      {getStatusName(employee.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>暂无员工数据</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 月度流动趋势 */}
      {turnover?.monthlyTurnover && turnover.monthlyTurnover.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-white400" />
              月度人员流动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {turnover.monthlyTurnover.slice(-6).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                >
                  <span className="text-sm text-gray-400">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <UserPlus className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">+{item.hired}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserMinus className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-red-400">-{item.resigned}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`min-w-[60px] justify-center ${
                        item.rate > 10 
                          ? 'border-orange-500/50 text-orange-400' 
                          : 'border-green-500/50 text-green-400'
                      }`}
                    >
                      {item.rate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EmployeeStatsDashboard;
