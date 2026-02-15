"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  TrendingUp
} from "lucide-react";

interface PartnerHoverPopupProps {
  partner: {
    name: string;
    nameZh: string;
    industry: string;
    industryZh: string;
    location: string;
    locationZh: string;
    partnerSince: string;
    employees: string;
    revenue: string;
    rating: number;
    description: string;
    descriptionZh: string;
  };
  locale: string;
  children: React.ReactNode;
}

export function PartnerHoverPopup({ partner, locale, children }: PartnerHoverPopupProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const getContent = (zh: string, en: string) => {
    return locale === "en" ? en : zh;
  };

  useEffect(() => {
    if (isHovered && containerRef.current && popupRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate position - try to show popup to the right of the card
      let x = containerRect.right + 16;
      let y = containerRect.top;

      // If popup would overflow right edge, show on left instead
      if (x + popupRect.width > viewportWidth - 16) {
        x = containerRect.left - popupRect.width - 16;
      }

      // If popup would overflow left edge, center it horizontally
      if (x < 16) {
        x = Math.max(16, (viewportWidth - popupRect.width) / 2);
      }

      // Adjust vertical position if needed
      if (y + popupRect.height > viewportHeight - 16) {
        y = Math.max(16, viewportHeight - popupRect.height - 16);
      }

      setPosition({ x, y });
    }
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      {children}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 9999,
            }}
            className="w-80 pointer-events-none"
          >
            {/* Glass effect popup */}
            <div className="glass-medium rounded-xl border border-border/50 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Header with gradient */}
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border/50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg leading-tight">
                    {getContent(partner.nameZh, partner.name)}
                  </h3>
                  <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium">{partner.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getContent(partner.industryZh, partner.industry)}
                </p>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {getContent(partner.locationZh, partner.location)}
                  </span>
                </div>

                {/* Partner Since */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {locale === "en" ? "Partner since" : "合作始于"} {partner.partnerSince}
                  </span>
                </div>

                {/* Employees */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {partner.employees} {locale === "en" ? "employees" : "员工"}
                  </span>
                </div>

                {/* Revenue */}
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {partner.revenue} {locale === "en" ? "revenue" : "营收"}
                  </span>
                </div>

                {/* Description */}
                <div className="pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {getContent(partner.descriptionZh, partner.description)}
                  </p>
                </div>

                {/* Hint */}
                <div className="pt-2 text-xs text-center text-muted-foreground/70">
                  {locale === "en" ? "Click for full details" : "点击查看完整详情"}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
