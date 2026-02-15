# CaseShowcase Component Guide

## Overview

The `CaseShowcase` component displays a portfolio of successful projects and case studies. It features industry-based filtering, responsive grid layout, and comprehensive case information display.

## Features

- **Case Grid Display**: Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
- **Industry Filtering**: Filter cases by industry with "All Industries" option
- **Case Cards**: Display case title, description, thumbnail, industry badge, and key results
- **Results Display**: Show up to 2 key results per case with visual indicators
- **Empty State**: Graceful handling when no cases are available
- **Responsive Design**: Works seamlessly on all device sizes
- **Accessibility**: WCAG AA compliant with semantic HTML
- **Callbacks**: Optional callback when case is clicked

## Installation

The component is located at:
```
components/website/sections/CaseShowcase.tsx
```

## Usage

### Basic Usage

```tsx
import CaseShowcase from '@/components/website/sections/CaseShowcase';
import type { Case } from '@/types/website';

const cases: Case[] = [
  {
    id: 'case-1',
    title: 'E-commerce Platform Redesign',
    description: 'Complete redesign of an e-commerce platform',
    thumbnail: 'https://example.com/image.jpg',
    industry: 'Retail',
    results: ['50% increase in sales', '30% improvement in conversion'],
    link: '/cases/case-1',
  },
  // ... more cases
];

export default function CasesPage() {
  return <CaseShowcase cases={cases} />;
}
```

### With Callback

```tsx
<CaseShowcase
  cases={cases}
  onCaseClick={(caseId) => {
    console.log('Clicked case:', caseId);
    // Track analytics or navigate
  }}
/>
```

### With Custom Styling

```tsx
<CaseShowcase
  cases={cases}
  className="bg-white"
/>
```

## Props

### `cases: Case[]`
- **Type**: `Case[]`
- **Required**: Yes
- **Description**: Array of case objects to display
- **Example**:
```typescript
[
  {
    id: 'case-1',
    title: 'Project Title',
    description: 'Project description',
    thumbnail: 'https://example.com/image.jpg',
    industry: 'Technology',
    results: ['Result 1', 'Result 2'],
    link: '/cases/case-1',
  }
]
```

### `onCaseClick?: (caseId: string) => void`
- **Type**: `(caseId: string) => void`
- **Default**: `undefined`
- **Description**: Callback function called when a case card is clicked
- **Example**:
```typescript
onCaseClick={(caseId) => {
  analytics.track('case_clicked', { caseId });
}}
```

### `className?: string`
- **Type**: `string`
- **Default**: `''`
- **Description**: Additional CSS classes to apply to the section
- **Example**: `className="bg-gray-100 py-20"`

## Case Data Structure

```typescript
interface Case {
  id: string;              // Unique identifier
  title: string;           // Case title
  description: string;     // Short description
  thumbnail: string;       // Image URL
  industry: string;        // Industry category
  results: string[];       // Array of key results
  link: string;            // Link to case detail page
}
```

## Features in Detail

### Industry Filtering

- Automatically extracts unique industries from cases
- Displays filter buttons for each industry
- "All Industries" button shows all cases
- Active filter is highlighted in blue
- Results count updates when filtering

### Case Cards

Each case card displays:
- **Thumbnail**: Image with hover zoom effect
- **Industry Badge**: Blue badge with industry name
- **Title**: Case title (truncated to 2 lines)
- **Description**: Short description (truncated to 3 lines)
- **Key Results**: Up to 2 results with checkmark indicators
- **View Case Study Link**: Navigation link to case detail

### Responsive Layout

- **Mobile** (<768px): 1 column grid
- **Tablet** (768px-1024px): 2 column grid
- **Desktop** (>1024px): 3 column grid

### Empty State

When no cases are provided:
- Displays "No cases found" message
- Hides filter buttons
- Hides results count

## Styling

The component uses Tailwind CSS classes:

- **Section**: `w-full py-12 md:py-16 lg:py-20 bg-gray-50`
- **Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- **Card**: `bg-white rounded-lg shadow-md hover:shadow-lg`
- **Filter Buttons**: `px-4 py-2 rounded-full font-medium`
- **Active Filter**: `bg-blue-600 text-white`
- **Inactive Filter**: `bg-white text-gray-700 border border-gray-300`

## Customization

### Custom Styling

```tsx
<CaseShowcase
  cases={cases}
  className="bg-gradient-to-r from-blue-50 to-indigo-50"
/>
```

### Custom Callback

```tsx
<CaseShowcase
  cases={cases}
  onCaseClick={(caseId) => {
    // Custom logic
    router.push(`/cases/${caseId}`);
  }}
/>
```

## Accessibility Features

- **Semantic HTML**: Uses `<section>`, `<h2>`, `<button>`, `<img>` tags
- **Alt Text**: All images have descriptive alt text
- **Button Labels**: Filter buttons have clear, descriptive text
- **Heading Hierarchy**: Proper heading levels (H2 for main title)
- **Color Contrast**: Meets WCAG AA standards
- **Keyboard Navigation**: All interactive elements are keyboard accessible

## Testing

The component includes 40 comprehensive unit tests covering:

- **Rendering**: All elements render correctly
- **Filtering**: Industry filtering works as expected
- **Interactions**: Click handlers and callbacks work
- **Empty State**: Proper handling of empty cases
- **Responsive Design**: Grid layout is responsive
- **Accessibility**: Semantic HTML and ARIA attributes
- **Edge Cases**: Long titles, special characters, many results

### Running Tests

```bash
npm test -- components/website/sections/CaseShowcase.test.tsx
```

### Test Coverage

- 40 unit tests
- 100% pass rate
- Covers all major functionality and edge cases

## Requirements Validation

This component validates the following requirements:

- **Requirement 3.1**: Displays success case list
- **Requirement 3.2**: Shows case title, description, thumbnail, industry, results
- **Requirement 3.3**: Navigates to case detail page when clicked
- **Requirement 3.4**: Supports filtering by industry
- **Requirement 3.5**: Displays case key metrics/results

## Property-Based Testing

The component is designed to support property-based testing for:

- **Property 2: Case Showcase Industry Filtering**
  - For any case list and any industry filter, all returned cases should have matching industry
  - Validates: Requirements 3.4

- **Property 18: Case Showcase Data Presence**
  - For any case in the showcase, it should display title, description, thumbnail, industry, and results
  - Validates: Requirements 3.2, 3.5

## Integration Examples

### In Homepage

```tsx
import CaseShowcase from '@/components/website/sections/CaseShowcase';

export default function HomePage() {
  const cases = await fetchCases();
  
  return (
    <main>
      {/* Other sections */}
      <CaseShowcase cases={cases} />
      {/* Other sections */}
    </main>
  );
}
```

### In Cases Page

```tsx
import CaseShowcase from '@/components/website/sections/CaseShowcase';

export default function CasesPage() {
  const cases = await fetchAllCases();
  
  return (
    <div>
      <h1>Our Success Cases</h1>
      <CaseShowcase
        cases={cases}
        onCaseClick={(caseId) => {
          // Track analytics
        }}
      />
    </div>
  );
}
```

### With Analytics

```tsx
<CaseShowcase
  cases={cases}
  onCaseClick={(caseId) => {
    analytics.track('case_showcase_click', {
      caseId,
      timestamp: new Date(),
    });
  }}
/>
```

## Performance Considerations

- **Memoization**: Uses `useMemo` for filtering and industry extraction
- **Lazy Loading**: Images can be lazy-loaded with Next.js Image component
- **Efficient Filtering**: O(n) filtering algorithm
- **No External Dependencies**: Only uses React and Next.js

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Cases not displaying

1. Check that `cases` prop is provided
2. Verify case data structure matches `Case` interface
3. Check browser console for errors

### Filtering not working

1. Ensure cases have `industry` field
2. Check that industry values are consistent
3. Verify filter buttons are clickable

### Styling issues

1. Ensure Tailwind CSS is properly configured
2. Check for CSS conflicts
3. Verify no custom CSS overrides Tailwind classes

## Future Enhancements

- Pagination for large case lists
- Search functionality
- Sorting options (by date, popularity, etc.)
- Case detail modal
- Image lazy loading
- Animation effects
- Case comparison feature
- Export case data

## Support

For issues or questions about the CaseShowcase component, please refer to:
- Component tests: `components/website/sections/CaseShowcase.test.tsx`
- Type definitions: `types/website.ts`
- Design document: `.kiro/specs/website-system/design.md`
