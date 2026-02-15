'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { dashboardStyles } from '@/lib/dashboard-styles';
import { cn } from '@/lib/utils';
import { useDashboardTranslations } from '@/lib/i18n/use-dashboard-translations';


interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface ProductSpecification {
  id: string;
  name: string;
  value: string;
}

export default function CreateProductPage() {
  const { t, isRTL } = useDashboardTranslations();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    sku: '',
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [newSpec, setNewSpec] = useState({ name: '', value: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage: ProductImage = {
            id: Date.now().toString(),
            url: event.target?.result as string,
            alt: formData.name || t('createProduct.form.productImage'),
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const addSpecification = () => {
    if (newSpec.name && newSpec.value) {
      setSpecifications(prev => [...prev, {
        id: Date.now().toString(),
        ...newSpec,
      }]);
      setNewSpec({ name: '', value: '' });
    } else {
      toast.error(t('createProduct.validation.specificationRequired'));
    }
  };

  const removeSpecification = (id: string) => {
    setSpecifications(prev => prev.filter(spec => spec.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price) {
      toast.error(t('createProduct.validation.requiredFields'));
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          images,
          specifications,
        }),
      });

      if (response.ok) {
        toast.success(t('createProduct.success'));
        setFormData({ name: '', description: '', category: '', price: '', stock: '', sku: '' });
        setImages([]);
        setSpecifications([]);
      } else {
        toast.error(t('createProduct.error'));
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(t('createProduct.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (previewMode) {
    return (
      <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Button 
            onClick={() => setPreviewMode(false)}
            variant="outline"
            className="mb-6"
          >
            {t('createProduct.actions.backToEdit')}
          </Button>
          
          <Card className="purple-gradient-card">
            <CardHeader>
              <CardTitle className="purple-gradient-title text-3xl">
                {formData.name}
              </CardTitle>
              <CardDescription className="purple-gradient-text">
                {formData.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {images.length > 0 && (
                <div>
                  <h3 className="purple-gradient-title font-semibold mb-4">
                    {t('createProduct.preview.productImages')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map(img => (
                      <img 
                        key={img.id}
                        src={img.url} 
                        alt={img.alt}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="purple-gradient-text text-sm mb-2">{t('createProduct.preview.price')}</p>
                  <p className="purple-gradient-title text-2xl font-bold">
                    ¥{formData.price}
                  </p>
                </div>
                <div>
                  <p className="purple-gradient-text text-sm mb-2">{t('createProduct.preview.stock')}</p>
                  <p className="purple-gradient-title text-2xl font-bold">
                    {formData.stock}
                  </p>
                </div>
              </div>

              {formData.description && (
                <div>
                  <h3 className="purple-gradient-title font-semibold mb-2">
                    {t('createProduct.preview.description')}
                  </h3>
                  <p className="purple-gradient-text">{formData.description}</p>
                </div>
              )}

              {specifications.length > 0 && (
                <div>
                  <h3 className="purple-gradient-title font-semibold mb-4">
                    {t('createProduct.preview.specifications')}
                  </h3>
                  <div className="space-y-2">
                    {specifications.map(spec => (
                      <div key={spec.id} className="flex justify-between text-muted-foreground">
                        <span>{spec.name}:</span>
                        <span className="text-foreground">{spec.value}</span>
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
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="purple-gradient-title text-3xl md:text-4xl font-bold mb-2">
              {t('createProduct.title')}
            </h1>
            <p className="purple-gradient-text text-lg">
              {t('createProduct.description')}
            </p>
          </div>
          <Button 
            onClick={() => setPreviewMode(true)}
            variant="outline"
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {t('createProduct.actions.preview')}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card className="purple-gradient-card">
            <CardHeader>
              <CardTitle className="text-foreground">{t('createProduct.form.basicInfo')}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('createProduct.form.basicInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">
                  {t('createProduct.form.productName')} *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('createProduct.form.productNamePlaceholder')}
                  className="bg-muted/30 border-border"
                  required
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">
                  {t('createProduct.form.category')} *
                </label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-muted/30 border-border">
                    <SelectValue placeholder={t('createProduct.form.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">{t('createProduct.categories.electronics')}</SelectItem>
                    <SelectItem value="clothing">{t('createProduct.categories.clothing')}</SelectItem>
                    <SelectItem value="food">{t('createProduct.categories.food')}</SelectItem>
                    <SelectItem value="books">{t('createProduct.categories.books')}</SelectItem>
                    <SelectItem value="other">{t('createProduct.categories.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">
                  {t('createProduct.form.description')}
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('createProduct.form.descriptionPlaceholder')}
                  className="bg-muted/30 border-border min-h-24"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-foreground text-sm font-medium mb-2 block">
                    {t('createProduct.form.price')} *
                  </label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="bg-muted/30 border-border"
                    required
                  />
                </div>

                <div>
                  <label className="text-foreground text-sm font-medium mb-2 block">
                    {t('createProduct.form.stock')}
                  </label>
                  <Input
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="bg-muted/30 border-border"
                  />
                </div>

                <div>
                  <label className="text-foreground text-sm font-medium mb-2 block">
                    {t('createProduct.form.sku')}
                  </label>
                  <Input
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder={t('createProduct.form.skuPlaceholder')}
                    className="bg-muted/30 border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 产品图片 */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">{t('createProduct.form.productImages')}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('createProduct.form.uploadImagesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center hover:border-border/60 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-foreground/70">{t('createProduct.form.uploadImagesHint')}</p>
                  <p className="text-muted-foreground text-sm">{t('createProduct.form.supportedFormats')}</p>
                </label>
              </div>

              {images.length > 0 && (
                <div>
                  <p className="text-foreground text-sm font-medium mb-3">{t('createProduct.form.uploadedImages')} ({images.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map(img => (
                      <div key={img.id} className="relative group">
                        <img 
                          src={img.url} 
                          alt={img.alt}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 bg-destructive text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={t('createProduct.form.removeImage')}
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

          {/* 产品规格 */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">{t('createProduct.form.specifications')}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('createProduct.form.specificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-foreground text-sm font-medium mb-2 block">
                    {t('createProduct.form.specificationName')}
                  </label>
                  <Input
                    value={newSpec.name}
                    onChange={(e) => setNewSpec(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('createProduct.form.specificationNamePlaceholder')}
                    className="bg-muted/30 border-border"
                  />
                </div>
                <div>
                  <label className="text-foreground text-sm font-medium mb-2 block">
                    {t('createProduct.form.specificationValue')}
                  </label>
                  <Input
                    value={newSpec.value}
                    onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={t('createProduct.form.specificationValuePlaceholder')}
                    className="bg-muted/30 border-border"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={addSpecification}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('createProduct.form.addSpecification')}
              </Button>

              {specifications.length > 0 && (
                <div className="space-y-2">
                  <p className="text-foreground text-sm font-medium">{t('createProduct.form.addedSpecifications')}</p>
                  {specifications.map(spec => (
                    <div key={spec.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                      <span>
                        <Badge variant="secondary" className="mr-2">{spec.name}</Badge>
                        <span className="text-foreground">{spec.value}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(spec.id)}
                        className="text-destructive hover:text-destructive/80"
                        aria-label={t('createProduct.form.removeSpecification')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground flex-1"
            >
              {isLoading ? t('createProduct.actions.creating') : t('createProduct.actions.createProduct')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
            >
              {t('createProduct.actions.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
