# Website System

The Website System is a comprehensive module for managing the public-facing website. It includes configuration, SEO optimization, utilities, and type definitions.

## Directory Structure

```
lib/website/
├── config.ts          # Central configuration (website, theme, navigation, SEO)
├── seo.ts             # SEO utilities and metadata generation
├── types.ts           # Extended type definitions
├── utils.ts           # Common utility functions
├── constants.ts       # Centralized constants
├── index.ts           # Main export file
└── README.md          # This file
```

## Key Files

### config.ts
Contains all configuration for the website system:
- **websiteConfig**: Site name, description, logo, brand color (#1E3A5F), contact info
- **themeConfig**: Color palette, typography, spacing
- **navigationConfig**: Main menu and footer links
- **seoConfig**: Default SEO settings
- **breakpoints**: Responsive design breakpoints
- **animationConfig**: Animation durations and easing

### seo.ts
SEO utilities for metadata generation:
- `generateSEOMetadata()`: Generate complete SEO metadata
- `generateOpenGraphTags()`: Generate OG meta tags
- `generateTwitterCardTags()`: Generate Twitter Card tags
- `generateStructuredData()`: Generate JSON-LD structured data
- `generateOrganizationSchema()`: Organization schema
- `generateLocalBusinessSchema()`: Local business schema
- `generateArticleSchema()`: Article schema
- `generateBreadcrumbSchema()`: Breadcrumb schema
- `generateSitemapEntry()`: Sitemap entry

### types.ts
Extended type definitions:
- `PageMetadata`: Page metadata interface
- `PageProps`: Next.js page props
- `ApiResponse<T>`: Generic API response
- `PaginationParams`: Pagination parameters
- `PaginatedResponse<T>`: Paginated response

### utils.ts
Common utility functions:
- **Date/Time**: `formatDate()`, `calculateReadingTime()`
- **Text**: `truncateText()`, `generateSlug()`, `sanitizeHtml()`, `parseMarkdown()`
- **Validation**: `isValidEmail()`, `isValidPhone()`
- **Formatting**: `formatCurrency()`
- **Accessibility**: `getContrastRatio()`, `meetsWCAGAA()`, `meetsWCAGAAA()`
- **Performance**: `debounce()`, `throttle()`
- **URL**: `buildUrl()`, `isExternalUrl()`

### constants.ts
Centralized constants:
- **BRAND_COLORS**: Brand color palette
- **BREAKPOINTS**: Responsive breakpoints
- **ANIMATION_DURATIONS**: Animation timing
- **Z_INDEX**: Z-index scale
- **ROUTES**: Page routes
- **SERVICE_CATEGORIES**: Service categories
- **BLOG_CATEGORIES**: Blog categories
- **VALIDATION_RULES**: Form validation rules
- **PAGINATION**: Pagination defaults
- **CACHE_DURATION**: Cache durations
- **SEO**: SEO constants
- **ACCESSIBILITY**: Accessibility standards
- **ERROR_MESSAGES**: Error messages
- **SUCCESS_MESSAGES**: Success messages
- **SOCIAL_MEDIA**: Social media platforms
- **IMAGE_SIZES**: Image dimensions
- **FILE_UPLOAD**: File upload limits

## Brand Color

The primary brand color is **#1E3A5F** (Deep Blue), which is used throughout the website system:
- Primary color palette: Shades of blue from #f0f5fb to #1E3A5F
- Secondary color: #2D5A8C (Medium Blue)
- Accent color: #FF6B35 (Orange)

## Usage Examples

### Import Configuration
```typescript
import { websiteConfig, themeConfig, navigationConfig } from '@/lib/website/config';

console.log(websiteConfig.brandColor); // #1E3A5F
```

### Generate SEO Metadata
```typescript
import { generateSEOMetadata, generateOpenGraphTags } from '@/lib/website/seo';

const metadata = generateSEOMetadata(
  'Services',
  'Our professional services',
  {
    keywords: ['services', 'professional'],
    url: 'https://example.com/services'
  }
);

const ogTags = generateOpenGraphTags(metadata);
```

### Use Utilities
```typescript
import { 
  formatDate, 
  calculateReadingTime, 
  isValidEmail,
  getContrastRatio,
  meetsWCAGAA 
} from '@/lib/website/utils';

const date = formatDate(new Date()); // "January 15, 2024"
const readTime = calculateReadingTime(articleContent); // 5
const isValid = isValidEmail('user@example.com'); // true
const ratio = getContrastRatio('#1E3A5F', '#FFFFFF'); // 8.59
const wcagCompliant = meetsWCAGAA(ratio); // true
```

### Use Constants
```typescript
import { BRAND_COLORS, ROUTES, SERVICE_CATEGORIES } from '@/lib/website/constants';

console.log(BRAND_COLORS.primary); // #1E3A5F
console.log(ROUTES.services); // /services
console.log(SERVICE_CATEGORIES[0].name); // Web Development
```

## Responsive Design

The website system supports three main breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Tailwind CSS breakpoints are configured in `tailwind.config.ts`:
- `xs`: 320px
- `sm`: 640px
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px
- `2xl`: 1536px

## SEO Optimization

The website system includes comprehensive SEO support:
- Meta tags (title, description, keywords)
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data (JSON-LD)
- Sitemap generation
- Breadcrumb navigation

## Accessibility

The website system follows WCAG accessibility standards:
- Color contrast ratio: 4.5:1 (AA standard)
- AAA standard: 7:1
- Semantic HTML structure
- Keyboard navigation support
- Alt text for images
- Focus indicators

## Performance

Utilities for performance optimization:
- Image optimization constants
- Debounce and throttle functions
- Cache duration constants
- Code splitting support

## Integration

To use the website system in your components:

```typescript
import { 
  websiteConfig, 
  generateSEOMetadata, 
  formatDate,
  BRAND_COLORS,
  ROUTES 
} from '@/lib/website';

export default function MyComponent() {
  const metadata = generateSEOMetadata('Page Title', 'Page Description');
  
  return (
    <div style={{ color: BRAND_COLORS.primary }}>
      {/* Component content */}
    </div>
  );
}
```

## Next Steps

1. Create page components in `app/(website)/`
2. Create reusable components in `components/website/`
3. Implement forms in `components/website/forms/`
4. Create layout components in `components/website/layout/`
5. Build section components in `components/website/sections/`
