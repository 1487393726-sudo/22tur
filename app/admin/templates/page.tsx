'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Eye, ChevronLeft, FileCode } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'order_confirmation',
    content: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  const templateTypes = [
    { value: 'order_confirmation', label: '订单确认' },
    { value: 'shipping_notification', label: '发货通知' },
    { value: 'invoice', label: '发票' },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) {
      setError('请填写必填项');
      return;
    }

    try {
      const method = editingTemplate ? 'PUT' : 'POST';
      const url = editingTemplate
        ? `/api/admin/templates/${editingTemplate.id}`
        : '/api/admin/templates';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save template');

      const data = await response.json();
      
      if (editingTemplate) {
        setTemplates(templates.map((t) => (t.id === editingTemplate.id ? data.template : t)));
      } else {
        setTemplates([data.template, ...templates]);
      }

      setShowEditor(false);
      setEditingTemplate(null);
      setFormData({ name: '', type: 'order_confirmation', content: '', isActive: true });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模板吗？')) return;

    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete template');

      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      content: template.content,
      isActive: template.isActive,
    });
    setShowEditor(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4c1d95] via-[#9333ea] to-[#701a75] flex items-center justify-center">
        <div className="text-center">
          <FileCode className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
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
            <div className="flex items-center gap-4">
              <div>
                <h1 className="theme-gradient-text text-2xl font-bold">模板管理</h1>
                <p className="text-sm text-gray-400">
                  创建和管理订单、发货、发票等模板
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setFormData({ name: '', type: 'order_confirmation', content: '', isActive: true });
                setShowEditor(true);
              }}
              className="theme-gradient-bg text-white hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              创建模板
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Editor */}
        {showEditor && (
          <div className="mb-8 bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="theme-gradient-text text-lg font-semibold">
                {editingTemplate ? '编辑模板' : '创建模板'}
              </h2>
              <Button
                onClick={() => {
                  setShowEditor(false);
                  setEditingTemplate(null);
                }}
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                关闭
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="theme-gradient-text block text-sm font-medium mb-2">
                    模板名称 <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="输入模板名称"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:theme-gradient-border"
                  />
                </div>
                <div>
                  <label className="theme-gradient-text block text-sm font-medium mb-2">
                    模板类型 <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2 focus:theme-gradient-border"
                    aria-label="模板类型"
                  >
                    {templateTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-primary-900">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="theme-gradient-text block text-sm font-medium mb-2">
                  模板内容 <span className="text-red-400">*</span>
                </label>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  placeholder="输入模板内容，使用 {placeholder} 格式添加占位符"
                  rows={8}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:theme-gradient-border"
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 提示: 使用 {'{customer_name}'}, {'{order_number}'}, {'{total_amount}'} 等占位符
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-white"
                />
                <label htmlFor="isActive" className="text-sm text-white">
                  启用此模板
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 theme-gradient-bg text-white hover:shadow-lg transition-shadow"
                >
                  保存模板
                </Button>
                <Button
                  onClick={() => {
                    setShowEditor(false);
                    setEditingTemplate(null);
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

        {/* Templates list */}
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-12 text-center">
              <FileCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">暂无模板，点击上方按钮创建</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="theme-gradient-text text-lg font-semibold">
                          {template.name}
                        </h3>
                        <span
                          className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            template.isActive
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-gray-500/20 text-gray-300'
                          )}
                        >
                          {template.isActive ? '启用' : '禁用'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        类型: {templateTypes.find((t) => t.value === template.type)?.label}
                      </p>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {template.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => handleEdit(template)}
                      size="sm"
                      variant="ghost"
                      className="theme-gradient-text hover:bg-blue-500/20"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:bg-white/10"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      预览
                    </Button>
                    <Button
                      onClick={() => handleDelete(template.id)}
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
