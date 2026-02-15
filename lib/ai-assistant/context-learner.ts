/**
 * AI 助手上下文学习器
 * 学习项目特定的术语、知识和上下文
 */

import { prisma } from '@/lib/prisma';

export interface ProjectContext {
  id: string;
  projectId: string;
  domain: string;
  terminology: Record<string, string>;
  businessRules: string[];
  stakeholders: Stakeholder[];
  constraints: string[];
  objectives: string[];
  lastUpdated: Date;
}

export interface Stakeholder {
  name: string;
  role: string;
  responsibilities: string[];
  contactInfo?: string;
}

export interface ContextKnowledge {
  id: string;
  projectId: string;
  type: KnowledgeType;
  title: string;
  content: string;
  tags: string[];
  source: string;
  confidence: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type KnowledgeType = 
  | 'TERMINOLOGY'
  | 'BUSINESS_RULE'
  | 'PROCESS'
  | 'CONSTRAINT'
  | 'BEST_PRACTICE'
  | 'LESSON_LEARNED'
  | 'STAKEHOLDER_INFO'
  | 'TECHNICAL_SPEC';

export interface LearningSource {
  type: 'DOCUMENT' | 'CONVERSATION' | 'TASK' | 'MEETING' | 'EMAIL';
  id: string;
  content: string;
  metadata: Record<string, any>;
}

export interface TerminologyEntry {
  term: string;
  definition: string;
  context: string;
  examples: string[];
  synonyms: string[];
  relatedTerms: string[];
  confidence: number;
  source: string;
}

/**
 * 学习项目上下文
 */
export async function learnProjectContext(projectId: string): Promise<ProjectContext> {
  try {
    // 获取现有上下文
    let context = await getProjectContext(projectId);
    
    if (!context) {
      context = await createInitialContext(projectId);
    }

    // 从各种来源学习
    await learnFromDocuments(projectId);
    await learnFromConversations(projectId);
    await learnFromTasks(projectId);
    await learnFromTeamInteractions(projectId);

    // 更新上下文
    context = await updateProjectContext(projectId);
    
    return context;
  } catch (error) {
    console.error('Error learning project context:', error);
    throw new Error('Failed to learn project context');
  }
}

/**
 * 获取项目上下文
 */
export async function getProjectContext(projectId: string): Promise<ProjectContext | null> {
  try {
    const context = await prisma.projectContext.findUnique({
      where: { projectId },
    });

    if (!context) {
      return null;
    }

    return {
      id: context.id,
      projectId: context.projectId,
      domain: context.domain || 'General',
      terminology: JSON.parse(context.terminology || '{}'),
      businessRules: JSON.parse(context.businessRules || '[]'),
      stakeholders: JSON.parse(context.stakeholders || '[]'),
      constraints: JSON.parse(context.constraints || '[]'),
      objectives: JSON.parse(context.objectives || '[]'),
      lastUpdated: context.updatedAt,
    };
  } catch (error) {
    console.error('Error getting project context:', error);
    return null;
  }
}

/**
 * 创建初始上下文
 */
async function createInitialContext(projectId: string): Promise<ProjectContext> {
  try {
    // 获取项目基本信息
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        department: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // 推断项目领域
    const domain = inferProjectDomain(project);

    // 识别利益相关者
    const stakeholders: Stakeholder[] = [
      {
        name: project.client?.name || 'Client',
        role: 'Client',
        responsibilities: ['Requirements definition', 'Acceptance testing', 'Feedback provision'],
        contactInfo: project.client?.email,
      },
      ...project.members.map(member => ({
        name: `${member.user.firstName} ${member.user.lastName}`,
        role: member.role,
        responsibilities: getRoleResponsibilities(member.role),
      })),
    ];

    // 初始目标
    const objectives = [
      project.description || 'Complete project successfully',
      'Meet all requirements',
      'Deliver on time and within budget',
    ];

    // 初始约束
    const constraints = [
      `Budget: ${project.budget || 'TBD'}`,
      `Timeline: ${project.startDate?.toDateString()} - ${project.endDate?.toDateString()}`,
      `Team size: ${project.members.length} members`,
    ];

    const contextData = {
      projectId,
      domain,
      terminology: JSON.stringify({}),
      businessRules: JSON.stringify([]),
      stakeholders: JSON.stringify(stakeholders),
      constraints: JSON.stringify(constraints),
      objectives: JSON.stringify(objectives),
    };

    const context = await prisma.projectContext.create({
      data: contextData,
    });

    return {
      id: context.id,
      projectId: context.projectId,
      domain,
      terminology: {},
      businessRules: [],
      stakeholders,
      constraints,
      objectives,
      lastUpdated: context.updatedAt,
    };
  } catch (error) {
    console.error('Error creating initial context:', error);
    throw new Error('Failed to create initial context');
  }
}

/**
 * 从文档中学习
 */
async function learnFromDocuments(projectId: string): Promise<void> {
  try {
    const documents = await prisma.document.findMany({
      where: { projectId },
      orderBy: { uploadDate: 'desc' },
      take: 10, // 限制处理的文档数量
    });

    for (const document of documents) {
      // 分析文档内容
      const knowledge = await extractKnowledgeFromDocument(document);
      
      // 保存学到的知识
      for (const item of knowledge) {
        await saveContextKnowledge(projectId, item);
      }
    }
  } catch (error) {
    console.error('Error learning from documents:', error);
  }
}

/**
 * 从对话中学习
 */
async function learnFromConversations(projectId: string): Promise<void> {
  try {
    const conversations = await prisma.aIConversation.findMany({
      where: { projectId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5, // 限制处理的对话数量
    });

    for (const conversation of conversations) {
      // 分析对话内容
      const knowledge = await extractKnowledgeFromConversation(conversation);
      
      // 保存学到的知识
      for (const item of knowledge) {
        await saveContextKnowledge(projectId, item);
      }
    }
  } catch (error) {
    console.error('Error learning from conversations:', error);
  }
}

/**
 * 从任务中学习
 */
async function learnFromTasks(projectId: string): Promise<void> {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: true,
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // 限制处理的任务数量
    });

    // 分析任务模式
    const taskPatterns = analyzeTaskPatterns(tasks);
    
    // 提取业务规则
    const businessRules = extractBusinessRulesFromTasks(tasks);
    
    // 识别术语
    const terminology = extractTerminologyFromTasks(tasks);

    // 保存学到的知识
    for (const rule of businessRules) {
      await saveContextKnowledge(projectId, {
        type: 'BUSINESS_RULE',
        title: 'Task-derived Business Rule',
        content: rule,
        tags: ['task-analysis'],
        source: 'task-analysis',
        confidence: 0.7,
      });
    }

    for (const [term, definition] of Object.entries(terminology)) {
      await saveContextKnowledge(projectId, {
        type: 'TERMINOLOGY',
        title: term,
        content: definition,
        tags: ['terminology'],
        source: 'task-analysis',
        confidence: 0.6,
      });
    }
  } catch (error) {
    console.error('Error learning from tasks:', error);
  }
}

/**
 * 从团队交互中学习
 */
async function learnFromTeamInteractions(projectId: string): Promise<void> {
  try {
    // 分析项目成员的协作模式
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: true,
      },
    });

    // 分析任务分配模式
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: true,
      },
    });

    const collaborationPatterns = analyzeCollaborationPatterns(members, tasks);
    
    // 保存协作知识
    for (const pattern of collaborationPatterns) {
      await saveContextKnowledge(projectId, {
        type: 'BEST_PRACTICE',
        title: 'Team Collaboration Pattern',
        content: pattern,
        tags: ['collaboration', 'team-dynamics'],
        source: 'team-analysis',
        confidence: 0.8,
      });
    }
  } catch (error) {
    console.error('Error learning from team interactions:', error);
  }
}

/**
 * 保存上下文知识
 */
async function saveContextKnowledge(
  projectId: string, 
  knowledge: Omit<ContextKnowledge, 'id' | 'projectId' | 'isVerified' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    // 检查是否已存在相似的知识
    const existing = await prisma.contextKnowledge.findFirst({
      where: {
        projectId,
        type: knowledge.type,
        title: knowledge.title,
      },
    });

    if (existing) {
      // 更新现有知识
      await prisma.contextKnowledge.update({
        where: { id: existing.id },
        data: {
          content: knowledge.content,
          confidence: Math.max(existing.confidence, knowledge.confidence),
          updatedAt: new Date(),
        },
      });
    } else {
      // 创建新知识
      await prisma.contextKnowledge.create({
        data: {
          projectId,
          type: knowledge.type,
          title: knowledge.title,
          content: knowledge.content,
          tags: JSON.stringify(knowledge.tags),
          source: knowledge.source,
          confidence: knowledge.confidence,
          isVerified: false,
        },
      });
    }
  } catch (error) {
    console.error('Error saving context knowledge:', error);
  }
}

/**
 * 更新项目上下文
 */
async function updateProjectContext(projectId: string): Promise<ProjectContext> {
  try {
    // 获取所有相关知识
    const knowledge = await prisma.contextKnowledge.findMany({
      where: { projectId },
      orderBy: { confidence: 'desc' },
    });

    // 聚合术语
    const terminology: Record<string, string> = {};
    const businessRules: string[] = [];
    
    knowledge.forEach(item => {
      if (item.type === 'TERMINOLOGY') {
        terminology[item.title] = item.content;
      } else if (item.type === 'BUSINESS_RULE') {
        businessRules.push(item.content);
      }
    });

    // 更新上下文
    const context = await prisma.projectContext.update({
      where: { projectId },
      data: {
        terminology: JSON.stringify(terminology),
        businessRules: JSON.stringify(businessRules),
        updatedAt: new Date(),
      },
    });

    return {
      id: context.id,
      projectId: context.projectId,
      domain: context.domain || 'General',
      terminology,
      businessRules,
      stakeholders: JSON.parse(context.stakeholders || '[]'),
      constraints: JSON.parse(context.constraints || '[]'),
      objectives: JSON.parse(context.objectives || '[]'),
      lastUpdated: context.updatedAt,
    };
  } catch (error) {
    console.error('Error updating project context:', error);
    throw new Error('Failed to update project context');
  }
}

/**
 * 获取上下文增强的提示词
 */
export async function getContextEnhancedPrompt(projectId: string, basePrompt: string): Promise<string> {
  try {
    const context = await getProjectContext(projectId);
    
    if (!context) {
      return basePrompt;
    }

    let enhancedPrompt = basePrompt;

    // 添加项目背景
    enhancedPrompt += `\n\n项目背景:`;
    enhancedPrompt += `\n- 项目领域: ${context.domain}`;
    enhancedPrompt += `\n- 项目目标: ${context.objectives.join(', ')}`;
    enhancedPrompt += `\n- 项目约束: ${context.constraints.join(', ')}`;

    // 添加术语定义
    if (Object.keys(context.terminology).length > 0) {
      enhancedPrompt += `\n\n项目术语:`;
      Object.entries(context.terminology).forEach(([term, definition]) => {
        enhancedPrompt += `\n- ${term}: ${definition}`;
      });
    }

    // 添加业务规则
    if (context.businessRules.length > 0) {
      enhancedPrompt += `\n\n业务规则:`;
      context.businessRules.forEach((rule, index) => {
        enhancedPrompt += `\n${index + 1}. ${rule}`;
      });
    }

    // 添加利益相关者信息
    if (context.stakeholders.length > 0) {
      enhancedPrompt += `\n\n利益相关者:`;
      context.stakeholders.forEach(stakeholder => {
        enhancedPrompt += `\n- ${stakeholder.name} (${stakeholder.role}): ${stakeholder.responsibilities.join(', ')}`;
      });
    }

    return enhancedPrompt;
  } catch (error) {
    console.error('Error getting context enhanced prompt:', error);
    return basePrompt;
  }
}

/**
 * 验证和清理知识
 */
export async function validateAndCleanKnowledge(projectId: string): Promise<void> {
  try {
    const knowledge = await prisma.contextKnowledge.findMany({
      where: { projectId },
    });

    for (const item of knowledge) {
      // 验证知识的相关性和准确性
      const isValid = await validateKnowledge(item);
      
      if (!isValid) {
        // 删除无效知识
        await prisma.contextKnowledge.delete({
          where: { id: item.id },
        });
      } else {
        // 标记为已验证
        await prisma.contextKnowledge.update({
          where: { id: item.id },
          data: { isVerified: true },
        });
      }
    }
  } catch (error) {
    console.error('Error validating and cleaning knowledge:', error);
  }
}

// 辅助函数
function inferProjectDomain(project: any): string {
  const name = project.name.toLowerCase();
  const description = (project.description || '').toLowerCase();
  
  if (name.includes('web') || name.includes('website') || description.includes('web')) {
    return 'Web Development';
  } else if (name.includes('mobile') || name.includes('app') || description.includes('mobile')) {
    return 'Mobile Development';
  } else if (name.includes('data') || name.includes('analytics') || description.includes('data')) {
    return 'Data Analytics';
  } else if (name.includes('marketing') || description.includes('marketing')) {
    return 'Marketing';
  } else if (name.includes('finance') || description.includes('finance')) {
    return 'Finance';
  } else {
    return 'General';
  }
}

function getRoleResponsibilities(role: string): string[] {
  const responsibilities: Record<string, string[]> = {
    'MANAGER': ['Project planning', 'Team coordination', 'Stakeholder communication'],
    'DEVELOPER': ['Code development', 'Technical implementation', 'Code review'],
    'DESIGNER': ['UI/UX design', 'Visual design', 'Prototyping'],
    'TESTER': ['Quality assurance', 'Test planning', 'Bug reporting'],
    'ANALYST': ['Requirements analysis', 'Documentation', 'Process improvement'],
  };
  
  return responsibilities[role] || ['Project contribution'];
}

async function extractKnowledgeFromDocument(document: any): Promise<Array<Omit<ContextKnowledge, 'id' | 'projectId' | 'isVerified' | 'createdAt' | 'updatedAt'>>> {
  // 这里应该实现文档内容分析
  // 暂时返回模拟数据
  return [
    {
      type: 'TERMINOLOGY',
      title: 'API',
      content: 'Application Programming Interface - 应用程序编程接口',
      tags: ['technical'],
      source: `document-${document.id}`,
      confidence: 0.9,
    },
  ];
}

async function extractKnowledgeFromConversation(conversation: any): Promise<Array<Omit<ContextKnowledge, 'id' | 'projectId' | 'isVerified' | 'createdAt' | 'updatedAt'>>> {
  // 这里应该实现对话内容分析
  // 暂时返回模拟数据
  return [
    {
      type: 'LESSON_LEARNED',
      title: 'Communication Best Practice',
      content: '定期团队会议有助于项目进度跟踪',
      tags: ['communication', 'best-practice'],
      source: `conversation-${conversation.id}`,
      confidence: 0.8,
    },
  ];
}

function analyzeTaskPatterns(tasks: any[]): string[] {
  // 分析任务模式
  const patterns: string[] = [];
  
  // 分析任务优先级分布
  const priorityCount = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});
  
  patterns.push(`任务优先级分布: ${JSON.stringify(priorityCount)}`);
  
  // 分析任务状态分布
  const statusCount = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  
  patterns.push(`任务状态分布: ${JSON.stringify(statusCount)}`);
  
  return patterns;
}

function extractBusinessRulesFromTasks(tasks: any[]): string[] {
  const rules: string[] = [];
  
  // 分析任务分配规则
  const assignmentPatterns = tasks.reduce((acc, task) => {
    if (task.assignee) {
      const key = `${task.priority}-${task.assignee.role}`;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});
  
  Object.entries(assignmentPatterns).forEach(([pattern, count]) => {
    if (count as number > 2) {
      const [priority, role] = pattern.split('-');
      rules.push(`${priority} 优先级任务通常分配给 ${role} 角色`);
    }
  });
  
  return rules;
}

function extractTerminologyFromTasks(tasks: any[]): Record<string, string> {
  const terminology: Record<string, string> = {};
  
  // 从任务标题和描述中提取常见术语
  const commonTerms = ['API', 'UI', 'UX', 'DB', 'Frontend', 'Backend'];
  
  tasks.forEach(task => {
    const text = `${task.title} ${task.description || ''}`.toLowerCase();
    commonTerms.forEach(term => {
      if (text.includes(term.toLowerCase()) && !terminology[term]) {
        terminology[term] = `项目中使用的 ${term} 相关术语`;
      }
    });
  });
  
  return terminology;
}

function analyzeCollaborationPatterns(members: any[], tasks: any[]): string[] {
  const patterns: string[] = [];
  
  // 分析协作模式
  const collaborations = tasks.reduce((acc, task) => {
    if (task.assignee) {
      const assigneeRole = members.find(m => m.userId === task.assigneeId)?.role;
      if (assigneeRole) {
        acc[assigneeRole] = (acc[assigneeRole] || 0) + 1;
      }
    }
    return acc;
  }, {});
  
  Object.entries(collaborations).forEach(([role, count]) => {
    patterns.push(`${role} 角色承担了 ${count} 个任务`);
  });
  
  return patterns;
}

async function validateKnowledge(knowledge: any): Promise<boolean> {
  // 简单的验证逻辑
  // 实际实现中可能需要更复杂的验证
  
  // 检查置信度
  if (knowledge.confidence < 0.3) {
    return false;
  }
  
  // 检查内容长度
  if (knowledge.content.length < 10) {
    return false;
  }
  
  // 检查是否过时（超过30天且置信度低）
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (knowledge.createdAt < thirtyDaysAgo && knowledge.confidence < 0.6) {
    return false;
  }
  
  return true;
}