# AboutPage Component Guide

## Overview

The `AboutPage` component is a comprehensive company information display component that showcases company details, development timeline, achievements, and credentials. It's designed to build trust and credibility with visitors by presenting company history, values, and accomplishments.

## Features

### 1. Company Information Section
- Displays company name, description, mission, and vision
- Shows core values with visual checkmark indicators
- Responsive two-column layout on desktop, single column on mobile
- Dark mode support

### 2. Development Timeline
- Chronologically sorted timeline of company milestones
- Visual timeline with connecting line and dots
- Alternating layout on desktop for visual interest
- Optional emoji icons for each milestone
- Responsive design that adapts to mobile

### 3. Key Achievements
- Displays company metrics and accomplishments
- Shows achievement icons, metrics, titles, and descriptions
- Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)
- Gradient background styling
- Conditionally rendered (hidden if empty)

### 4. Certificates & Credentials
- Displays professional certifications and credentials
- Shows certificate images with hover effects
- Displays issuer, issue date, and expiry date (if applicable)
- Keyboard accessible with click and keyboard support
- Conditionally rendered (hidden if empty)

## Component Props

```typescript
interface AboutPageProps {
  data: AboutPageType;
  onCertificateClick?: (certificate: Certificate) => void;
}
```

### Props Details

- **data** (required): The about page data containing company info, timeline, certificates, and achievements
- **onCertificateClick** (optional): Callback function triggered when a certificate is clicked or activated via keyboard

## Data Structure

```typescript
interface AboutPageType {
  companyInfo: CompanyInfo;
  timeline: TimelineEvent[];
  certificates: Certificate[];
  achievements: Achievement[];
}

interface CompanyInfo {
  name: string;
  mission: string;
  vision: string;
  values: string[];
  description: string;
  foundedYear: number;
}

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  icon?: string;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  image: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  metric: string;
  icon: string;
}
```

## Usage Example

```typescript
import { AboutPage } from '@/components/website/sections/AboutPage';
import { AboutPage as AboutPageType } from '@/types/website';

const aboutData: AboutPageType = {
  companyInfo: {
    name: 'Tech Solutions Inc.',
    mission: 'To deliver innovative technology solutions',
    vision: 'To be the leading technology partner',
    values: ['Innovation', 'Integrity', 'Excellence'],
    description: 'We are a leading technology company...',
    foundedYear: 2008,
  },
  timeline: [
    {
      year: 2008,
      title: 'Company Founded',
      description: 'Started with a small team',
      icon: '🚀',
    },
    // ... more timeline events
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'ISO 9001:2015',
      issuer: 'ISO',
      issueDate: new Date('2020-01-15'),
      expiryDate: new Date('2025-01-15'),
      image: 'https://example.com/iso.jpg',
    },
    // ... more certificates
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'Projects Completed',
      description: 'Successfully delivered projects',
      metric: '500+',
      icon: '✓',
    },
    // ... more achievements
  ],
};

export default function Page() {
  const handleCertificateClick = (certificate: Certificate) => {
    console.log('Certificate clicked:', certificate);
    // Handle certificate click - e.g., open modal, navigate, etc.
  };

  return (
    <AboutPage 
      data={aboutData}
      onCertificateClick={handleCertificateClick}
    />
  );
}
```

## Styling

The component uses Tailwind CSS with the following color scheme:
- **Primary**: Blue (#1E3A5F) - used for accents and highlights
- **Background**: White (light mode) / Gray-900 (dark mode)
- **Text**: Gray-900 (light mode) / White (dark mode)
- **Borders**: Gray-200 (light mode) / Gray-700 (dark mode)

### Responsive Breakpoints

- **Mobile**: < 768px (1 column layouts)
- **Tablet**: 768px - 1024px (2 column layouts)
- **Desktop**: > 1024px (3-4 column layouts)

## Accessibility Features

1. **Semantic HTML**: Uses proper heading hierarchy (h1, h2, h3)
2. **ARIA Labels**: Decorative icons marked with `aria-hidden="true"`
3. **Keyboard Navigation**: Certificates are keyboard accessible with Enter/Space support
4. **Alt Text**: All images have descriptive alt text
5. **Color Contrast**: Meets WCAG AA standards
6. **Focus Indicators**: Clear focus states for interactive elements

## Performance Considerations

1. **Memoization**: Timeline is memoized to prevent unnecessary re-renders
2. **Conditional Rendering**: Achievements and certificates sections only render if data exists
3. **Image Optimization**: Consider using Next.js Image component for production
4. **Lazy Loading**: Images can be lazy-loaded for better performance

## Testing

The component includes 55 comprehensive unit tests covering:

- **Rendering**: All sections and content display correctly
- **Core Values**: Proper display with icons and styling
- **Timeline**: Chronological sorting and event display
- **Achievements**: Metrics, icons, and descriptions
- **Certificates**: Names, issuers, dates, and images
- **Interactions**: Click handlers and keyboard support
- **Responsive Design**: Grid layouts at different breakpoints
- **Accessibility**: Heading hierarchy, alt text, keyboard navigation
- **Edge Cases**: Empty arrays, long text, special characters
- **Data Sorting**: Timeline events sorted by year
- **Styling**: Dark mode, hover effects, gradients
- **Content Completeness**: All required sections present

### Running Tests

```bash
npm test -- components/website/sections/AboutPage.test.tsx --testTimeout=10000
```

## Customization

### Modifying Colors

Update the Tailwind classes in the component:
```typescript
// Change primary color from blue to purple
className="bg-purple-600 dark:bg-purple-400"
```

### Adding More Sections

To add new sections, follow the existing pattern:
```typescript
{data.newSection.length > 0 && (
  <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8">
    {/* Section content */}
  </section>
)}
```

### Customizing Timeline Layout

Modify the timeline alternating layout:
```typescript
className={`flex flex-col md:flex-row gap-6 md:gap-8 ${
  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
}`}
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android 90+

## Known Limitations

1. Certificate images are displayed at fixed aspect ratio - consider using Next.js Image for better optimization
2. Timeline line is hidden on mobile - consider adding a vertical line for better visual continuity
3. No built-in modal for certificate details - implement via parent component

## Future Enhancements

1. Add animation on scroll for timeline events
2. Implement certificate modal with full details
3. Add team member integration with TeamSection
4. Support for video testimonials in achievements
5. Interactive timeline with filtering by category
6. Export timeline as PDF or image

## Troubleshooting

### Timeline not sorting correctly
- Ensure timeline events have valid year numbers
- Check that years are numbers, not strings

### Certificates not clickable
- Verify `onCertificateClick` callback is provided
- Check that certificate elements have `role="button"` and `tabIndex={0}`

### Responsive layout breaking
- Verify Tailwind CSS is properly configured
- Check that responsive classes are not being purged

### Dark mode not working
- Ensure dark mode provider is set up in parent component
- Verify `dark:` classes are in Tailwind configuration

## Related Components

- **TeamSection**: Display team members
- **TestimonialSection**: Show customer testimonials
- **CaseShowcase**: Display case studies
- **HeroBanner**: Hero section for pages

## Requirements Validation

This component validates the following requirements:

- **Requirement 9.1**: Displays company history, mission, and vision
- **Requirement 9.2**: Includes core values and development ideology
- **Requirement 9.3**: Shows certificates and honors
- **Requirement 9.4**: Displays development timeline
- **Requirement 9.5**: Shows key achievements and milestones

## Version History

- **v1.0.0** (2024-01-23): Initial release with full feature set
  - Company information display
  - Development timeline with sorting
  - Achievements showcase
  - Certificates display with keyboard support
  - Full accessibility compliance
  - Comprehensive test coverage (55 tests)
