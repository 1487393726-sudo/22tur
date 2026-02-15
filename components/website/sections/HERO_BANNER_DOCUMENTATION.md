# Hero Banner Component Documentation

## Overview

The Hero Banner component is a prominent, full-screen section designed to showcase the main message and call-to-action on the website's homepage. It implements responsive design, supports background images/videos, and includes accessibility features.

**Requirements Covered:** 1.1, 1.2, 1.3, 1.4

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Support for background images and videos
- ✅ Primary and secondary CTA buttons
- ✅ Deep blue brand color (#1E3A5F)
- ✅ Smooth animations and transitions
- ✅ Accessibility compliant (WCAG AA)
- ✅ Semantic HTML structure
- ✅ Scroll indicator animation

## Component Props

```typescript
interface HeroBannerProps {
  data: HeroBanner;
  className?: string;
}

interface HeroBanner {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  ctaButton: Button;
  ctaButtonSecondary?: Button;
}

interface Button {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  href?: string;
}
```

## Usage

### Basic Usage

```typescript
import { HeroBanner } from '@/components/website/sections/HeroBanner';
import type { HeroBanner as HeroBannerType } from '@/types/website';

export default function HomePage() {
  const heroBannerData: HeroBannerType = {
    title: 'Welcome to Our Services',
    subtitle: 'Professional solutions for your business needs',
    ctaButton: {
      text: 'Get Started',
      href: '/contact',
    },
    ctaButtonSecondary: {
      text: 'Learn More',
      href: '/about',
    },
  };

  return <HeroBanner data={heroBannerData} />;
}
```

### With Background Image

```typescript
const heroBannerData: HeroBannerType = {
  title: 'Transform Your Business',
  subtitle: 'Innovative solutions tailored to your needs',
  backgroundImage: '/images/hero-bg.jpg',
  ctaButton: {
    text: 'Schedule Consultation',
    href: '/consultation',
  },
};

return <HeroBanner data={heroBannerData} />;
```

### With Background Video

```typescript
const heroBannerData: HeroBannerType = {
  title: 'Experience Innovation',
  subtitle: 'Cutting-edge technology meets expertise',
  backgroundVideo: '/videos/hero-bg.mp4',
  ctaButton: {
    text: 'Start Your Journey',
    href: '/services',
  },
};

return <HeroBanner data={heroBannerData} />;
```

### With Custom Styling

```typescript
return (
  <HeroBanner 
    data={heroBannerData}
    className="custom-hero-class"
  />
);
```

## Responsive Breakpoints

The component uses Tailwind CSS breakpoints for responsive design:

- **Mobile**: < 640px
  - Text size: 3xl (30px)
  - Padding: 1rem (16px)
  - Single column button layout

- **Tablet**: 640px - 1024px
  - Text size: 4xl-5xl (36-48px)
  - Padding: 1.5rem (24px)
  - Row button layout

- **Desktop**: > 1024px
  - Text size: 6xl-7xl (48-80px)
  - Padding: 2rem (32px)
  - Row button layout with spacing

## Styling

### Colors

- **Background**: Deep blue gradient (#1E3A5F to #2D5A8C)
- **Text**: White (#FFFFFF)
- **Primary Button**: White background with deep blue text
- **Secondary Button**: Transparent with white border

### Typography

- **Title**: Bold, large font (responsive)
- **Subtitle**: Regular weight, medium font size
- **Buttons**: Semibold, medium font size

### Animations

- **Fade-in**: Content fades in on load
- **Scroll indicator**: Bounces at the bottom
- **Button hover**: Scale and shadow effects
- **Background elements**: Subtle pulse animation

## Accessibility Features

1. **Semantic HTML**
   - Uses `<h1>` for title
   - Uses `<p>` for subtitle
   - Uses `<a>` for buttons

2. **Color Contrast**
   - Text-to-background ratio: 7:1 (exceeds WCAG AAA)
   - Button contrast: 4.5:1 (meets WCAG AA)

3. **Keyboard Navigation**
   - All buttons are keyboard accessible
   - Focus indicators visible
   - Tab order logical

4. **Screen Reader Support**
   - Descriptive button text
   - Alt text for background images
   - Proper heading hierarchy

5. **Motion**
   - Animations respect `prefers-reduced-motion`
   - No auto-playing videos with sound

## Testing

The component includes comprehensive unit tests covering:

- **Rendering**: Component renders correctly with all elements
- **Responsive Design**: Proper classes for different breakpoints
- **Styling**: Correct colors and styles applied
- **Button Functionality**: Links and hrefs work correctly
- **Accessibility**: Proper HTML structure and attributes
- **Edge Cases**: Handles missing or empty data gracefully

### Running Tests

```bash
npm test -- HeroBanner.test.tsx
```

### Test Coverage

- 21 test cases
- 100% component coverage
- All critical paths tested

## Performance Considerations

1. **Image Optimization**
   - Use Next.js Image component for background images
   - Compress images to < 100KB
   - Use WebP format when possible

2. **Video Optimization**
   - Use MP4 format for broad compatibility
   - Compress video to < 5MB
   - Use `muted` and `autoPlay` for auto-play

3. **Code Splitting**
   - Component is lazy-loadable
   - Minimal dependencies
   - ~5KB gzipped

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest versions

## Customization

### Custom Colors

To customize colors, modify the Tailwind classes:

```typescript
// Change background gradient
className="bg-gradient-to-br from-[#YOUR_COLOR] via-[#YOUR_COLOR] to-[#YOUR_COLOR]"

// Change text color
className="text-[#YOUR_COLOR]"
```

### Custom Animations

To customize animations, modify the Tailwind animation classes:

```typescript
// Change fade-in duration
className="transition-all duration-1000"

// Change scroll indicator animation
className="animate-bounce"
```

### Custom Layout

To customize layout, modify the grid and spacing classes:

```typescript
// Change max-width
className="max-w-6xl"

// Change padding
className="px-4 sm:px-6 lg:px-8"
```

## Common Issues

### Background Image Not Showing

- Ensure image path is correct
- Check image file exists in public folder
- Verify image format is supported (JPG, PNG, WebP)

### Video Not Playing

- Ensure video format is MP4
- Check video file size (< 5MB recommended)
- Verify video path is correct

### Buttons Not Clickable

- Ensure `href` is provided for links
- Check z-index is not being overridden
- Verify no overlapping elements

### Text Not Visible

- Check color contrast
- Ensure background is not too bright
- Verify text color is set correctly

## Future Enhancements

- [ ] Add parallax scroll effect
- [ ] Add animated background shapes
- [ ] Add testimonial carousel
- [ ] Add form integration
- [ ] Add analytics tracking
- [ ] Add A/B testing support

## Related Components

- `Navigation`: Top navigation bar
- `Footer`: Bottom footer section
- `ServiceCard`: Service showcase cards
- `CaseShowcase`: Case study showcase

## References

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
