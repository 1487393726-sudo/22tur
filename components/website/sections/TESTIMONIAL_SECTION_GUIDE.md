# TestimonialSection Component Guide

## Overview

The `TestimonialSection` component displays customer testimonials in a carousel format with automatic rotation, manual navigation, and pagination controls. It provides a professional presentation of client feedback with star ratings, author information, and optional video testimonials.

## Features

- **Carousel Display**: Shows one testimonial at a time with smooth navigation
- **Auto-rotation**: Automatically cycles through testimonials at configurable intervals
- **Manual Navigation**: Previous/Next buttons for manual control
- **Pagination Dots**: Visual indicators for current position and quick navigation
- **Star Ratings**: Visual 5-star rating display for each testimonial
- **Video Support**: Optional video testimonial links
- **Empty State**: Friendly message when no testimonials available
- **Responsive Design**: Adapts to mobile, tablet, and desktop layouts
- **Accessibility**: WCAG AA compliant with proper ARIA labels and semantic HTML
- **Counter Display**: Shows current position (e.g., "1 of 4")

## Component Props

```typescript
interface TestimonialSectionProps {
  testimonials: Testimonial[];           // Array of testimonials to display
  className?: string;                    // Additional CSS classes for the section
  autoplay?: boolean;                    // Enable auto-rotation (default: true)
  autoplayInterval?: number;             // Interval in ms (default: 5000)
}
```

## Testimonial Type

```typescript
interface Testimonial {
  id: string;                            // Unique identifier
  content: string;                       // Testimonial text
  author: string;                        // Client name
  company: string;                       // Client company
  rating: number;                        // Rating 1-5
  avatar: string;                        // Avatar image URL
  videoUrl?: string;                     // Optional video URL
}
```

## Usage Examples

### Basic Usage

```tsx
import { TestimonialSection } from '@/components/website/sections/TestimonialSection';
import type { Testimonial } from '@/types/website';

const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    content: 'Exceptional service and outstanding results!',
    author: 'John Smith',
    company: 'Tech Corp',
    rating: 5,
    avatar: 'https://example.com/john.jpg',
  },
  // ... more testimonials
];

export default function HomePage() {
  return <TestimonialSection testimonials={testimonials} />;
}
```

### With Custom Autoplay Settings

```tsx
<TestimonialSection 
  testimonials={testimonials}
  autoplay={true}
  autoplayInterval={3000}  // 3 seconds
/>
```

### Disable Autoplay

```tsx
<TestimonialSection 
  testimonials={testimonials}
  autoplay={false}
/>
```

### With Custom Styling

```tsx
<TestimonialSection 
  testimonials={testimonials}
  className="bg-gradient-to-b from-blue-50 to-white"
/>
```

## Styling

The component uses Tailwind CSS classes for styling:

- **Section**: `py-12 md:py-16 lg:py-20` (responsive vertical padding)
- **Card**: `bg-white rounded-lg shadow-lg p-8 md:p-12` (card styling)
- **Stars**: `text-yellow-400` (filled) / `text-gray-300` (empty)
- **Navigation**: `bg-white rounded-full p-2 shadow-md hover:shadow-lg`
- **Dots**: `w-3 h-3 rounded-full` (active: `bg-blue-600`, inactive: `bg-gray-300`)

## Carousel Behavior

### Auto-rotation
- Automatically advances to the next testimonial at the specified interval
- Loops back to the first testimonial after the last one
- Can be disabled with `autoplay={false}`

### Manual Navigation
- **Previous Button**: Navigate to previous testimonial
- **Next Button**: Navigate to next testimonial
- **Pagination Dots**: Click any dot to jump to that testimonial
- Wraps around at boundaries (last → first, first → last)

### Counter Display
- Shows current position (e.g., "1 of 4")
- Updates automatically when navigating
- Only displayed when multiple testimonials exist

## Star Rating Display

- Displays 5 stars for each testimonial
- Filled stars (yellow) represent the rating
- Empty stars (gray) represent remaining stars
- Supports ratings from 1 to 5

## Video Testimonials

- Optional video link appears below testimonial content
- Opens in new tab with security attributes
- Only displayed if `videoUrl` is provided
- Includes play icon and "Watch Video Testimonial" text

## Empty State

When no testimonials are provided:
- Displays friendly message: "No testimonials available at this time."
- Hides carousel, navigation, and pagination controls
- Maintains section styling for consistent layout

## Responsive Behavior

### Mobile (<768px)
- Single column layout
- Compact padding (p-8)
- Navigation arrows positioned closer to card
- Touch-friendly button sizes

### Tablet (768px-1024px)
- Medium padding (p-8 md:p-12)
- Optimized spacing
- Visible navigation controls

### Desktop (>1024px)
- Full padding (p-12)
- Maximum width container (max-w-7xl)
- Generous spacing

## Accessibility Features

- **Semantic HTML**: Uses `<section>` and `<h2>` tags
- **Alt Text**: All images have descriptive alt text
- **ARIA Labels**: Navigation buttons and pagination dots have aria-labels
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Color Contrast**: Meets WCAG AA standards (4.5:1 for text)
- **Focus Indicators**: Clear focus states on buttons and links

## Testing

The component includes 52 comprehensive unit tests covering:

- **Rendering**: Component structure, testimonials, ratings
- **Navigation**: Previous/Next buttons, wrapping behavior
- **Pagination**: Dots, counter, active states
- **Video Testimonials**: Link rendering and attributes
- **Empty State**: No testimonials handling
- **Autoplay**: Auto-rotation, intervals, disable
- **Accessibility**: Heading hierarchy, alt text, ARIA labels
- **Responsive Design**: Padding, positioning
- **Edge Cases**: Long content, special characters, ratings

Run tests with:
```bash
npm test -- components/website/sections/TestimonialSection.test.tsx --testTimeout=10000 --forceExit
```

## Performance Considerations

- **Efficient Rendering**: Only current testimonial is rendered
- **Interval Management**: Properly cleans up intervals on unmount
- **No Unnecessary Re-renders**: Uses React hooks efficiently
- **Smooth Transitions**: CSS transitions for visual feedback

## Common Patterns

### Fetching Testimonials

```tsx
async function getTestimonials(): Promise<Testimonial[]> {
  const response = await fetch('/api/testimonials');
  return response.json();
}

export default async function HomePage() {
  const testimonials = await getTestimonials();
  return <TestimonialSection testimonials={testimonials} />;
}
```

### Handling Navigation Events

```tsx
function handleTestimonialChange(index: number) {
  // Track which testimonial was viewed
  analytics.track('testimonial_viewed', { index });
}

// Note: Component doesn't expose navigation events
// Use pagination dots or navigation buttons for user interaction
```

### Filtering Testimonials

```tsx
const [selectedRating, setSelectedRating] = useState<number | null>(null);

const filteredTestimonials = selectedRating
  ? testimonials.filter(t => t.rating === selectedRating)
  : testimonials;

<TestimonialSection testimonials={filteredTestimonials} />
```

## Customization

### Custom Autoplay Interval

```tsx
// Fast rotation (2 seconds)
<TestimonialSection 
  testimonials={testimonials}
  autoplayInterval={2000}
/>

// Slow rotation (10 seconds)
<TestimonialSection 
  testimonials={testimonials}
  autoplayInterval={10000}
/>
```

### Custom Styling

To customize colors, modify the Tailwind classes:

```tsx
// In TestimonialSection.tsx, update the dot styling
className={`w-3 h-3 rounded-full transition-colors ${
  index === currentIndex
    ? 'bg-purple-600'  // Custom active color
    : 'bg-gray-300 hover:bg-gray-400'
}`}
```

### Custom Star Display

To use different star symbols:

```tsx
// In TestimonialSection.tsx, update the star rendering
<span className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
  ★  {/* Change to ⭐ or other symbol */}
</span>
```

## Troubleshooting

### Testimonials Not Showing

- Verify `testimonials` array is not empty
- Check that testimonial objects have all required fields
- Ensure avatar URLs are valid and accessible

### Autoplay Not Working

- Verify `autoplay` prop is not set to `false`
- Check `autoplayInterval` is a valid number (in milliseconds)
- Ensure component is mounted and not unmounted

### Navigation Not Working

- Verify multiple testimonials are provided
- Check that buttons are not disabled
- Ensure click handlers are properly attached

### Styling Issues

- Verify Tailwind CSS is properly configured
- Check for CSS conflicts with other stylesheets
- Ensure custom className doesn't override important styles

## Related Components

- **CaseShowcase**: Similar carousel pattern for case studies
- **TeamSection**: Similar card-based layout with filtering
- **ServiceList**: Similar card-based layout for services

## Requirements Mapping

This component implements the following requirements:

- **Requirement 5.1**: Display testimonial list on homepage
- **Requirement 5.2**: Show testimonial content, author, company, rating
- **Requirement 5.3**: Support carousel/pagination display
- **Requirement 5.4**: Display author avatar and company info
- **Requirement 5.5**: Optional video testimonials
- **Requirement 17.1-17.3**: Responsive design across breakpoints
- **Requirement 20.1-20.4**: Accessibility compliance

## Version History

- **v1.0.0** (2026-01-23): Initial release with carousel, autoplay, and video support
