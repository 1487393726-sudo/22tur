"use client";

/**
 * Communication Manager Component
 * Task 7.2: Client communication record management
 * 
 * Requirements: 6.4 - Record all communication history and decision process
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Send,
  X,
  Edit
} from 'lucide-react';

interface CommunicationRecord {
  id: string;
  advisorId: string;
  clientId: string;
  type: 'EMAIL' | 'PHONE' | 'MEETING' | 'NOTE';
  subject: string;
  content: string;
  timestamp: Date;
  followUpRequired: boolean;
  followUpDate?: Date;
}

interface CommunicationManagerProps {
  advisorId: string;
  clientId: string;
  className?: string;
}

export function CommunicationManager({
  advisorId,
  clientId,
  className = ''
}: CommunicationManagerProps) {
  const [communications, setCommunications] = useState<CommunicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterFollowUp, setFilterFollowUp] = useState<string>('ALL');

  // New communication form state
  const [newCommunication, setNewCommunication] = useState({
    type: 'NOTE' as const,
    subject: '',
    content: '',
    followUpRequired: false,
    followUpDate: ''
  });
  const [saving, setSaving] = useState(false);

  // Communication type icons and labels
  const communicationTypes = {
    EMAIL: { icon: Mail, label: '邮件', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    PHONE: { icon: Phone, label: '电话', color: 'text-green-600', bgColor: 'bg-green-100' },
    MEETING: { icon: Calendar, label: '会议', color: 'text-white600', bgColor: 'bg-purple-100' },
    NOTE: { icon: FileText, label: '备注', color: 'text-gray-600', bgColor: 'bg-gray-100' }
  };

  // Fetch communication history
  const fetchCommunications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/advisor/communications?advisorId=${advisorId}&clientId=${clientId}&limit=100`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCommunications(result.data.map((comm: any) => ({
          ...comm,
          timestamp: new Date(comm.timestamp),
          followUpDate: comm.followUpDate ? new Date(comm.followUpDate) : undefined
        })));
      } else {
        throw new Error(result.message || 'Failed to fetch communications');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching communications:', err);
    } finally {
      setLoading(false);
    }
  }, [advisorId, clientId]);

  // Save new communication
  const handleSaveCommunication = async () => {
    if (!newCommunication.subject.trim() || !newCommunication.content.trim()) {
      alert('请填写主题和内容');
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch('/api/advisor/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advisorId,
          clientId,
          type: newCommunication.type,
          subject: newCommunication.subject,
          content: newCommunication.content,
          followUpRequired: newCommunication.followUpRequired,
          followUpDate: newCommunication.followUpDate || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Add new communication to list
        const newComm = {
          ...result.data,
          timestamp: new Date(result.data.timestamp),
          followUpDate: result.data.followUpDate ? new Date(result.data.followUpDate) : undefined
        };
        setCommunications(prev => [newComm, ...prev]);
        
        // Reset form
        setNewCommunication({
          type: 'NOTE',
          subject: '',
          content: '',
          followUpRequired: false,
          followUpDate: ''
        });
        setShowNewForm(false);
      } else {
        throw new Error(result.message || 'Failed to save communication');
      }
    } catch (err) {
      console.error('Error saving communication:', err);
      alert('保存沟通记录失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // Filter communications
  const filteredCommunications = communications.filter(comm => {
    // Search filter
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = filterType === 'ALL' || comm.type === filterType;
    
    // Follow-up filter
    const matchesFollowUp = filterFollowUp === 'ALL' ||
                           (filterFollowUp === 'REQUIRED' && comm.followUpRequired) ||
                           (filterFollowUp === 'NOT_REQUIRED' && !comm.followUpRequired);
    
    return matchesSearch && matchesType && matchesFollowUp;
  });

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Check if follow-up is overdue
  const isFollowUpOverdue = (comm: CommunicationRecord) => {
    return comm.followUpRequired && comm.followUpDate && comm.followUpDate < new Date();
  };

  // Initial load
  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 text-white600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">沟通记录</h2>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增记录
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索沟通记录..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="ALL">所有类型</option>
            {Object.entries(communicationTypes).map(([type, config]) => (
              <option key={type} value={type}>{config.label}</option>
            ))}
          </select>

          {/* Follow-up Filter */}
          <select
            value={filterFollowUp}
            onChange={(e) => setFilterFollowUp(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="ALL">所有跟进</option>
            <option value="REQUIRED">需要跟进</option>
            <option value="NOT_REQUIRED">无需跟进</option>
          </select>
        </div>
      </div>

      {/* New Communication Form */}
      {showNewForm && (
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">新增沟通记录</h3>
            <button
              onClick={() => setShowNewForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Type and Subject */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  沟通类型
                </label>
                <select
                  value={newCommunication.type}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.entries(communicationTypes).map(([type, config]) => (
                    <option key={type} value={type}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主题 *
                </label>
                <input
                  type="text"
                  value={newCommunication.subject}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="输入沟通主题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容 *
              </label>
              <textarea
                value={newCommunication.content}
                onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
                placeholder="详细描述沟通内容、决策过程和结果"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Follow-up */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newCommunication.followUpRequired}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                  className="rounded border-gray-300 text-white600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">需要跟进</span>
              </label>

              {newCommunication.followUpRequired && (
                <div>
                  <input
                    type="date"
                    value={newCommunication.followUpDate}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleSaveCommunication}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    保存记录
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Communication List */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchCommunications}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              重试
            </button>
          </div>
        ) : filteredCommunications.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无沟通记录</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'ALL' || filterFollowUp !== 'ALL' 
                ? '没有找到匹配的记录' 
                : '还没有与此客户的沟通记录'}
            </p>
            {!searchTerm && filterType === 'ALL' && filterFollowUp === 'ALL' && (
              <button
                onClick={() => setShowNewForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                创建第一条记录
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommunications.map((comm) => {
              const TypeIcon = communicationTypes[comm.type].icon;
              const isOverdue = isFollowUpOverdue(comm);
              
              return (
                <div
                  key={comm.id}
                  className={`border rounded-lg p-4 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${communicationTypes[comm.type].bgColor}`}>
                        <TypeIcon className={`h-4 w-4 ${communicationTypes[comm.type].color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{comm.subject}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${communicationTypes[comm.type].bgColor} ${communicationTypes[comm.type].color}`}>
                            {communicationTypes[comm.type].label}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{comm.content}</p>
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(comm.timestamp)}
                          </div>
                          
                          {comm.followUpRequired && (
                            <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>
                              {isOverdue ? (
                                <AlertCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              跟进: {comm.followUpDate ? formatDate(comm.followUpDate) : '待定'}
                              {isOverdue && ' (已逾期)'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}