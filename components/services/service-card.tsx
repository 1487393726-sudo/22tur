"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  DollarSign,
  ArrowRight,
  Star,
  Badge as BadgeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/types/services";

interface ServiceCardProps {
  service: Service;
  category: string;
  index?: number;
  onConsult?: (service: Service) => void;
}

export function ServiceCard({
  service,
  category,
  index = 0,
  onConsult,
}: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleConsult = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onConsult) {
      onConsult(service);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/services/${category}/${service.id}`} className="block h-full">
        <div
          className={cn(
            "relative h-full p-6 rounded-xl",
            "bg-gradient-to-br from-background to-muted/30",
            "border border-border/50 hover:border-primary/30",
            "transition-all duration-300 group",
            "hover:shadow-lg hover:shadow-primary/10",
            "hover:-translate-y-1",
            isHovered && "scale-[1.02]"
          )}
        >
          {/* Popular Badge */}
          {service.popular && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                热门
              </Badge>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {service.description}
          </p>

          {/* Features */}
          <div className="mb-6 space-y-2">
            {service.features.slice(0, 3).map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{feature}</span>
              </div>
            ))}
            {service.features.length > 3 && (
              <div className="text-xs text-muted-foreground italic">
                +{service.features.length - 3} 更多特性
              </div>
            )}
          </div>

          {/* Price and Delivery */}
          <div className="mb-6 space-y-2 pb-6 border-b border-border/50">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                ¥{service.priceRange.min.toLocaleString()} - ¥
                {service.priceRange.max.toLocaleString()} {service.priceRange.unit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                交付周期: {service.deliveryTime}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleConsult}
            >
              在线咨询
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90"
              asChild
            >
              <Link href={`/appointment?service=${service.id}`}>预约</Link>
            </Button>
          </div>

          {/* Hover Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    </motion.div>
  );
}

export default ServiceCard;
