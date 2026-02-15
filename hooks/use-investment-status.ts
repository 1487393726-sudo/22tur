'use client';

import { useState, useEffect, useCallback } from 'react';

interface InvestmentStatusData {
  hasInvestments: boolean;
  totalInvestments: number;
  totalAmount: number;
  investments: any[];
  projectInvestments: any[];
}

interface UseInvestmentStatusReturn {
  hasInvestments: boolean;
  isLoading: boolean;
  error: string | null;
  data: InvestmentStatusData | null;
  refetch: () => Promise<void>;
}

/**
 * 投资状态检查 Hook
 * Investment status check hook
 * 
 * 用于检查当前用户是否有活跃投资
 */
export function useInvestmentStatus(): UseInvestmentStatusReturn {
  const [hasInvestments, setHasInvestments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InvestmentStatusData | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/investment-status');
      
      if (!response.ok) {
        if (response.status === 401) {
          setHasInvestments(false);
          setError('未登录');
          return;
        }
        throw new Error('Failed to fetch investment status');
      }
      
      const result = await response.json();
      setHasInvestments(result.hasInvestments);
      setData(result);
    } catch (err) {
      console.error('Error fetching investment status:', err);
      setError(err instanceof Error ? err.message : '获取投资状态失败');
      setHasInvestments(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    hasInvestments,
    isLoading,
    error,
    data,
    refetch: fetchStatus
  };
}
