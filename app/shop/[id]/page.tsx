"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Star,
  Clock,
  Shield,
  Headphones,
  Loader2,
  MessageCircle,
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
      description: string;
      basePrice: number | null;
      category: {
        name: string;
      };
    };
    quantity: number;
  }[];
}

export default function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [pkg, setPkg] = useState<ServicePackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackageDetail();
  }, [id]);

  const fetchPackageDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/services/packages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPkg(data);
      } else {
        router.push("/shop");
      }
    } catch (error) {
      console.error("获取套餐详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!pkg) {
    return null;
  }

  const savingsPercent = Math.round((pkg.savings / pkg.originalPrice) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <main className="pt-20">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回商店
          </Button>
        </div>

        {/* Package Detail */}
        <section className="px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Image and Info */}
              <div>
                {pkg.coverImage ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                    <Image
                      src={pkg.coverImage}
                      alt={pkg.name}
                      fill
                      className="object-cover"
                    />
                    {pkg.isPopular && (
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-medium rounded-full flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          热门推荐
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6">
                    <ShoppingCart className="w-20 h-20 text-white/50" />
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                    <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">快速交付</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                    <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">质量保证</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                    <Headphones className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">专属客服</p>
                  </div>
                </div>
              </div>

              {/* Right: Details */}
              <div>
                {pkg.category && (
                  <span className="inline-block px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full mb-4">
                    {pkg.category.name}
                  </span>
                )}

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {pkg.name}
                </h1>
                <p className="text-gray-500 mb-6">{pkg.nameEn}</p>

                <p className="text-gray-300 leading-relaxed mb-8">
                  {pkg.description}
                </p>

                {/* Price */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-4xl font-bold text-white">
                      ¥{pkg.packagePrice.toLocaleString()}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      ¥{pkg.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      节省 ¥{pkg.savings.toLocaleString()}
                    </span>
                    <span className="text-green-400 text-sm">
                      优惠 {savingsPercent}%
                    </span>
                  </div>
                </div>

                {/* Highlights */}
                {pkg.highlights && pkg.highlights.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      套餐亮点
                    </h3>
                    <ul className="space-y-3">
                      {pkg.highlights.map((highlight, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 text-gray-300"
                        >
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    asChild
                  >
                    <Link href="/contact">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      立即购买
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-700"
                    asChild
                  >
                    <Link href="/contact">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      咨询
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Included Services */}
        <section className="px-4 py-16 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">
              包含服务 ({pkg.items.length} 项)
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pkg.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs text-blue-400 mb-1 block">
                        {item.service.category?.name}
                      </span>
                      <h3 className="text-lg font-semibold text-white">
                        {item.service.name}
                      </h3>
                    </div>
                    {item.quantity > 1 && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                  {item.service.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {item.service.description}
                    </p>
                  )}
                  {item.service.basePrice && (
                    <p className="text-gray-500 text-sm mt-3">
                      单独购买: ¥{item.service.basePrice.toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              常见问题
            </h2>

            <div className="space-y-4">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  购买后如何开始服务？
                </h3>
                <p className="text-gray-400">
                  购买成功后，我们的客服会在24小时内与您联系，了解您的具体需求并安排服务启动。
                </p>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  套餐内的服务可以单独使用吗？
                </h3>
                <p className="text-gray-400">
                  是的，套餐内的各项服务可以根据您的需求灵活安排使用顺序和时间。
                </p>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  如果对服务不满意怎么办？
                </h3>
                <p className="text-gray-400">
                  我们提供服务质量保证，如果您对服务不满意，可以申请修改或退款。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
