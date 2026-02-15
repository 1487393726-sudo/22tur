export interface Testimonial {
  name: string
  role: string
  company: string
  image: string
  content: string
  rating: number
}

export const testimonials: Testimonial[] = [
  {
    name: "Michael Chen",
    role: "CEO",
    company: "TechStart Inc",
    image: "/client-ceo-portrait.jpg",
    content:
      "Working with this team was transformative. They delivered a stunning website that exceeded our expectations and significantly increased our conversion rates. Truly exceptional work!",
    rating: 5,
  },
  {
    name: "Sarah Martinez",
    role: "Marketing Director",
    company: "Growth Co",
    image: "/client-marketing-director.jpg",
    content:
      "Their attention to detail and creative approach set them apart. Our brand identity has never looked better, and customer engagement has tripled since the redesign.",
    rating: 5,
  },
  {
    name: "James Patterson",
    role: "Founder",
    company: "Startup Labs",
    image: "/client-founder-portrait.jpg",
    content:
      "From concept to launch, they were with us every step. The mobile app they built is intuitive, fast, and our users love it. Highly recommend their services!",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    role: "Product Manager",
    company: "Digital Solutions",
    image: "/client-product-manager.jpg",
    content:
      "Professional, responsive, and incredibly talented. They turned our vision into reality and provided ongoing support that's been invaluable to our success.",
    rating: 5,
  },
  {
    name: "Alex Rodriguez",
    role: "Creative Director",
    company: "Brand Studio",
    image: "/creative-director-portrait.png",
    content:
      "The design work they delivered was absolutely stunning. Our new visual identity perfectly captures our brand essence and has received incredible feedback from clients.",
    rating: 5,
  },
]
