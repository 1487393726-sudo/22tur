'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Zap, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { dashboardStyles } from '@/lib/dashboard-styles';
import { cn } from '@/lib/utils';
import { useDashboardTranslations } from '@/lib/i18n/use-dashboard-translations';

interface ProjectRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  timeline: string;
  status: string;
  priority: string;
  createdAt: string;
  dueDate: string;
  services: string[];
  attachments: number;
}

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  deliveryDays: number;
  description: string;
  features: string[];
}

// Service categories - labels will be translated dynamically
const SERVICE_CATEGORIES = [
  { value: 'design', icon: '🎨' },
  { value: 'development', icon: '💻' },
  { value: 'production', icon: '🏭' },
  { value: 'printing', icon: '🖨️' },
  { value: 'marketing', icon: '📢' },
  { value: 'consulting', icon: '💼' },
];

// Priority levels - labels will be translated dynamically
const PRIORITY_LEVELS = [
  { value: 'low', color: 'bg-blue-500' },
  { value: 'medium', color: 'bg-yellow-500' },
  { value: 'high', color: 'bg-orange-500' },
  { value: 'urgent', color: 'bg-red-500' },
];

// Project status - text will be translated dynamically
const PROJECT_STATUS = {
  DRAFT: { variant: 'outline' as const },
  SUBMITTED: { variant: 'secondary' as const },
  REVIEWING: { variant: 'secondary' as const },
  APPROVED: { variant: 'default' as const },
  IN_PROGRESS: { variant: 'secondary' as const },
  COMPLETED: { variant: 'default' as const },
  CANCELLED: { variant: 'destructive' as const },
};

const AVAILABLE_SERVICES: ServiceItem[] = [
  {
    id: '1',
    name: 'UI/UX Design',
    category: 'design',
    basePrice: 5000,
    deliveryDays: 14,
    description: 'Professional user interface and experience design',
    features: ['Prototyping', 'Visual Design', 'Interaction Design', 'User Testing'],
  },
  {
    id: '2',
    name: 'Brand Design',
    category: 'design',
    basePrice: 8000,
    deliveryDays: 21,
    description: 'Complete brand identity system design',
    features: ['Logo Design', 'Brand Guidelines', 'Visual System', 'Applications'],
  },
  {
    id: '3',
    name: 'Website Development',
    category: 'development',
    basePrice: 15000,
    deliveryDays: 30,
    description: 'Responsive website development',
    features: ['Frontend', 'Backend', 'Database', 'Deployment'],
  },
  {
    id: '4',
    name: 'Mini Program Development',
    category: 'development',
    basePrice: 12000,
    deliveryDays: 28,
    description: 'WeChat mini program development',
    features: ['Feature Development', 'UI Design', 'Testing', 'Publishing'],
  },
  {
    id: '5',
    name: 'Packaging Design',
    category: 'production',
    basePrice: 3000,
    deliveryDays: 10,
    description: 'Product packaging design and production',
    features: ['Design', 'Samples', 'Printing', 'Quality Check'],
  },
  {
    id: '6',
    name: 'Printing Services',
    category: 'printing',
    basePrice: 1000,
    deliveryDays: 7,
    description: 'Professional printing services',
    features: ['Design', 'Color Management', 'Printing', 'Binding'],
  },
  {
    id: '7',
    name: 'Digital Marketing',
    category: 'marketing',
    basePrice: 5000,
    deliveryDays: 30,
    description: 'Comprehensive digital marketing solutions',
    features: ['Strategy', 'Content', 'Channels', 'Analytics'],
  },
  {
    id: '8',
    name: 'Business Consulting',
    category: 'consulting',
    basePrice: 3000,
    deliveryDays: 14,
    description: 'Professional business consulting services',
    features: ['Analysis', 'Strategy', 'Implementation', 'Evaluation'],
  },
];

export default function ProjectRequirementsPage() {
  const { t, isRTL, locale } = useDashboardTranslations();
  const [activeTab, setActiveTab] = useState('requirements');
  const [requirements, setRequirements] = useState<ProjectRequirement[]>([
    {
      id: '1',
      title: 'Corporate Website Redesign',
      description: 'Need to redesign corporate website to enhance brand image',
      category: 'design',
      budget: 25000,
      timeline: '2024-03-15',
      status: 'APPROVED',
      priority: 'high',
      createdAt: '2024-01-20',
      dueDate: '2024-03-15',
      services: ['1', '3'],
      attachments: 3,
    },
  ]);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    timeline: '',
    priority: 'medium',
    services: [] as string[],
  });

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequirement.title || !newRequirement.category || !newRequirement.budget) {
      toast.error(t('projectRequirements.form.requiredFields'));
      return;
    }

    const requirement: ProjectRequirement = {
      id: Date.now().toString(),
      title: newRequirement.title,
      description: newRequirement.description,
      category: newRequirement.category,
      budget: parseFloat(newRequirement.budget),
      timeline: newRequirement.timeline,
      status: 'DRAFT',
      priority: newRequirement.priority,
      createdAt: new Date().toISOString(),
      dueDate: newRequirement.timeline,
      services: newRequirement.services,
      attachments: 0,
    };

    setRequirements([requirement, ...requirements]);
    setNewRequirement({
      title: '',
      description: '',
      category: '',
      budget: '',
      timeline: '',
      priority: 'medium',
      services: [],
    });
    setShowNewForm(false);
    toast.success(t('projectRequirements.form.requirementCreated'));
  };

  const toggleService = (serviceId: string) => {
    setNewRequirement(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const getCategoryLabel = (category: string) => {
    return t(`projectRequirements.categories.${category}`, category);
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.value === priority)?.color || 'bg-gray-500';
  };

  const getPriorityLabel = (priority: string) => {
    return t(`projectRequirements.priority.${priority}`, priority);
  };

  const getStatusText = (status: string) => {
    return t(`projectRequirements.status.${status.toLowerCase()}`, status);
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

  const calculateTotalPrice = (serviceIds: string[]) => {
    return serviceIds.reduce((sum, id) => {
      const service = AVAILABLE_SERVICES.find(s => s.id === id);
      return sum + (service?.basePrice || 0);
    }, 0);
  };

  const stats = {
    totalProjects: requirements.length,
    inProgress: requirements.filter(r => r.status === 'IN_PROGRESS').length,
    completed: requirements.filter(r => r.status === 'COMPLETED').length,
    totalBudget: requirements.reduce((sum, r) => sum + r.budget, 0),
  };

  return (
    <div className="purple-gradient-page purple-gradient-content min-h-screen p-4 md:p-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="purple-gradient-title text-3xl md:text-4xl font-bold mb-2">{t('projectRequirements.title')}</h1>
          <p className="purple-gradient-text text-lg">{t('projectRequirements.description')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="purple-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="purple-gradient-title text-sm font-medium">{t('projectRequirements.stats.totalProjects')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="purple-gradient-title text-2xl font-bold">{stats.totalProjects}</div>
              <p className="purple-gradient-text text-xs text-muted-foreground">{t('projectRequirements.stats.allProjects')}</p>
            </CardContent>
          </Card>

          <Card className="purple-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="purple-gradient-title text-sm font-medium">{t('projectRequirements.stats.inProgress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="purple-gradient-title text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="purple-gradient-text text-xs text-muted-foreground">{t('projectRequirements.stats.activeProjects')}</p>
            </CardContent>
          </Card>

          <Card className="purple-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="purple-gradient-title text-sm font-medium">{t('projectRequirements.stats.completed')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="purple-gradient-title text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="purple-gradient-text text-xs text-muted-foreground">{t('projectRequirements.stats.finishedProjects')}</p>
            </CardContent>
          </Card>

          <Card className="purple-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="purple-gradient-title text-sm font-medium">{t('projectRequirements.stats.totalBudget')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="purple-gradient-title text-2xl font-bold text-purple-600">¥{stats.totalBudget.toLocaleString()}</div>
              <p className="purple-gradient-text text-xs text-muted-foreground">{t('projectRequirements.stats.allProjectsBudget')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30">
            <TabsTrigger value="requirements" className="gap-2">
              <FileText className="w-4 h-4" />
              {t('projectRequirements.tabs.requirements')}
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Zap className="w-4 h-4" />
              {t('projectRequirements.tabs.services')}
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <DollarSign className="w-4 h-4" />
              {t('projectRequirements.tabs.pricing')}
            </TabsTrigger>
          </TabsList>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowNewForm(!showNewForm)} className="purple-gradient-button gap-2">
                <Plus className="w-4 h-4" />
                {t('projectRequirements.newRequirement')}
              </Button>
            </div>

            {showNewForm && (
              <Card className="purple-gradient-card">
                <CardHeader>
                  <CardTitle className="purple-gradient-title">{t('projectRequirements.form.createTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateRequirement} className="space-y-4">
                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('projectRequirements.form.projectTitle')} *</label>
                      <Input
                        value={newRequirement.title}
                        onChange={(e) => setNewRequirement({ ...newRequirement, title: e.target.value })}
                        placeholder={t('projectRequirements.form.projectTitlePlaceholder')}
                        className="purple-gradient-input bg-muted/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('projectRequirements.form.description')} *</label>
                      <Textarea
                        value={newRequirement.description}
                        onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                        placeholder={t('projectRequirements.form.descriptionPlaceholder')}
                        className="purple-gradient-input bg-muted/30 min-h-24"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('projectRequirements.form.serviceCategory')} *</label>
                        <Select value={newRequirement.category} onValueChange={(v) => setNewRequirement({ ...newRequirement, category: v })}>
                          <SelectTrigger className="purple-gradient-input bg-muted/30">
                            <SelectValue placeholder={t('projectRequirements.form.selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_CATEGORIES.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{getCategoryLabel(cat.value)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('projectRequirements.form.priority')}</label>
                        <Select value={newRequirement.priority} onValueChange={(v) => setNewRequirement({ ...newRequirement, priority: v })}>
                          <SelectTrigger className="purple-gradient-input bg-muted/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_LEVELS.map(p => (
                              <SelectItem key={p.value} value={p.value}>{getPriorityLabel(p.value)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('projectRequirements.form.budget')} *</label>
                        <Input
                          type="number"
                          value={newRequirement.budget}
                          onChange={(e) => setNewRequirement({ ...newRequirement, budget: e.target.value })}
                          placeholder="0"
                          className="purple-gradient-input bg-muted/30"
                          required
                        />
                      </div>

                      <div>
                        <label className="purple-gradient-text text-sm font-medium mb-2 block">{t('projectRequirements.form.deadline')}</label>
                        <Input
                          type="date"
                          value={newRequirement.timeline}
                          onChange={(e) => setNewRequirement({ ...newRequirement, timeline: e.target.value })}
                          className="purple-gradient-input bg-muted/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="purple-gradient-text text-sm font-medium mb-3 block">{t('projectRequirements.form.selectServices')}</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {AVAILABLE_SERVICES.filter(s => s.category === newRequirement.category).map(service => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => toggleService(service.id)}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all text-left",
                              newRequirement.services.includes(service.id)
                                ? "bg-primary/10 border-primary"
                                : "bg-muted/30 border-border/40 hover:border-border/60"
                            )}
                          >
                            <p className="purple-gradient-text font-medium text-sm">{service.name}</p>
                            <p className="purple-gradient-text text-xs text-muted-foreground">¥{service.basePrice.toLocaleString()}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {newRequirement.services.length > 0 && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="purple-gradient-text text-sm font-medium mb-2">{t('projectRequirements.form.total')}: ¥{calculateTotalPrice(newRequirement.services).toLocaleString()}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button type="submit" className="purple-gradient-button flex-1">{t('projectRequirements.form.create')}</Button>
                      <Button type="button" variant="outline" onClick={() => setShowNewForm(false)} className="purple-gradient-button-outline flex-1">
                        {t('projectRequirements.form.cancel')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="purple-gradient-card">
              <CardHeader>
                <CardTitle className="purple-gradient-title">{t('projectRequirements.requirementsList')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirements.map(req => (
                    <div key={req.id} className="bg-muted/30 rounded-lg p-4 border border-border/40">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="purple-gradient-title font-semibold">{req.title}</h3>
                          <p className="purple-gradient-text text-sm text-muted-foreground">{req.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={PROJECT_STATUS[req.status as keyof typeof PROJECT_STATUS]?.variant || 'outline'}>
                            {getStatusText(req.status)}
                          </Badge>
                          <Badge className={getPriorityColor(req.priority)}>
                            {getPriorityLabel(req.priority)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3 text-sm">
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('projectRequirements.table.category')}</p>
                          <p className="purple-gradient-text font-medium">{getCategoryLabel(req.category)}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('projectRequirements.table.budget')}</p>
                          <p className="purple-gradient-text font-medium text-green-600">¥{req.budget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('projectRequirements.table.services')}</p>
                          <p className="purple-gradient-text font-medium">{req.services.length}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('projectRequirements.table.deadline')}</p>
                          <p className="purple-gradient-text font-medium">{new Date(req.dueDate).toLocaleDateString(getDateLocale())}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-muted-foreground text-xs">{t('projectRequirements.table.attachments')}</p>
                          <p className="purple-gradient-text font-medium">{req.attachments}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="purple-gradient-button-outline">{t('projectRequirements.actions.view')}</Button>
                        <Button variant="outline" size="sm" className="purple-gradient-button-outline">{t('projectRequirements.actions.edit')}</Button>
                        <Button variant="outline" size="sm" className="purple-gradient-button-outline">{t('projectRequirements.actions.submit')}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="purple-gradient-card">
              <CardHeader>
                <CardTitle className="purple-gradient-title">{t('projectRequirements.availableServices')}</CardTitle>
                <CardDescription className="purple-gradient-text">{t('projectRequirements.availableServicesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {AVAILABLE_SERVICES.map(service => (
                    <div key={service.id} className="bg-muted/30 rounded-lg p-4 border border-border/40">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="purple-gradient-title font-semibold">{service.name}</h3>
                          <p className="purple-gradient-text text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="purple-gradient-title text-lg font-bold text-green-600">¥{service.basePrice.toLocaleString()}</p>
                          <p className="purple-gradient-text text-xs text-muted-foreground">{service.deliveryDays} {t('projectRequirements.days')}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="purple-gradient-text text-xs font-medium text-muted-foreground mb-2">{t('projectRequirements.features')}</p>
                        <div className="flex flex-wrap gap-2">
                          {service.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </div>

                      <Button size="sm" className="purple-gradient-button w-full">{t('projectRequirements.selectService')}</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card className="purple-gradient-card">
              <CardHeader>
                <CardTitle className="purple-gradient-title">{t('projectRequirements.servicePricing')}</CardTitle>
                <CardDescription className="purple-gradient-text">{t('projectRequirements.servicePricingDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {SERVICE_CATEGORIES.map(category => {
                  const categoryServices = AVAILABLE_SERVICES.filter(s => s.category === category.value);
                  return (
                    <div key={category.value} className="mb-8">
                      <h3 className="purple-gradient-title text-lg font-semibold mb-4">{category.icon} {getCategoryLabel(category.value)}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border/40">
                              <th className="purple-gradient-text text-left py-2 px-3 font-medium">{t('projectRequirements.table.serviceName')}</th>
                              <th className="purple-gradient-text text-left py-2 px-3 font-medium">{t('projectRequirements.table.basePrice')}</th>
                              <th className="purple-gradient-text text-left py-2 px-3 font-medium">{t('projectRequirements.table.delivery')}</th>
                              <th className="purple-gradient-text text-left py-2 px-3 font-medium">{t('projectRequirements.table.action')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryServices.map(service => (
                              <tr key={service.id} className="border-b border-border/20 hover:bg-muted/20">
                                <td className="purple-gradient-text py-3 px-3">{service.name}</td>
                                <td className="purple-gradient-text py-3 px-3 font-medium">¥{service.basePrice.toLocaleString()}</td>
                                <td className="purple-gradient-text py-3 px-3">{service.deliveryDays} {t('projectRequirements.days')}</td>
                                <td className="py-3 px-3">
                                  <Button size="sm" variant="outline" className="purple-gradient-button-outline">{t('projectRequirements.actions.details')}</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
