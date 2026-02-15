export interface BlogPost {
  title: string
  excerpt: string
  author: string
  authorImage: string
  date: string
  readTime: string
  category: string
  image: string
  slug: string
}

export const blogPosts: BlogPost[] = [
  {
    title: "The Future of Web Design: Trends to Watch in 2024",
    excerpt:
      "Explore the latest design trends shaping the digital landscape, from immersive 3D experiences to minimalist interfaces that prioritize user experience.",
    author: "Alex Morgan",
    authorImage: "/creative-director-portrait.png",
    date: "2024-11-15",
    readTime: "5 min read",
    category: "Design",
    image: "/blog-web-design-trends.jpg",
    slug: "future-of-web-design-2024",
  },
  {
    title: "Building Performant React Applications at Scale",
    excerpt:
      "Learn best practices for optimizing React applications, including code splitting, lazy loading, and advanced performance monitoring techniques.",
    author: "Sarah Chen",
    authorImage: "/professional-developer-portrait.png",
    date: "2024-11-10",
    readTime: "8 min read",
    category: "Development",
    image: "/blog-react-performance.jpg",
    slug: "performant-react-applications",
  },
  {
    title: "UI/UX Principles Every Designer Should Know",
    excerpt:
      "Master the fundamental principles of user interface and experience design to create products that users love and engage with consistently.",
    author: "Marcus Williams",
    authorImage: "/professional-designer-portrait.png",
    date: "2024-11-05",
    readTime: "6 min read",
    category: "Design",
    image: "/blog-ux-principles.jpg",
    slug: "ui-ux-principles",
  },
]
