# Service Detail Component Guide

## Overview
The ServiceDetail component displays comprehensive information about a service, including description, process steps, pricing, FAQs, related cases, and customer testimonials.

## Features

### 1. Hero Section
- Service name, category, and short description
- Star rating with review count
- Price display in a prominent card
- Consultation and "Learn More" buttons
- Professional gradient background

### 2. Service Description
- Full detailed description
- Prose formatting for readability
- Semantic HTML structure

### 3. Service Process
- Multi-step process visualization
- Step number, title, description, and duration
- Connector lines between steps (desktop)
- Responsive grid layout

### 4. Includes and Excludes
- Two-column layout
- Green checkmarks for included items
- Red X marks for excluded items
- Clear visual distinction

### 5. Deliverables
- List of project deliverables
- Highlighted in blue box
- Bullet point formatting

### 6. Project Timeline
- Estimated project duration
- Highlighted in gradient box
- Clear and prominent display

### 7. FAQs
- Expandable/collapsible FAQ items
- Only one FAQ expanded at a time
- Smooth animations
- Question and answer display

### 8. Related Cases
- Grid layout of related case studies
- Case thumbnail, title, description
- Industry tag
- Link to case detail page
- Hover effects

### 9. Related Testimonials
- Grid layout of customer testimonials
- Customer avatar and name
- Company affiliation
- Star rating
- Testimonial content in quotes

### 10. CTA Section
- Call-to-action section at bottom
- Consultation button
- Gradient background
- Motivational text

## Component Props

```typescript
interface ServiceDetailProps {
  service: ServiceDetail;           // Required: Service detail object
  relatedCases?: Case[];            // Optional: Related case studies
  relatedTestimonials?: Testimonial[]; // Optional: Customer testimonials
  onConsultationClick?: () => void; // Optional: Consultation button callback
  className?: string;               // Optional: Custom CSS class
}
```

## Service Data Structure

```typescript
interface ServiceDetail extends Service {
  fullDescription: string;      // Complete service description
  process: ProcessStep[];       // Service process steps
  deliverables: string[];       // Project deliverables
  timeline: string;             // Estimated project timeline
  includes: string[];           // What's included in service
  excludes: string[];           // What's not included
  faqs: FAQ[];                  // Frequently asked questions
}

interface ProcessStep {
  order: number;                // Step number
  title: string;                // Step title
  description: string;          // Step description
  duration: string;             // Estimated duration
}

interface FAQ {
  id: string;                   // Unique FAQ ID
  question: string;             // FAQ question
  answer: string;               // FAQ answer
}
```

## Usage Example

```tsx
import { ServiceDetail } from '@/components/website/sections/ServiceDetail';

export function ServiceDetailPage() {
  const service: ServiceDetail = {
    id: 'web-design',
    name: 'Web Design Service',
    description: 'Professional web design',
    shortDescription: 'Create stunning websites',
    icon: '🎨',
    category: 'Design',
    link: '/services/web-design',
    price: 5000,
    rating: 4.8,
    reviewCount: 25,
    fullDescription: 'Our web design service...',
    process: [
      {
        order: 1,
        title: 'Discovery',
        description: 'Understand your business goals',
        duration: '1 week',
      },
      // ... more steps
    ],
    deliverables: [
      'Responsive website design',
      'Mobile-optimized version',
      // ... more deliverables
    ],
    timeline: '6-8 weeks',
    includes: [
      'Unlimited revisions',
      'Mobile responsive design',
      // ... more items
    ],
    excludes: [
      'Content writing',
      'Photography',
      // ... more items
    ],
    faqs: [
      {
        id: 'faq-1',
        question: 'How long does the design process take?',
        answer: 'The typical design process takes 6-8 weeks...',
      },
      // ... more FAQs
    ],
  };

  const relatedCases: Case[] = [
    {
      id: 'case-1',
      title: 'E-commerce Platform',
      description: 'Built a modern e-commerce platform',
      thumbnail: 'https://...',
      industry: 'Retail',
      results: ['50% increase in sales'],
      link: '/cases/case-1',
    },
    // ... more cases
  ];

  const relatedTestimonials: Testimonial[] = [
    {
      id: 'testimonial-1',
      content: 'Excellent service!',
      author: 'John Doe',
      company: 'Tech Corp',
      rating: 5,
      avatar: 'https://...',
    },
    // ... more testimonials
  ];

  const handleConsultation = () => {
    // Handle consultation click
    console.log('Consultation clicked');
  };

  return (
    <ServiceDetail
      service={service}
      relatedCases={relatedCases}
      relatedTestimonials={relatedTestimonials}
      onConsultationClick={handleConsultation}
    />
  );
}
```

## Styling

### Brand Colors
- Primary: #1E3A5F (Deep Blue)
- Accent: #2D5A8C (Lighter Blue)
- Success: Green (#10B981)
- Error: Red (#EF4444)

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Tailwind Classes Used
- Gradient backgrounds
- Responsive grid layouts
- Hover effects
- Smooth transitions
- Shadow effects

## Accessibility

### Features
- Semantic HTML structure
- Proper heading hierarchy
- Descriptive button text
- Image alt text
- Color contrast compliance
- Keyboard navigation support
- ARIA attributes

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate buttons
- Arrow keys for expandable sections

## Performance

### Optimization Techniques
- Efficient React rendering
- Minimal re-renders
- Optimized CSS with Tailwind
- Lazy loading support for images
- Responsive images

### Best Practices
- Use React.memo for optimization if needed
- Lazy load related content if needed
- Optimize images before use
- Use CDN for image delivery

## Testing

### Test Coverage
- 53 unit tests covering all features
- Component rendering tests
- User interaction tests
- Edge case handling
- Responsive design tests

### Running Tests
```bash
npm test -- components/website/sections/ServiceDetail.test.tsx
```

## Common Issues and Solutions

### Issue: FAQ not expanding
**Solution**: Ensure FAQ items have unique IDs and proper onClick handlers

### Issue: Images not loading
**Solution**: Verify image URLs are correct and accessible

### Issue: Layout breaking on mobile
**Solution**: Check responsive classes are applied correctly

### Issue: Consultation button not working
**Solution**: Ensure onConsultationClick callback is provided

## Future Enhancements

Potential improvements:
- Video testimonials support
- Interactive process timeline
- Service comparison feature
- Booking integration
- Live chat support
- Related services carousel
- Service reviews section
- Pricing calculator

## Support

For issues or questions:
1. Check the test file for usage examples
2. Review the component JSDoc comments
3. Check the requirements document
4. Review the design document

## Related Components

- ServiceCard: Display service in card format
- ServiceList: Display multiple services with filtering
- ConsultationForm: Collect consultation requests
- TestimonialSection: Display testimonials
- CaseShowcase: Display case studies
