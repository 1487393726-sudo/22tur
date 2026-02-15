'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ProductImageUpload } from '@/components/marketplace/ProductImageUpload';
import { ProductEditForm } from '@/components/marketplace/ProductEditForm';
import { ChevronLeft, Upload, Image as ImageIcon, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  description?: string;
  price: number;
  stock: number;
}

export default function ProductImagesPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/marketplace/products?pageSize=100');
        const data = await res.json();
        setProducts(data.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleUploadComplete = (images: string[]) => {
    console.log('Images uploaded:', images);
    // 可以在这里添加成功提示或刷新产品列表
  };

  const handleEditClick = () => {
    if (selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct);
      if (product) {
        setEditingProduct(product);
        setIsEditing(true);
      }
    }
  };

  const handleSaveProduct = async (formData: any) => {
    if (!selectedProduct) return;

    try {
      const res = await fetch(`/api/marketplace/products/${selectedProduct}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to save product');
      }

      const data = await res.json();

      // 更新本地产品列表
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct
            ? { ...p, ...formData }
            : p
        )
      );

      setIsEditing(false);
      setEditingProduct(null);

      // 显示成功提示
      alert('产品信息已保存');
    } catch (error) {
      console.error('Failed to save product:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4c1d95] via-[#9333ea] to-[#701a75] flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
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
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">产品图片管理</h1>
              <p className="text-sm text-gray-400">
                为直播设备产品上传和管理图片
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* 产品列表 */}
          <div className="md:col-span-1">
            <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-4 sticky top-20">
              <h2 className="font-semibold mb-4 text-white">选择产品</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.length > 0 ? (
                  products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedProduct(product.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-colors',
                        selectedProduct === product.id
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                      )}
                    >
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs opacity-75">
                        {product.brand} {product.model}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    暂无产品
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 上传区域 */}
          <div className="md:col-span-2">
            {selectedProduct ? (
              <div className="space-y-6">
                {/* 编辑产品信息 */}
                {isEditing && editingProduct ? (
                    <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                      编辑产品信息
                    </h2>
                    <ProductEditForm
                      product={editingProduct}
                      onSave={handleSaveProduct}
                      onCancel={() => {
                        setIsEditing(false);
                        setEditingProduct(null);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    {/* 产品信息卡片 */}
                    <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">
                          产品信息
                        </h2>
                        <Button
                          onClick={handleEditClick}
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          编辑
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">产品名称</p>
                          <p className="text-white font-medium">
                            {products.find((p) => p.id === selectedProduct)?.name}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">品牌</p>
                            <p className="text-white font-medium">
                              {products.find((p) => p.id === selectedProduct)?.brand}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">型号</p>
                            <p className="text-white font-medium">
                              {products.find((p) => p.id === selectedProduct)?.model}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">价格</p>
                            <p className="text-white font-medium">
                              ¥{products.find((p) => p.id === selectedProduct)?.price.toLocaleString('zh-CN')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">库存</p>
                            <p className="text-white font-medium">
                              {products.find((p) => p.id === selectedProduct)?.stock} 件
                            </p>
                          </div>
                        </div>
                        {products.find((p) => p.id === selectedProduct)?.description && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">描述</p>
                            <p className="text-gray-300 text-sm">
                              {products.find((p) => p.id === selectedProduct)?.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 上传图片 */}
                    <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Upload className="h-5 w-5 text-white" />
                        <h2 className="text-lg font-semibold text-white">
                          上传图片
                        </h2>
                      </div>

                      <ProductImageUpload
                        productId={selectedProduct}
                        onUploadComplete={handleUploadComplete}
                      />

                      {/* 使用说明 */}
                      <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <h3 className="font-semibold text-sm text-white mb-2">
                          💡 上传说明
                        </h3>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• 支持 JPG, PNG, WebP 等常见图片格式</li>
                          <li>• 单个文件不超过 10MB</li>
                          <li>• 建议上传 3-5 张产品图片</li>
                          <li>• 可以拖拽多个文件到上传区域</li>
                          <li>• 图片将自动保存到产品库</li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-primary-900/40 backdrop-blur rounded-lg border border-white/10 p-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">
                  请从左侧选择一个产品来上传图片
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
