'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Users, FileText, Briefcase, Plus, Edit, Trash2, Save, Loader2,
  GripVertical, Star, Eye, EyeOff, Filter,
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface TeamMember {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  bio: string;
  bioEn: string;
  avatar: string;
  order: number;
  isActive: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  image: string;
  category: string;
  author: string;
  readTime: string;
  publishedAt: string;
  isPublished: boolean;
}

interface PortfolioItem {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  image: string;
  category: string;
  tags: string;
  client: string;
  link: string;
  featured: boolean;
  isActive: boolean;
  order: number;
}

// Sortable Item Component
function SortableTeamCard({ member, onEdit, onDelete }: {
  member: TeamMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div {...attributes} {...listeners} className="cursor-grab mb-2 self-end">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full object-cover mb-3" />
          <h3 className="font-medium text-white">{member.name}</h3>
          <p className="text-sm text-white">{member.role}</p>
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{member.bio}</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={onEdit}><Edit className="w-3 h-3" /></Button>
            <Button size="sm" variant="outline" className="text-red-400 hover:text-red-300" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SortablePortfolioCard({ item, onEdit, onDelete, onToggleFeatured, editLabel }: {
  item: PortfolioItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
  editLabel: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="bg-white/5 border-white/10 overflow-hidden">
      <div {...attributes} {...listeners} className="cursor-grab p-2 flex justify-end">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white">{item.category}</span>
          <Button size="sm" variant="ghost" onClick={onToggleFeatured} className={item.featured ? 'text-yellow-400' : 'text-gray-400'}>
            <Star className="w-4 h-4" fill={item.featured ? 'currentColor' : 'none'} />
          </Button>
        </div>
        <h3 className="font-medium text-white mt-1">{item.title}</h3>
        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.description}</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}>
            <Edit className="w-3 h-3 mr-1" />{editLabel}
          </Button>
          <Button size="sm" variant="outline" className="text-red-400 hover:text-red-300" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContentManagementPage() {
  const t = useTranslations('admin.content');
  const tc = useTranslations('common');
  const [activeTab, setActiveTab] = useState('team');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  // Filter states
  const [blogStatusFilter, setBlogStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState<string>('__all__');

  // Dialog states
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [teamRes, blogRes, portfolioRes] = await Promise.all([
        fetch('/api/admin/content/team'),
        fetch('/api/admin/content/blog'),
        fetch('/api/admin/content/portfolio'),
      ]);
      if (teamRes.ok) setTeamMembers((await teamRes.json()).members || []);
      if (blogRes.ok) setBlogPosts((await blogRes.json()).posts || []);
      if (portfolioRes.ok) setPortfolioItems((await portfolioRes.json()).items || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error(t('messages.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Team member handlers
  const handleTeamDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const oldIndex = teamMembers.findIndex(m => m.id === active.id);
    const newIndex = teamMembers.findIndex(m => m.id === over.id);
    const newOrder = arrayMove(teamMembers, oldIndex, newIndex);
    setTeamMembers(newOrder);
    
    try {
      await fetch('/api/admin/content/team/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newOrder.map((m, i) => ({ id: m.id, order: i })) }),
      });
      toast.success(t('messages.orderUpdated'));
    } catch { toast.error(t('messages.orderUpdateFailed')); }
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    setIsSaving(true);
    try {
      const url = isCreating ? '/api/admin/content/team' : `/api/admin/content/team/${editingMember.id}`;
      const res = await fetch(url, {
        method: isCreating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember),
      });
      if (res.ok) {
        toast.success(isCreating ? t('messages.memberCreated') : t('messages.memberUpdated'));
        loadData();
        setDialogOpen(false);
        setEditingMember(null);
      } else {
        toast.error((await res.json()).error || t('messages.saveFailed'));
      }
    } catch { toast.error(t('messages.saveFailed')); }
    finally { setIsSaving(false); }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm(t('messages.confirmDeleteMember'))) return;
    try {
      const res = await fetch(`/api/admin/content/team/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success(t('messages.memberDeleted')); loadData(); }
    } catch { toast.error(t('messages.deleteFailed')); }
  };

  // Blog post handlers
  const handleSavePost = async () => {
    if (!editingPost) return;
    setIsSaving(true);
    try {
      const url = isCreating ? '/api/admin/content/blog' : `/api/admin/content/blog/${editingPost.id}`;
      const res = await fetch(url, {
        method: isCreating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPost),
      });
      if (res.ok) {
        toast.success(isCreating ? t('messages.postCreated') : t('messages.postUpdated'));
        loadData();
        setDialogOpen(false);
        setEditingPost(null);
      } else {
        toast.error((await res.json()).error || t('messages.saveFailed'));
      }
    } catch { toast.error(t('messages.saveFailed')); }
    finally { setIsSaving(false); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm(t('messages.confirmDeletePost'))) return;
    try {
      const res = await fetch(`/api/admin/content/blog/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success(t('messages.postDeleted')); loadData(); }
    } catch { toast.error(t('messages.deleteFailed')); }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/admin/content/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      if (res.ok) {
        toast.success(post.isPublished ? t('messages.postUnpublished') : t('messages.postPublished'));
        loadData();
      }
    } catch { toast.error(t('messages.operationFailed')); }
  };

  // Portfolio handlers
  const handlePortfolioDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const oldIndex = portfolioItems.findIndex(p => p.id === active.id);
    const newIndex = portfolioItems.findIndex(p => p.id === over.id);
    const newOrder = arrayMove(portfolioItems, oldIndex, newIndex);
    setPortfolioItems(newOrder);
    
    try {
      await fetch('/api/admin/content/portfolio/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newOrder.map((p, i) => ({ id: p.id, order: i })) }),
      });
      toast.success(t('messages.orderUpdated'));
    } catch { toast.error(t('messages.orderUpdateFailed')); }
  };

  const handleSavePortfolio = async () => {
    if (!editingPortfolio) return;
    setIsSaving(true);
    try {
      const url = isCreating ? '/api/admin/content/portfolio' : `/api/admin/content/portfolio/${editingPortfolio.id}`;
      const res = await fetch(url, {
        method: isCreating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPortfolio),
      });
      if (res.ok) {
        toast.success(isCreating ? t('messages.portfolioCreated') : t('messages.portfolioUpdated'));
        loadData();
        setDialogOpen(false);
        setEditingPortfolio(null);
      } else {
        toast.error((await res.json()).error || t('messages.saveFailed'));
      }
    } catch { toast.error(t('messages.saveFailed')); }
    finally { setIsSaving(false); }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm(t('messages.confirmDeletePortfolio'))) return;
    try {
      const res = await fetch(`/api/admin/content/portfolio/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success(t('messages.portfolioDeleted')); loadData(); }
    } catch { toast.error(t('messages.deleteFailed')); }
  };

  const handleToggleFeatured = async (item: PortfolioItem) => {
    try {
      const res = await fetch(`/api/admin/content/portfolio/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !item.featured }),
      });
      if (res.ok) {
        toast.success(item.featured ? t('messages.unsetFeatured') : t('messages.setFeatured'));
        loadData();
      }
    } catch { toast.error(t('messages.operationFailed')); }
  };

  // Create new items
  const createNewMember = () => {
    setIsCreating(true);
    setEditingMember({
      id: '', name: '', nameEn: '', role: '', roleEn: '', bio: '', bioEn: '',
      avatar: '/placeholder-user.jpg', order: teamMembers.length, isActive: true,
    });
    setDialogOpen(true);
  };

  const createNewPost = () => {
    setIsCreating(true);
    setEditingPost({
      id: '', title: '', titleEn: '', slug: '', excerpt: '', excerptEn: '', content: '',
      image: '/placeholder.jpg', category: 'Design', author: '', readTime: '5 min read',
      publishedAt: new Date().toISOString(), isPublished: false,
    });
    setDialogOpen(true);
  };

  const createNewPortfolio = () => {
    setIsCreating(true);
    setEditingPortfolio({
      id: '', title: '', titleEn: '', slug: '', description: '', descriptionEn: '',
      image: '/placeholder.jpg', category: '网站', tags: '[]', client: '', link: '',
      featured: false, isActive: true, order: portfolioItems.length,
    });
    setDialogOpen(true);
  };

  // Filter blog posts
  const filteredPosts = blogPosts.filter(post => {
    if (blogStatusFilter === 'published' && !post.isPublished) return false;
    if (blogStatusFilter === 'draft' && post.isPublished) return false;
    if (blogCategoryFilter && blogCategoryFilter !== '__all__' && post.category !== blogCategoryFilter) return false;
    return true;
  });

  const categories = [...new Set(blogPosts.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-gray-400">{t('description')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5">
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />{t('tabs.team')}
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />{t('tabs.blog')}
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />{t('tabs.portfolio')}
          </TabsTrigger>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="team" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400">{t('dragHint')}</p>
            <Button onClick={createNewMember} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />{t('addMember')}
            </Button>
          </div>
          {teamMembers.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center text-gray-400">{t('noTeamMembers')}</CardContent>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTeamDragEnd}>
              <SortableContext items={teamMembers.map(m => m.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {teamMembers.map((member) => (
                    <SortableTeamCard
                      key={member.id}
                      member={member}
                      onEdit={() => { setIsCreating(false); setEditingMember(member); setDialogOpen(true); }}
                      onDelete={() => handleDeleteMember(member.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        {/* Blog Posts Tab */}
        <TabsContent value="blog" className="mt-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={blogStatusFilter} onValueChange={(v) => setBlogStatusFilter(v as 'all' | 'published' | 'draft')}>
                  <SelectTrigger className="w-32 bg-white/5 border-white/10">
                    <SelectValue placeholder={t('filter.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filter.all')}</SelectItem>
                    <SelectItem value="published">{t('filter.published')}</SelectItem>
                    <SelectItem value="draft">{t('filter.draft')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={blogCategoryFilter} onValueChange={setBlogCategoryFilter}>
                <SelectTrigger className="w-32 bg-white/5 border-white/10">
                  <SelectValue placeholder={t('filter.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t('filter.allCategories')}</SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createNewPost} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />{t('addPost')}
            </Button>
          </div>
          {filteredPosts.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center text-gray-400">{t('noBlogPosts')}</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="bg-white/5 border-white/10 overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-40 object-cover" />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white">{post.category}</span>
                      <Button size="sm" variant="ghost" onClick={() => handleTogglePublish(post)}>
                        {post.isPublished ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </Button>
                    </div>
                    <h3 className="font-medium text-white mt-1 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(post.publishedAt).toLocaleDateString()} · {post.readTime}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                        setIsCreating(false); setEditingPost(post); setDialogOpen(true);
                      }}>
                        <Edit className="w-3 h-3 mr-1" />{tc('edit')}
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-400 hover:text-red-300" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400">{t('dragFeaturedHint')}</p>
            <Button onClick={createNewPortfolio} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />{t('addPortfolio')}
            </Button>
          </div>
          {portfolioItems.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center text-gray-400">{t('noPortfolioItems')}</CardContent>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePortfolioDragEnd}>
              <SortableContext items={portfolioItems.map(p => p.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioItems.map((item) => (
                    <SortablePortfolioCard
                      key={item.id}
                      item={item}
                      onEdit={() => { setIsCreating(false); setEditingPortfolio(item); setDialogOpen(true); }}
                      onDelete={() => handleDeletePortfolio(item.id)}
                      onToggleFeatured={() => handleToggleFeatured(item)}
                      editLabel={tc('edit')}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>
      </Tabs>

      {/* Team Member Dialog */}
      <Dialog open={dialogOpen && !!editingMember} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingMember(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? t('createMember') : t('editMember')}</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('form.nameCn')}</Label><Input value={editingMember.name} onChange={(e) => setEditingMember({...editingMember, name: e.target.value})} /></div>
                <div><Label>{t('form.nameEn')}</Label><Input value={editingMember.nameEn} onChange={(e) => setEditingMember({...editingMember, nameEn: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('form.roleCn')}</Label><Input value={editingMember.role} onChange={(e) => setEditingMember({...editingMember, role: e.target.value})} /></div>
                <div><Label>{t('form.roleEn')}</Label><Input value={editingMember.roleEn} onChange={(e) => setEditingMember({...editingMember, roleEn: e.target.value})} /></div>
              </div>
              <div><Label>{t('form.avatarUrl')}</Label><Input value={editingMember.avatar} onChange={(e) => setEditingMember({...editingMember, avatar: e.target.value})} /></div>
              <div><Label>{t('form.bioCn')}</Label><Textarea value={editingMember.bio} onChange={(e) => setEditingMember({...editingMember, bio: e.target.value})} /></div>
              <div><Label>{t('form.bioEn')}</Label><Textarea value={editingMember.bioEn} onChange={(e) => setEditingMember({...editingMember, bioEn: e.target.value})} /></div>
              <div className="flex items-center gap-2">
                <Switch checked={editingMember.isActive} onCheckedChange={(checked) => setEditingMember({...editingMember, isActive: checked})} />
                <Label>{t('form.enabled')}</Label>
              </div>
              <Button onClick={handleSaveMember} className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}{tc('save')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Blog Post Dialog */}
      <Dialog open={dialogOpen && !!editingPost} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingPost(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? t('createPost') : t('editPost')}</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <div className="space-y-4">
              <div><Label>{t('form.titleCn')}</Label><Input value={editingPost.title} onChange={(e) => setEditingPost({...editingPost, title: e.target.value})} /></div>
              <div><Label>{t('form.titleEn')}</Label><Input value={editingPost.titleEn} onChange={(e) => setEditingPost({...editingPost, titleEn: e.target.value})} /></div>
              <div><Label>{t('form.urlSlug')}</Label><Input value={editingPost.slug} onChange={(e) => setEditingPost({...editingPost, slug: e.target.value})} placeholder="e.g. my-blog-post" /></div>
              <div><Label>{t('form.coverImageUrl')}</Label><Input value={editingPost.image} onChange={(e) => setEditingPost({...editingPost, image: e.target.value})} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>{t('filter.category')}</Label><Input value={editingPost.category} onChange={(e) => setEditingPost({...editingPost, category: e.target.value})} /></div>
                <div><Label>{t('form.author')}</Label><Input value={editingPost.author} onChange={(e) => setEditingPost({...editingPost, author: e.target.value})} /></div>
                <div><Label>{t('form.readTime')}</Label><Input value={editingPost.readTime} onChange={(e) => setEditingPost({...editingPost, readTime: e.target.value})} /></div>
              </div>
              <div><Label>{t('form.excerptCn')}</Label><Textarea value={editingPost.excerpt} onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})} /></div>
              <div><Label>{t('form.excerptEn')}</Label><Textarea value={editingPost.excerptEn} onChange={(e) => setEditingPost({...editingPost, excerptEn: e.target.value})} /></div>
              <div><Label>{t('form.contentCn')}</Label><Textarea value={editingPost.content} onChange={(e) => setEditingPost({...editingPost, content: e.target.value})} rows={6} /></div>
              <div className="flex items-center gap-2">
                <Switch checked={editingPost.isPublished} onCheckedChange={(checked) => setEditingPost({...editingPost, isPublished: checked})} />
                <Label>{t('form.publish')}</Label>
              </div>
              <Button onClick={handleSavePost} className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}{tc('save')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Portfolio Dialog */}
      <Dialog open={dialogOpen && !!editingPortfolio} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingPortfolio(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? t('createPortfolioItem') : t('editPortfolioItem')}</DialogTitle>
          </DialogHeader>
          {editingPortfolio && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('form.titleCn')}</Label><Input value={editingPortfolio.title} onChange={(e) => setEditingPortfolio({...editingPortfolio, title: e.target.value})} /></div>
                <div><Label>{t('form.titleEn')}</Label><Input value={editingPortfolio.titleEn} onChange={(e) => setEditingPortfolio({...editingPortfolio, titleEn: e.target.value})} /></div>
              </div>
              <div><Label>{t('form.urlSlug')}</Label><Input value={editingPortfolio.slug} onChange={(e) => setEditingPortfolio({...editingPortfolio, slug: e.target.value})} placeholder="e.g. my-portfolio-item" /></div>
              <div><Label>{t('form.coverImageUrl')}</Label><Input value={editingPortfolio.image} onChange={(e) => setEditingPortfolio({...editingPortfolio, image: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('filter.category')}</Label><Input value={editingPortfolio.category} onChange={(e) => setEditingPortfolio({...editingPortfolio, category: e.target.value})} /></div>
                <div><Label>{t('form.client')}</Label><Input value={editingPortfolio.client} onChange={(e) => setEditingPortfolio({...editingPortfolio, client: e.target.value})} /></div>
              </div>
              <div><Label>{t('form.descriptionCn')}</Label><Textarea value={editingPortfolio.description} onChange={(e) => setEditingPortfolio({...editingPortfolio, description: e.target.value})} /></div>
              <div><Label>{t('form.descriptionEn')}</Label><Textarea value={editingPortfolio.descriptionEn} onChange={(e) => setEditingPortfolio({...editingPortfolio, descriptionEn: e.target.value})} /></div>
              <div><Label>{t('form.tagsJson')}</Label><Input value={editingPortfolio.tags} onChange={(e) => setEditingPortfolio({...editingPortfolio, tags: e.target.value})} placeholder='["tag1", "tag2"]' /></div>
              <div><Label>{t('form.projectLink')}</Label><Input value={editingPortfolio.link} onChange={(e) => setEditingPortfolio({...editingPortfolio, link: e.target.value})} /></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={editingPortfolio.featured} onCheckedChange={(checked) => setEditingPortfolio({...editingPortfolio, featured: checked})} />
                  <Label>{t('form.featured')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editingPortfolio.isActive} onCheckedChange={(checked) => setEditingPortfolio({...editingPortfolio, isActive: checked})} />
                  <Label>{t('form.enabled')}</Label>
                </div>
              </div>
              <Button onClick={handleSavePortfolio} className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}{tc('save')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
