/**
 * AI Assistant Types
 * Defines all TypeScript interfaces and types for the AI assistant system
 */

// LLM Provider Types
export interface LLMResponse {
  content: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
  finishReason: string;
}

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMProvider {
  name: string;
  sendRequest(request: LLMRequest): Promise<LLMResponse>;
  validateConnection(): Promise<boolean>;
  getModelInfo(): Promise<ModelInfo>;
}

export interface ModelInfo {
  name: string;
  provider: string;
  maxTokens: number;
  costPer1kTokens: {
    input: number;
    output: number;
  };
}

// Conversation Types
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

export interface Conversation {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  messages: ConversationMessage[];
  context?: ProjectContext;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Project Context Types
export interface ProjectContext {
  projectId: string;
  projectName: string;
  description?: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  teamSize: number;
  tasks: TaskData[];
  team: TeamMember[];
  historicalData?: HistoricalData;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee?: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: number; // 0-100 percentage
  workload: number; // 0-100 percentage
}

export interface HistoricalData {
  completedTasks: number;
  totalTasks: number;
  averageCompletionTime: number; // in days
  velocityTrend: number[]; // tasks per week
  riskHistory: RiskEvent[];
}

export interface RiskEvent {
  date: Date;
  type: string;
  severity: string;
  description: string;
  resolved: boolean;
}

// Recommendation Types
export interface Recommendation {
  id: string;
  projectId: string;
  type: 'task_optimization' | 'progress_prediction' | 'risk_analysis' | 'resource_allocation';
  title: string;
  description: string;
  reasoning: string;
  expectedBenefit?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'pending' | 'applied' | 'rejected' | 'expired';
  rating?: number;
  feedback?: string;
  createdAt: Date;
  appliedAt?: Date;
  expiresAt?: Date;
}

// Analysis Result Types
export interface TaskOptimizationResult {
  projectId: string;
  suggestions: TaskSuggestion[];
  expectedEfficiencyGain: number;
  estimatedTimeToComplete: number;
}

export interface TaskSuggestion {
  taskId: string;
  currentPriority: string;
  suggestedPriority: string;
  reasoning: string;
  estimatedHours: number;
}

export interface ProgressPrediction {
  projectId: string;
  estimatedCompletionDate: Date;
  confidence: number;
  completionProbability: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface RiskAnalysis {
  projectId: string;
  risks: Risk[];
  overallRiskScore: number;
  criticalRisks: Risk[];
  mitigationStrategies: string[];
}

export interface Risk {
  id: string;
  type: string;
  description: string;
  probability: number;
  impact: number;
  severity: number;
  mitigationStrategy?: string;
}

export interface ResourceAllocationResult {
  projectId: string;
  suggestions: AllocationSuggestion[];
  expectedUtilizationImprovement: number;
  workloadBalance: number;
}

export interface AllocationSuggestion {
  memberId: string;
  memberName: string;
  currentWorkload: number;
  suggestedWorkload: number;
  suggestedTasks: string[];
  reasoning: string;
}

// Context Knowledge Types
export interface ContextKnowledge {
  id: string;
  projectId: string;
  term: string;
  definition: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI Config Types
export interface AIConfig {
  id: string;
  projectId?: string;
  modelProvider: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Call Log Types
export interface AICallLog {
  id: string;
  conversationId?: string;
  projectId?: string;
  userId?: string;
  action: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
  duration?: number;
  status: 'success' | 'failed' | 'timeout';
  errorMessage?: string;
  createdAt: Date;
}
