'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  Eye,
  Undo,
  Redo,
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import type {
  Template,
  TemplateType,
  TemplatePlaceholder,
  TemplateEditorProps,
  TextStyle,
} from '@/types/editor';
import { DEFAULT_PLACEHOLDERS, DEFAULT_TEXT_STYLE } from '@/types/editor';

// ============================================
// 类型定义
// ============================================

interface HistoryState {
  content: string;
  timestamp: number;
}

// ============================================
// TemplateEditor 组件
// ============================================

export function TemplateEditor({ template, onSave, onPreview }: TemplateEditorProps) {
  // 表单状态
  const [name, setName] = useState(template?.name ?? '');
  const [type, setType] = useState<TemplateType>(template?.type ?? 'order_confirmation');
  const [content, setContent] = useState(template?.content ?? '');
  const [placeholders, setPlaceholders] = useState<TemplatePlaceholder[]>(
    template?.placeholders ?? DEFAULT_PLACEHOLDERS[type]
  );
  const [isActive, setIsActive] = useState(template?.isActive ?? true);

  // 编辑状态
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 历史记录（用于撤销/重做）
  const [history, setHistory] = useState<HistoryState[]>([
    { content: template?.content ?? '', timestamp: Date.now() },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // 对话框状态
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingTypeChange, setPendingTypeChange] = useState<TemplateType | null>(null);

  // 初始内容（用于检测变更）
  const [initialContent, setInitialContent] = useState(template?.content ?? '');

  // 检测变更
  useEffect(() => {
    const hasChanges =
      name !== (template?.name ?? '') ||
      type !== (template?.type ?? 'order_confirmation') ||
      content !== initialContent ||
      isActive !== (template?.isActive ?? true);
    setIsDirty(hasChanges);
  }, [name, type, content, isActive, template, initialContent]);

  // 类型变更时更新占位符
  const handleTypeChange = (newType: TemplateType) => {
    if (isDirty) {
      setPendingTypeChange(newType);
      setShowUnsavedDialog(true);
    } else {
      applyTypeChange(newType);
    }
  };

  const applyTypeChange = (newType: TemplateType) => {
    setType(newType);
    setPlaceholders(DEFAULT_PLACEHOLDERS[newType]);
    setPendingTypeChange(null);
  };

  // 内容变更处理
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // 添加到历史记录（防抖）
    const now = Date.now();
    const lastHistory = history[historyIndex];
    if (now - lastHistory.timestamp > 1000) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ content: newContent, timestamp: now });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // 撤销
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex].content);
    }
  }, [history, historyIndex]);

  // 重做
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex].content);
    }
  }, [history, historyIndex]);

  // 保存
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const templateData: Template = {
        id: template?.id ?? '',
        name,
        type,
        content,
        placeholders,
        styles: template?.styles ?? {},
        isActive,
        createdAt: template?.createdAt ?? new Date(),
        updatedAt: new Date(),
      };
      await onSave(templateData);
      setInitialContent(content);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  // 预览
  const handlePreview = () => {
    const templateData: Template = {
      id: template?.id ?? '',
      name,
      type,
      content,
      placeholders,
      styles: template?.styles ?? {},
      isActive,
      createdAt: template?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    onPreview(templateData);
  };

  // 插入占位符
  const insertPlaceholder = (placeholder: TemplatePlaceholder) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + placeholder.key + content.substring(end);
      handleContentChange(newContent);
      
      // 恢复光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + placeholder.key.length,
          start + placeholder.key.length
        );
      }, 0);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleUndo}
            disabled={!canUndo}
            aria-label="撤销"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRedo}
            disabled={!canRedo}
            aria-label="重做"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              未保存的更改
            </span>
          )}
          <Button type="button" variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-1" />
            预览
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：模板设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">模板设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>模板名称</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入模板名称"
              />
            </div>

            <div className="space-y-2">
              <Label>模板类型</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_confirmation">订单确认</SelectItem>
                  <SelectItem value="shipping_notification">发货通知</SelectItem>
                  <SelectItem value="invoice">发票</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>可用占位符</Label>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-1">
                  {placeholders.map((placeholder) => (
                    <button
                      key={placeholder.key}
                      type="button"
                      className="w-full text-left px-2 py-1 text-sm rounded hover:bg-muted transition-colors"
                      onClick={() => insertPlaceholder(placeholder)}
                    >
                      <span className="font-mono text-primary">{placeholder.key}</span>
                      <span className="text-muted-foreground ml-2">
                        {placeholder.label}
                      </span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                点击占位符插入到内容中
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：内容编辑 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              模板内容
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="template-content"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="输入模板内容，使用占位符来插入动态数据..."
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* 未保存更改对话框 */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>未保存的更改</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            您有未保存的更改。切换模板类型将丢失当前的占位符设置。是否继续？
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnsavedDialog(false);
                setPendingTypeChange(null);
              }}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                if (pendingTypeChange) {
                  applyTypeChange(pendingTypeChange);
                }
                setShowUnsavedDialog(false);
              }}
            >
              继续
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// 模板预览组件
// ============================================

interface TemplatePreviewProps {
  template: Template;
  sampleData?: Record<string, string>;
}

export function TemplatePreview({ template, sampleData }: TemplatePreviewProps) {
  // 使用默认占位符值或提供的示例数据
  const data = sampleData ?? Object.fromEntries(
    template.placeholders.map((p) => [p.key, p.defaultValue])
  );

  // 替换占位符
  const renderedContent = substituteTemplatePlaceholders(template.content, data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">预览: {template.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white border rounded-lg p-6 whitespace-pre-wrap">
          {renderedContent}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// 工具函数（用于属性测试）
// ============================================

/**
 * 替换模板占位符
 */
export function substituteTemplatePlaceholders(
  content: string,
  data: Record<string, string>
): string {
  let result = content;
  for (const [key, value] of Object.entries(data)) {
    // Use a function as replacement to avoid special character interpretation
    // (e.g., $$ becomes $ in normal string replacement)
    result = result.replace(new RegExp(escapeRegExp(key), 'g'), () => value);
  }
  return result;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 验证模板加载是否正确填充编辑器
 */
export function verifyTemplateLoad(
  template: Template,
  editorContent: string
): boolean {
  return editorContent === template.content;
}

/**
 * 撤销操作
 */
export function undoOperation<T>(history: T[], currentIndex: number): { value: T; newIndex: number } | null {
  if (currentIndex <= 0) {
    return null;
  }
  const newIndex = currentIndex - 1;
  return { value: history[newIndex], newIndex };
}

/**
 * 重做操作
 */
export function redoOperation<T>(history: T[], currentIndex: number): { value: T; newIndex: number } | null {
  if (currentIndex >= history.length - 1) {
    return null;
  }
  const newIndex = currentIndex + 1;
  return { value: history[newIndex], newIndex };
}

/**
 * 验证撤销/重做往返
 */
export function verifyUndoRedoRoundTrip<T>(
  history: T[],
  startIndex: number
): boolean {
  // 执行撤销
  const undoResult = undoOperation(history, startIndex);
  if (!undoResult) {
    return startIndex === 0; // 如果在开头，撤销应该失败
  }

  // 执行重做
  const redoResult = redoOperation(history, undoResult.newIndex);
  if (!redoResult) {
    return false;
  }

  // 应该回到原始索引
  return redoResult.newIndex === startIndex;
}

/**
 * 检测脏状态
 */
export function detectDirtyState(
  original: string,
  current: string
): boolean {
  return original !== current;
}

/**
 * 验证占位符替换
 */
export function verifyPlaceholderSubstitution(
  content: string,
  placeholders: TemplatePlaceholder[],
  data: Record<string, string>
): boolean {
  const result = substituteTemplatePlaceholders(content, data);
  
  // 检查所有占位符是否被替换
  for (const placeholder of placeholders) {
    if (data[placeholder.key] && result.includes(placeholder.key)) {
      return false; // 占位符未被替换
    }
    if (data[placeholder.key] && !result.includes(data[placeholder.key])) {
      return false; // 替换值未出现
    }
  }
  
  return true;
}
