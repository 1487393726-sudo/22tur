export interface Service {
  title: string;
  description: string;
  icon: string;
  features: string[];
  highlight?: string;
}

export const services: Service[] = [
  {
    title: "Web Development",
    description:
      "Full-stack web applications and websites built with modern frameworks, scalable architecture, and lightning-fast performance.",
    icon: "code",
    features: [
      "Next.js 16 & React 19",
      "TypeScript & Node.js",
      "Cloud Deployment",
      "PWA & SEO Optimized",
      "Real-time Features",
    ],
    highlight: "Lightning Fast",
  },
  {
    title: "Mobile Development",
    description:
      "Native and cross-platform mobile apps that provide seamless experiences across all devices and platforms.",
    icon: "smartphone",
    features: [
      "iOS & Android Native",
      "React Native & Flutter",
      "App Store Launch",
      "Push Notifications",
      "Offline Capabilities",
    ],
    highlight: "Cross-Platform",
  },
  {
    title: "UI/UX Design",
    description:
      "Human-centered design that transforms complex problems into intuitive, accessible, and delightful user experiences.",
    icon: "palette",
    features: [
      "Design Systems",
      "User Journey Mapping",
      "Interactive Prototypes",
      "Accessibility (WCAG)",
      "Design Tokens",
    ],
    highlight: "User-Centered",
  },
  {
    title: "Brand & Identity",
    description:
      "Comprehensive brand strategies that create emotional connections and differentiate your business in the market.",
    icon: "sparkles",
    features: [
      "Brand Strategy",
      "Logo & Visual Identity",
      "Brand Guidelines",
      "Marketing Collateral",
      "Brand Voice & Messaging",
    ],
    highlight: "Memorable",
  },
  {
    title: "Digital Strategy",
    description:
      "Data-driven digital marketing and growth strategies that amplify your reach and maximize conversion rates.",
    icon: "trending-up",
    features: [
      "Growth Marketing",
      "SEO & Content Strategy",
      "Social Media Strategy",
      "Analytics & Attribution",
      "Conversion Optimization",
    ],
    highlight: "Results-Driven",
  },
  {
    title: "Technology Consulting",
    description:
      "Strategic technology guidance to modernize your infrastructure, optimize processes, and accelerate digital transformation.",
    icon: "lightbulb",
    features: [
      "Architecture Review",
      "Technology Roadmap",
      "Code Audits",
      "Team Mentoring",
      "DevOps & CI/CD",
    ],
    highlight: "Future-Proof",
  },
];
