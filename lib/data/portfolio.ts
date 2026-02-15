export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  designer: string;
  image: string;
  views: number;
  likes: number;
  featured: boolean;
  description: string;
  tags: string[];
  completedDate: string;
  client?: string;
  projectUrl?: string;
  technologies?: string[];
}

export interface PortfolioCategory {
  id: string;
  label: string;
  count: number;
}

export const portfolioCategories: PortfolioCategory[] = [
  { id: "all", label: "All Works", count: 0 },
  { id: "web", label: "Web Design", count: 0 },
  { id: "mobile", label: "Mobile Apps", count: 0 },
  { id: "ui", label: "UI/UX Design", count: 0 },
  { id: "branding", label: "Brand Design", count: 0 },
  { id: "illustration", label: "Illustration", count: 0 },
  { id: "marketing", label: "Marketing Design", count: 0 },
  { id: "packaging", label: "Package Design", count: 0 },
  { id: "motion", label: "Motion Graphics", count: 0 },
  { id: "3d", label: "3D Design", count: 0 },
  { id: "print", label: "Print Design", count: 0 },
  { id: "vi", label: "VI Design", count: 0 },
  { id: "interior", label: "Interior Design", count: 0 },
  { id: "ecommerce", label: "E-commerce Development", count: 0 },
  { id: "strategy", label: "Marketing Strategy", count: 0 },
  { id: "socialmedia", label: "Social Media Design", count: 0 },
  { id: "uniform", label: "Uniform Design", count: 0 },
  { id: "paper", label: "Paper Products Design", count: 0 },
  { id: "poster", label: "Poster & Ads Design", count: 0 },
];

export const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "Modern E-commerce Platform",
    category: "web",
    designer: "Creative Team Alpha",
    image: "/modern-ecommerce-platform.png",
    views: 2834,
    likes: 189,
    featured: true,
    description: "A comprehensive e-commerce solution with modern design principles, seamless user experience, and advanced shopping features.",
    tags: ["E-commerce", "Responsive", "React", "Next.js"],
    completedDate: "2024-03-15",
    client: "TechMart Solutions",
    projectUrl: "https://example.com",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Stripe"]
  },
  {
    id: 2,
    title: "Crypto Wallet Mobile App",
    category: "mobile",
    designer: "Creative Team Beta",
    image: "/crypto-wallet-mobile-app.jpg",
    views: 1967,
    likes: 145,
    featured: true,
    description: "Secure and intuitive cryptocurrency wallet application with advanced trading features and portfolio management.",
    tags: ["Fintech", "Mobile", "Crypto", "Security"],
    completedDate: "2024-02-28",
    client: "CryptoFlow Inc",
    technologies: ["React Native", "TypeScript", "Web3", "Blockchain API"]
  },
  {
    id: 3,
    title: "Elegant Restaurant Website",
    category: "web",
    designer: "Creative Team Gamma",
    image: "/elegant-restaurant-website.png",
    views: 3421,
    likes: 267,
    featured: true,
    description: "Sophisticated restaurant website featuring online reservations, menu showcase, and immersive dining experience presentation.",
    tags: ["Restaurant", "Hospitality", "Booking", "Responsive"],
    completedDate: "2024-01-20",
    client: "Bella Vista Restaurant",
    projectUrl: "https://bellavista-example.com",
    technologies: ["Next.js", "Sanity CMS", "Framer Motion", "Tailwind CSS"]
  },
  {
    id: 4,
    title: "Fashion Brand Identity Design",
    category: "branding",
    designer: "Creative Team Delta",
    image: "/fashion-brand-identity-design.jpg",
    views: 2156,
    likes: 198,
    featured: false,
    description: "Complete brand identity system for luxury fashion brand including logo, typography, color palette, and brand guidelines.",
    tags: ["Fashion", "Luxury", "Identity", "Print Design"],
    completedDate: "2024-01-10",
    client: "Aurora Fashion House",
    technologies: ["Adobe Illustrator", "Adobe InDesign", "Figma"]
  },
  {
    id: 5,
    title: "Fitness App Interface",
    category: "mobile",
    designer: "Creative Team Epsilon",
    image: "/fitness-app-interface.png",
    views: 1743,
    likes: 126,
    featured: false,
    description: "Motivational fitness tracking application with personalized workouts, nutrition planning, and social challenges.",
    tags: ["Fitness", "Health", "Tracking", "Social"],
    completedDate: "2023-12-15",
    client: "FitLife Solutions",
    technologies: ["Flutter", "Firebase", "Health APIs", "Machine Learning"]
  },
  {
    id: 6,
    title: "SaaS Analytics Dashboard",
    category: "ui",
    designer: "Creative Team Zeta",
    image: "/saas-analytics-dashboard.png",
    views: 2567,
    likes: 203,
    featured: true,
    description: "Comprehensive analytics dashboard for SaaS platforms with real-time data visualization and advanced reporting features.",
    tags: ["SaaS", "Analytics", "Dashboard", "Data Viz"],
    completedDate: "2023-11-30",
    client: "DataInsight Pro",
    projectUrl: "https://datainsight-example.com",
    technologies: ["React", "D3.js", "Node.js", "MongoDB", "Chart.js"]
  },
  {
    id: 7,
    title: "Creative Portfolio Website",
    category: "web",
    designer: "Creative Team Alpha",
    image: "/placeholder.jpg",
    views: 1892,
    likes: 134,
    featured: false,
    description: "Personal portfolio website for creative professionals showcasing work with smooth animations and interactive elements.",
    tags: ["Portfolio", "Creative", "Animation", "Interactive"],
    completedDate: "2023-11-15",
    client: "Independent Artist",
    technologies: ["Gatsby", "GSAP", "Three.js", "Netlify"]
  },
  {
    id: 8,
    title: "Medical App Interface",
    category: "mobile",
    designer: "Creative Team Beta",
    image: "/placeholder.jpg",
    views: 1456,
    likes: 98,
    featured: false,
    description: "Healthcare management application for patients and doctors with appointment booking and telemedicine features.",
    tags: ["Healthcare", "Medical", "Telemedicine", "Booking"],
    completedDate: "2023-10-20",
    client: "MedCare Solutions",
    technologies: ["React Native", "Node.js", "PostgreSQL", "Socket.io"]
  },
  {
    id: 9,
    title: "Startup Brand Package",
    category: "branding",
    designer: "Creative Team Delta",
    image: "/placeholder.jpg",
    views: 1234,
    likes: 89,
    featured: false,
    description: "Complete branding package for tech startup including logo design, website, business cards, and marketing materials.",
    tags: ["Startup", "Tech", "Branding", "Marketing"],
    completedDate: "2023-09-25",
    client: "InnovateHub",
    technologies: ["Adobe Creative Suite", "Figma", "Webflow"]
  },
  {
    id: 10,
    title: "Educational Platform UI",
    category: "ui",
    designer: "Creative Team Gamma",
    image: "/placeholder.jpg",
    views: 2098,
    likes: 156,
    featured: false,
    description: "User-friendly educational platform interface with course management, progress tracking, and interactive learning tools.",
    tags: ["Education", "E-learning", "Interactive", "Progress"],
    completedDate: "2023-08-30",
    client: "EduTech Academy",
    projectUrl: "https://edutech-example.com",
    technologies: ["Vue.js", "Laravel", "MySQL", "WebRTC"]
  },
  {
    id: 11,
    title: "Travel App Design",
    category: "mobile",
    designer: "Creative Team Epsilon",
    image: "/placeholder.jpg",
    views: 1678,
    likes: 112,
    featured: false,
    description: "Comprehensive travel planning application with booking integration, itinerary management, and social sharing features.",
    tags: ["Travel", "Booking", "Social", "Planning"],
    completedDate: "2023-08-15",
    client: "Wanderlust Travel",
    technologies: ["Swift", "Kotlin", "Firebase", "Google Maps API"]
  },
  {
    id: 12,
    title: "Corporate Website Redesign",
    category: "web",
    designer: "Creative Team Zeta",
    image: "/placeholder.jpg",
    views: 1543,
    likes: 87,
    featured: false,
    description: "Complete redesign of corporate website with focus on user experience, accessibility, and conversion optimization.",
    tags: ["Corporate", "Redesign", "Accessibility", "Conversion"],
    completedDate: "2023-07-20",
    client: "Global Enterprises",
    projectUrl: "https://globalent-example.com",
    technologies: ["WordPress", "PHP", "SCSS", "jQuery"]
  },
  // Marketing Design Projects
  {
    id: 13,
    title: "Social Media Campaign",
    category: "marketing",
    designer: "Creative Team Alpha",
    image: "/social-media-campaign.jpg",
    views: 3234,
    likes: 167,
    featured: true,
    description: "Comprehensive social media marketing campaign for product launch with creative visuals and engaging content strategy.",
    tags: ["Social Media", "Marketing", "Campaign", "Brand Strategy"],
    completedDate: "2024-01-25",
    client: "GrowthWave Marketing",
    projectUrl: "https://growthwave-campaign.com",
    technologies: ["Adobe Creative Suite", "Canva", "Meta Business Suite", "Analytics"]
  },
  {
    id: 14,
    title: "Product Launch Graphics",
    category: "marketing",
    designer: "Creative Team Beta",
    image: "/product-launch-graphics.jpg",
    views: 1876,
    likes: 234,
    featured: false,
    description: "Complete visual identity for product launch including promotional materials, social graphics, and presentation templates.",
    tags: ["Product Launch", "Marketing Graphics", "Visual Design", "Promotion"],
    completedDate: "2023-11-10",
    client: "TechNova Solutions",
    technologies: ["Adobe Illustrator", "Photoshop", "Figma", "After Effects"]
  },
  {
    id: 15,
    title: "Email Newsletter Design",
    category: "marketing",
    designer: "Creative Team Gamma",
    image: "/email-newsletter-design.jpg",
    views: 1432,
    likes: 189,
    featured: false,
    description: "Responsive email newsletter templates with modern design, high engagement rates, and cross-platform compatibility.",
    tags: ["Email Marketing", "Newsletter", "Template Design", "Responsive"],
    completedDate: "2023-09-15",
    client: "ConnectMail Pro",
    technologies: ["HTML", "CSS", "Mailchimp", "Figma"]
  },
  // Package Design Projects
  {
    id: 16,
    title: "Eco-Friendly Product Packaging",
    category: "packaging",
    designer: "Creative Team Delta",
    image: "/eco-friendly-packaging.jpg",
    views: 2654,
    likes: 298,
    featured: true,
    description: "Sustainable packaging design for organic products using recyclable materials and minimalist aesthetic approach.",
    tags: ["Sustainable", "Packaging", "Eco-Friendly", "Product Design"],
    completedDate: "2024-02-10",
    client: "GreenEarth Products",
    projectUrl: "https://greenearth-packaging.com",
    technologies: ["Adobe Illustrator", "Cinema 4D", "Environmental Design Tools"]
  },
  {
    id: 17,
    title: "Luxury Gift Box Design",
    category: "packaging",
    designer: "Creative Team Epsilon",
    image: "/luxury-gift-box.jpg",
    views: 1987,
    likes: 267,
    featured: false,
    description: "Premium gift box packaging with elegant design, custom inserts, and premium finishing touches.",
    tags: ["Luxury", "Gift Packaging", "Premium Design", "Custom Boxes"],
    completedDate: "2023-12-20",
    client: "Elegance Gifts Co.",
    technologies: ["ArtiosCAD", "Adobe Creative Suite", "3D Rendering"]
  },
  {
    id: 18,
    title: "Food Product Packaging Series",
    category: "packaging",
    designer: "Creative Team Zeta",
    image: "/food-packaging-series.jpg",
    views: 1543,
    likes: 145,
    featured: false,
    description: "Complete packaging system for food products including branding, nutritional information design, and shelf display optimization.",
    tags: ["Food Packaging", "Branding", "Nutritional Design", "Retail"],
    completedDate: "2023-08-25",
    client: "FreshBite Foods",
    technologies: ["Adobe Illustrator", "Photoshop", "Packaging Design Software"]
  },
  // Motion Graphics Projects
  {
    id: 19,
    title: "Brand Animation Identity",
    category: "motion",
    designer: "Creative Team Alpha",
    image: "/brand-animation-identity.jpg",
    views: 3421,
    likes: 456,
    featured: true,
    description: "Dynamic brand identity animation package with logo animations, transition effects, and motion graphics for digital platforms.",
    tags: ["Brand Animation", "Motion Graphics", "Logo Animation", "Visual Effects"],
    completedDate: "2024-03-01",
    client: "MotionFlow Studios",
    projectUrl: "https://motionflow-showcase.com",
    technologies: ["After Effects", "Cinema 4D", "Blender", "Adobe Animate"]
  },
  {
    id: 20,
    title: "Product Explainer Video",
    category: "motion",
    designer: "Creative Team Beta",
    image: "/product-explainer-video.jpg",
    views: 2876,
    likes: 334,
    featured: false,
    description: "Animated explainer video showcasing product features with engaging visuals and clear messaging.",
    tags: ["Explainer Video", "Animation", "Product Demo", "Motion Design"],
    completedDate: "2023-10-15",
    client: "DemoTech Solutions",
    projectUrl: "https://demotech-explainer.com",
    technologies: ["After Effects", "Premiere Pro", "Audition", "Motion Graphics"]
  },
  {
    id: 21,
    title: "UI Micro-interactions",
    category: "motion",
    designer: "Creative Team Gamma",
    image: "/ui-micro-interactions.jpg",
    views: 2134,
    likes: 287,
    featured: false,
    description: "Set of custom UI micro-interactions and animations for enhanced user experience in web applications.",
    tags: ["UI Animation", "Micro-interactions", "User Experience", "Motion Design"],
    completedDate: "2023-11-30",
    client: "InteractUI Design",
    technologies: ["Figma", "Principle", "After Effects", "Lottie"]
  },
  // 3D Design Projects
  {
    id: 22,
    title: "Product 3D Visualization",
    category: "3d",
    designer: "Creative Team Delta",
    image: "/product-3d-visualization.jpg",
    views: 3654,
    likes: 523,
    featured: true,
    description: "Photorealistic 3D product visualization with interactive 360° views and detailed material rendering.",
    tags: ["3D Visualization", "Product Design", "Rendering", "Interactive"],
    completedDate: "2024-01-15",
    client: "Vision3D Studios",
    projectUrl: "https://vision3d-portfolio.com",
    technologies: ["Blender", "Substance Painter", "Marmoset Toolbag", "Unreal Engine"]
  },
  {
    id: 23,
    title: "Architectural 3D Rendering",
    category: "3d",
    designer: "Creative Team Epsilon",
    image: "/architectural-3d-rendering.jpg",
    views: 2987,
    likes: 412,
    featured: false,
    description: "Exterior architectural visualization with realistic lighting, materials, and environmental integration.",
    tags: ["Architecture", "3D Rendering", "Visualization", "Realistic"],
    completedDate: "2023-12-05",
    client: "BuildVision Architects",
    projectUrl: "https://buildvision-arch.com",
    technologies: ["3ds Max", "V-Ray", "Corona Renderer", "Photoshop"]
  },
  {
    id: 24,
    title: "Character 3D Modeling",
    category: "3d",
    designer: "Creative Team Zeta",
    image: "/character-3d-modeling.jpg",
    views: 1876,
    likes: 298,
    featured: false,
    description: "Detailed 3D character modeling with stylized design, rigging, and animation-ready topology.",
    tags: ["Character Design", "3D Modeling", "Digital Sculpture", "Animation"],
    completedDate: "2023-09-20",
    client: "GameCraft Studios",
    projectUrl: "https://gamecraft-character.com",
    technologies: ["ZBrush", "Maya", "Substance Painter", "Blender"]
  },
  // Print Design Projects
  {
    id: 25,
    title: "Annual Report Design",
    category: "print",
    designer: "Creative Team Alpha",
    image: "/annual-report-design.jpg",
    views: 1654,
    likes: 234,
    featured: true,
    description: "Corporate annual report with professional layout, data visualization, and premium print production quality.",
    tags: ["Annual Report", "Print Design", "Corporate", "Data Visualization"],
    completedDate: "2024-02-20",
    client: "FinanceCorp International",
    projectUrl: "https://annual-report-design.com",
    technologies: ["InDesign", "Adobe Creative Suite", "Excel", "Data Visualization Tools"]
  },
  {
    id: 26,
    title: "Magazine Layout Design",
    category: "print",
    designer: "Creative Team Beta",
    image: "/magazine-layout-design.jpg",
    views: 2432,
    likes: 312,
    featured: false,
    description: "Modern magazine layout with typography focus, visual hierarchy, and engaging editorial design.",
    tags: ["Magazine Design", "Editorial", "Typography", "Layout"],
    completedDate: "2023-11-15",
    client: "StyleLife Magazine",
    projectUrl: "https://stylelife-magazine.com",
    technologies: ["InDesign", "Illustrator", "Photoshop", "Figma"]
  },
  {
    id: 27,
    title: "Brochure & Catalog Design",
    category: "print",
    designer: "Creative Team Gamma",
    image: "/brochure-catalog-design.jpg",
    views: 1987,
    likes: 276,
    featured: false,
    description: "Marketing brochure and product catalog with professional layout and compelling visual presentation.",
    tags: ["Brochure", "Catalog", "Marketing Materials", "Print Design"],
    completedDate: "2023-10-30",
    client: "MarketPro Solutions",
    projectUrl: "https://marketpro-brochure.com",
    technologies: ["InDesign", "Illustrator", "Photoshop", "Adobe Creative Suite"]
  },
  // VI Design Projects
  {
    id: 28,
    title: "Corporate VI System - TechVision",
    category: "vi",
    designer: "Creative Team Alpha",
    image: "/corporate-vi-system-techvision.jpg",
    views: 3456,
    likes: 423,
    featured: true,
    description: "Complete Visual Identity system for technology company including logo, business cards, letterhead, brand guidelines and all marketing materials.",
    tags: ["VI System", "Logo Design", "Brand Guidelines", "Corporate Identity"],
    completedDate: "2024-03-10",
    client: "TechVision Corporation",
    projectUrl: "https://techvision-vi.com",
    technologies: ["Adobe Illustrator", "InDesign", "Brand Guidelines", "Print Design"]
  },
  {
    id: 29,
    title: "Restaurant VI Design - FreshBite",
    category: "vi",
    designer: "Creative Team Beta",
    image: "/restaurant-vi-freshbite.jpg",
    views: 2341,
    likes: 312,
    featured: false,
    description: "Complete visual identity for restaurant chain including menu design, packaging, signage, and staff uniform design.",
    tags: ["Restaurant VI", "Menu Design", "Packaging", "Signage"],
    completedDate: "2024-01-25",
    client: "FreshBite Restaurant Group",
    projectUrl: "https://freshbite-vi.com",
    technologies: ["Adobe Creative Suite", "3D Design", "Print Production"]
  },
  {
    id: 30,
    title: "Fashion Brand VI - Elegance",
    category: "vi",
    designer: "Creative Team Gamma",
    image: "/fashion-brand-vi-elegance.jpg",
    views: 2890,
    likes: 367,
    featured: false,
    description: "Luxury fashion brand visual identity including logo system, typography, color palette, and boutique design guidelines.",
    tags: ["Fashion VI", "Luxury Brand", "Typography", "Boutique Design"],
    completedDate: "2023-11-15",
    client: "Elegance Fashion Group",
    projectUrl: "https://elegance-fashion-vi.com",
    technologies: ["Adobe Illustrator", "Photoshop", "InDesign", "Brand Strategy"]
  },
  // Interior Design Projects
  {
    id: 31,
    title: "Modern Office Interior Design",
    category: "interior",
    designer: "Creative Team Delta",
    image: "/modern-office-interior-design.jpg",
    views: 3789,
    likes: 456,
    featured: true,
    description: "Complete office interior design including workspace planning, lighting design, furniture selection, and brand integration.",
    tags: ["Office Design", "Workspace Planning", "Lighting", "Furniture Design"],
    completedDate: "2024-02-15",
    client: "Innovation Hub Tech",
    projectUrl: "https://office-interior-design.com",
    technologies: ["AutoCAD", "3ds Max", "V-Ray", "SketchUp", "Interior Design"]
  },
  {
    id: 32,
    title: "Retail Store Interior - Fashion Boutique",
    category: "interior",
    designer: "Creative Team Epsilon",
    image: "/retail-store-interior-boutique.jpg",
    views: 2654,
    likes: 298,
    featured: false,
    description: "Luxury fashion boutique interior design with custom displays, fitting rooms, and customer experience optimization.",
    tags: ["Retail Design", "Boutique Interior", "Display Design", "Customer Experience"],
    completedDate: "2023-12-10",
    client: "Luxury Fashion House",
    projectUrl: "https://boutique-interior.com",
    technologies: ["AutoCAD", "3D Rendering", "Light Design", "Material Selection"]
  },
  {
    id: 33,
    title: "Restaurant Interior Design",
    category: "interior",
    designer: "Creative Team Zeta",
    image: "/restaurant-interior-design.jpg",
    views: 2123,
    likes: 267,
    featured: false,
    description: "Contemporary restaurant interior with theme design, seating arrangement, lighting design, and kitchen workflow optimization.",
    tags: ["Restaurant Interior", "Theme Design", "Seating Layout", "Kitchen Design"],
    completedDate: "2023-09-20",
    client: "Gourmet Dining Group",
    projectUrl: "https://restaurant-interior.com",
    technologies: ["SketchUp", "AutoCAD", "3D Visualization", "Interior Architecture"]
  },
  // E-commerce Development Projects
  {
    id: 34,
    title: "Complete E-commerce Platform - Fashion Store",
    category: "ecommerce",
    designer: "Creative Team Alpha",
    image: "/ecommerce-fashion-store.jpg",
    views: 4567,
    likes: 523,
    featured: true,
    description: "Full e-commerce platform development with product catalog, shopping cart, payment integration, inventory management, and analytics.",
    tags: ["E-commerce", "Online Store", "Payment Gateway", "Inventory Management"],
    completedDate: "2024-03-05",
    client: "StyleMart Fashion",
    projectUrl: "https://stylemart-ecommerce.com",
    technologies: ["Shopify", "React", "Node.js", "Stripe", "MongoDB", "AWS"]
  },
  {
    id: 35,
    title: "B2B E-commerce Platform",
    category: "ecommerce",
    designer: "Creative Team Beta",
    image: "/b2b-ecommerce-platform.jpg",
    views: 3234,
    likes: 389,
    featured: false,
    description: "B2B wholesale e-commerce platform with bulk ordering, customer portals, and integrated ERP systems.",
    tags: ["B2B E-commerce", "Wholesale", "Customer Portal", "ERP Integration"],
    completedDate: "2024-01-15",
    client: "WholesalePro Distributors",
    projectUrl: "https://wholesalepro-ecommerce.com",
    technologies: ["Magento", "PHP", "MySQL", "API Integration", "Custom Development"]
  },
  {
    id: 36,
    title: "Multi-vendor Marketplace",
    category: "ecommerce",
    designer: "Creative Team Gamma",
    image: "/multi-vendor-marketplace.jpg",
    views: 2987,
    likes: 334,
    featured: false,
    description: "Multi-vendor marketplace platform with vendor management, commission systems, and advanced search capabilities.",
    tags: ["Marketplace", "Multi-vendor", "Commission System", "Vendor Portal"],
    completedDate: "2023-11-30",
    client: "MarketHub Platform",
    projectUrl: "https://markethub-platform.com",
    technologies: ["WordPress", "WooCommerce", "PHP", "MySQL", "Custom Plugins"]
  },
  // Marketing Strategy Projects
  {
    id: 37,
    title: "Digital Marketing Strategy - Tech Startup",
    category: "strategy",
    designer: "Creative Team Delta",
    image: "/digital-marketing-strategy-tech.jpg",
    views: 2876,
    likes: 312,
    featured: true,
    description: "Comprehensive digital marketing strategy including market analysis, competitor research, content strategy, and growth hacking tactics.",
    tags: ["Marketing Strategy", "Market Analysis", "Growth Hacking", "Content Strategy"],
    completedDate: "2024-02-20",
    client: "TechStart Innovations",
    projectUrl: "https://marketing-strategy-case.com",
    technologies: ["Marketing Analytics", "SEO Tools", "Social Media Platforms", "Email Marketing"]
  },
  {
    id: 38,
    title: "Brand Positioning Strategy",
    category: "strategy",
    designer: "Creative Team Epsilon",
    image: "/brand-positioning-strategy.jpg",
    views: 2345,
    likes: 278,
    featured: false,
    description: "Complete brand positioning strategy including target audience analysis, competitive positioning, and brand messaging framework.",
    tags: ["Brand Strategy", "Positioning", "Target Audience", "Messaging Framework"],
    completedDate: "2023-12-15",
    client: "Elite Brands Corporation",
    projectUrl: "https://brand-positioning.com",
    technologies: ["Market Research Tools", "Analytics Platforms", "Strategic Planning"]
  },
  {
    id: 39,
    title: "Product Launch Strategy",
    category: "strategy",
    designer: "Creative Team Zeta",
    image: "/product-launch-strategy.jpg",
    views: 1987,
    likes: 234,
    featured: false,
    description: "Multi-channel product launch strategy including pre-launch buzz, launch event planning, and post-launch engagement.",
    tags: ["Product Launch", "Launch Strategy", "Event Planning", "Multi-channel Marketing"],
    completedDate: "2023-10-25",
    client: "InnovateProducts Inc",
    projectUrl: "https://product-launch-strategy.com",
    technologies: ["Marketing Automation", "Event Planning", "PR Tools", "Analytics"]
  },
  // Social Media Design Projects
  {
    id: 40,
    title: "Social Media Brand Kit - Fashion Brand",
    category: "socialmedia",
    designer: "Creative Team Alpha",
    image: "/social-media-brand-kit-fashion.jpg",
    views: 3456,
    likes: 445,
    featured: true,
    description: "Complete social media brand identity including templates, story highlights, cover designs, and content guidelines for all platforms.",
    tags: ["Social Media Branding", "Template Design", "Content Guidelines", "Multi-platform"],
    completedDate: "2024-01-20",
    client: "ChicStyle Fashion",
    projectUrl: "https://social-media-brand-kit.com",
    technologies: ["Adobe Creative Suite", "Figma", "Canva Pro", "Social Media Tools"]
  },
  {
    id: 41,
    title: "Instagram Content Strategy & Design",
    category: "socialmedia",
    designer: "Creative Team Beta",
    image: "/instagram-content-strategy.jpg",
    views: 2890,
    likes: 356,
    featured: false,
    description: "Instagram content strategy with visual design templates, content calendar, and engagement optimization tactics.",
    tags: ["Instagram Strategy", "Content Calendar", "Visual Templates", "Engagement"],
    completedDate: "2023-11-20",
    client: "Lifestyle Brands Co",
    projectUrl: "https://instagram-strategy.com",
    technologies: ["Instagram Tools", "Content Planning", "Analytics", "Design Software"]
  },
  {
    id: 42,
    title: "TikTok Video Brand Package",
    category: "socialmedia",
    designer: "Creative Team Gamma",
    image: "/tiktok-video-brand-package.jpg",
    views: 3123,
    likes: 389,
    featured: false,
    description: "TikTok brand package including video templates, transitions, sound design, and trend-based content creation guidelines.",
    tags: ["TikTok Branding", "Video Templates", "Trend Content", "Sound Design"],
    completedDate: "2023-12-05",
    client: "ViralContent Studio",
    projectUrl: "https://tiktok-brand-package.com",
    technologies: ["Video Editing Software", "After Effects", "Trend Analysis", "Sound Design"]
  },
  // Uniform Design Projects
  {
    id: 43,
    title: "Corporate Uniform Collection",
    category: "uniform",
    designer: "Creative Team Delta",
    image: "/corporate-uniform-collection.jpg",
    views: 2134,
    likes: 267,
    featured: true,
    description: "Complete corporate uniform collection including executive wear, casual uniforms, safety gear, and seasonal variations with brand integration.",
    tags: ["Corporate Uniforms", "Executive Wear", "Safety Gear", "Brand Integration"],
    completedDate: "2024-02-10",
    client: "Professional Services Inc",
    projectUrl: "https://corporate-uniforms.com",
    technologies: ["Fashion Design", "Pattern Making", "Textile Design", "Brand Guidelines"]
  },
  {
    id: 44,
    title: "Restaurant Staff Uniform Design",
    category: "uniform",
    designer: "Creative Team Epsilon",
    image: "/restaurant-staff-uniform.jpg",
    views: 1876,
    likes: 234,
    featured: false,
    description: "Restaurant staff uniform design for front-of-house and kitchen staff with comfort, functionality, and brand aesthetic.",
    tags: ["Restaurant Uniforms", "Staff Wear", "Functional Design", "Brand Aesthetic"],
    completedDate: "2023-11-15",
    client: "Gourmet Restaurant Group",
    projectUrl: "https://restaurant-uniforms.com",
    technologies: ["Apparel Design", "Textile Selection", "Comfort Design", "Brand Application"]
  },
  {
    id: 45,
    title: "Healthcare Professional Uniforms",
    category: "uniform",
    designer: "Creative Team Zeta",
    image: "/healthcare-professional-uniforms.jpg",
    views: 1543,
    likes: 189,
    featured: false,
    description: "Healthcare professional uniform design with focus on hygiene, comfort, professional appearance, and department differentiation.",
    tags: ["Healthcare Uniforms", "Professional Wear", "Hygiene Design", "Department Coding"],
    completedDate: "2023-10-20",
    client: "Medical Center Group",
    projectUrl: "https://healthcare-uniforms.com",
    technologies: ["Medical Textile Design", "Comfort Engineering", "Professional Standards", "Safety Design"]
  },
  // Paper Products Design Projects
  {
    id: 46,
    title: "Luxury Stationery Collection",
    category: "paper",
    designer: "Creative Team Alpha",
    image: "/luxury-stationery-collection.jpg",
    views: 2345,
    likes: 298,
    featured: true,
    description: "Premium stationery collection including business cards, letterheads, envelopes, notebooks, and specialty paper products.",
    tags: ["Luxury Stationery", "Business Cards", "Letterhead", "Specialty Paper"],
    completedDate: "2024-01-25",
    client: "Elite Business Group",
    projectUrl: "https://luxury-stationery.com",
    technologies: ["Paper Engineering", "Print Design", "Typography", "Material Selection"]
  },
  {
    id: 47,
    title: "Custom Notebook & Journal Design",
    category: "paper",
    designer: "Creative Team Beta",
    image: "/custom-notebook-journal.jpg",
    views: 1987,
    likes: 245,
    featured: false,
    description: "Custom notebook and journal design with unique binding, cover materials, and interior layouts for corporate gifting.",
    tags: ["Notebook Design", "Custom Binding", "Cover Design", "Interior Layout"],
    completedDate: "2023-12-10",
    client: "Corporate Gifts Ltd",
    projectUrl: "https://custom-notebooks.com",
    technologies: ["Paper Craft", "Binding Techniques", "Cover Design", "Custom Printing"]
  },
  {
    id: 48,
    title: "Wedding Invitation Suite",
    category: "paper",
    designer: "Creative Team Gamma",
    image: "/wedding-invitation-suite.jpg",
    views: 2765,
    likes: 334,
    featured: false,
    description: "Elegant wedding invitation suite including save-the-dates, invitations, RSVP cards, and thank you notes with custom illustrations.",
    tags: ["Wedding Stationery", "Invitation Design", "Custom Illustrations", "Luxury Paper"],
    completedDate: "2023-11-25",
    client: "Bridal Elegance",
    projectUrl: "https://wedding-stationery.com",
    technologies: ["Calligraphy", "Paper Craft", "Illustration", "Luxury Printing"]
  },
  // Poster & Advertising Design Projects
  {
    id: 49,
    title: "Movie Poster Campaign",
    category: "poster",
    designer: "Creative Team Delta",
    image: "/movie-poster-campaign.jpg",
    views: 3456,
    likes: 456,
    featured: true,
    description: "Complete movie poster campaign including teaser posters, character posters, and international release designs with strategic marketing placement.",
    tags: ["Movie Posters", "Campaign Design", "Marketing Materials", "International Design"],
    completedDate: "2024-02-15",
    client: "Hollywood Film Studio",
    projectUrl: "https://movie-poster-campaign.com",
    technologies: ["Adobe Creative Suite", "Photography", "Typography", "Marketing Strategy"]
  },
  {
    id: 50,
    title: "Concert & Event Posters",
    category: "poster",
    designer: "Creative Team Epsilon",
    image: "/concert-event-posters.jpg",
    views: 2890,
    likes: 367,
    featured: false,
    description: "Dynamic concert and event poster series with artist branding, venue information, and promotional materials for social media.",
    tags: ["Concert Posters", "Event Design", "Artist Branding", "Promotional Materials"],
    completedDate: "2023-12-20",
    client: "Live Music Events",
    projectUrl: "https://concert-posters.com",
    technologies: ["Graphic Design", "Illustration", "Typography", "Digital Marketing"]
  },
  {
    id: 51,
    title: "Product Advertising Campaign",
    category: "poster",
    designer: "Creative Team Zeta",
    image: "/product-advertising-campaign.jpg",
    views: 2678,
    likes: 312,
    featured: false,
    description: "Multi-format product advertising campaign including billboards, print ads, and digital banners with consistent brand messaging.",
    tags: ["Product Advertising", "Billboard Design", "Print Campaign", "Digital Banners"],
    completedDate: "2023-10-15",
    client: "Global Brands Corporation",
    projectUrl: "https://product-ad-campaign.com",
    technologies: ["Large Format Design", "Campaign Strategy", "Media Planning", "Brand Guidelines"]
  }
];

// Calculate category counts
portfolioCategories.forEach(category => {
  if (category.id === "all") {
    category.count = portfolioItems.length;
  } else {
    category.count = portfolioItems.filter(item => item.category === category.id).length;
  }
});

export const getFeaturedProjects = (): PortfolioItem[] => {
  return portfolioItems.filter(item => item.featured);
};

export const getProjectsByCategory = (categoryId: string): PortfolioItem[] => {
  if (categoryId === "all") {
    return portfolioItems;
  }
  return portfolioItems.filter(item => item.category === categoryId);
};

export const searchProjects = (query: string): PortfolioItem[] => {
  const lowercaseQuery = query.toLowerCase();
  return portfolioItems.filter(item =>
    item.title.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    item.designer.toLowerCase().includes(lowercaseQuery) ||
    (item.client && item.client.toLowerCase().includes(lowercaseQuery))
  );
};

export const getRecentProjects = (count: number = 6): PortfolioItem[] => {
  return portfolioItems
    .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
    .slice(0, count);
};

export const getPopularProjects = (count: number = 6): PortfolioItem[] => {
  return portfolioItems
    .sort((a, b) => b.views - a.views)
    .slice(0, count);
};
