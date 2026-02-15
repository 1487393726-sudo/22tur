# Footer Component Guide

## Overview

The `Footer` component is a comprehensive footer section for the website system. It displays company information, quick links, contact details, social media links, and a newsletter subscription form. The component is fully responsive and accessible, supporting all breakpoints (mobile, tablet, desktop).

**Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**

## Features

- **Company Information**: Display company name, description, and logo
- **Newsletter Subscription**: Email subscription form with validation
- **Quick Links**: Organized footer sections with navigation links
- **Contact Information**: Email, phone, and address display
- **Social Media Links**: Links to social media platforms
- **Legal Links**: Privacy policy, terms of service, etc.
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility**: WCAG AA compliant with proper ARIA labels and roles
- **Form Validation**: Email format validation with error messages

## Component Props

```typescript
interface FooterProps {
  data: Footer;
  onNewsletterSubmit?: (email: string) => Promise<void>;
}

interface Footer {
  companyInfo: {
    name: string;
    description: string;
    logo?: string;
  };
  sections: FooterSection[];
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  legalLinks: FooterLink[];
  newsletter?: {
    title: string;
    description: string;
    placeholder: string;
  };
  copyright: string;
}
```

## Usage Example

```tsx
import { Footer } from '@/components/website/sections/Footer';
import type { Footer as FooterType } from '@/types/website';

const footerData: FooterType = {
  companyInfo: {
    name: 'Professional Services',
    description: 'We provide expert solutions for your business needs.',
    logo: '/logo.svg',
  },
  sections: [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Cases', href: '/cases' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
  ],
  contactInfo: {
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, City, State 12345',
    businessHours: [
      {
        day: 'Monday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
    ],
  },
  socialLinks: [
    {
      platform: 'facebook',
      url: 'https://facebook.com',
      icon: 'facebook',
      label: 'Facebook',
    },
    {
      platform: 'twitter',
      url: 'https://twitter.com',
      icon: 'twitter',
      label: 'Twitter',
    },
  ],
  legalLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  newsletter: {
    title: 'Subscribe to Our Newsletter',
    description: 'Get the latest updates delivered to your inbox.',
    placeholder: 'Enter your email',
  },
  copyright: '© 2024 Professional Services. All rights reserved.',
};

export default function Page() {
  const handleNewsletterSubmit = async (email: string) => {
    // Handle newsletter subscription
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to subscribe');
  };

  return (
    <Footer
      data={footerData}
      onNewsletterSubmit={handleNewsletterSubmit}
    />
  );
}
```

## Sections

### Company Information Section
- Displays company logo (optional)
- Shows company name and description
- Contains newsletter subscription form

### Footer Sections
- Organized into multiple columns
- Each section has a title and list of links
- Links are fully clickable and navigable

### Contact Information Section
- Email link (mailto)
- Phone link (tel)
- Physical address
- Business hours (from ContactInfo)

### Bottom Footer
- Copyright information
- Legal links (Privacy Policy, Terms of Service, etc.)
- Social media links with proper accessibility

## Newsletter Subscription

The newsletter subscription form includes:
- Email input field with validation
- Subscribe button with loading state
- Error messages for invalid emails
- Success message after subscription
- Automatic email clearing after successful submission

### Email Validation

The component validates email format using the pattern:
```
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

Valid emails:
- `user@example.com`
- `first.last@example.co.uk`
- `user+tag@example.com`

Invalid emails:
- `user` (no @ or domain)
- `user@` (no domain)
- `@example.com` (no local part)
- `user @example.com` (space in email)

## Responsive Design

### Mobile (<768px)
- Single column layout for company info
- Newsletter form stacks vertically
- Footer sections stack vertically
- Contact info displayed in single column
- Social links centered

### Tablet (768px-1024px)
- Two column layout
- Newsletter form side by side
- Footer sections in 2-3 columns
- Contact info in 2 columns

### Desktop (>1024px)
- Five column layout
- Company info spans 2 columns
- Footer sections in separate columns
- Contact info in dedicated column
- Social links right-aligned

## Accessibility Features

- **Semantic HTML**: Uses `<footer>` element with `role="contentinfo"`
- **ARIA Labels**: All interactive elements have proper aria-labels
- **Form Labels**: Newsletter input has aria-label
- **Error Messages**: Error messages have `role="alert"`
- **Success Messages**: Success messages have `role="status"`
- **Keyboard Navigation**: All links and buttons are keyboard accessible
- **Screen Reader Support**: Proper heading hierarchy and link text
- **Color Contrast**: All text meets WCAG AA standards (4.5:1 minimum)

## Styling

The component uses Tailwind CSS classes for styling:
- Dark background: `bg-slate-900` (main), `bg-slate-950` (bottom)
- Text colors: `text-white`, `text-slate-300`, `text-slate-400`
- Hover effects: `hover:text-white`, `hover:bg-blue-700`
- Responsive classes: `md:`, `lg:` prefixes for breakpoints
- Spacing: `py-12`, `lg:py-16`, `gap-8`, `lg:gap-12`

## Testing

The component includes 51 comprehensive tests covering:

### Rendering Tests
- Footer element rendering
- Company info section
- Logo display
- Footer sections and links
- Contact information
- Copyright and legal links
- Social media links

### Newsletter Subscription Tests
- Newsletter form rendering
- Email validation (empty, invalid format)
- Valid email acceptance
- Error message display
- Success message display
- Email input clearing
- Button state management
- Form submission handling

### Accessibility Tests
- Proper role attributes
- ARIA labels on inputs
- ARIA labels on social links
- Role attributes on error/success messages
- Screen reader text

### Responsive Design Tests
- Grid layout classes
- Responsive padding

### Link Navigation Tests
- Correct href attributes
- Link functionality

### Empty States Tests
- Handling empty sections
- Handling empty social links
- Handling empty legal links

### Data Validation Tests
- Multiple footer sections
- Multiple social links

### Form Submission Tests
- Newsletter submission callback
- Invalid email handling
- Submission without callback

### Email Validation Tests
- Valid email formats
- Invalid email formats

### Button States Tests
- Button text changes
- Loading state management

## Performance Considerations

- Uses `useCallback` for memoized event handlers
- Prevents unnecessary re-renders with proper dependency arrays
- Efficient email validation using regex
- Minimal DOM updates

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Common Issues and Solutions

### Newsletter form not submitting
- Ensure the form is submitted using `fireEvent.submit()` in tests
- Check that email validation passes before submission

### Error messages not appearing
- Verify that the error state is being set correctly
- Check that the error element has the correct data-testid

### Social links not displaying
- Ensure socialLinks array is not empty
- Check that each social link has required properties

### Responsive layout issues
- Verify Tailwind CSS is properly configured
- Check that responsive classes are applied correctly

## Future Enhancements

- Add animation transitions for error/success messages
- Implement real-time email validation feedback
- Add newsletter preference management
- Support for multiple languages
- Dark mode toggle integration
- Analytics tracking for newsletter signups
