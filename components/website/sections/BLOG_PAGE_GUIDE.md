# Blog Page and Article Detail Components Guide

## Overview

The Blog Page and Article Detail components provide a complete blogging system for the website, including article listing with advanced filtering, search functionality, and detailed article viewing with comments support.

## Components

### 1. BlogPage Component

The `BlogPage` component displays a list of articles with filtering, searching, and sorting capabilities.

#### Props

```typescript
interface BlogPageProps {
  articles: Article[];
  categories: BlogCategory[];
  onArticleClick?: (articleId: string) => void;
  className?: string;
}
```

#### Features

- **Article Grid Display**: Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- **Search Functionality**: Search articles by title, excerpt, or content
- **Category Filtering**: Filter articles by category with "All" option
- **Tag Filtering**: Filter articles by multiple tags
- **Sorting Options**: Sort by newest, oldest, or most popular (by comment count)
- **Results Counter**: Display number of articles shown vs total
- **Empty State**: Show helpful message when no articles match filters
- **Clear Filters**: Quick button to reset all active filters

#### Usage Example

```typescript
import { BlogPage } from '@/components/website/sections/BlogPage';
import type { Article, BlogCategory } from '@/types/website';

const articles: Article[] = [
  {
    id: '1',
    title: 'Getting Started with React',
    excerpt: 'Learn the basics of React development',
    content: 'Full article content...',
    author: 'John Doe',
    publishDate: new Date('2024-01-15'),
    category: 'Technology',
    tags: ['react', 'javascript'],
    thumbnail: 'https://example.com/react.jpg',
    readingTime: 5,
    commentCount: 3,
  },
  // ... more articles
];

const categories: BlogCategory[] = [
  { id: 'tech', name: 'Technology', description: 'Tech articles' },
  { id: 'business', name: 'Business', description: 'Business articles' },
];

export default function BlogPageWrapper() {
  const handleArticleClick = (articleId: string) => {
    // Navigate to article detail page
    window.location.href = `/blog/${articleId}`;
  };

  return (
    <BlogPage
      articles={articles}
      categories={categories}
      onArticleClick={handleArticleClick}
    />
  );
}
```

#### Styling

The component uses Tailwind CSS with responsive classes:
- Mobile: Single column layout
- Tablet (768px+): Two column layout
- Desktop (1024px+): Three column layout

#### Accessibility

- Proper heading hierarchy (h1 for page title)
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Alt text for images
- Color contrast compliance (WCAG AA)

### 2. ArticleDetail Component

The `ArticleDetail` component displays a single article with full content, comments, and related articles.

#### Props

```typescript
interface ArticleDetailProps {
  article: Article;
  relatedArticles?: Article[];
  comments?: Comment[];
  onCommentSubmit?: (comment: { author: string; email: string; content: string }) => void;
  onRelatedArticleClick?: (articleId: string) => void;
  className?: string;
}
```

#### Features

- **Article Header**: Title, category, author, dates, and reading time
- **Featured Image**: Responsive article thumbnail
- **Article Content**: Full HTML content rendering
- **Tags Display**: Show article tags with hash symbol
- **Share Buttons**: Social media sharing options (Facebook, Twitter, LinkedIn, Email)
- **Comments Section**: Display existing comments with nested replies
- **Comment Form**: Allow users to submit new comments with validation
- **Related Articles**: Show related articles in a grid
- **Responsive Design**: Optimized for all screen sizes

#### Usage Example

```typescript
import { ArticleDetail } from '@/components/website/sections/ArticleDetail';
import type { Article, Comment } from '@/types/website';

const article: Article = {
  id: '1',
  title: 'Getting Started with React',
  excerpt: 'Learn the basics of React development',
  content: '<h2>Introduction</h2><p>React is a JavaScript library...</p>',
  author: 'John Doe',
  publishDate: new Date('2024-01-15'),
  updateDate: new Date('2024-01-20'),
  category: 'Technology',
  tags: ['react', 'javascript'],
  thumbnail: 'https://example.com/react.jpg',
  readingTime: 5,
  commentCount: 3,
};

const comments: Comment[] = [
  {
    id: '1',
    author: 'Alice',
    email: 'alice@example.com',
    content: 'Great article!',
    publishDate: new Date(),
    likes: 5,
    replies: [],
    isApproved: true,
  },
];

const relatedArticles: Article[] = [
  // ... related articles
];

export default function ArticleDetailPage() {
  const handleCommentSubmit = async (comment: {
    author: string;
    email: string;
    content: string;
  }) => {
    // Submit comment to backend
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    // Handle response
  };

  const handleRelatedArticleClick = (articleId: string) => {
    window.location.href = `/blog/${articleId}`;
  };

  return (
    <ArticleDetail
      article={article}
      comments={comments}
      relatedArticles={relatedArticles}
      onCommentSubmit={handleCommentSubmit}
      onRelatedArticleClick={handleRelatedArticleClick}
    />
  );
}
```

#### Comment Form Validation

The comment form validates:
- Author name is not empty
- Email is not empty
- Email format is valid (contains @ and domain)
- Comment content is not empty

#### Styling

The component uses Tailwind CSS with:
- Responsive typography (text-4xl on desktop, text-3xl on mobile)
- Responsive spacing and padding
- Responsive grid layouts for related articles
- Prose styling for article content

#### Accessibility

- Proper heading hierarchy (h1 for article title, h2 for sections)
- Semantic HTML structure
- Form labels and placeholders
- Error messages for form validation
- Alt text for images
- Color contrast compliance (WCAG AA)
- Keyboard navigation support

## Sub-Components

### ArticleCard

Displays a single article in the blog list with thumbnail, title, excerpt, and metadata.

**Props:**
- `article: Article` - Article data
- `onClick?: () => void` - Click handler

### CommentItem

Displays a single comment with author info, content, likes, and nested replies.

**Props:**
- `comment: Comment` - Comment data

### RelatedArticleCard

Displays a related article in a compact card format.

**Props:**
- `article: Article` - Article data
- `onClick?: () => void` - Click handler

### ShareButton

Displays a social media share button.

**Props:**
- `platform: string` - Social platform name
- `label: string` - Button label
- `testId: string` - Test ID for testing

## Data Models

### Article

```typescript
interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: Date;
  updateDate?: Date;
  category: string;
  tags: string[];
  thumbnail: string;
  readingTime: number;
  commentCount: number;
}
```

### BlogCategory

```typescript
interface BlogCategory {
  id: string;
  name: string;
  description: string;
}
```

### Comment

```typescript
interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  publishDate: Date;
  likes: number;
  replies: Comment[];
  isApproved: boolean;
}
```

## Testing

Both components have comprehensive test suites:

### BlogPage Tests (47 tests)
- Rendering tests
- Category filtering tests
- Tag filtering tests
- Search functionality tests
- Sorting tests
- Clear filters tests
- Empty state tests
- Article card interaction tests
- Responsive design tests
- Accessibility tests
- Combined filter tests
- Edge case tests
- Data formatting tests

### ArticleDetail Tests (51 tests)
- Rendering tests
- Comments section tests
- Comment form validation tests
- Comment form submission tests
- Related articles tests
- Share buttons tests
- Responsive design tests
- Accessibility tests
- Edge case tests
- Data formatting tests

Run tests with:
```bash
npm test -- components/website/sections/BlogPage.test.tsx --testTimeout=10000
npm test -- components/website/sections/ArticleDetail.test.tsx --testTimeout=10000
```

## Performance Considerations

1. **Memoization**: Uses `useMemo` for expensive filtering and sorting operations
2. **Lazy Loading**: Images use lazy loading for better performance
3. **Code Splitting**: Components can be dynamically imported
4. **Responsive Images**: Use appropriate image sizes for different breakpoints

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Styling

Override default styles using Tailwind CSS classes:

```typescript
<BlogPage
  articles={articles}
  categories={categories}
  className="bg-gray-100"
/>
```

### Custom Callbacks

Implement custom behavior for article clicks and comment submissions:

```typescript
<ArticleDetail
  article={article}
  onCommentSubmit={async (comment) => {
    // Custom comment handling
  }}
  onRelatedArticleClick={(id) => {
    // Custom navigation
  }}
/>
```

## Requirements Mapping

### BlogPage
- **Requirement 10.1**: Display article list ✓
- **Requirement 10.2**: Support filtering by category and tags ✓
- **Requirement 10.3**: Support search functionality ✓
- **Requirement 10.4**: Display article metadata (title, excerpt, date, author) ✓
- **Requirement 10.5**: Support pagination/sorting ✓

### ArticleDetail
- **Requirement 11.1**: Display complete article content ✓
- **Requirement 11.2**: Display article metadata (title, author, dates) ✓
- **Requirement 11.3**: Support formatted content (HTML rendering) ✓
- **Requirement 11.4**: Display related articles ✓
- **Requirement 11.5**: Include social sharing buttons ✓
- **Requirement 12.1-12.5**: Comment system support ✓

## Known Limitations

1. Comment moderation is handled externally (isApproved flag)
2. Social sharing requires external implementation
3. Article content is rendered as HTML (ensure proper sanitization)
4. Related articles must be provided by parent component

## Future Enhancements

1. Add comment pagination for articles with many comments
2. Implement real-time comment updates
3. Add article rating/voting system
4. Add bookmark/save article functionality
5. Add article recommendation engine
6. Add full-text search with highlighting
7. Add article export (PDF, etc.)
8. Add comment threading UI improvements
