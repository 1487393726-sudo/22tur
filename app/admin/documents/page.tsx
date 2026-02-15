'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, Trash2, Send, FileText, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
}

interface Customer {
  id: string;
  email: string;
  customUserId?: string;
  firstName: string;
  lastName: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    isPublic: false,
  });

  const categories = [
    { value: 'general', label: '通用资料' },
    { value: 'contract', label: '合同' },
    { value: 'invoice', label: '发票' },
    { value: 'report', label: '报告' },
    { value: 'guide', label: '指南' },
    { value: 'other', label: '其他' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 获取文档列表
      const docsResponse = await fetch('/api/admin/documents');
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setDocuments(docsData.documents || []);
      }

      // 获取客户列表
      const customersResponse = await fetch('/api/admin/users');
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.users || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formData.title) {
      setError('请填写文档标题');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('isPublic', formData.isPublic.toString());

      const response = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setDocuments([data.document, ...documents]);
      setSuccess('文档上传成功');
      setShowUploadForm(false);
      setFormData({ title: '', description: '', category: 'general', isPublic: false });
      
      // 清除成功提示
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSendDocument = async () => {
    if (!selectedDocument || !selectedCustomer) {
      setError('请选择文档和客户');
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/admin/documents/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          customerId: selectedCustomer,
        }),
      });

      if (!response.ok) throw new Error('Send failed');

      setSuccess('文档已发送到客户账户');
      setShowSendForm(false);
      setSelectedDocument(null);
      setSelectedCustomer('');
      
      // 清除成功提示
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？')) return;

    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setDocuments(documents.filter((d) => d.id !== id));
      setSuccess('文档已删除');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4c1d95] via-[#9333ea] to-[#701a75] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-gray-300">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4c1d95] via-[#9333ea] to-[#701a75]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary-900/50 backdrop-blur border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">资料管理</h1>
              <p className="text-sm text-gray-400">
                上传和管理资料，发送到客户账户
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowUploadForm(true)}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                上传资料
              </Button>
              <Button
                onClick={() => setShowSendForm(true)}
                disabled={!selectedDocument}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                发送到客户
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-sm text-green-300">{success}</p>
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="mb-8 bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">上传资料</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  资料标题 <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入资料标题"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  资料描述
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入资料描述"
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    资料分类
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2"
                    aria-label="资料分类"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-primary-900">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/10"
                    />
                    <span className="text-sm text-white">公开资料</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  选择文件 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-input"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <label
                    htmlFor="file-input"
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-300">
                      {uploading ? '上传中...' : '点击选择文件或拖拽上传'}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  支持: PDF, Word, Excel (最大 50MB)
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowUploadForm(false)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Send Form */}
        {showSendForm && selectedDocument && (
          <div className="mb-8 bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">发送资料到客户</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  选择的资料
                </label>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white font-medium">{selectedDocument.title}</p>
                  <p className="text-sm text-gray-400">
                    {formatFileSize(selectedDocument.fileSize)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  选择客户 <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2"
                  aria-label="选择客户"
                >
                  <option value="" className="bg-primary-900">
                    -- 选择客户 --
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id} className="bg-primary-900">
                      {customer.firstName} {customer.lastName} ({customer.email})
                      {customer.customUserId && ` - ${customer.customUserId}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSendDocument}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                >
                  <Send className="h-4 w-4 mr-2" />
                  发送资料
                </Button>
                <Button
                  onClick={() => {
                    setShowSendForm(false);
                    setSelectedDocument(null);
                    setSelectedCustomer('');
                  }}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Documents List */}
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">暂无资料，点击上方按钮上传</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={cn(
                    'bg-primary-900/40 backdrop-blur rounded-lg border p-6 cursor-pointer transition-colors',
                    selectedDocument?.id === doc.id
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-white">
                          {doc.title}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-300">
                          {categories.find((c) => c.value === doc.category)?.label}
                        </span>
                        {doc.isPublic && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-300">
                            公开
                          </span>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-300 mb-2">{doc.description}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        大小: {formatFileSize(doc.fileSize)} | 下载: {doc.downloadCount} 次 | 上传: {new Date(doc.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:bg-blue-500/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
