'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InvoiceEditor } from '@/components/invoice/InvoiceEditor';
import { Loader2, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  email: string;
  customUserId?: string;
  firstName: string;
  lastName: string;
}

interface Invoice {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  customerCustomId?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch invoices
      const invoicesResponse = await fetch('/api/admin/invoices');
      if (!invoicesResponse.ok) throw new Error('Failed to fetch invoices');
      const invoicesData = await invoicesResponse.json();
      setInvoices(invoicesData.invoices || []);

      // Fetch customers
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

  const handleSaveInvoice = async (data: any) => {
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save invoice');

      const result = await response.json();
      setInvoices([result.invoice, ...invoices]);
      setShowEditor(false);
      setEditingInvoice(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('确定要删除这张发票吗？')) return;

    try {
      const response = await fetch(`/api/admin/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete invoice');

      setInvoices(invoices.filter((inv) => inv.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold theme-gradient-text">发票管理</h1>
          <p className="text-gray-400 mt-2">创建、编辑和管理发票</p>
        </div>
        <Button
          onClick={() => {
            setEditingInvoice(null);
            setShowEditor(true);
          }}
          className="theme-gradient-bg text-white hover:shadow-lg transition-shadow"
        >
          <Plus className="h-4 w-4 mr-2" />
          创建发票
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Editor */}
      {showEditor && (
        <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6">
          <InvoiceEditor
            customers={customers}
            onSave={handleSaveInvoice}
            onCancel={() => {
              setShowEditor(false);
              setEditingInvoice(null);
            }}
          />
        </div>
      )}

      {/* Invoices list */}
      {!showEditor && (
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-12 text-center">
              <p className="text-gray-400">暂无发票</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {invoice.number}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {invoice.customerName} ({invoice.customerEmail})
                      </p>
                      {invoice.customerCustomId && (
                        <p className="text-xs text-gray-500 mt-1">
                          客户ID: {invoice.customerCustomId}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        invoice.status === 'DRAFT'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : invoice.status === 'PAID'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-blue-500/20 text-blue-300'
                      )}
                    >
                      {invoice.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">开票日期</p>
                      <p className="text-sm text-white font-medium">
                        {new Date(invoice.issueDate).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">到期日期</p>
                      <p className="text-sm text-white font-medium">
                        {new Date(invoice.dueDate).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">小计</p>
                      <p className="text-sm text-white font-medium">
                        ¥{invoice.subtotal.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">总计</p>
                      <p className="text-lg text-white font-bold">
                        ¥{invoice.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingInvoice(invoice);
                        setShowEditor(true);
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:bg-blue-500/20"
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
                      onClick={() => handleDeleteInvoice(invoice.id)}
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
      )}
    </div>
  );
}
