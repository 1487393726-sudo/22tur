# Website Sections Components

This directory contains reusable section components for the website with 3D effects and glass morphism styling.

## Components

### CTASection

Call-to-action section with glass morphism background and 3D hover effects.

**Features:**
- Glass morphism background with configurable blur intensity
- Multiple gradient schemes (primary, secondary, accent, sunset, ocean)
- 3D hover effects on buttons with smooth animations
- Responsive layout (mobile-first)
- Multi-language support
- Decorative sparkle animations
- Customizable button variants (primary, secondary, outline)

**Usage:**
```tsx
import { CTASection } from '@/components/website/sections/CTASection';

<CTASection
  title="Ready to Get Started?"
  description="Contact us and let us help you bring your ideas to life"
  buttons={[
    {
      text: "Contact Us",
      href: "/contact",
      variant: "primary",
      showArrow: true,
    },
    {
      text: "View Services",
      href: "/services",
      variant: "outline",
    },
  ]}
  gradientScheme="primary"
  glassIntensity="medium"
  showSparkles={true}
/>
```

**Props:**
- `title` (string, required): Section title
- `description` (string, required): Section description/subtitle
- `buttons` (CTAButton[], required): Array of CTA buttons (1-2 recommended)
- `gradientScheme` ('primary' | 'secondary' | 'accent' | 'sunset' | 'ocean', default: 'primary'): Background gradient scheme
- `glassIntensity` ('light' | 'medium' | 'heavy', default: 'medium'): Glass effect intensity
- `showSparkles` (boolean, default: true): Show decorative sparkles
- `className` (string, optional): Additional CSS classes

**Requirements:** 7.5

---

### StatsSection

Displays company statistics with animated counting numbers.

**Features:**
- CountUpAnimation for number counting effect
- Glass morphism card effects
- 3D depth shadows
- Responsive grid layout
- Multi-language support

**Usage:**
```tsx
import { StatsSection } from '@/components/website/sections/StatsSection';

<StatsSection
  title="Our Achievements"
  subtitle="Numbers that speak for themselves"
  stats={[
    { value: 100, label: "Projects Completed", suffix: "+", icon: "🚀" },
    { value: 50, label: "Happy Clients", suffix: "+", icon: "😊" },
    { value: 10, label: "Years Experience", suffix: "+", icon: "⭐" },
    { value: 99.9, label: "Client Satisfaction", suffix: "%", decimals: 1, icon: "💯" }
  ]}
/>
```

**Requirements:** 7.3

---

### TestimonialsSection

Displays customer testimonials with 3D card carousel effects.

**Features:**
- 3D card carousel with smooth transitions
- Auto-play with configurable interval
- Manual navigation (prev/next buttons)
- Touch/swipe support for mobile
- Glass morphism card effects
- 3D depth shadows
- Responsive layout

**Usage:**
```tsx
import { TestimonialsSection } from '@/components/website/sections/TestimonialsSection';

<TestimonialsSection
  title="What Our Clients Say"
  subtitle="Real feedback from satisfied clients"
  testimonials={[
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc.",
      content: "Working with this team has been an absolute pleasure...",
      rating: 5
    }
  ]}
  autoPlayInterval={5000}
/>
```

**Requirements:** 7.4

---

## Design Principles

All section components follow these design principles:

1. **3D Effects**: Use perspective, transforms, and depth shadows for visual impact
2. **Glass Morphism**: Apply backdrop blur and semi-transparent backgrounds
3. **Responsive Design**: Mobile-first approach with breakpoints at 640px, 768px, 1024px
4. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
5. **Performance**: GPU-accelerated animations, lazy loading, optimized rendering
6. **Multi-language**: Support for Chinese, English, and Uyghur (RTL)

## Testing

Each component includes:
- Unit tests for specific examples and edge cases
- Example files demonstrating various usage patterns
- TypeScript types for type safety

Run tests:
```bash
npm test -- components/website/sections/__tests__/
```

## Related Components

- **3D Components**: `components/website/3d/` - Card3D, CardGrid3D, FlipCard3D, HeroSection3D
- **Animation Components**: `components/website/animations/` - FadeInView, SlideInView, CountUpAnimation
- **UI Components**: `components/ui/` - Glass card, glass modal, buttons with glass effects

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

Fallbacks are provided for browsers without 3D transform or backdrop-filter support.
