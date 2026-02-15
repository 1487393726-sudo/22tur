import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * 工作流引擎
 * 负责执行工作流实例，调度节点，管理状态
 */

export interface WorkflowExecutionContext {
  instanceId: string;
  workflowId: string;
  variables: Record<string, any>;
  currentNodeId: string | null;
}

export interface NodeExecutionResult {
  success: boolean;
  nextNodeIds: string[];
  error?: string;
  data?: any;
}

/**
 * 工作流引擎类
 */
export class WorkflowEngine {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 启动工作流实例
   */
  async startWorkflow(
    workflowId: string,
    startedBy: string,
    title: string = "工作流实例",
    context: Record<string, any> = {}
  ): Promise<string> {
    try {
      // 获取工作流
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: true,
        },
      });

      if (!workflow) {
        throw new Error("工作流不存在");
      }

      if (!workflow.isActive) {
        throw new Error("只能执行激活状态的工作流");
      }

      // 找到开始节点
      const startNode = workflow.nodes.find((node) => node.type === "START");
      if (!startNode) {
        throw new Error("工作流缺少开始节点");
      }

      // 创建工作流实例
      const instance = await this.prisma.workflowInstance.create({
        data: {
          workflowId: workflow.id,
          title,
          status: "RUNNING",
          startedBy: startedBy,
          startedAt: new Date(),
          context: JSON.stringify(context),
        },
      });

      // 创建开始节点执行记录
      await this.prisma.nodeExecution.create({
        data: {
          instanceId: instance.id,
          nodeId: startNode.id,
          status: "COMPLETED",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });

      return instance.id;
    } catch (error) {
      console.error("启动工作流失败:", error);
      throw error;
    }
  }

  /**
   * 执行节点
   */
  async executeNode(instanceId: string, nodeId: string): Promise<NodeExecutionResult> {
    try {
      // 获取实例信息
      const instance = await this.prisma.workflowInstance.findUnique({
        where: { id: instanceId },
        include: {
          workflow: {
            include: {
              nodes: true,
            },
          },
        },
      });

      if (!instance) {
        throw new Error("工作流实例不存在");
      }

      const node = instance.workflow.nodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error("节点不存在");
      }

      // 创建节点执行记录
      const execution = await this.prisma.nodeExecution.create({
        data: {
          instanceId: instance.id,
          nodeId: node.id,
          status: "RUNNING",
          startedAt: new Date(),
        },
      });

      // 根据节点类型执行不同逻辑
      let result: NodeExecutionResult = {
        success: true,
        nextNodeIds: [],
      };

      try {
        switch (node.type) {
          case "START":
            result = await this.executeStartNode(instance, node);
            break;
          case "END":
            result = await this.executeEndNode(instance, node);
            break;
          case "TASK":
            result = await this.executeTaskNode(instance, node);
            break;
          case "APPROVAL":
            result = await this.executeApprovalNode(instance, node);
            break;
          case "NOTIFICATION":
            result = await this.executeNotificationNode(instance, node);
            break;
          case "DECISION":
            result = await this.executeDecisionNode(instance, node);
            break;
          default:
            result = { success: true, nextNodeIds: [] };
        }

        // 更新执行记录
        await this.prisma.nodeExecution.update({
          where: { id: execution.id },
          data: {
            status: result.success ? "COMPLETED" : "FAILED",
            completedAt: new Date(),
            output: result.data ? JSON.stringify(result.data) : null,
            notes: result.error,
          },
        });
      } catch (error) {
        await this.prisma.nodeExecution.update({
          where: { id: execution.id },
          data: {
            status: "FAILED",
            completedAt: new Date(),
            notes: error instanceof Error ? error.message : "未知错误",
          },
        });
        throw error;
      }

      return result;
    } catch (error) {
      console.error("执行节点失败:", error);
      return {
        success: false,
        nextNodeIds: [],
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }

  private async executeStartNode(instance: any, node: any): Promise<NodeExecutionResult> {
    return { success: true, nextNodeIds: [] };
  }

  private async executeEndNode(instance: any, node: any): Promise<NodeExecutionResult> {
    await this.prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
    return { success: true, nextNodeIds: [] };
  }

  private async executeTaskNode(instance: any, node: any): Promise<NodeExecutionResult> {
    return { success: true, nextNodeIds: [] };
  }

  private async executeApprovalNode(instance: any, node: any): Promise<NodeExecutionResult> {
    return { success: true, nextNodeIds: [] };
  }

  private async executeNotificationNode(instance: any, node: any): Promise<NodeExecutionResult> {
    return { success: true, nextNodeIds: [] };
  }

  private async executeDecisionNode(instance: any, node: any): Promise<NodeExecutionResult> {
    return { success: true, nextNodeIds: [] };
  }

  /**
   * 完成工作流实例
   */
  async completeWorkflow(instanceId: string): Promise<void> {
    await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }

  /**
   * 取消工作流实例
   */
  async cancelWorkflow(instanceId: string): Promise<void> {
    await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        status: "CANCELLED",
        completedAt: new Date(),
      },
    });
  }

  /**
   * 获取工作流实例状态
   */
  async getInstanceStatus(instanceId: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        workflow: true,
        executions: {
          include: {
            node: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return instance;
  }

  /**
   * 获取待处理的审批任务
   */
  async getPendingApprovals(userId: string) {
    const executions = await this.prisma.nodeExecution.findMany({
      where: {
        assignedTo: userId,
        status: "PENDING",
      },
      include: {
        instance: {
          include: {
            workflow: true,
          },
        },
        node: true,
      },
    });

    return executions;
  }

  /**
   * 处理审批
   */
  async handleApproval(
    executionId: string,
    approved: boolean,
    notes?: string
  ): Promise<void> {
    const execution = await this.prisma.nodeExecution.findUnique({
      where: { id: executionId },
      include: {
        instance: true,
        node: true,
      },
    });

    if (!execution) {
      throw new Error("执行记录不存在");
    }

    await this.prisma.nodeExecution.update({
      where: { id: executionId },
      data: {
        status: approved ? "COMPLETED" : "FAILED",
        completedAt: new Date(),
        notes,
        output: JSON.stringify({ approved }),
      },
    });

    if (!approved) {
      await this.prisma.workflowInstance.update({
        where: { id: execution.instanceId },
        data: {
          status: "FAILED",
          completedAt: new Date(),
        },
      });
    }
  }
}

// 导出单例
export const workflowEngine = new WorkflowEngine();
