'use client';

/**
 * 项目生命周期追踪器组件
 * Project Lifecycle Tracker Component
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  Calendar,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ProjectPhase, MilestoneStatus } from '@/types/investor-operations-monitoring';

interface Milestone {
  id: string;
  name: string;
  description?: string;
  expectedDate: string;
  completedDate?: string;
  status: MilestoneStatus;
}

interface Delay {
  id: string;
  delayDays: number;
  reason: string;
  newExpectedDate: string;
  recordedAt: string;
}

interface PhaseData {
  id: string;
  phase: ProjectPhase;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  progress: number;
  notes?: string;
  milestoneCount: number;
  completedMilestones: number;
  delayCount: number;
  totalDelayDays: number;
  milestones: Milestone[];
  delays: Delay[];
}

interface TimelineData {
  projectId: string;
  currentPhase: ProjectPhase;
  overallProgress: number;
  estimatedCompletionDate?: string;
  phases: PhaseData[];
}

interface ProjectLifecycleTrackerProps {
  projectId: string;
  onPhaseChange?: (phase: ProjectPhase) => void;
}

const PHASE_LABELS: Record<ProjectPhase, string> = {
  [ProjectPhase.DESIGN]: '设计阶段',
  [ProjectPhase.RENOVATION]: '装修阶段',
  [ProjectPhase.PRE_OPENING]: '开业准备',
  [ProjectPhase.OPERATING]: '正式运营'
};

const PHASE_COLORS: Record<ProjectPhase, string> = {
  [ProjectPhase.DESIGN]: 'bg-blue-500',
  [ProjectPhase.RENOVATION]: 'bg-yellow-500',
  [ProjectPhase.PRE_OPENING]: 'bg-purple-500',
  [ProjectPhase.OPERATING]: 'bg-green-500'
};

const PHASE_ORDER = [
  ProjectPhase.DESIGN,
  ProjectPhase.RENOVATION,
  ProjectPhase.PRE_OPENING,
  ProjectPhase.OPERATING
];

export function ProjectLifecycleTracker({ projectId, onPhaseChange }: ProjectLifecycleTrackerProps) {
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeline();
  }, [projectId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/timeline`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取时间线失败');
      }
      
      setTimeline(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取时间线失败');
    } finally {
      setLoading(false);
    }
  };

  const getPhaseStatus = (phase: ProjectPhase): 'completed' | 'current' | 'upcoming' => {
    if (!timeline) return 'upcoming';
    
    const currentIndex = PHASE_ORDER.indexOf(timeline.currentPhase);
    const phaseIndex = PHASE_ORDER.indexOf(phase);
    
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <p className="text-white/60">暂无生命周期数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 整体进度概览 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">项目生命周期</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${PHASE_COLORS[timeline.currentPhase]} text-white`}>
            {PHASE_LABELS[timeline.currentPhase]}
          </span>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>整体进度</span>
            <span>{timeline.overallProgress}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${timeline.overallProgress}%` }}
            />
          </div>
        </div>

        {/* 预计完成日期 */}
        {timeline.estimatedCompletionDate && (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Calendar className="w-4 h-4" />
            <span>预计完成: {formatDate(timeline.estimatedCompletionDate)}</span>
          </div>
        )}
      </div>

      {/* 阶段时间线 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6">阶段时间线</h3>
        
        <div className="relative">
          {/* 连接线 */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />
          
          {PHASE_ORDER.map((phase, index) => {
            const status = getPhaseStatus(phase);
            const phaseData = timeline.phases.find(p => p.phase === phase);
            const isExpanded = expandedPhase === phase;
            
            return (
              <div key={phase} className="relative pl-16 pb-8 last:pb-0">
                {/* 阶段图标 */}
                <div className={`absolute left-3 w-6 h-6 rounded-full flex items-center justify-center
                  ${status === 'completed' ? 'bg-green-500' : 
                    status === 'current' ? PHASE_COLORS[phase] : 'bg-white/20'}`}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : status === 'current' ? (
                    <Clock className="w-4 h-4 text-white animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-white/40 rounded-full" />
                  )}
                </div>

                {/* 阶段内容 */}
                <div 
                  className={`bg-white/5 rounded-lg p-4 cursor-pointer transition-all
                    ${status === 'current' ? 'ring-2 ring-purple-500/50' : ''}
                    hover:bg-white/10`}
                  onClick={() => setExpandedPhase(isExpanded ? null : phase)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${status === 'upcoming' ? 'text-white/40' : 'text-white'}`}>
                        {PHASE_LABELS[phase]}
                      </span>
                      {phaseData && phaseData.delayCount > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          延期 {phaseData.totalDelayDays} 天
                        </span>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>

                  {phaseData && (
                    <div className="mt-2 flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(phaseData.startDate)}
                      </span>
                      <span>→</span>
                      <span>{formatDate(phaseData.expectedEndDate)}</span>
                      {status === 'current' && (
                        <span className="ml-auto text-white400">
                          进度: {phaseData.progress}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* 展开的详细信息 */}
                  {isExpanded && phaseData && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                      {/* 里程碑列表 */}
                      {phaseData.milestones.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            里程碑 ({phaseData.completedMilestones}/{phaseData.milestoneCount})
                          </h4>
                          <div className="space-y-2">
                            {phaseData.milestones.map(milestone => (
                              <div 
                                key={milestone.id}
                                className="flex items-center justify-between text-sm bg-white/5 rounded p-2"
                              >
                                <div className="flex items-center gap-2">
                                  {milestone.status === 'COMPLETED' ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  ) : milestone.status === 'DELAYED' ? (
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-white/40" />
                                  )}
                                  <span className={milestone.status === 'COMPLETED' ? 'text-white/60 line-through' : 'text-white'}>
                                    {milestone.name}
                                  </span>
                                </div>
                                <span className="text-white/40 text-xs">
                                  {formatDate(milestone.expectedDate)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 延期记录 */}
                      {phaseData.delays.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-yellow-400/80 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            延期记录
                          </h4>
                          <div className="space-y-2">
                            {phaseData.delays.map(delay => (
                              <div 
                                key={delay.id}
                                className="text-sm bg-yellow-500/10 rounded p-2 border border-yellow-500/20"
                              >
                                <div className="flex justify-between text-yellow-400">
                                  <span>延期 {delay.delayDays} 天</span>
                                  <span className="text-xs">{formatDate(delay.recordedAt)}</span>
                                </div>
                                <p className="text-white/60 text-xs mt-1">{delay.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 备注 */}
                      {phaseData.notes && (
                        <div className="text-sm text-white/60 bg-white/5 rounded p-2">
                          <span className="text-white/40">备注: </span>
                          {phaseData.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="整体进度"
          value={`${timeline.overallProgress}%`}
          color="purple"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="里程碑"
          value={`${timeline.phases.reduce((sum, p) => sum + p.completedMilestones, 0)}/${timeline.phases.reduce((sum, p) => sum + p.milestoneCount, 0)}`}
          color="blue"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="当前阶段"
          value={PHASE_LABELS[timeline.currentPhase]}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="总延期"
          value={`${timeline.phases.reduce((sum, p) => sum + p.totalDelayDays, 0)} 天`}
          color="yellow"
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'purple' | 'blue' | 'green' | 'yellow';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-white400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-white/60">{label}</span>
      </div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

export default ProjectLifecycleTracker;
