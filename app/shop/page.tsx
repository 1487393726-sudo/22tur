"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ServiceErrorBoundary,
  ServiceLoadError,
  ServiceEmptyState,
} from "@/components/services/service-error-boundary";
import {
  ShoppingCart,
  Star,
  Check,
  ArrowRight,
  Loader2,
  Sparkles,
  Zap,
  Scale,
  X,
  Package,
} from "lucide-react";

interface ServicePackage {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  originalPrice: number;
  packagePrice: number;
  savings: number;
  coverImage: string | null;
  highlights: string[];
  isPopular: boolean;
  category: {
    id: string;
    name: string;
    nameEn: string;
  } | null;
  items: {
    service: {
      id: string;
      name: string;
      nameEn: string;
    };
    quantity: number;
  }[];
}

export default function ShopPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [compareData, setCompareData] = useState<any>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services/packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      } else {
        setError("获取套餐数据失败，请稍后重试");
      }
    } catch (error) {
      console.error("获取套餐失败:", error);
      setError("网络连接失败，请检查网络后重试");
    } finally {
      setLoading(false);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCompare = async () => {
    if (compareList.length < 2) return;
    try {
      const res = await fetch(
        `/api/services/packages/compare?ids=${compareList.join(",")}`
      );
      if (res.ok) {
        const data = await res.json();
        setCompareData(data);
        setShowCompare(true);
      }
    } catch (error) {
      console.error("对比失败:", error);
    }
  };

  const popularPackages = packages.filter((p) => p.isPopular);
  const regularPackages = packages.filter((p) => !p.isPopular);

  return (
    <ServiceErrorBoundary serviceName="产品商店">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <ShoppingCart className="w-4 h-4" />
              产品商店
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              服务套餐
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              精选服务套餐，为您提供更优惠的价格和更全面的服务
            </p>
          </div>
        </section>

        {/* Compare Bar */}
        {compareList.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Scale className="w-5 h-5 text-blue-400" />
                <span className="text-white">
                  已选择 {compareList.length} 个套餐进行对比
                </span>
                <div className="flex gap-2">
                  {compareList.map((id) => {
                    const pkg = packages.find((p) => p.id === id);
                    return pkg ? (
                      <span
                        key={id}
                        className="px-3 py-1 bg-slate-700 rounded-full text-sm text-gray-300 flex items-center gap-2"
                      >
                        {pkg.name}
                        <button
                          onClick={() => toggleCompare(id)}
                          className="hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCompareList([])}
                  className="border-slate-600"
                >
                  清空
                </Button>
                <Button
                  onClick={handleCompare}
                  disabled={compareList.length < 2}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  开始对比
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        <section className="px-4 pb-32">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <ServiceLoadError message={error} onRetry={fetchPackages} />
            ) : packages.length === 0 ? (
              <ServiceEmptyState
                icon={Package}
                title="暂无套餐"
                description="目前没有可购买的服务套餐，请稍后再来查看"
                actionLabel="浏览服务"
                actionHref="/services"
              />
            ) : (
              <>
                {/* Popular Packages */}
                {popularPackages.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-yellow-500" />
                      热门推荐
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {popularPackages.map((pkg) => (
                        <PackageCard
                          key={pkg.id}
                          pkg={pkg}
                          isSelected={compareList.includes(pkg.id)}
                          onToggleCompare={() => toggleCompare(pkg.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Packages */}
                {regularPackages.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      全部套餐
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularPackages.map((pkg) => (
                        <PackageCard
                          key={pkg.id}
                          pkg={pkg}
                          isSelected={compareList.includes(pkg.id)}
                          onToggleCompare={() => toggleCompare(pkg.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Compare Modal */}
        {showCompare && compareData && (
          <CompareModal
            data={compareData}
            onClose={() => {
              setShowCompare(false);
              setCompareData(null);
            }}
          />
        )}
      </main>

      <Footer />
    </div>
    </ServiceErrorBoundary>
  );
}

function PackageCard({
  pkg,
  isSelected,
  onToggleCompare,
}: {
  pkg: ServicePackage;
  isSelected: boolean;
  onToggleCompare: () => void;
}) {
  const savingsPercent = Math.round((pkg.savings / pkg.originalPrice) * 100);

  return (
    <div
      className={`relative bg-slate-800/30 border rounded-2xl overflow-hidden transition-all ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-slate-700/50 hover:border-slate-600/50"
      }`}
    >
      {pkg.isPopular && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            热门
          </span>
        </div>
      )}

      {pkg.coverImage && (
        <div className="relative h-40">
          <Image
            src={pkg.coverImage}
            alt={pkg.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
      )}

      <div className="p-6">
        {pkg.category && (
          <span className="text-xs text-blue-400 mb-2 block">
            {pkg.category.name}
          </span>
        )}
        <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {pkg.description}
        </p>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              ¥{pkg.packagePrice.toLocaleString()}
            </span>
            <span className="text-gray-500 line-through">
              ¥{pkg.originalPrice.toLocaleString()}
            </span>
          </div>
          <span className="text-green-400 text-sm">
            节省 ¥{pkg.savings.toLocaleString()} ({savingsPercent}%)
          </span>
        </div>

        {/* Highlights */}
        {pkg.highlights && pkg.highlights.length > 0 && (
          <ul className="space-y-2 mb-6">
            {pkg.highlights.slice(0, 4).map((highlight, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
        )}

        {/* Services Count */}
        <p className="text-gray-500 text-sm mb-4">
          包含 {pkg.items.length} 项服务
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            asChild
          >
            <Link href={`/shop/${pkg.slug || pkg.id}`}>
              查看详情
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleCompare}
            className={`border-slate-600 ${
              isSelected ? "bg-blue-500/20 border-blue-500" : ""
            }`}
          >
            <Scale className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CompareModal({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">套餐对比</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Package Headers */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${data.packages.length}, 1fr)` }}>
            <div></div>
            {data.packages.map((pkg: any) => (
              <div key={pkg.id} className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {pkg.name}
                </h3>
                <div className="text-2xl font-bold text-blue-400">
                  ¥{pkg.packagePrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 line-through">
                  ¥{pkg.originalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-green-400">
                  节省 {pkg.savingsPercent}%
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-8 space-y-2">
            <div
              className="grid gap-4 py-3 border-b border-slate-700"
              style={{ gridTemplateColumns: `200px repeat(${data.packages.length}, 1fr)` }}
            >
              <div className="text-gray-400 font-medium">包含服务数</div>
              {data.packages.map((pkg: any) => (
                <div key={pkg.id} className="text-center text-white">
                  {pkg.serviceCount} 项
                </div>
              ))}
            </div>

            {Object.entries(data.comparison.serviceNames).map(
              ([serviceId, names]: [string, any]) => (
                <div
                  key={serviceId}
                  className="grid gap-4 py-3 border-b border-slate-700/50"
                  style={{ gridTemplateColumns: `200px repeat(${data.packages.length}, 1fr)` }}
                >
                  <div className="text-gray-300">{names.name}</div>
                  {data.packages.map((pkg: any) => {
                    const included = data.comparison.matrix[serviceId]?.[pkg.id];
                    return (
                      <div key={pkg.id} className="text-center">
                        {included ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* Actions */}
          <div
            className="grid gap-4 mt-8"
            style={{ gridTemplateColumns: `200px repeat(${data.packages.length}, 1fr)` }}
          >
            <div></div>
            {data.packages.map((pkg: any) => (
              <div key={pkg.id} className="text-center">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  asChild
                >
                  <Link href={`/shop/${pkg.slug || pkg.id}`}>
                    选择此套餐
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
