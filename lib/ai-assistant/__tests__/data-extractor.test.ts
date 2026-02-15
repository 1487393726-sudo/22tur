/**
 * Unit Tests for Data Extractor
 * **Feature: ai-project-assistant, Property 9: 上下文更新一致性**
 * **Validates: Requirements 10.3**
 * 
 * Tests data extraction and context consistency
 */

import {
  extractProjectContext,
  extractTaskData,
  extractTeamData,
  extractHistoricalData,
  formatContextForLLM,
  updateProjectContext,
  getCachedProjectContext,
} from '../data-extractor';
import { ProjectContext, TaskData, TeamMember, HistoricalData } from '../types';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
    },
    projectMember: {
      findMany: jest.fn(),
    },
    expense: {
      findMany: jest.fn(),
    },
    projectContext: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('Data Extractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractTaskData', () => {
    it('should extract task data from project', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignee: { username: 'user1' },
          dueDate: new Date('2024-12-31'),
          createdAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: null,
          status: 'COMPLETED',
          priority: 'MEDIUM',
          assignee: null,
          dueDate: null,
          createdAt: new Date(),
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const tasks = await extractTaskData('project-1');

      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe('task-1');
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[0].status).toBe('IN_PROGRESS');
      expect(tasks[0].assignee).toBe('user1');
      expect(tasks[1].assignee).toBeUndefined();
    });

    it('should return empty array when no tasks found', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const tasks = await extractTaskData('project-1');

      expect(tasks).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const tasks = await extractTaskData('project-1');

      expect(tasks).toEqual([]);
    });

    it('should order tasks by creation date descending', async () => {
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', status: 'COMPLETED', priority: 'HIGH', assignee: null, dueDate: null, createdAt: new Date('2024-01-01') },
        { id: 'task-2', title: 'Task 2', status: 'IN_PROGRESS', priority: 'MEDIUM', assignee: null, dueDate: null, createdAt: new Date('2024-01-02') },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      await extractTaskData('project-1');

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('extractTeamData', () => {
    it('should extract team member data', async () => {
      const mockMembers = [
        {
          user: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
          },
          role: 'DEVELOPER',
        },
        {
          user: {
            id: 'user-2',
            firstName: 'Jane',
            lastName: 'Smith',
          },
          role: 'MANAGER',
        },
      ];

      (prisma.projectMember.findMany as jest.Mock).mockResolvedValue(mockMembers);

      const team = await extractTeamData('project-1');

      expect(team).toHaveLength(2);
      expect(team[0].name).toBe('John Doe');
      expect(team[0].role).toBe('DEVELOPER');
      expect(team[1].name).toBe('Jane Smith');
      expect(team[1].role).toBe('MANAGER');
    });

    it('should return empty array when no team members found', async () => {
      (prisma.projectMember.findMany as jest.Mock).mockResolvedValue([]);

      const team = await extractTeamData('project-1');

      expect(team).toEqual([]);
    });

    it('should set default availability and workload', async () => {
      const mockMembers = [
        {
          user: { id: 'user-1', firstName: 'John', lastName: 'Doe' },
          role: 'DEVELOPER',
        },
      ];

      (prisma.projectMember.findMany as jest.Mock).mockResolvedValue(mockMembers);

      const team = await extractTeamData('project-1');

      expect(team[0].availability).toBe(100);
      expect(team[0].workload).toBe(50);
    });

    it('should handle errors gracefully', async () => {
      (prisma.projectMember.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const team = await extractTeamData('project-1');

      expect(team).toEqual([]);
    });
  });

  describe('extractHistoricalData', () => {
    it('should extract historical data with task statistics', async () => {
      const mockTasks = [
        { id: 'task-1', status: 'COMPLETED' },
        { id: 'task-2', status: 'COMPLETED' },
        { id: 'task-3', status: 'IN_PROGRESS' },
      ];

      const mockExpenses = [
        { date: new Date('2024-01-01') },
        { date: new Date('2024-01-02') },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.expense.findMany as jest.Mock).mockResolvedValue(mockExpenses);

      const historical = await extractHistoricalData('project-1', 90);

      expect(historical.completedTasks).toBe(2);
      expect(historical.totalTasks).toBe(3);
      expect(historical.averageCompletionTime).toBeGreaterThan(0);
    });

    it('should calculate velocity trend correctly', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);

      const historical = await extractHistoricalData('project-1', 14);

      expect(historical.velocityTrend).toBeDefined();
      expect(Array.isArray(historical.velocityTrend)).toBe(true);
    });

    it('should handle zero tasks gracefully', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);

      const historical = await extractHistoricalData('project-1', 90);

      expect(historical.completedTasks).toBe(0);
      expect(historical.totalTasks).toBe(0);
      expect(historical.averageCompletionTime).toBe(0);
    });

    it('should return default values on error', async () => {
      (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const historical = await extractHistoricalData('project-1', 90);

      expect(historical.completedTasks).toBe(0);
      expect(historical.totalTasks).toBe(0);
      expect(historical.averageCompletionTime).toBe(0);
      expect(historical.velocityTrend).toEqual([]);
      expect(historical.riskHistory).toEqual([]);
    });

    it('should use custom days parameter', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);

      await extractHistoricalData('project-1', 30);

      expect(prisma.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  describe('formatContextForLLM', () => {
    it('should format project context as readable string', () => {
      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Test Project',
        description: 'A test project',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 100000,
        teamSize: 5,
        tasks: [
          {
            id: 'task-1',
            title: 'Task 1',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
          },
        ],
        team: [
          {
            id: 'user-1',
            name: 'John Doe',
            role: 'DEVELOPER',
            skills: [],
            availability: 100,
            workload: 50,
          },
        ],
        historicalData: {
          completedTasks: 5,
          totalTasks: 10,
          averageCompletionTime: 7,
          velocityTrend: [1, 2, 3],
          riskHistory: [],
        },
      };

      const formatted = formatContextForLLM(context);

      expect(formatted).toContain('Test Project');
      expect(formatted).toContain('IN_PROGRESS');
      expect(formatted).toContain('Team Size: 5');
      expect(formatted).toContain('Task 1');
      expect(formatted).toContain('John Doe');
      expect(formatted).toContain('Completed Tasks: 5/10');
    });

    it('should handle missing optional fields', () => {
      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Test Project',
        status: 'PLANNING',
        teamSize: 3,
        tasks: [],
        team: [],
      };

      const formatted = formatContextForLLM(context);

      expect(formatted).toContain('Test Project');
      expect(formatted).toContain('PLANNING');
      expect(formatted).not.toContain('Description:');
    });

    it('should truncate large task lists', () => {
      const tasks = Array.from({ length: 15 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
      }));

      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Test Project',
        status: 'IN_PROGRESS',
        teamSize: 5,
        tasks,
        team: [],
      };

      const formatted = formatContextForLLM(context);

      expect(formatted).toContain('... and 5 more tasks');
    });
  });

  describe('updateProjectContext', () => {
    it('should upsert project context', async () => {
      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Test Project',
        status: 'IN_PROGRESS',
        teamSize: 5,
        tasks: [],
        team: [],
      };

      (prisma.projectContext.upsert as jest.Mock).mockResolvedValue({});

      await updateProjectContext('project-1', context);

      expect(prisma.projectContext.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 'project-1' },
          update: expect.objectContaining({
            lastSync: expect.any(Date),
          }),
          create: expect.objectContaining({
            projectId: 'project-1',
          }),
        })
      );
    });

    it('should serialize context to JSON', async () => {
      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Test Project',
        status: 'IN_PROGRESS',
        teamSize: 5,
        tasks: [],
        team: [],
      };

      (prisma.projectContext.upsert as jest.Mock).mockResolvedValue({});

      await updateProjectContext('project-1', context);

      const call = (prisma.projectContext.upsert as jest.Mock).mock.calls[0][0];
      expect(typeof call.update.context).toBe('string');
      expect(JSON.parse(call.update.context)).toEqual(context);
    });

    it('should handle errors gracefully', async () => {
      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Test Project',
        status: 'IN_PROGRESS',
        teamSize: 5,
        tasks: [],
        team: [],
      };

      (prisma.projectContext.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Should not throw
      await updateProjectContext('project-1', context);
    });
  });

  describe('getCachedProjectContext', () => {
    it('should retrieve cached project context', async () => {
      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Test Project',
        status: 'IN_PROGRESS',
        teamSize: 5,
        tasks: [],
        team: [],
      };

      (prisma.projectContext.findUnique as jest.Mock).mockResolvedValue({
        projectId: 'project-1',
        context: JSON.stringify(context),
      });

      const cached = await getCachedProjectContext('project-1');

      expect(cached).toEqual(context);
    });

    it('should return null when context not found', async () => {
      (prisma.projectContext.findUnique as jest.Mock).mockResolvedValue(null);

      const cached = await getCachedProjectContext('project-1');

      expect(cached).toBeNull();
    });

    it('should handle JSON parsing errors', async () => {
      (prisma.projectContext.findUnique as jest.Mock).mockResolvedValue({
        projectId: 'project-1',
        context: 'invalid json',
      });

      const cached = await getCachedProjectContext('project-1');

      expect(cached).toBeNull();
    });

    it('should handle database errors', async () => {
      (prisma.projectContext.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const cached = await getCachedProjectContext('project-1');

      expect(cached).toBeNull();
    });
  });

  describe('extractProjectContext', () => {
    it('should extract complete project context', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'A test project',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 100000,
        client: { id: 'client-1', name: 'Client' },
        department: { id: 'dept-1', name: 'Department' },
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.projectMember.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);

      const context = await extractProjectContext('project-1');

      expect(context.projectId).toBe('project-1');
      expect(context.projectName).toBe('Test Project');
      expect(context.status).toBe('IN_PROGRESS');
      expect(context.teamSize).toBe(0);
    });

    it('should throw error when project not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(extractProjectContext('project-1')).rejects.toThrow('Project not found');
    });

    it('should include tasks, team, and historical data', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: null,
        status: 'IN_PROGRESS',
        startDate: null,
        endDate: null,
        budget: null,
        client: null,
        department: null,
      };

      const mockTasks = [
        { id: 'task-1', title: 'Task 1', status: 'IN_PROGRESS', priority: 'HIGH', assignee: null, dueDate: null, createdAt: new Date() },
      ];

      const mockMembers = [
        { user: { id: 'user-1', firstName: 'John', lastName: 'Doe' }, role: 'DEVELOPER' },
      ];

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.projectMember.findMany as jest.Mock).mockResolvedValue(mockMembers);
      (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);

      const context = await extractProjectContext('project-1');

      expect(context.tasks).toHaveLength(1);
      expect(context.team).toHaveLength(1);
      expect(context.historicalData).toBeDefined();
    });
  });
});

describe('Property 9: Context Update Consistency', () => {
  /**
   * Property 9: 上下文更新一致性
   * When project data updates, the system should automatically update AI's context information,
   * ensuring subsequent analysis is based on latest data.
   * **Validates: Requirements 10.3**
   */

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should maintain consistency between extracted and cached context', async () => {
    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      budget: 100000,
      client: null,
      department: null,
    };

    (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.projectMember.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.projectContext.upsert as jest.Mock).mockResolvedValue({});

    // Extract context
    const extracted = await extractProjectContext('project-1');

    // Update cache
    await updateProjectContext('project-1', extracted);

    // Verify upsert was called with correct data
    expect(prisma.projectContext.upsert).toHaveBeenCalled();
    const upsertCall = (prisma.projectContext.upsert as jest.Mock).mock.calls[0][0];
    const cachedContext = JSON.parse(upsertCall.update.context);

    expect(cachedContext.projectId).toBe(extracted.projectId);
    expect(cachedContext.projectName).toBe(extracted.projectName);
    expect(cachedContext.status).toBe(extracted.status);
  });

  it('should update context when project data changes', async () => {
    const mockProject1 = {
      id: 'project-1',
      name: 'Old Name',
      description: 'Old description',
      status: 'PLANNING',
      startDate: null,
      endDate: null,
      budget: null,
      client: null,
      department: null,
    };

    const mockProject2 = {
      id: 'project-1',
      name: 'New Name',
      description: 'New description',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      budget: 100000,
      client: null,
      department: null,
    };

    // First extraction
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject1);
    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.projectMember.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);

    const context1 = await extractProjectContext('project-1');
    expect(context1.projectName).toBe('Old Name');
    expect(context1.status).toBe('PLANNING');

    // Second extraction after update
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject2);
    const context2 = await extractProjectContext('project-1');
    expect(context2.projectName).toBe('New Name');
    expect(context2.status).toBe('IN_PROGRESS');
  });

  it('should ensure all context components are updated together', async () => {
    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      description: null,
      status: 'IN_PROGRESS',
      startDate: null,
      endDate: null,
      budget: null,
      client: null,
      department: null,
    };

    const mockTasks = [
      { id: 'task-1', title: 'Task 1', status: 'IN_PROGRESS', priority: 'HIGH', assignee: null, dueDate: null, createdAt: new Date() },
      { id: 'task-2', title: 'Task 2', status: 'COMPLETED', priority: 'MEDIUM', assignee: null, dueDate: null, createdAt: new Date() },
    ];

    const mockMembers = [
      { user: { id: 'user-1', firstName: 'John', lastName: 'Doe' }, role: 'DEVELOPER' },
      { user: { id: 'user-2', firstName: 'Jane', lastName: 'Smith' }, role: 'MANAGER' },
    ];

    (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
    (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
    (prisma.projectMember.findMany as jest.Mock).mockResolvedValue(mockMembers);
    (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);

    const context = await extractProjectContext('project-1');

    // Verify all components are present and consistent
    expect(context.tasks).toHaveLength(2);
    expect(context.team).toHaveLength(2);
    expect(context.teamSize).toBe(2);
    expect(context.historicalData).toBeDefined();
    expect(context.historicalData?.totalTasks).toBe(2);
    expect(context.historicalData?.completedTasks).toBe(1);
  });

  it('should format context consistently for LLM consumption', async () => {
    const context: ProjectContext = {
      projectId: 'project-1',
      projectName: 'Test Project',
      description: 'A test project',
      status: 'IN_PROGRESS',
      teamSize: 2,
      tasks: [
        { id: 'task-1', title: 'Task 1', status: 'IN_PROGRESS', priority: 'HIGH' },
      ],
      team: [
        { id: 'user-1', name: 'John Doe', role: 'DEVELOPER', skills: [], availability: 100, workload: 50 },
      ],
      historicalData: {
        completedTasks: 5,
        totalTasks: 10,
        averageCompletionTime: 7,
        velocityTrend: [1, 2, 3],
        riskHistory: [],
      },
    };

    const formatted1 = formatContextForLLM(context);
    const formatted2 = formatContextForLLM(context);

    // Same context should produce same formatted output
    expect(formatted1).toBe(formatted2);

    // Formatted output should contain all essential information
    expect(formatted1).toContain('Test Project');
    expect(formatted1).toContain('IN_PROGRESS');
    expect(formatted1).toContain('Task 1');
    expect(formatted1).toContain('John Doe');
  });

  it('should handle context updates with missing data gracefully', async () => {
    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      description: null,
      status: 'PLANNING',
      startDate: null,
      endDate: null,
      budget: null,
      client: null,
      department: null,
    };

    (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.projectMember.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.projectContext.upsert as jest.Mock).mockResolvedValue({});

    const context = await extractProjectContext('project-1');
    await updateProjectContext('project-1', context);

    // Should complete without errors
    expect(context.projectId).toBe('project-1');
    expect(context.tasks).toEqual([]);
    expect(context.team).toEqual([]);
  });
});
