// Performance monitoring utilities
export const reportWebVitals = (metric: {
  id: string
  name: string
  value: number
  label?: "web-vital" | "custom"
}) => {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${metric.name}:`, metric.value)
  }

  // Send to analytics in production
  if (typeof window !== "undefined" && (window as unknown as { gtag?: CallableFunction }).gtag) {
    ;(window as unknown as { gtag: CallableFunction }).gtag("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      event_category: metric.label === "web-vital" || !metric.label ? "Web Vitals" : "Custom",
      event_label: metric.id,
      non_interaction: true,
    })
  }
}

// Core Web Vitals thresholds
export const VITALS_THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}
