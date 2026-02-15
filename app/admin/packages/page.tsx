'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, Trash2, Send, Package, Loader2, Plus, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackageFile {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
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

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageFile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageFile | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 获取压缩包列表
      const packagesResponse = await fetch('/api/admin/packages');
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setPackages(packagesData.packages || []);
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

    // 验证文件类型
    const allowedTypes = ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-zip-compressed'];
    if (!allowedTypes.includes(file.type)) {
      setError('只支持 ZIP、RAR、7Z 格式的压缩包');
      return;
    }

    if (!formData.title) {
      setError('请填写压缩包标题');
      return;
    }

    // 检查文件大小
    const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
    if (file.size > maxSize) {
      setError(`文件过大。最大支持 10GB，您的文件为 ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB`);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);

      const response = await fetch('/api/admin/packages/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setPackages([data.package, ...packages]);
      setSuccess('压缩包上传成功');
      setShowUploadForm(false);
      setFormData({ title: '', description: '' });
      setUploadProgress(0);
      
      // 清除成功提示
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleSendPackage = async () => {
    if (!selectedPackage || !selectedCustomer) {
      setError('请选择压缩包和客户');
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/admin/packages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          customerId: selectedCustomer,
          sendEmail,
        }),
      });

      if (!response.ok) throw new Error('Send failed');

      setSuccess('压缩包已发送到客户账户' + (sendEmail ? '和邮箱' : ''));
      setShowSendForm(false);
      setSelectedPackage(null);
      setSelectedCustomer('');
      
      // 清除成功提示
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
    }
  };

  const handleDownloadPackage = async (pkg: PackageFile) => {
    try {
      const response = await fetch(`/api/admin/packages/${pkg.id}/download`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pkg.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('确定要删除这个压缩包吗？')) return;

    try {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setPackages(packages.filter((p) => p.id !== id));
      setSuccess('压缩包已删除');
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
              <h1 className="text-2xl font-bold text-white">压缩包管理</h1>
              <p className="text-sm text-gray-400">
                上传和管理压缩包，发送到客户账户和邮箱
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowUploadForm(true)}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                上传压缩包
              </Button>
              <Button
                onClick={() => setShowSendForm(true)}
                disabled={!selectedPackage}
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
            <h2 className="text-lg font-semibold text-white mb-6">上传压缩包</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  压缩包标题 <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入压缩包标题"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  压缩包描述
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入压缩包描述"
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  选择压缩包 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-input"
                    accept=".zip,.rar,.7z"
                  />
                  <label
                    htmlFor="file-input"
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-300">
                      {uploading ? '上传中...' : '点击选择压缩包或拖拽上传'}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  支持: ZIP, RAR, 7Z (最大 10GB)
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
        {showSendForm && selectedPackage && (
          <div className="mb-8 bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">发送压缩包到客户</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  选择的压缩包
                </label>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white font-medium">{selectedPackage.title}</p>
                  <p className="text-sm text-gray-400">
                    {formatFileSize(selectedPackage.fileSize)}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10"
                />
                <label htmlFor="sendEmail" className="text-sm text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  同时发送下载链接到邮箱
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSendPackage}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                >
                  <Send className="h-4 w-4 mr-2" />
                  发送压缩包
                </Button>
                <Button
                  onClick={() => {
                    setShowSendForm(false);
                    setSelectedPackage(null);
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

        {/* Packages List */}
        <div className="space-y-4">
          {packages.length === 0 ? (
            <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">暂无压缩包，点击上方按钮上传</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={cn(
                    'bg-primary-900/40 backdrop-blur rounded-lg border p-6 cursor-pointer transition-colors',
                    selectedPackage?.id === pkg.id
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-white">
                          {pkg.title}
                        </h3>
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-gray-300 mb-2">{pkg.description}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        大小: {formatFileSize(pkg.fileSize)} | 下载: {pkg.downloadCount} 次 | 上传: {new Date(pkg.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPackage(pkg);
                      }}
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
                        handleDeletePackage(pkg.id);
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
