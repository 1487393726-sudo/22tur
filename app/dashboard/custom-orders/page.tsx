'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, X, Eye, FileText, Package, Shirt, Box } from 'lucide-react';
import { toast } from 'sonner';
import { dashboardStyles, getStatusVariant } from '@/lib/dashboard-styles';
import { cn } from '@/lib/utils';
import { useDashboardTranslations } from '@/lib/i18n/use-dashboard-translations';


interface OrderFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface CustomOrder {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  dueDate: string;
  budget: number;
  description: string;
}

export default function CustomOrdersPage() {
  const { t, isRTL, locale } = useDashboardTranslations();
  const [activeTab, setActiveTab] = useState('new');
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Categories with translations
  const CATEGORIES = [
    { value: 'paper', label: t('customOrders.categories.paper'), icon: FileText, description: t('customOrders.categories.paperDesc') },
    { value: 'clothing', label: t('customOrders.categories.clothing'), icon: Shirt, description: t('customOrders.categories.clothingDesc') },
    { value: 'packaging', label: t('customOrders.categories.packaging'), icon: Box, description: t('customOrders.categories.packagingDesc') },
    { value: 'boxes', label: t('customOrders.categories.boxes'), icon: Package, description: t('customOrders.categories.boxesDesc') },
    { value: 'labels', label: t('customOrders.categories.labels'), icon: FileText, description: t('customOrders.categories.labelsDesc') },
    { value: 'other', label: t('customOrders.categories.other'), icon: Package, description: t('customOrders.categories.otherDesc') },
  ];

  // Status map with translations
  const STATUS_MAP: Record<string, { text: string; variant: any }> = {
    DRAFT: { text: t('customOrders.status.draft'), variant: 'outline' },
    SUBMITTED: { text: t('customOrders.status.submitted'), variant: 'secondary' },
    REVIEWING: { text: t('customOrders.status.reviewing'), variant: 'secondary' },
    APPROVED: { text: t('customOrders.status.approved'), variant: 'default' },
    REJECTED: { text: t('customOrders.status.rejected'), variant: 'destructive' },
    IN_PRODUCTION: { text: t('customOrders.status.inProduction'), variant: 'secondary' },
    COMPLETED: { text: t('customOrders.status.completed'), variant: 'default' },
  };

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    quantity: '',
    budget: '',
    dueDate: '',
    specifications: '',
    additionalNotes: '',
  });

  const [files, setFiles] = useState<OrderFile[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach(file => {
        const newFile: OrderFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size,
        };
        setFiles(prev => [...prev, newFile]);
      });
      toast.success(t('customOrders.form.uploadSuccess', `Uploaded ${uploadedFiles.length} files`));
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.description) {
      toast.error(t('customOrders.form.requiredFields'));
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/custom-orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity) || 0,
          budget: parseFloat(formData.budget) || 0,
          files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(t('customOrders.form.submitSuccess'));
        setFormData({
          title: '',
          category: '',
          description: '',
          quantity: '',
          budget: '',
          dueDate: '',
          specifications: '',
          additionalNotes: '',
        });
        setFiles([]);
        setActiveTab('orders');
        fetchOrders();
      } else {
        toast.error(t('customOrders.form.submitError'));
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error(t('customOrders.form.submitError'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/custom-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const getCategoryInfo = (categoryValue: string) => {
    return CATEGORIES.find(c => c.value === categoryValue);
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

  if (previewMode) {
    const categoryInfo = getCategoryInfo(formData.category);
    return (
      <div className="purple-gradient-page purple-gradient-content min-h-screen p-4 md:p-8" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setPreviewMode(false)}
            variant="outline"
            className="mb-6"
          >
            {t('customOrders.form.backToEdit')}
          </Button>

          <Card className="purple-gradient-card">
            <CardHeader>
              <CardTitle className="purple-gradient-title text-3xl">{formData.title}</CardTitle>
              <CardDescription className="purple-gradient-text">
                {categoryInfo?.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="purple-gradient-text text-muted-foreground text-sm mb-2">{t('customOrders.form.budget')}</p>
                  <p className="purple-gradient-title text-2xl font-bold">¥{formData.budget}</p>
                </div>
                <div>
                  <p className="purple-gradient-text text-muted-foreground text-sm mb-2">{t('customOrders.form.quantity')}</p>
                  <p className="purple-gradient-title text-2xl font-bold">{formData.quantity}</p>
                </div>
              </div>

              {formData.dueDate && (
                <div>
                  <p className="purple-gradient-text text-muted-foreground text-sm mb-2">{t('customOrders.form.deadline')}</p>
                  <p className="purple-gradient-text">{new Date(formData.dueDate).toLocaleDateString(getDateLocale())}</p>
                </div>
              )}

              <div>
                <h3 className="purple-gradient-title font-semibold mb-2">{t('customOrders.form.projectDescription')}</h3>
                <p className="purple-gradient-text text-muted-foreground">{formData.description}</p>
              </div>

              {formData.specifications && (
                <div>
                  <h3 className="purple-gradient-title font-semibold mb-2">{t('customOrders.form.technicalSpecs')}</h3>
                  <p className="purple-gradient-text text-muted-foreground whitespace-pre-wrap">{formData.specifications}</p>
                </div>
              )}

              {formData.additionalNotes && (
                <div>
                  <h3 className="purple-gradient-title font-semibold mb-2">{t('customOrders.form.notes')}</h3>
                  <p className="purple-gradient-text text-muted-foreground">{formData.additionalNotes}</p>
                </div>
              )}

              {files.length > 0 && (
                <div>
                  <h3 className="purple-gradient-title font-semibold mb-4">{t('customOrders.form.attachments')}</h3>
                  <div className="space-y-2">
                    {files.map(file => (
                      <div key={file.id} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="purple-gradient-text text-sm font-medium">{file.name}</p>
                            <p className="purple-gradient-text text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="purple-gradient-page purple-gradient-content min-h-screen p-4 md:p-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="purple-gradient-title text-3xl md:text-4xl font-bold mb-2">{t('customOrders.title')}</h1>
            <p className="purple-gradient-text text-lg">{t('customOrders.description')}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger value="new" className="gap-2">
              <Plus className="w-4 h-4" />
              {t('customOrders.tabs.newOrder')}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" />
              {t('customOrders.tabs.myOrders')}
            </TabsTrigger>
          </TabsList>

          {/* New Order */}
          <TabsContent value="new" className="space-y-6">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Select Category */}
              <Card className="purple-gradient-card">
                <CardHeader>
                  <CardTitle className="purple-gradient-title">{t('customOrders.form.selectType')}</CardTitle>
                  <CardDescription className="purple-gradient-text">
                    {t('customOrders.form.selectTypeDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => handleCategoryChange(cat.value)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all text-left",
                            formData.category === cat.value
                              ? "bg-primary/10 border-primary"
                              : "bg-muted/30 border-border/40 hover:border-border/60"
                          )}
                        >
                          <Icon className="w-6 h-6 text-primary mb-2" />
                          <p className="purple-gradient-title font-medium">{cat.label}</p>
                          <p className="purple-gradient-text text-muted-foreground text-sm">{cat.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card className="purple-gradient-card">
                <CardHeader>
                  <CardTitle className="purple-gradient-title">{t('customOrders.form.basicInfo')}</CardTitle>
                  <CardDescription className="purple-gradient-text">
                    {t('customOrders.form.basicInfoDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="purple-gradient-text text-sm font-medium mb-2 block">
                      {t('customOrders.form.projectTitle')} *
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder={t('customOrders.form.projectTitlePlaceholder')}
                      className="purple-gradient-input bg-muted/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="purple-gradient-text text-sm font-medium mb-2 block">
                      {t('customOrders.form.projectDescription')} *
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={t('customOrders.form.projectDescriptionPlaceholder')}
                      className="purple-gradient-input bg-muted/30 min-h-24"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-2 block">
                        {t('customOrders.form.quantity')} *
                      </label>
                      <Input
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="purple-gradient-input bg-muted/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-2 block">
                        {t('customOrders.form.budget')} *
                      </label>
                      <Input
                        name="budget"
                        type="number"
                        step="0.01"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="purple-gradient-input bg-muted/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-2 block">
                        {t('customOrders.form.deadline')}
                      </label>
                      <Input
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="purple-gradient-input bg-muted/30"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Specifications */}
              <Card className="purple-gradient-card">
                <CardHeader>
                  <CardTitle className="purple-gradient-title">{t('customOrders.form.technicalSpecs')}</CardTitle>
                  <CardDescription className="purple-gradient-text">
                    {t('customOrders.form.technicalSpecsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="purple-gradient-text text-sm font-medium mb-2 block">
                      {t('customOrders.form.specRequirements')}
                    </label>
                    <Textarea
                      name="specifications"
                      value={formData.specifications}
                      onChange={handleInputChange}
                      placeholder={t('customOrders.form.specRequirementsPlaceholder')}
                      className="purple-gradient-input bg-muted/30 min-h-32 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="purple-gradient-text text-sm font-medium mb-2 block">
                      {t('customOrders.form.additionalNotes')}
                    </label>
                    <Textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                      placeholder={t('customOrders.form.additionalNotesPlaceholder')}
                      className="purple-gradient-input bg-muted/30 min-h-20"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card className="purple-gradient-card">
                <CardHeader>
                  <CardTitle className="purple-gradient-title">{t('customOrders.form.attachments')}</CardTitle>
                  <CardDescription className="purple-gradient-text">
                    {t('customOrders.form.attachmentsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center hover:border-border/60 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.ai,.psd,.zip"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="purple-gradient-text text-foreground/70">{t('customOrders.form.uploadPrompt')}</p>
                      <p className="purple-gradient-text text-muted-foreground text-sm">{t('customOrders.form.uploadFormats')}</p>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div>
                      <p className="purple-gradient-text text-sm font-medium mb-3">{t('customOrders.form.uploadedFiles')} ({files.length})</p>
                      <div className="space-y-2">
                        {files.map(file => (
                          <div key={file.id} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="purple-gradient-text text-sm font-medium truncate">{file.name}</p>
                                <p className="purple-gradient-text text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="text-destructive hover:text-destructive/80 ml-2"
                              aria-label={t('customOrders.form.deleteFile')}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {t('customOrders.form.preview')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="purple-gradient-button flex-1"
                >
                  {isLoading ? t('customOrders.form.submitting') : t('customOrders.form.submitOrder')}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* My Orders */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="purple-gradient-card">
              <CardHeader>
                <CardTitle className="purple-gradient-title">{t('customOrders.myOrders.title')}</CardTitle>
                <CardDescription className="purple-gradient-text">
                  {t('customOrders.myOrders.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="purple-gradient-text text-muted-foreground mb-4">{t('customOrders.myOrders.empty')}</p>
                    <Button
                      onClick={() => setActiveTab('new')}
                      className="purple-gradient-button"
                    >
                      {t('customOrders.myOrders.createFirst')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        className="bg-muted/30 rounded-lg p-6 border border-border/40 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="purple-gradient-title font-semibold text-lg mb-1">{order.title}</h3>
                            <p className="purple-gradient-text text-muted-foreground text-sm">{order.description}</p>
                          </div>
                          <Badge variant={STATUS_MAP[order.status]?.variant || 'outline'}>
                            {STATUS_MAP[order.status]?.text || order.status}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="purple-gradient-text text-muted-foreground text-xs mb-1">{t('customOrders.myOrders.category')}</p>
                            <p className="purple-gradient-text text-sm font-medium">{order.category}</p>
                          </div>
                          <div>
                            <p className="purple-gradient-text text-muted-foreground text-xs mb-1">{t('customOrders.myOrders.budget')}</p>
                            <p className="purple-gradient-text text-sm font-medium">¥{order.budget}</p>
                          </div>
                          <div>
                            <p className="purple-gradient-text text-muted-foreground text-xs mb-1">{t('customOrders.myOrders.submissionDate')}</p>
                            <p className="purple-gradient-text text-sm font-medium">
                              {new Date(order.createdAt).toLocaleDateString(getDateLocale())}
                            </p>
                          </div>
                          <div>
                            <p className="purple-gradient-text text-muted-foreground text-xs mb-1">{t('customOrders.myOrders.deadline')}</p>
                            <p className="purple-gradient-text text-sm font-medium">
                              {new Date(order.dueDate).toLocaleDateString(getDateLocale())}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="purple-gradient-button-outline"
                          >
                            {t('customOrders.myOrders.viewDetails')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="purple-gradient-button-outline"
                          >
                            {t('customOrders.myOrders.contactSupport')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
