import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { factoryService } from '@/services/api/factoryService';
import type { AgentDeploymentRequest } from '@/services/api/factoryService';

export function useFactoryStatus() {
  return useQuery({
    queryKey: ['factory', 'status'],
    queryFn: () => factoryService.getFactoryStatus(),
    refetchInterval: 5000,
  });
}

export function useAssemblyStages() {
  return useQuery({
    queryKey: ['factory', 'assembly-stages'],
    queryFn: () => factoryService.getAssemblyStages(),
    refetchInterval: 2000,
  });
}

export function useFactoryMetrics() {
  return useQuery({
    queryKey: ['factory', 'metrics'],
    queryFn: () => factoryService.getMetrics(),
    refetchInterval: 3000,
  });
}

export function useDeployAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: AgentDeploymentRequest) => factoryService.deployAgent(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factory'] });
    },
  });
}