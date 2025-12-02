import { apiClient } from './client';
import type { DashboardMetrics, AssemblyStage } from '@/types/landing';

export interface FactoryStatus {
  metrics: DashboardMetrics;
  assemblyLine: AssemblyStage[];
  timestamp: number;
}

export interface AgentDeploymentRequest {
  agentId: string;
  configuration?: Record<string, unknown>;
}

export interface AgentDeploymentResponse {
  success: boolean;
  agentId: string;
  transactionId?: string;
  message: string;
}

// Factory Service API
export const factoryService = {
  // Get current factory status
  getFactoryStatus: async (): Promise<FactoryStatus> => {
    const response = await apiClient.get<FactoryStatus>('/factory/status');
    return response.data;
  },

  // Get assembly line stages
  getAssemblyStages: async (): Promise<AssemblyStage[]> => {
    const response = await apiClient.get<AssemblyStage[]>('/factory/assembly-line');
    return response.data;
  },

  // Get dashboard metrics
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get<DashboardMetrics>('/factory/metrics');
    return response.data;
  },

  // Deploy an agent
  deployAgent: async (request: AgentDeploymentRequest): Promise<AgentDeploymentResponse> => {
    const response = await apiClient.post<AgentDeploymentResponse>('/factory/deploy', request);
    return response.data;
  },

  // Get agent queue
  getAgentQueue: async (): Promise<{ count: number; agents: Array<{ id: string; status: string }> }> => {
    const response = await apiClient.get('/factory/queue');
    return response.data;
  },
};