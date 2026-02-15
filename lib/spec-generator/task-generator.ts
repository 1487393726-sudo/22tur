/**
 * Spec Task Generator Library
 * 
 * Provides utilities to parse Spec documents and generate task lists
 */

import fs from 'fs';
import path from 'path';

export interface Requirement {
  id: string;
  number: number;
  title: string;
  userStory: string;
  description: string;
  criteria: AcceptanceCriterion[];
  priority: 'high' | 'medium' | 'low';
  phase?: string;
}

export interface AcceptanceCriterion {
  number: number;
  text: string;
}

export interface DesignComponent {
  name: string;
  path: string;
  description: string;
  dependencies: string[];
}

export interface Task {
  id: string;
  number: number;
  title: string;
  description: string;
  subtasks: Subtask[];
  requirementRefs: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedDays: number;
  isOptional: boolean;
  category: string;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskGroup {
  title: string;
  description: string;
  tasks: Task[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Parse requirements.md to extract requirements
 */
export function parseRequirements(content: string): Requirement[] {
  const requirements: Requirement[] = [];
  
  // Split by requirement headers (### Requirement X:)
  const requirementPattern = /### Requirement (\d+):\s*(.+?)(?=###|$)/gs;
  let match;
  
  while ((match = requirementPattern.exec(content)) !== null) {
    const number = parseInt(match[1]);
    const blockContent = match[2];
    
    // Extract title
    const titleMatch = blockContent.match(/^(.+?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Extract user story
    const userStoryMatch = blockContent.match(/\*\*User Story\*\*:?\s*(.+?)(?:\n|$)/);
    const userStory = userStoryMatch ? userStoryMatch[1].trim() : '';
    
    // Extract acceptance criteria
    const criteriaMatch = blockContent.match(/#### Acceptance Criteria\n([\s\S]*?)(?=###|$)/);
    const criteria: AcceptanceCriterion[] = [];
    
    if (criteriaMatch) {
      const criteriaText = criteriaMatch[1];
      const criteriaLines = criteriaText.split('\n').filter(l => l.match(/^\d+\./));
      
      criteria.push(...criteriaLines.map((l, i) => ({
        number: i + 1,
        text: l.replace(/^\d+\.\s*/, '').trim()
      })));
    }
    
    // Determine phase from title
    const phase = extractPhase(title);
    
    requirements.push({
      id: `REQ-${number}`,
      number,
      title,
      userStory,
      description: blockContent.substring(0, 300),
      criteria,
      priority: 'high',
      phase
    });
  }
  
  return requirements;
}

/**
 * Extract phase from requirement title
 */
function extractPhase(title: string): string {
  const phaseMap: Record<string, string> = {
    '认证': '用户认证',
    '设置': '个人中心',
    '通知': '通知系统',
    '消息': '消息系统',
    '文件': '文件管理',
    '支付': '支付集成',
    '看板': '看板功能',
    '工作流': '工作流系统',
    '报表': '报表系统',
    '仪表板': '仪表板系统'
  };
  
  for (const [keyword, phase] of Object.entries(phaseMap)) {
    if (title.includes(keyword)) {
      return phase;
    }
  }
  
  return '其他功能';
}

/**
 * Generate tasks from requirements
 */
export function generateTasksFromRequirements(requirements: Requirement[]): TaskGroup[] {
  const taskGroups = new Map<string, Task[]>();
  
  // Group requirements by phase
  for (const req of requirements) {
    const phase = req.phase || '其他功能';
    
    if (!taskGroups.has(phase)) {
      taskGroups.set(phase, []);
    }
    
    // Create subtasks from acceptance criteria
    const subtasks: Subtask[] = req.criteria.map((c, i) => ({
      id: `${req.id}-SUB-${i + 1}`,
      text: `实现: ${c.text.substring(0, 80)}${c.text.length > 80 ? '...' : ''}`,
      completed: false
    }));
    
    // Create main task
    const task: Task = {
      id: req.id,
      number: req.number,
      title: `实现${req.title}`,
      description: req.userStory,
      subtasks,
      requirementRefs: [req.id],
      priority: req.priority,
      estimatedDays: Math.max(1, Math.ceil(req.criteria.length / 3)),
      isOptional: false,
      category: phase
    };
    
    taskGroups.get(phase)!.push(task);
  }
  
  // Convert to TaskGroup array
  const groups: TaskGroup[] = [];
  for (const [phase, tasks] of taskGroups) {
    groups.push({
      title: phase,
      description: `${phase}相关的所有任务`,
      tasks,
      priority: 'high'
    });
  }
  
  return groups;
}

/**
 * Generate markdown for tasks
 */
export function generateTasksMarkdown(taskGroups: TaskGroup[], specName: string): string {
  let markdown = `# ${specName} - 实施任务列表

**自动生成**: ${new Date().toISOString().split('T')[0]}  
**生成工具**: Spec Task Generator

## 项目概览

本任务列表由自动化脚本从需求文档和设计文档生成。

---

`;

  let taskCounter = 1;
  
  for (const group of taskGroups) {
    markdown += `## ${group.title}\n\n`;
    markdown += `${group.description}\n\n`;
    
    for (const task of group.tasks) {
      const checkbox = task.isOptional ? '- [ ]*' : '- [ ]';
      const priority = task.priority === 'high' ? '🔴' : 
                      task.priority === 'medium' ? '🟡' : '🟢';
      
      markdown += `${checkbox} ${taskCounter}. ${task.title}\n`;
      markdown += `   - **优先级**: ${priority}\n`;
      markdown += `   - **工作量**: ${task.estimatedDays} 天\n`;
      markdown += `   - **需求**: ${task.requirementRefs.join(', ')}\n`;
      
      if (task.subtasks.length > 0) {
        markdown += `   - **子任务**:\n`;
        for (const subtask of task.subtasks) {
          markdown += `     - [ ] ${subtask.text}\n`;
        }
      }
      
      markdown += '\n';
      taskCounter++;
    }
    
    markdown += '\n---\n\n';
  }
  
  markdown += `## 统计信息

- **总任务数**: ${taskGroups.reduce((sum, g) => sum + g.tasks.length, 0)}
- **总子任务数**: ${taskGroups.reduce((sum, g) => sum + g.tasks.reduce((s, t) => s + t.subtasks.length, 0), 0)}
- **总工作量**: ${taskGroups.reduce((sum, g) => sum + g.tasks.reduce((s, t) => s + t.estimatedDays, 0), 0)} 天
- **任务组数**: ${taskGroups.length}

---

**生成者**: Kiro Spec Task Generator  
**生成时间**: ${new Date().toISOString()}
`;

  return markdown;
}

/**
 * Load and parse a Spec
 */
export async function loadSpec(specName: string): Promise<{
  requirements: Requirement[];
  taskGroups: TaskGroup[];
}> {
  const specDir = path.join(process.cwd(), '.kiro', 'specs', specName);
  const requirementsPath = path.join(specDir, 'requirements.md');
  
  if (!fs.existsSync(specDir)) {
    throw new Error(`Spec 目录不存在: ${specDir}`);
  }
  
  if (!fs.existsSync(requirementsPath)) {
    throw new Error(`requirements.md 不存在: ${requirementsPath}`);
  }
  
  const requirementsContent = fs.readFileSync(requirementsPath, 'utf-8');
  const requirements = parseRequirements(requirementsContent);
  const taskGroups = generateTasksFromRequirements(requirements);
  
  return { requirements, taskGroups };
}

/**
 * Generate and save tasks for a Spec
 */
export async function generateSpecTasks(specName: string): Promise<string> {
  const specDir = path.join(process.cwd(), '.kiro', 'specs', specName);
  const tasksPath = path.join(specDir, 'tasks.md');
  
  const { requirements, taskGroups } = await loadSpec(specName);
  const markdown = generateTasksMarkdown(taskGroups, specName);
  
  fs.writeFileSync(tasksPath, markdown, 'utf-8');
  
  return tasksPath;
}

/**
 * Generate tasks for all incomplete Specs
 */
export async function generateAllSpecTasks(): Promise<Map<string, string>> {
  const specsDir = path.join(process.cwd(), '.kiro', 'specs');
  const results = new Map<string, string>();
  
  if (!fs.existsSync(specsDir)) {
    throw new Error(`Specs 目录不存在: ${specsDir}`);
  }
  
  const specDirs = fs.readdirSync(specsDir).filter(f => {
    const fullPath = path.join(specsDir, f);
    return fs.statSync(fullPath).isDirectory();
  });
  
  for (const specDir of specDirs) {
    try {
      const tasksPath = await generateSpecTasks(specDir);
      results.set(specDir, tasksPath);
    } catch (error) {
      console.warn(`⚠️  跳过 ${specDir}: ${error}`);
    }
  }
  
  return results;
}
