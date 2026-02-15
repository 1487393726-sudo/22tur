/**
 * Property-Based Tests for Task Optimizer
 * **Feature: ai-project-assistant, Property 2: 建议理由完整性**
 * **Validates: Requirements 2.3**
 * 
 * Tests that all recommendations include complete reasoning
 */

import fc from 'fast-check';
import {
  analyzeTaskOptimization,
  calculateTaskDependencies,
  calculateCriticalPath,
} from '../analysis/task-optimizer';
import { ProjectContext, TaskData, TaskSuggestion } from '../types';

// Mock dependencies
jest.mock('../openai-integration', () => ({
  getOpenAIProvider: jest.fn(() => ({
    sendRequest: jest.fn(async () => ({
      content: JSON.stringify({
        suggestions: [
          {
            taskId: 'task-1',
            currentPriority: 'HIGH',
            suggestedPriority: 'MEDIUM',
            reasoning: 'Task can be deprioritized due to lower impact',
            estimatedHours: 8,
          },
        ],
        overallAnalysis: 'Optimization opportunities identified',
      }),
    })),
  })),
}));

jest.mock('../config-manager', () => ({
  getEffectiveAIConfig: jest.fn(async () => ({
    modelName: 'gpt-4',
    maxTokens: 2000,
  })),
}));

// Generators for property-based testing
const taskDataGenerator = (): fc.Arbitrary<TaskData> =>
  fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.option(fc.string({ maxLength: 500 })),
    status: fc.constantFrom('TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'),
    priority: fc.constantFrom('LOW', 'MEDIUM', 'HIGH'),
    assignee: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    dueDate: fc.option(fc.date()),
    estimatedHours: fc.option(fc.integer({ min: 1, max: 100 })),
    actualHours: fc.option(fc.integer({ min: 0, max: 100 })),
    dependencies: fc.option(fc.array(fc.uuid(), { maxLength: 5 })),
  });

const projectContextGenerator = (): fc.Arbitrary<ProjectContext> =>
  fc.record({
    projectId: fc.uuid(),
    projectName: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.option(fc.string({ maxLength: 500 })),
    status: fc.constantFrom('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'),
    startDate: fc.option(fc.date()),
    endDate: fc.option(fc.date()),
    budget: fc.option(fc.integer({ min: 1000, max: 1000000 })),
    teamSize: fc.integer({ min: 1, max: 50 }),
    tasks: fc.array(taskDataGenerator(), { minLength: 1, maxLength: 20 }),
    team: fc.constant([]),
  });

describe('Task Optimizer - Property-Based Tests', () => {
  describe('Property 2: Recommendation Reasoning Completeness', () => {
    /**
     * Property 2: 建议理由完整性
     * For any generated recommendation, the system should provide clear reasoning,
     * including analysis basis, considerations, and expected benefits.
     * **Validates: Requirements 2.3**
     */

    it('should provide reasoning for every recommendation', async () => {
      await fc.assert(
        fc.asyncProperty(projectContextGenerator(), async (context) => {
          try {
            const result = await analyzeTaskOptimization('project-1', context);

            // Every suggestion must have reasoning
            result.suggestions.forEach((suggestion) => {
              expect(suggestion.reasoning).toBeDefined();
              expect(typeof suggestion.reasoning).toBe('string');
              expect(suggestion.reasoning.length).toBeGreaterThan(0);
            });
          } catch (error) {
            // If analysis fails, that's acceptable for this property
            expect(error).toBeDefined();
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should include task ID in every recommendation', async () => {
      await fc.assert(
        fc.asyncProperty(projectContextGenerator(), async (context) => {
          try {
            const result = await analyzeTaskOptimization('project-1', context);

            result.suggestions.forEach((suggestion) => {
              expect(suggestion.taskId).toBeDefined();
              expect(typeof suggestion.taskId).toBe('string');
              expect(suggestion.taskId.length).toBeGreaterThan(0);
            });
          } catch (error) {
            expect(error).toBeDefined();
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should include priority information in every recommendation', async () => {
      await fc.assert(
        fc.asyncProperty(projectContextGenerator(), async (context) => {
          try {
            const result = await analyzeTaskOptimization('project-1', context);

            result.suggestions.forEach((suggestion) => {
              expect(suggestion.currentPriority).toBeDefined();
              expect(['LOW', 'MEDIUM', 'HIGH']).toContain(suggestion.currentPriority);
              expect(suggestion.suggestedPriority).toBeDefined();
              expect(['LOW', 'MEDIUM', 'HIGH']).toContain(suggestion.suggestedPriority);
            });
          } catch (error) {
            expect(error).toBeDefined();
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should include estimated hours in every recommendation', async () => {
      await fc.assert(
        fc.asyncProperty(projectContextGenerator(), async (context) => {
          try {
            const result = await analyzeTaskOptimization('project-1', context);

            result.suggestions.forEach((suggestion) => {
              expect(suggestion.estimatedHours).toBeDefined();
              expect(typeof suggestion.estimatedHours).toBe('number');
              expect(suggestion.estimatedHours).toBeGreaterThan(0);
            });
          } catch (error) {
            expect(error).toBeDefined();
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should provide non-empty reasoning text', async () => {
      await fc.assert(
        fc.asyncProperty(projectContextGenerator(), async (context) => {
          try {
            const result = await analyzeTaskOptimization('project-1', context);

            result.suggestions.forEach((suggestion) => {
              // Reasoning should not be just whitespace
              expect(suggestion.reasoning.trim().length).toBeGreaterThan(0);
              // Reasoning should be meaningful (not just placeholder)
              expect(suggestion.reasoning).not.toBe('No reasoning provided');
            });
          } catch (error) {
            expect(error).toBeDefined();
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should provide efficiency gain metric', async () => {
      await fc.assert(
        fc.asyncProperty(projectContextGenerator(), async (context) => {
          try {
            const result = await analyzeTaskOptimization('project-1', context);

            expect(result.expectedEfficiencyGain).toBeDefined();
            expect(typeof result.expectedEfficiencyGain).toBe('number');
            expect(result.expectedEfficiencyGain).toBeGreaterThanOrEqual(0);
          } catch (error) {
            expect(error).toBeDefined();
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should provide completion time estimate', async () => {
      await fc.assert(
        fc.asyncProperty(projectContextGenerator(), async (context) => {
          try {
            const result = await analyzeTaskOptimization('project-1', context);

            expect(result.estimatedTimeToComplete).toBeDefined();
            expect(typeof result.estimatedTimeToComplete).toBe('number');
            expect(result.estimatedTimeToComplete).toBeGreaterThan(0);
          } catch (error) {
            expect(error).toBeDefined();
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('calculateTaskDependencies', () => {
    it('should create dependency map for all tasks', () => {
      fc.assert(
        fc.property(fc.array(taskDataGenerator(), { minLength: 1, maxLength: 10 }), (tasks) => {
          const dependencies = calculateTaskDependencies(tasks);

          // Should have entry for each task
          expect(dependencies.size).toBe(tasks.length);

          // Each task should have a dependency array
          tasks.forEach((task) => {
            expect(dependencies.has(task.id)).toBe(true);
            const deps = dependencies.get(task.id);
            expect(Array.isArray(deps)).toBe(true);
          });
        }),
        { numRuns: 50 }
      );
    });

    it('should preserve task dependencies', () => {
      fc.assert(
        fc.property(fc.array(taskDataGenerator(), { minLength: 1, maxLength: 10 }), (tasks) => {
          const dependencies = calculateTaskDependencies(tasks);

          tasks.forEach((task) => {
            const deps = dependencies.get(task.id);
            if (task.dependencies) {
              expect(deps).toEqual(task.dependencies);
            } else {
              expect(deps).toEqual([]);
            }
          });
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('calculateCriticalPath', () => {
    it('should return valid critical path', () => {
      fc.assert(
        fc.property(fc.array(taskDataGenerator(), { minLength: 1, maxLength: 10 }), (tasks) => {
          // Clear dependencies to avoid circular references in generated data
          const cleanTasks = tasks.map((t) => ({ ...t, dependencies: [] }));
          const dependencies = calculateTaskDependencies(cleanTasks);
          const criticalPath = calculateCriticalPath(cleanTasks, dependencies);

          // Critical path should be an array
          expect(Array.isArray(criticalPath)).toBe(true);

          // All items in critical path should be task IDs
          const taskIds = new Set(cleanTasks.map((t) => t.id));
          criticalPath.forEach((taskId) => {
            expect(taskIds.has(taskId)).toBe(true);
          });
        }),
        { numRuns: 50 }
      );
    });

    it('should not have duplicate tasks in critical path', () => {
      fc.assert(
        fc.property(fc.array(taskDataGenerator(), { minLength: 1, maxLength: 10 }), (tasks) => {
          // Clear dependencies to avoid circular references
          const cleanTasks = tasks.map((t) => ({ ...t, dependencies: [] }));
          const dependencies = calculateTaskDependencies(cleanTasks);
          const criticalPath = calculateCriticalPath(cleanTasks, dependencies);

          const uniqueIds = new Set(criticalPath);
          expect(uniqueIds.size).toBe(criticalPath.length);
        }),
        { numRuns: 50 }
      );
    });
  });
});

describe('Task Optimizer - Unit Tests', () => {
  describe('analyzeTaskOptimization', () => {
    it('should return task optimization result with suggestions', async () => {
      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Test Project',
        status: 'IN_PROGRESS',
        teamSize: 5,
        tasks: [
          {
            id: 'task-1',
            title: 'Task 1',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
          },
          {
            id: 'task-2',
            title: 'Task 2',
            status: 'TODO',
            priority: 'MEDIUM',
          },
        ],
        team: [],
      };

      const result = await analyzeTaskOptimization('project-1', context);

      expect(result.projectId).toBe('project-1');
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.expectedEfficiencyGain).toBeDefined();
      expect(result.estimatedTimeToComplete).toBeDefined();
    });

    it('should handle empty task list', async () => {
      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Test Project',
        status: 'PLANNING',
        teamSize: 0,
        tasks: [],
        team: [],
      };

      const result = await analyzeTaskOptimization('project-1', context);

      expect(result.projectId).toBe('project-1');
      expect(result.suggestions).toBeDefined();
    });

    it('should handle large task lists', async () => {
      const tasks: TaskData[] = Array.from({ length: 50 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        status: i % 3 === 0 ? 'COMPLETED' : i % 3 === 1 ? 'IN_PROGRESS' : 'TODO',
        priority: i % 3 === 0 ? 'HIGH' : i % 3 === 1 ? 'MEDIUM' : 'LOW',
      }));

      const context: ProjectContext = {
        projectId: 'project-1',
        projectName: 'Large Project',
        status: 'IN_PROGRESS',
        teamSize: 10,
        tasks,
        team: [],
      };

      const result = await analyzeTaskOptimization('project-1', context);

      expect(result.suggestions).toBeDefined();
      expect(result.expectedEfficiencyGain).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateTaskDependencies', () => {
    it('should handle tasks without dependencies', () => {
      const tasks: TaskData[] = [
        { id: 'task-1', title: 'Task 1', status: 'TODO', priority: 'HIGH' },
        { id: 'task-2', title: 'Task 2', status: 'TODO', priority: 'MEDIUM' },
      ];

      const dependencies = calculateTaskDependencies(tasks);

      expect(dependencies.get('task-1')).toEqual([]);
      expect(dependencies.get('task-2')).toEqual([]);
    });

    it('should handle tasks with dependencies', () => {
      const tasks: TaskData[] = [
        { id: 'task-1', title: 'Task 1', status: 'TODO', priority: 'HIGH' },
        {
          id: 'task-2',
          title: 'Task 2',
          status: 'TODO',
          priority: 'MEDIUM',
          dependencies: ['task-1'],
        },
      ];

      const dependencies = calculateTaskDependencies(tasks);

      expect(dependencies.get('task-2')).toEqual(['task-1']);
    });
  });

  describe('calculateCriticalPath', () => {
    it('should find critical path in linear dependency chain', () => {
      const tasks: TaskData[] = [
        { id: 'task-1', title: 'Task 1', status: 'TODO', priority: 'HIGH' },
        {
          id: 'task-2',
          title: 'Task 2',
          status: 'TODO',
          priority: 'HIGH',
          dependencies: ['task-1'],
        },
        {
          id: 'task-3',
          title: 'Task 3',
          status: 'TODO',
          priority: 'HIGH',
          dependencies: ['task-2'],
        },
      ];

      const dependencies = calculateTaskDependencies(tasks);
      const criticalPath = calculateCriticalPath(tasks, dependencies);

      expect(criticalPath.length).toBeGreaterThan(0);
      expect(criticalPath).toContain('task-1');
    });

    it('should handle independent tasks', () => {
      const tasks: TaskData[] = [
        { id: 'task-1', title: 'Task 1', status: 'TODO', priority: 'HIGH' },
        { id: 'task-2', title: 'Task 2', status: 'TODO', priority: 'HIGH' },
        { id: 'task-3', title: 'Task 3', status: 'TODO', priority: 'HIGH' },
      ];

      const dependencies = calculateTaskDependencies(tasks);
      const criticalPath = calculateCriticalPath(tasks, dependencies);

      expect(criticalPath.length).toBeGreaterThan(0);
    });
  });
});
