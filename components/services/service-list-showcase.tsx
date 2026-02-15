"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ServiceCard } from "./service-card";
import { ServiceErrorBoundary } from "./service-error-boundary";
import type { Service } from "@/lib/types/services";

interface ServiceListShowcaseProps {
  category: string;
  title?: string;
  subtitle?: string;
  onConsult?: (service: Service) => void;
}

export function ServiceListShowcase({
  category,
  title,
  subtitle,
  onConsult,
}: ServiceListShowcaseProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/services?category=${category}`);

      if (!response.ok) {
        throw new Error("获取服务列表失败");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "获取服务列表失败");
      }

      // Filter services by category
      const filteredServices = Array.isArray(data.data)
        ? data.data.filter((s: Service) => s.category === category)
        : [];

      setServices(filteredServices);

      if (filteredServices.length === 0) {
        setError("暂无该类别的服务");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "获取服务列表失败";
      setError(errorMessage);
      console.error("获取服务列表失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [category]);

  const handleRetry = () => {
    fetchServices();
  };

  return (
    <ServiceErrorBoundary>
      <div className="w-full">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">加载服务列表中...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{error}</AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重试
              </Button>
            </div>
          </motion.div>
        )}

        {/* Services Grid */}
        {!loading && !error && services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                category={category}
                index={index}
                onConsult={onConsult}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && services.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground mb-4">暂无该类别的服务</p>
            <Button onClick={handleRetry} variant="outline">
              刷新
            </Button>
          </motion.div>
        )}
      </div>
    </ServiceErrorBoundary>
  );
}

export default ServiceListShowcase;
