export interface Project {
  title: string
  category: string
  description: string
  image: string
  tags: string[]
  link?: string
}

export const projects: Project[] = [
  {
    title: "E-Commerce Platform",
    category: "Web Development",
    description: "A modern shopping experience with seamless checkout and personalized recommendations.",
    image: "/modern-ecommerce-platform.png",
    tags: ["Next.js", "TypeScript", "Stripe"],
    link: "#",
  },
  {
    title: "Brand Identity",
    category: "Design",
    description: "Complete visual identity system for a sustainable fashion brand.",
    image: "/fashion-brand-identity-design.jpg",
    tags: ["Branding", "UI/UX", "Motion"],
    link: "#",
  },
  {
    title: "Fitness Mobile App",
    category: "Mobile Development",
    description: "AI-powered workout tracking app with social features and real-time analytics.",
    image: "/fitness-app-interface.png",
    tags: ["React Native", "AI", "Firebase"],
    link: "#",
  },
  {
    title: "SaaS Dashboard",
    category: "Web Development",
    description: "Analytics platform with real-time data visualization and team collaboration tools.",
    image: "/saas-analytics-dashboard.png",
    tags: ["React", "D3.js", "WebSocket"],
    link: "#",
  },
  {
    title: "Restaurant Website",
    category: "Web Design",
    description: "Elegant website with online reservations and interactive menu experience.",
    image: "/elegant-restaurant-website.png",
    tags: ["Next.js", "Framer", "CMS"],
    link: "#",
  },
  {
    title: "Crypto Wallet",
    category: "Mobile Development",
    description: "Secure cryptocurrency wallet with multi-chain support and DeFi integration.",
    image: "/crypto-wallet-mobile-app.jpg",
    tags: ["Flutter", "Web3", "Blockchain"],
    link: "#",
  },
]
