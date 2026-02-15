"use client";

import { useEffect } from "react";
import { reportWebVitals } from "@/lib/utils/performance";

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    import("web-vitals").then(
      ({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        onCLS(reportWebVitals);
        onFCP(reportWebVitals);
        onLCP(reportWebVitals);
        onTTFB(reportWebVitals);
        onINP(reportWebVitals);
      },
    ).catch(() => {
      // web-vitals not available
    });
  }, []);

  return null;
}
