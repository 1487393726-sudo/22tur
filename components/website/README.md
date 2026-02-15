# Website Components

This directory contains all reusable components for the website system.

## Directory Structure

```
components/website/
├── sections/          # Page sections (Hero, Services, Cases, etc.)
├── layout/            # Layout components (Navigation, Footer, etc.)
├── forms/             # Form components (Contact, Consultation, etc.)
└── README.md          # This file
```

## Sections

The `sections/` directory contains large, reusable page sections:

- **HeroBanner**: Hero section with title, subtitle, and CTA buttons
- **ServiceCards**: Service card grid with filtering
- **CaseShowcase**: Case study showcase with filtering
- **TeamSection**: Team member cards with filtering
- **TestimonialSection**: Customer testimonials with carousel
- **CTASection**: Call-to-action sections
- **AboutSection**: About company information
- **ContactSection**: Contact information display

## Layout

The `layout/` directory contains layout components:

- **Navigation**: Top navigation bar with menu
- **Footer**: Footer with links and contact info
- **Sidebar**: Sidebar navigation (if needed)
- **Container**: Page container with max-width
- **Grid**: Responsive grid layout

## Forms

The `forms/` directory contains form components:

- **ContactForm**: Contact form with validation
- **ConsultationForm**: Service consultation form
- **CommentForm**: Article comment form
- **NewsletterForm**: Newsletter subscription form
- **SearchForm**: Search form

## Component Naming Convention

- Use PascalCase for component names
- Use descriptive names that indicate purpose
- Suffix with component type if needed (e.g., `ServiceCard`, `ContactForm`)

## Component Structure

Each component should follow this structure:

```typescript
import React from 'react';
import type { ComponentProps } from '@/types/website';

interface Props {
  // Component props
}

/**
 * Component description
 * 
 * @param props - Component props
 * @returns Rendered component
 */
export function ComponentName({ ...props }: Props): React.ReactElement {
  return (
    <div>
      {/* Component content */}
    </div>
  );
}

export default ComponentName;
```

## Styling

All components use Tailwind CSS for styling:
- Use the brand color palette from `lib/website/constants`
- Follow responsive design patterns
- Use semantic HTML
- Ensure accessibility compliance

## Props

Components should accept props for:
- Content (text, images, links)
- Styling (className, style)
- Behavior (onClick, onChange)
- Accessibility (aria-*, role)

## Testing

Each component should have:
- Unit tests for rendering
- Tests for user interactions
- Tests for accessibility
- Tests for responsive behavior

## Examples

### Service Card Component

```typescript
import type { ServiceCard as ServiceCardType } from '@/types/website';

interface ServiceCardProps {
  service: ServiceCardType;
  onClick?: () => void;
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  return (
    <div 
      className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <img src={service.icon} alt={service.name} className="w-12 h-12 mb-4" />
      <h3 className="text-lg font-semibold text-primary-900 mb-2">
        {service.name}
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        {service.description}
      </p>
      <a href={service.link} className="text-primary-600 hover:text-primary-700 font-medium">
        Learn More →
      </a>
    </div>
  );
}
```

### Contact Form Component

```typescript
import { useState } from 'react';
import type { ContactForm as ContactFormType } from '@/types/website';

interface ContactFormProps {
  onSubmit?: (data: ContactFormType) => void;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormType>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}
```

## Best Practices

1. **Reusability**: Design components to be reusable across pages
2. **Accessibility**: Ensure all components meet WCAG AA standards
3. **Performance**: Optimize rendering and avoid unnecessary re-renders
4. **Documentation**: Add JSDoc comments to all components
5. **Testing**: Write tests for all components
6. **Styling**: Use Tailwind CSS consistently
7. **Props**: Keep props interface clean and well-documented
8. **Error Handling**: Handle errors gracefully

## Integration

To use components in pages:

```typescript
import { ServiceCard } from '@/components/website/sections/ServiceCard';
import { ContactForm } from '@/components/website/forms/ContactForm';

export default function ServicesPage() {
  return (
    <div>
      <ServiceCard service={serviceData} />
      <ContactForm onSubmit={handleSubmit} />
    </div>
  );
}
```

## Next Steps

1. Create individual section components
2. Create layout components
3. Create form components
4. Add component tests
5. Document component APIs
