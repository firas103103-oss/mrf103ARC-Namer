/**
 * 🔧 Shared API Hooks
 * Custom hooks مشتركة لجميع الـ Sectors
 */

import React from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiRequest } from './queryClient';

// Generic hook for fetching sector data
export function useSectorData<T = any>(
  sector: string,
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: [`${sector}-${endpoint}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/${sector}/${endpoint}`);
      return (response as any).data || response;
    },
    refetchInterval: 30000,
    ...options,
  });
}

// Sector Overview Hook
export function useSectorOverview(sector: string) {
  return useSectorData(sector, 'overview', {
    refetchInterval: 30000,
  });
}

// Sector Team Hook
export function useSectorTeam(sector: string) {
  return useSectorData(sector, 'team', {
    refetchInterval: 30000,
  });
}

// Hierarchy Stats Hook
export function useHierarchyStats() {
  return useQuery({
    queryKey: ['hierarchy-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/arc/hierarchy/stats');
      return (response as any).data || response;
    },
    refetchInterval: 30000,
  });
}

// Maestros Hook
export function useMaestros() {
  return useQuery({
    queryKey: ['maestros'],
    queryFn: () => apiRequest('GET', '/api/arc/maestros'),
    refetchInterval: 30000,
  });
}

// All Agents Hook
export function useAllAgents() {
  return useQuery({
    queryKey: ['all-agents'],
    queryFn: () => apiRequest('GET', '/api/arc/agents'),
    refetchInterval: 30000,
  });
}

// Single Agent Hook
export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => apiRequest('GET', `/api/arc/agents/${agentId}`),
    refetchInterval: 30000,
    enabled: !!agentId,
  });
}

// Hierarchy Tree Hook
export function useHierarchyTree() {
  return useQuery({
    queryKey: ['hierarchy-tree'],
    queryFn: () => apiRequest('GET', '/api/arc/hierarchy/tree'),
    refetchInterval: 60000, // Less frequent as structure doesn't change often
  });
}

// Specialists by Sector Hook
export function useSpecialists(sector: string) {
  return useQuery({
    queryKey: ['specialists', sector],
    queryFn: () => apiRequest('GET', `/api/arc/sector/${sector}/specialists`),
    refetchInterval: 30000,
    enabled: !!sector,
  });
}

// Daily Report Hook
export function useDailyReport(agentId: string) {
  return useQuery({
    queryKey: ['daily-report', agentId],
    queryFn: () => apiRequest('POST', `/api/arc/reports/daily/${agentId}`),
    refetchInterval: 300000, // 5 minutes
    enabled: !!agentId,
  });
}

// Agent Status Hook
export function useAgentStatus(agentId: string) {
  return useQuery({
    queryKey: ['agent-status', agentId],
    queryFn: () => apiRequest('GET', `/api/arc/agents/${agentId}`),
    refetchInterval: 15000, // More frequent for status
    enabled: !!agentId,
  });
}

// Learning Stats Hook
export function useLearningStats(agentId?: string) {
  const endpoint = agentId 
    ? `/api/arc/learning/stats/${agentId}`
    : '/api/arc/learning/stats';
    
  return useQuery({
    queryKey: agentId ? ['learning-stats', agentId] : ['learning-stats'],
    queryFn: () => apiRequest('GET', endpoint),
    refetchInterval: 60000,
  });
}

// Helper function to refresh multiple queries
export function createRefreshHandler(...refetchFns: Array<() => void>) {
  return () => {
    refetchFns.forEach(fn => fn());
  };
}

// Loading component helper
export function renderLoading(message: string = 'Loading...') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Error component helper
export function renderError(message: string = 'Failed to load data', onRetry?: () => void) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="text-destructive text-5xl mb-4">⚠️</div>
        <p className="text-destructive mb-4">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default {
  useSectorData,
  useSectorOverview,
  useSectorTeam,
  useHierarchyStats,
  useMaestros,
  useAllAgents,
  useAgent,
  useHierarchyTree,
  useSpecialists,
  useDailyReport,
  useAgentStatus,
  useLearningStats,
  createRefreshHandler,
  renderLoading,
  renderError,
};
