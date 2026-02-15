/**
 * AI 助手报告生成器
 * 自动生成项目总结报告，支持多种格式导出
 */

import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ReportData {
  projectId: string;
  projectName: string;
  summary: string;
  tasks: TaskSummary[];
  risks: RiskSummary[];
  recommendations: RecommendationSummary[];
  timeline: TimelineSummary[];
  resources: ResourceSummary[];
  metrics: ProjectMetrics;
}

export interface TaskSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: string;
  dueDate?: Date;
  completedAt?: Date;
  progress: number;
}

export interface RiskSummary {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  impact: string;
  mitigation: string;
  status: string;
}

export interface RecommendationSummary {
  id: string;
  title: string;
  type: string;
  priority: string;
  description: string;
  expectedImpact: string;
  status: string;
  appliedAt?: Date;
}

export interface TimelineSummary {
  date: Date;
  event: string;
  type: 'MILESTONE' | 'TASK' | 'RISK' | 'RECOMMENDATION';
  description: string;
}

export interface ResourceSummary {
  userId: string;
  name: string;
  role: string;
  utilization: number;
  tasksAssigned: number;
  tasksCompleted: number;
  efficiency: number;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  averageTaskDuration: number;
  totalRisks: number;
  highRisks: number;
  mitigatedRisks: number;
  totalRecommendations: number;
  appliedRecommendations: number;
  teamSize: number;
  averageUtilization: number;
  projectDuration: number;
  estimatedCompletion: Date;
  budgetUtilization?: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  format: 'TEXT' | 'HTML' | 'PDF';
  isDefault: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'SUMMARY' | 'TASKS' | 'RISKS' | 'RECOMMENDATIONS' | 'TIMELINE' | 'RESOURCES' | 'METRICS' | 'CHARTS';
  order: number;
  config: Record<string, any>;
}

/**
 * 生成项目报告数据
 */
export async function generateReportData(projectId: string): Promise<ReportData> {
  try {
    // 获取项目基本信息
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            assignee: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        client: true,
        department: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // 获取 AI 建议
    const recommendations = await prisma.recommendation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    // 生成任务摘要
    const taskSummaries: TaskSummary[] = project.tasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?.firstName + ' ' + task.assignee?.lastName,
      dueDate: task.dueDate || undefined,
      progress: calculateTaskProgress(task.status),
    }));

    // 生成风险摘要（模拟数据，实际应从风险分析结果获取）
    const riskSummaries: RiskSummary[] = await generateRiskSummaries(projectId);

    // 生成建议摘要
    const recommendationSummaries: RecommendationSummary[] = recommendations.map(rec => ({
      id: rec.id,
      title: rec.title,
      type: rec.type,
      priority: rec.priority,
      description: rec.description,
      expectedImpact: rec.expectedBenefit || 'Medium',
      status: rec.status,
      appliedAt: rec.appliedAt || undefined,
    }));

    // 生成时间线
    const timeline: TimelineSummary[] = await generateTimeline(projectId);

    // 生成资源摘要
    const resourceSummaries: ResourceSummary[] = project.members.map(member => ({
      userId: member.user.id,
      name: `${member.user.firstName} ${member.user.lastName}`,
      role: member.role,
      utilization: calculateUtilization(member.user.id, projectId),
      tasksAssigned: project.tasks.filter(t => t.assigneeId === member.user.id).length,
      tasksCompleted: project.tasks.filter(t => t.assigneeId === member.user.id && t.status === 'COMPLETED').length,
      efficiency: calculateEfficiency(member.user.id, projectId),
    }));

    // 计算项目指标
    const metrics: ProjectMetrics = {
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter(t => t.status === 'COMPLETED').length,
      completionRate: project.tasks.length > 0 ? 
        (project.tasks.filter(t => t.status === 'COMPLETED').length / project.tasks.length) * 100 : 0,
      overdueTasks: project.tasks.filter(t => 
        t.dueDate && t.dueDate < new Date() && t.status !== 'COMPLETED'
      ).length,
      averageTaskDuration: calculateAverageTaskDuration(project.tasks),
      totalRisks: riskSummaries.length,
      highRisks: riskSummaries.filter(r => r.severity === 'HIGH' || r.severity === 'CRITICAL').length,
      mitigatedRisks: riskSummaries.filter(r => r.status === 'MITIGATED').length,
      totalRecommendations: recommendations.length,
      appliedRecommendations: recommendations.filter(r => r.status === 'APPLIED').length,
      teamSize: project.members.length,
      averageUtilization: resourceSummaries.reduce((sum, r) => sum + r.utilization, 0) / resourceSummaries.length || 0,
      projectDuration: calculateProjectDuration(project.startDate || undefined, project.endDate || undefined),
      estimatedCompletion: estimateProjectCompletion(project),
    };

    return {
      projectId: project.id,
      projectName: project.name,
      summary: await generateProjectSummary(project, metrics),
      tasks: taskSummaries,
      risks: riskSummaries,
      recommendations: recommendationSummaries,
      timeline,
      resources: resourceSummaries,
      metrics,
    };
  } catch (error) {
    console.error('Error generating report data:', error);
    throw new Error('Failed to generate report data');
  }
}

/**
 * 生成文本格式报告
 */
export async function generateTextReport(reportData: ReportData): Promise<string> {
  const lines: string[] = [];
  
  // 标题
  lines.push(`项目报告: ${reportData.projectName}`);
  lines.push('='.repeat(50));
  lines.push('');
  
  // 项目摘要
  lines.push('项目摘要');
  lines.push('-'.repeat(20));
  lines.push(reportData.summary);
  lines.push('');
  
  // 关键指标
  lines.push('关键指标');
  lines.push('-'.repeat(20));
  lines.push(`总任务数: ${reportData.metrics.totalTasks}`);
  lines.push(`已完成任务: ${reportData.metrics.completedTasks}`);
  lines.push(`完成率: ${reportData.metrics.completionRate.toFixed(1)}%`);
  lines.push(`逾期任务: ${reportData.metrics.overdueTasks}`);
  lines.push(`团队规模: ${reportData.metrics.teamSize}`);
  lines.push(`平均利用率: ${reportData.metrics.averageUtilization.toFixed(1)}%`);
  lines.push('');
  
  // 任务状态
  lines.push('任务状态');
  lines.push('-'.repeat(20));
  reportData.tasks.forEach(task => {
    lines.push(`- ${task.title} (${task.status}) - ${task.assignee || '未分配'}`);
  });
  lines.push('');
  
  // 风险分析
  lines.push('风险分析');
  lines.push('-'.repeat(20));
  reportData.risks.forEach(risk => {
    lines.push(`- ${risk.title} (${risk.severity}) - ${risk.mitigation}`);
  });
  lines.push('');
  
  // AI 建议
  lines.push('AI 建议');
  lines.push('-'.repeat(20));
  reportData.recommendations.forEach(rec => {
    lines.push(`- ${rec.title} (${rec.status}) - ${rec.description}`);
  });
  lines.push('');
  
  // 团队资源
  lines.push('团队资源');
  lines.push('-'.repeat(20));
  reportData.resources.forEach(resource => {
    lines.push(`- ${resource.name} (${resource.role}) - 利用率: ${resource.utilization.toFixed(1)}%`);
  });
  
  return lines.join('\n');
}

/**
 * 生成 HTML 格式报告
 */
export async function generateHTMLReport(reportData: ReportData): Promise<string> {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>项目报告 - ${reportData.projectName}</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #1e40af; }
        .metric-label { color: #64748b; margin-top: 5px; }
        .task-list, .risk-list, .rec-list { list-style: none; padding: 0; }
        .task-item, .risk-item, .rec-item { background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 6px; }
        .status-completed { border-left: 4px solid #10b981; }
        .status-in-progress { border-left: 4px solid #f59e0b; }
        .status-todo { border-left: 4px solid #6b7280; }
        .risk-high { border-left: 4px solid #ef4444; }
        .risk-medium { border-left: 4px solid #f59e0b; }
        .risk-low { border-left: 4px solid #10b981; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        .table th { background: #f8fafc; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>项目报告</h1>
        <h2>${reportData.projectName}</h2>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>

    <div class="section">
        <h2>项目摘要</h2>
        <p>${reportData.summary}</p>
    </div>

    <div class="section">
        <h2>关键指标</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${reportData.metrics.totalTasks}</div>
                <div class="metric-label">总任务数</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.metrics.completionRate.toFixed(1)}%</div>
                <div class="metric-label">完成率</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.metrics.overdueTasks}</div>
                <div class="metric-label">逾期任务</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.metrics.teamSize}</div>
                <div class="metric-label">团队规模</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>任务状态</h2>
        <ul class="task-list">
            ${reportData.tasks.map(task => `
                <li class="task-item status-${task.status.toLowerCase().replace('_', '-')}">
                    <strong>${task.title}</strong>
                    <div>状态: ${task.status} | 优先级: ${task.priority} | 负责人: ${task.assignee || '未分配'}</div>
                    ${task.dueDate ? `<div>截止日期: ${task.dueDate.toLocaleDateString('zh-CN')}</div>` : ''}
                </li>
            `).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>风险分析</h2>
        <ul class="risk-list">
            ${reportData.risks.map(risk => `
                <li class="risk-item risk-${risk.severity.toLowerCase()}">
                    <strong>${risk.title}</strong>
                    <div>严重程度: ${risk.severity} | 概率: ${(risk.probability * 100).toFixed(0)}%</div>
                    <div>影响: ${risk.impact}</div>
                    <div>缓解措施: ${risk.mitigation}</div>
                </li>
            `).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>AI 建议</h2>
        <ul class="rec-list">
            ${reportData.recommendations.map(rec => `
                <li class="rec-item">
                    <strong>${rec.title}</strong>
                    <div>类型: ${rec.type} | 优先级: ${rec.priority} | 状态: ${rec.status}</div>
                    <div>${rec.description}</div>
                    <div>预期影响: ${rec.expectedImpact}</div>
                </li>
            `).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>团队资源</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>姓名</th>
                    <th>角色</th>
                    <th>分配任务</th>
                    <th>完成任务</th>
                    <th>利用率</th>
                    <th>效率</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.resources.map(resource => `
                    <tr>
                        <td>${resource.name}</td>
                        <td>${resource.role}</td>
                        <td>${resource.tasksAssigned}</td>
                        <td>${resource.tasksCompleted}</td>
                        <td>${resource.utilization.toFixed(1)}%</td>
                        <td>${resource.efficiency.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

  return html;
}

/**
 * 生成 PDF 格式报告
 */
export async function generatePDFReport(reportData: ReportData): Promise<Buffer> {
  const doc = new jsPDF();
  
  // 设置中文字体（需要额外配置）
  doc.setFont('helvetica');
  
  // 标题
  doc.setFontSize(20);
  doc.text(`Project Report: ${reportData.projectName}`, 20, 30);
  
  // 生成时间
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);
  
  let yPosition = 60;
  
  // 项目摘要
  doc.setFontSize(14);
  doc.text('Project Summary', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(reportData.summary, 170);
  doc.text(summaryLines, 20, yPosition);
  yPosition += summaryLines.length * 5 + 10;
  
  // 关键指标
  doc.setFontSize(14);
  doc.text('Key Metrics', 20, yPosition);
  yPosition += 15;
  
  const metricsData = [
    ['Total Tasks', reportData.metrics.totalTasks.toString()],
    ['Completed Tasks', reportData.metrics.completedTasks.toString()],
    ['Completion Rate', `${reportData.metrics.completionRate.toFixed(1)}%`],
    ['Overdue Tasks', reportData.metrics.overdueTasks.toString()],
    ['Team Size', reportData.metrics.teamSize.toString()],
    ['Average Utilization', `${reportData.metrics.averageUtilization.toFixed(1)}%`],
  ];
  
  (doc as any).autoTable({
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'grid',
    styles: { fontSize: 9 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  // 任务状态
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  doc.setFontSize(14);
  doc.text('Task Status', 20, yPosition);
  yPosition += 15;
  
  const taskData = reportData.tasks.map(task => [
    task.title,
    task.status,
    task.priority,
    task.assignee || 'Unassigned',
  ]);
  
  (doc as any).autoTable({
    startY: yPosition,
    head: [['Task', 'Status', 'Priority', 'Assignee']],
    body: taskData,
    theme: 'grid',
    styles: { fontSize: 8 },
  });
  
  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * 保存报告到数据库
 */
export async function saveReport(
  projectId: string,
  title: string,
  format: 'TEXT' | 'HTML' | 'PDF',
  content: string | Buffer,
  userId: string
): Promise<string> {
  try {
    const report = await prisma.report.create({
      data: {
        title,
        type: 'AI_GENERATED',
        category: 'PROJECT_SUMMARY',
        format,
        isPublic: false,
        createdBy: userId,
        config: JSON.stringify({
          projectId,
          generatedAt: new Date().toISOString(),
          format,
        }),
      },
    });

    // 创建报告实例
    await prisma.reportInstance.create({
      data: {
        reportId: report.id,
        title: `${title} - ${new Date().toLocaleDateString()}`,
        format,
        data: typeof content === 'string' ? content : content.toString('base64'),
        metadata: JSON.stringify({
          projectId,
          generatedAt: new Date().toISOString(),
          fileSize: typeof content === 'string' ? content.length : content.length,
        }),
      },
    });

    return report.id;
  } catch (error) {
    console.error('Error saving report:', error);
    throw new Error('Failed to save report');
  }
}

// 辅助函数
function calculateTaskProgress(status: string): number {
  switch (status) {
    case 'COMPLETED': return 100;
    case 'IN_PROGRESS': return 50;
    case 'TODO': return 0;
    default: return 0;
  }
}

async function generateRiskSummaries(projectId: string): Promise<RiskSummary[]> {
  // 这里应该从实际的风险分析结果获取数据
  // 暂时返回模拟数据
  return [
    {
      id: 'risk-1',
      title: '资源不足风险',
      severity: 'HIGH',
      probability: 0.7,
      impact: '可能导致项目延期',
      mitigation: '增加团队成员或调整项目范围',
      status: 'ACTIVE',
    },
    {
      id: 'risk-2',
      title: '技术难度风险',
      severity: 'MEDIUM',
      probability: 0.4,
      impact: '可能影响功能实现',
      mitigation: '提前进行技术调研和原型验证',
      status: 'MITIGATED',
    },
  ];
}

async function generateTimeline(projectId: string): Promise<TimelineSummary[]> {
  // 生成项目时间线
  const timeline: TimelineSummary[] = [];
  
  // 获取任务完成记录
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });
  
  tasks.forEach(task => {
    timeline.push({
      date: task.createdAt,
      event: `任务创建: ${task.title}`,
      type: 'TASK',
      description: `创建了新任务: ${task.title}`,
    });
    
    if (task.status === 'COMPLETED') {
      timeline.push({
        date: task.updatedAt,
        event: `任务完成: ${task.title}`,
        type: 'TASK',
        description: `完成了任务: ${task.title}`,
      });
    }
  });
  
  return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function calculateUtilization(userId: string, projectId: string): number {
  // 计算用户在项目中的利用率
  // 这里应该基于实际的工作时间记录
  return Math.random() * 100; // 模拟数据
}

function calculateEfficiency(userId: string, projectId: string): number {
  // 计算用户效率
  // 这里应该基于任务完成情况和时间
  return Math.random() * 100; // 模拟数据
}

function calculateAverageTaskDuration(tasks: any[]): number {
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  if (completedTasks.length === 0) return 0;
  
  const totalDuration = completedTasks.reduce((sum, task) => {
    if (task.createdAt && task.updatedAt) {
      return sum + (task.updatedAt.getTime() - task.createdAt.getTime());
    }
    return sum;
  }, 0);
  
  return totalDuration / completedTasks.length / (1000 * 60 * 60 * 24); // 转换为天
}

function calculateProjectDuration(startDate?: Date, endDate?: Date): number {
  if (!startDate) return 0;
  const end = endDate || new Date();
  return (end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
}

function estimateProjectCompletion(project: any): Date {
  // 基于当前进度估算完成时间
  const completedTasks = project.tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const totalTasks = project.tasks.length;
  
  if (totalTasks === 0 || completedTasks === totalTasks) {
    return new Date();
  }
  
  const completionRate = completedTasks / totalTasks;
  const projectDuration = calculateProjectDuration(project.startDate);
  const estimatedTotalDuration = projectDuration / completionRate;
  const remainingDuration = estimatedTotalDuration - projectDuration;
  
  const estimatedCompletion = new Date();
  estimatedCompletion.setDate(estimatedCompletion.getDate() + remainingDuration);
  
  return estimatedCompletion;
}

async function generateProjectSummary(project: any, metrics: ProjectMetrics): Promise<string> {
  const summary = `
项目 "${project.name}" 当前进展良好，总体完成率为 ${metrics.completionRate.toFixed(1)}%。
项目共有 ${metrics.totalTasks} 个任务，其中 ${metrics.completedTasks} 个已完成，${metrics.overdueTasks} 个逾期。
团队规模为 ${metrics.teamSize} 人，平均利用率为 ${metrics.averageUtilization.toFixed(1)}%。

${metrics.completionRate >= 80 ? '项目进展顺利，预计能按时完成。' : 
  metrics.completionRate >= 60 ? '项目进展正常，需要关注逾期任务。' : 
  '项目进展缓慢，建议采取措施加快进度。'}

${metrics.overdueTasks > 0 ? `当前有 ${metrics.overdueTasks} 个逾期任务需要优先处理。` : ''}
${metrics.highRisks > 0 ? `识别出 ${metrics.highRisks} 个高风险项，需要制定缓解措施。` : ''}
${metrics.appliedRecommendations > 0 ? `已采纳 ${metrics.appliedRecommendations} 个 AI 建议，有助于项目优化。` : ''}
  `.trim();
  
  return summary;
}