'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Printer, Zap, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { dashboardStyles } from '@/lib/dashboard-styles';
import { cn } from '@/lib/utils';
import { useDashboardTranslations } from '@/lib/i18n/use-dashboard-translations';


interface FactoryOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  dueDate: string;
  createdAt: string;
  specifications: string;
  notes: string;
}

interface QuoteRequest {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  productType: string;
  quantity: string;
  specifications: string;
  status: string;
  createdAt: string;
}

export default function FactoryOrdersPage() {
  const { t, isRTL, locale } = useDashboardTranslations();
  const [activeTab, setActiveTab] = useState('orders');

  // Product types with translations
  const PRODUCT_TYPES = [
    { value: 'packaging', label: t('factoryOrders.productTypes.packaging'), icon: Package },
    { value: 'paper', label: t('factoryOrders.productTypes.paper'), icon: Package },
    { value: 'poster', label: t('factoryOrders.productTypes.poster'), icon: Zap },
    { value: 'advertisement', label: t('factoryOrders.productTypes.advertisement'), icon: TrendingUp },
    { value: 'businessCard', label: t('factoryOrders.productTypes.businessCard'), icon: Package },
    { value: 'printing', label: t('factoryOrders.productTypes.printing'), icon: Printer },
    { value: 'custom', label: t('factoryOrders.productTypes.custom'), icon: Package },
  ];

  // Order status with translations
  const ORDER_STATUS = {
    QUOTE_PENDING: { text: t('factoryOrders.status.quotePending'), color: 'bg-yellow-500' },
    QUOTE_SENT: { text: t('factoryOrders.status.quoteSent'), color: 'bg-blue-500' },
    CONFIRMED: { text: t('factoryOrders.status.confirmed'), color: 'bg-green-500' },
    IN_PRODUCTION: { text: t('factoryOrders.status.inProduction'), color: 'bg-purple-500' },
    QUALITY_CHECK: { text: t('factoryOrders.status.qualityCheck'), color: 'bg-orange-500' },
    READY_SHIP: { text: t('factoryOrders.status.readyShip'), color: 'bg-cyan-500' },
    SHIPPED: { text: t('factoryOrders.status.shipped'), color: 'bg-indigo-500' },
    COMPLETED: { text: t('factoryOrders.status.completed'), color: 'bg-emerald-500' },
    CANCELLED: { text: t('factoryOrders.status.cancelled'), color: 'bg-red-500' },
  };
  const [orders, setOrders] = useState<FactoryOrder[]>([
    {
      id: '1',
      orderNumber: 'FO-2024-001',
      clientName: 'Tech Company A',
      productType: 'packaging',
      quantity: 5000,
      unitPrice: 2.5,
      totalPrice: 12500,
      status: 'IN_PRODUCTION',
      dueDate: '2024-02-15',
      createdAt: '2024-01-20',
      specifications: 'Colored packaging boxes, size 20x15x10cm, 250g coated paper',
      notes: 'Rush order, requires expedited processing',
    },
  ]);

  const [quotes, setQuotes] = useState<QuoteRequest[]>([
    {
      id: '1',
      clientName: 'Advertising Company B',
      email: 'contact@adcompany.com',
      phone: '13800138000',
      productType: 'poster',
      quantity: '1000',
      specifications: 'A3 size, color printing, 157g coated paper',
      status: 'PENDING',
      createdAt: '2024-01-25',
    },
  ]);

  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    clientName: '',
    productType: '',
    quantity: '',
    unitPrice: '',
    dueDate: '',
    specifications: '',
    notes: '',
  });

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [newQuote, setNewQuote] = useState({
    clientName: '',
    email: '',
    phone: '',
    productType: '',
    quantity: '',
    specifications: '',
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.clientName || !newOrder.productType || !newOrder.quantity) {
      toast.error(t('factoryOrders.form.requiredFields'));
      return;
    }

    const order: FactoryOrder = {
      id: Date.now().toString(),
      orderNumber: `FO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      clientName: newOrder.clientName,
      productType: newOrder.productType,
      quantity: parseInt(newOrder.quantity),
      unitPrice: parseFloat(newOrder.unitPrice) || 0,
      totalPrice: parseInt(newOrder.quantity) * (parseFloat(newOrder.unitPrice) || 0),
      status: 'QUOTE_PENDING',
      dueDate: newOrder.dueDate,
      createdAt: new Date().toISOString(),
      specifications: newOrder.specifications,
      notes: newOrder.notes,
    };

    setOrders([order, ...orders]);
    setNewOrder({
      clientName: '',
      productType: '',
      quantity: '',
      unitPrice: '',
      dueDate: '',
      specifications: '',
      notes: '',
    });
    setShowNewOrderForm(false);
    toast.success(t('factoryOrders.form.orderCreated'));
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.clientName || !newQuote.productType || !newQuote.quantity) {
      toast.error(t('factoryOrders.form.requiredFields'));
      return;
    }

    const quote: QuoteRequest = {
      id: Date.now().toString(),
      clientName: newQuote.clientName,
      email: newQuote.email,
      phone: newQuote.phone,
      productType: newQuote.productType,
      quantity: newQuote.quantity,
      specifications: newQuote.specifications,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setQuotes([quote, ...quotes]);
    setNewQuote({
      clientName: '',
      email: '',
      phone: '',
      productType: '',
      quantity: '',
      specifications: '',
    });
    setShowQuoteForm(false);
    toast.success(t('factoryOrders.form.quoteCreated'));
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(t('factoryOrders.form.statusUpdated'));
  };

  const getProductTypeLabel = (type: string) => {
    return PRODUCT_TYPES.find(p => p.value === type)?.label || type;
  };

  // Get locale string for date formatting
  const getDateLocale = () => {
    const localeMap: Record<string, string> = {
      'zh': 'zh-CN',
      'zh-TW': 'zh-TW',
      'en': 'en-US',
      'ug': 'ug-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR'
    };
    return localeMap[locale] || 'en-US';
  };

  const stats = {
    totalOrders: orders.length,
    inProduction: orders.filter(o => o.status === 'IN_PRODUCTION').length,
    pendingQuotes: quotes.filter(q => q.status === 'PENDING').length,
    monthlyRevenue: orders.reduce((sum, o) => sum + o.totalPrice, 0),
  };

  return (
    <div className="purple-gradient-page purple-gradient-content min-h-screen p-4 md:p-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="purple-gradient-title text-3xl md:text-4xl font-bold mb-2">{t('factoryOrders.title')}</h1>
          <p className="purple-gradient-text text-lg">{t('factoryOrders.description')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="purple-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="purple-gradient-title text-sm font-medium">{t('factoryOrders.stats.totalOrders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="purple-gradient-title text-2xl font-bold">{stats.totalOrders}</div>
              <p className="purple-gradient-text text-xs text-muted-foreground">{t('factoryOrders.stats.thisMonth')}</p>
            </CardContent>
          </Card>

          <Card className="purple-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="purple-gradient-title text-sm font-medium">{t('factoryOrders.stats.inProduction')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="purple-gradient-title text-2xl font-bold text-purple-600">{stats.inProduction}</div>
              <p className="purple-gradient-text text-xs text-muted-foreground">{t('factoryOrders.stats.activeOrders')}</p>
            </CardContent>
          </Card>

          <Card className="purple-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="purple-gradient-title text-sm font-medium">{t('factoryOrders.stats.pendingQuotes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="purple-gradient-title text-2xl font-bold text-yellow-600">{stats.pendingQuotes}</div>
              <p className="purple-gradient-text text-xs text-muted-foreground">{t('factoryOrders.stats.needsProcessing')}</p>
            </CardContent>
          </Card>

          <Card className="purple-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="purple-gradient-title text-sm font-medium">{t('factoryOrders.stats.monthlyRevenue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="purple-gradient-title text-2xl font-bold text-green-600">¥{stats.monthlyRevenue.toLocaleString()}</div>
              <p className="purple-gradient-text text-xs text-muted-foreground">{t('factoryOrders.stats.totalThisMonth')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" />
              {t('factoryOrders.tabs.productionOrders')}
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-2">
              <Zap className="w-4 h-4" />
              {t('factoryOrders.tabs.quoteRequests')}
            </TabsTrigger>
            <TabsTrigger value="production" className="gap-2">
              <Clock className="w-4 h-4" />
              {t('factoryOrders.tabs.productionProgress')}
            </TabsTrigger>
          </TabsList>

          {/* Production Orders */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowNewOrderForm(!showNewOrderForm)} className="purple-gradient-button gap-2">
                <Plus className="w-4 h-4" />
                {t('factoryOrders.actions.newOrder')}
              </Button>
            </div>

            {showNewOrderForm && (
              <Card className="purple-gradient-card">
                <CardHeader>
                  <CardTitle className="purple-gradient-title">{t('factoryOrders.form.createNewOrder')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.clientName')} *</label>
                        <Input
                          value={newOrder.clientName}
                          onChange={(e) => setNewOrder({ ...newOrder, clientName: e.target.value })}
                          placeholder={t('factoryOrders.form.clientNamePlaceholder')}
                          className="purple-gradient-input bg-muted/30"
                          required
                        />
                      </div>
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.productType')} *</label>
                        <Select value={newOrder.productType} onValueChange={(v) => setNewOrder({ ...newOrder, productType: v })}>
                          <SelectTrigger className="purple-gradient-input bg-muted/30">
                            <SelectValue placeholder={t('factoryOrders.form.selectProductType')} />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_TYPES.map(p => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.quantity')} *</label>
                        <Input
                          type="number"
                          value={newOrder.quantity}
                          onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                          placeholder="0"
                          className="purple-gradient-input bg-muted/30"
                          required
                        />
                      </div>
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.unitPrice')}</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newOrder.unitPrice}
                          onChange={(e) => setNewOrder({ ...newOrder, unitPrice: e.target.value })}
                          placeholder="0.00"
                          className="purple-gradient-input bg-muted/30"
                        />
                      </div>
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.deliveryDate')}</label>
                        <Input
                          type="date"
                          value={newOrder.dueDate}
                          onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                          className="purple-gradient-input bg-muted/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.specifications')}</label>
                      <Textarea
                        value={newOrder.specifications}
                        onChange={(e) => setNewOrder({ ...newOrder, specifications: e.target.value })}
                        placeholder={t('factoryOrders.form.specificationsPlaceholder')}
                        className="purple-gradient-input bg-muted/30 min-h-20"
                      />
                    </div>

                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.notes')}</label>
                      <Textarea
                        value={newOrder.notes}
                        onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                        placeholder={t('factoryOrders.form.notesPlaceholder')}
                        className="purple-gradient-input bg-muted/30 min-h-16"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="purple-gradient-button flex-1">{t('factoryOrders.actions.createOrder')}</Button>
                      <Button type="button" variant="outline" onClick={() => setShowNewOrderForm(false)} className="purple-gradient-button-outline flex-1">
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="purple-gradient-card">
              <CardHeader>
                <CardTitle className="purple-gradient-title">{t('factoryOrders.orderList')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-muted/30 rounded-lg p-4 border border-border/40">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="purple-gradient-title font-semibold">{order.orderNumber}</h3>
                          <p className="purple-gradient-text text-sm text-muted-foreground">{order.clientName}</p>
                        </div>
                        <Badge className={ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color || 'bg-gray-500'}>
                          {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.text || order.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3 text-sm">
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('factoryOrders.table.productType')}</p>
                          <p className="purple-gradient-text font-medium">{getProductTypeLabel(order.productType)}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('factoryOrders.table.quantity')}</p>
                          <p className="purple-gradient-text font-medium">{order.quantity.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('factoryOrders.table.unitPrice')}</p>
                          <p className="purple-gradient-text font-medium">¥{order.unitPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('factoryOrders.table.totalPrice')}</p>
                          <p className="purple-gradient-text font-medium text-green-600">¥{order.totalPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('factoryOrders.table.deliveryDate')}</p>
                          <p className="purple-gradient-text font-medium">{new Date(order.dueDate).toLocaleDateString(getDateLocale())}</p>
                        </div>
                      </div>

                      {order.specifications && (
                        <div className="mb-3 p-2 bg-background rounded text-sm">
                          <p className="purple-gradient-text text-muted-foreground text-xs mb-1">{t('factoryOrders.form.specifications')}</p>
                          <p className="purple-gradient-text">{order.specifications}</p>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                          <SelectTrigger className="w-40 bg-muted/30 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ORDER_STATUS).map(([key, val]) => (
                              <SelectItem key={key} value={key}>{val.text}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="purple-gradient-button-outline">{t('factoryOrders.actions.edit')}</Button>
                        <Button variant="outline" size="sm" className="purple-gradient-button-outline">{t('factoryOrders.actions.print')}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quote Requests */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowQuoteForm(!showQuoteForm)} className="purple-gradient-button gap-2">
                <Plus className="w-4 h-4" />
                {t('factoryOrders.actions.newQuote')}
              </Button>
            </div>

            {showQuoteForm && (
              <Card className="purple-gradient-card">
                <CardHeader>
                  <CardTitle className="purple-gradient-title">{t('factoryOrders.form.createQuoteRequest')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateQuote} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.clientName')} *</label>
                        <Input
                          value={newQuote.clientName}
                          onChange={(e) => setNewQuote({ ...newQuote, clientName: e.target.value })}
                          placeholder={t('factoryOrders.form.clientNamePlaceholder')}
                          className="purple-gradient-input bg-muted/30"
                          required
                        />
                      </div>
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.email')}</label>
                        <Input
                          type="email"
                          value={newQuote.email}
                          onChange={(e) => setNewQuote({ ...newQuote, email: e.target.value })}
                          placeholder={t('factoryOrders.form.emailPlaceholder')}
                          className="purple-gradient-input bg-muted/30"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.phone')}</label>
                        <Input
                          value={newQuote.phone}
                          onChange={(e) => setNewQuote({ ...newQuote, phone: e.target.value })}
                          placeholder={t('factoryOrders.form.phonePlaceholder')}
                          className="purple-gradient-input bg-muted/30"
                        />
                      </div>
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.productType')} *</label>
                        <Select value={newQuote.productType} onValueChange={(v) => setNewQuote({ ...newQuote, productType: v })}>
                          <SelectTrigger className="purple-gradient-input bg-muted/30">
                            <SelectValue placeholder={t('factoryOrders.form.selectProductType')} />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_TYPES.map(p => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.quantity')} *</label>
                      <Input
                        value={newQuote.quantity}
                        onChange={(e) => setNewQuote({ ...newQuote, quantity: e.target.value })}
                        placeholder={t('factoryOrders.form.quantityPlaceholder')}
                        className="purple-gradient-input bg-muted/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('factoryOrders.form.specifications')}</label>
                      <Textarea
                        value={newQuote.specifications}
                        onChange={(e) => setNewQuote({ ...newQuote, specifications: e.target.value })}
                        placeholder={t('factoryOrders.form.specificationsPlaceholder')}
                        className="purple-gradient-input bg-muted/30 min-h-20"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="purple-gradient-button flex-1">{t('factoryOrders.actions.createQuote')}</Button>
                      <Button type="button" variant="outline" onClick={() => setShowQuoteForm(false)} className="purple-gradient-button-outline flex-1">
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="purple-gradient-card">
              <CardHeader>
                <CardTitle className="purple-gradient-title">{t('factoryOrders.quoteRequestList')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quotes.map(quote => (
                    <div key={quote.id} className="bg-muted/30 rounded-lg p-4 border border-border/40">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="purple-gradient-title font-semibold">{quote.clientName}</h3>
                          <p className="purple-gradient-text text-sm text-muted-foreground">{quote.email} | {quote.phone}</p>
                        </div>
                        <Badge variant={quote.status === 'PENDING' ? 'outline' : 'default'}>
                          {quote.status === 'PENDING' ? t('factoryOrders.quoteStatus.pending') : t('factoryOrders.quoteStatus.processed')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('factoryOrders.table.productType')}</p>
                          <p className="purple-gradient-text font-medium">{getProductTypeLabel(quote.productType)}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('factoryOrders.table.quantity')}</p>
                          <p className="purple-gradient-text font-medium">{quote.quantity}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('factoryOrders.table.requestDate')}</p>
                          <p className="purple-gradient-text font-medium">{new Date(quote.createdAt).toLocaleDateString(getDateLocale())}</p>
                        </div>
                      </div>

                      {quote.specifications && (
                        <div className="mb-3 p-2 bg-background rounded text-sm">
                          <p className="purple-gradient-text text-muted-foreground text-xs mb-1">{t('factoryOrders.form.specifications')}</p>
                          <p className="purple-gradient-text">{quote.specifications}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" className="purple-gradient-button">{t('factoryOrders.actions.sendQuote')}</Button>
                        <Button variant="outline" size="sm" className="purple-gradient-button-outline">{t('factoryOrders.actions.convertToOrder')}</Button>
                        <Button variant="outline" size="sm" className="purple-gradient-button-outline">{t('factoryOrders.actions.delete')}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Production Progress */}
          <TabsContent value="production" className="space-y-6">
            <Card className="purple-gradient-card">
              <CardHeader>
                <CardTitle className="purple-gradient-title">{t('factoryOrders.productionProgressTracking')}</CardTitle>
                <CardDescription className="purple-gradient-text">{t('factoryOrders.productionProgressDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.filter(o => ['IN_PRODUCTION', 'QUALITY_CHECK', 'READY_SHIP'].includes(o.status)).map(order => (
                    <div key={order.id} className="bg-muted/30 rounded-lg p-4 border border-border/40">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="purple-gradient-title font-semibold">{order.orderNumber}</h3>
                          <p className="purple-gradient-text text-sm text-muted-foreground">{order.clientName} - {getProductTypeLabel(order.productType)}</p>
                        </div>
                        <div className="text-right">
                          <p className="purple-gradient-text text-sm font-medium">{order.quantity.toLocaleString()} {t('factoryOrders.units')}</p>
                          <p className="purple-gradient-text text-xs text-muted-foreground">{t('factoryOrders.delivery')}: {new Date(order.dueDate).toLocaleDateString(getDateLocale())}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="purple-gradient-text text-sm font-medium">{t('factoryOrders.productionProgress')}</span>
                          <span className="purple-gradient-text text-sm text-muted-foreground">75%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto mb-1" />
                          <p className="purple-gradient-text">{t('factoryOrders.progressSteps.orderPlaced')}</p>
                        </div>
                        <div className="text-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto mb-1" />
                          <p className="purple-gradient-text">{t('factoryOrders.progressSteps.inProduction')}</p>
                        </div>
                        <div className="text-center">
                          <Clock className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                          <p className="purple-gradient-text">{t('factoryOrders.progressSteps.qualityCheck')}</p>
                        </div>
                        <div className="text-center">
                          <AlertCircle className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                          <p className="purple-gradient-text">{t('factoryOrders.progressSteps.readyToShip')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
