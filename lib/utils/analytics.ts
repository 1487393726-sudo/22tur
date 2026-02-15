// Analytics event tracking utilities
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== "undefined" && (window as unknown as { gtag?: CallableFunction }).gtag) {
    ;(window as unknown as { gtag: CallableFunction }).gtag("event", eventName, properties)
  }
}

export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && (window as unknown as { gtag?: CallableFunction }).gtag) {
    ;(window as unknown as { gtag: CallableFunction }).gtag("config", "GA_MEASUREMENT_ID", {
      page_path: url,
    })
  }
}

// Event types for type safety
export const AnalyticsEvents = {
  CONTACT_FORM_SUBMIT: "contact_form_submit",
  PROJECT_VIEW: "project_view",
  TEAM_MEMBER_VIEW: "team_member_view",
  NAVIGATION_CLICK: "navigation_click",
  CTA_CLICK: "cta_click",
} as const
