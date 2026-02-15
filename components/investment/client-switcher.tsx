"use client";

/**
 * Client Switcher Component
 * Task 7.2: Client switching and management interface
 * 
 * Requirements: 6.1, 6.2 - Switch clients within 2 seconds
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  Search, 
  Users, 
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Loader2
} from 'lucide-react';

interface ClientSummary {
  clientId: string;
  clientName: string;
  totalValue: number;
  returnPercentage: number;
  riskScore: number;
  lastUpdated: Date;
}

interface ClientSwitcherProps {
  advisorId: string;
  selectedClientId?: string;
  onClientSelect: (clientId: string, loadTime: number) => void;
  className?: string;
}

export function ClientSwitcher({
  advisorId,
  selectedClientId,
  onClientSelect,
  className = ''
}: ClientSwitcherProps) {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients list
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/advisor/clients?advisorId=${advisorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setClients(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch clients');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [advisorId]);

  // Handle client selection with performance tracking
  const handleClientSelect = useCallback(async (clientId: string) => {
    if (clientId === selectedClientId) {
      setIsOpen(false);
      return;
    }

    setSwitching(true);
    const startTime = Date.now();

    try {
      // Call the parent handler with load time tracking
      await onClientSelect(clientId, 0); // Parent will handle the actual loading
      
      const loadTime = Date.now() - startTime;
      
      // Log performance - should be under 2 seconds
      if (loadTime > 2000) {
        console.warn(`Client switch took ${loadTime}ms, exceeding 2s target`);
      }
      
      setIsOpen(false);
    } catch (err) {
      console.error('Error switching client:', err);
    } finally {
      setSwitching(false);
    }
  }, [selectedClientId, onClientSelect]);

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected client info
  const selectedClient = clients.find(client => client.clientId === selectedClientId);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Get risk level color
  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return 'text-green-600';
    if (riskScore <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Initial load
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div className={`relative ${className}`}>
      {/* Selected Client Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || switching}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center">
          {switching ? (
            <Loader2 className="h-5 w-5 animate-spin text-white600 mr-3" />
          ) : (
            <Users className="h-5 w-5 text-white600 mr-3" />
          )}
          
          <div className="text-left">
            {selectedClient ? (
              <>
                <div className="text-sm font-medium text-gray-900">
                  {selectedClient.clientName}
                </div>
                <div className="text-xs text-gray-500 flex items-center space-x-2">
                  <span>{formatCurrency(selectedClient.totalValue)}</span>
                  <span className={selectedClient.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(selectedClient.returnPercentage)}
                  </span>
                  <span className={getRiskColor(selectedClient.riskScore)}>
                    风险: {selectedClient.riskScore.toFixed(1)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                {loading ? '加载客户列表...' : '选择客户'}
              </div>
            )}
          </div>
        </div>
        
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索客户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Client List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-white600" />
                <p className="text-sm text-gray-500 mt-2">加载客户列表...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchClients}
                  className="mt-2 text-sm text-white600 hover:text-white800"
                >
                  重试
                </button>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-4 text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">
                  {searchTerm ? '没有找到匹配的客户' : '暂无客户'}
                </p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.clientId}
                  onClick={() => handleClientSelect(client.clientId)}
                  disabled={switching}
                  className={`w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    client.clientId === selectedClientId ? 'bg-purple-50 border-r-2 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white600">
                          {client.clientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {client.clientName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(client.totalValue)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xs font-medium flex items-center ${
                        client.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {client.returnPercentage >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercentage(client.returnPercentage)}
                      </div>
                      <div className={`text-xs flex items-center ${getRiskColor(client.riskScore)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {client.riskScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  {client.clientId === selectedClientId && (
                    <div className="mt-2 text-xs text-white600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      当前选中
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}