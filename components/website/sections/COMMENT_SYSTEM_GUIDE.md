# Comment System Component Guide

## Overview

The Comment System component provides a complete commenting solution for the website, including comment display, nested replies, form validation, and moderation support. It's designed to be reusable across different pages and contexts.

## Component

### CommentSystem Component

The `CommentSystem` component displays comments with full threading support, form validation, and user interactions.

#### Props

```typescript
interface CommentSystemProps {
  comments: Comment[];
  onCommentSubmit?: (comment: { author: string; email: string; content: string }) => void;
  onCommentLike?: (commentId: string) => void;
  onCommentReply?: (parentCommentId: string, reply: { author: string; email: string; content: string }) => void;
  className?: string;
  showForm?: boolean;
  maxDepth?: number;
}
```

#### Features

- **Comment Display**: Show comments with author, date, content, and likes
- **Nested Replies**: Support for threaded replies with configurable depth
- **Comment Form**: Validated form for submitting new comments
- **Reply Form**: Inline reply forms for responding to comments
- **Like System**: Allow users to like comments
- **Moderation Support**: Display pending status for unapproved comments
- **Form Validation**: Email and required field validation
- **Responsive Design**: Mobile-friendly layout
- **Accessibility**: WCAG AA compliant

#### Usage Example

```typescript
import { CommentSystem } from '@/components/website/sections/CommentSystem';
import type { Comment } from '@/types/website';

const comments: Comment[] = [
  {
    id: '1',
    author: 'Alice',
    email: 'alice@example.com',
    content: 'Great article!',
    publishDate: new Date('2024-01-16'),
    likes: 5,
    replies: [
      {
        id: '2',
        author: 'Bob',
        email: 'bob@example.com',
        content: 'I agree!',
        publishDate: new Date('2024-01-17'),
        likes: 2,
        replies: [],
        isApproved: true,
      },
    ],
    isApproved: true,
  },
];

export default function CommentsSection() {
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

  const handleCommentLike = async (commentId: string) => {
    // Update like count
    const response = await fetch(`/api/comments/${commentId}/like`, {
      method: 'POST',
    });
    // Handle response
  };

  const handleCommentReply = async (
    parentCommentId: string,
    reply: { author: string; email: string; content: string }
  ) => {
    // Submit reply to backend
    const response = await fetch(`/api/comments/${parentCommentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reply),
    });
    // Handle response
  };

  return (
    <CommentSystem
      comments={comments}
      onCommentSubmit={handleCommentSubmit}
      onCommentLike={handleCommentLike}
      onCommentReply={handleCommentReply}
      maxDepth={3}
      showForm={true}
    />
  );
}
```

#### Props Details

- **comments**: Array of Comment objects to display
- **onCommentSubmit**: Callback when user submits a new comment
- **onCommentLike**: Callback when user likes a comment
- **onCommentReply**: Callback when user replies to a comment
- **className**: Additional CSS classes for styling
- **showForm**: Whether to show the comment submission form (default: true)
- **maxDepth**: Maximum nesting depth for replies (default: 3)

#### Styling

The component uses Tailwind CSS with responsive classes:
- Mobile: Single column layout with adjusted spacing
- Tablet (768px+): Optimized spacing and padding
- Desktop (1024px+): Full-width layout with proper indentation for nested replies

#### Accessibility

- Proper heading hierarchy (h2 for comments section)
- Semantic HTML structure
- Form labels and placeholders
- Error messages for validation
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Proper button roles

## Sub-Components

### CommentThread

Displays a single comment with nested replies and reply form.

**Props:**
- `comment: Comment` - Comment data
- `depth: number` - Current nesting depth
- `maxDepth: number` - Maximum allowed depth
- `onLike: (commentId: string) => void` - Like handler
- `onReply: (parentId: string, reply: Comment) => void` - Reply handler
- `replyingTo: string | null` - ID of comment being replied to
- `replyForm: { author, email, content }` - Reply form state
- `onReplyChange: (e: ChangeEvent) => void` - Reply form change handler
- `onReplySubmit: (e: FormEvent, parentId: string) => void` - Reply submit handler

## Data Models

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

## Form Validation

The comment form validates:
- Author name is not empty
- Email is not empty
- Email format is valid (contains @ and domain)
- Comment content is not empty

## Testing

The component has comprehensive test coverage:

### Test Categories (42 tests)
- Rendering tests (9 tests)
- Comment approval status tests (2 tests)
- Comment form validation tests (5 tests)
- Comment form submission tests (3 tests)
- Comment likes tests (3 tests)
- Nested replies tests (5 tests)
- Reply submission tests (2 tests)
- Responsive design tests (2 tests)
- Accessibility tests (3 tests)
- Edge case tests (4 tests)
- Data formatting tests (2 tests)
- Form state management tests (2 tests)

Run tests with:
```bash
npm test -- components/website/sections/CommentSystem.test.tsx --testTimeout=10000
```

## Performance Considerations

1. **Memoization**: Uses useMemo for expensive operations
2. **Lazy Loading**: Comments can be paginated for large lists
3. **Efficient Rendering**: Only re-renders affected components
4. **Optimized State**: Minimal state updates

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
<CommentSystem
  comments={comments}
  className="bg-blue-50"
/>
```

### Custom Callbacks

Implement custom behavior for comments:

```typescript
<CommentSystem
  comments={comments}
  onCommentSubmit={async (comment) => {
    // Custom comment handling
  }}
  onCommentLike={async (commentId) => {
    // Custom like handling
  }}
  onCommentReply={async (parentId, reply) => {
    // Custom reply handling
  }}
/>
```

### Depth Control

Control maximum nesting depth:

```typescript
<CommentSystem
  comments={comments}
  maxDepth={2}  // Only allow 2 levels of nesting
/>
```

### Form Visibility

Show or hide the comment form:

```typescript
<CommentSystem
  comments={comments}
  showForm={false}  // Display comments only, no form
/>
```

## Requirements Mapping

### Requirement 12: Comment System
- **12.1**: Display comments section ✓
- **12.2**: Comment form with validation ✓
- **12.3**: Support comment likes and replies ✓
- **12.4**: Content moderation support ✓
- **12.5**: Display comment metadata ✓

## Known Limitations

1. Comment moderation is handled externally (isApproved flag)
2. Like count updates require external API calls
3. Reply threading is limited by maxDepth prop
4. No built-in pagination for large comment lists

## Future Enhancements

1. Add comment pagination for articles with many comments
2. Implement real-time comment updates using WebSocket
3. Add comment editing and deletion
4. Add comment search and filtering
5. Add comment sorting options (newest, oldest, most liked)
6. Add comment threading UI improvements
7. Add emoji support in comments
8. Add comment mentions (@username)
9. Add comment markdown support
10. Add spam detection and filtering

## Integration with ArticleDetail

The CommentSystem is already integrated into the ArticleDetail component. You can also use it standalone:

```typescript
import { CommentSystem } from '@/components/website/sections/CommentSystem';

// Use as standalone component
<CommentSystem
  comments={comments}
  onCommentSubmit={handleSubmit}
  onCommentLike={handleLike}
  onCommentReply={handleReply}
/>
```

## API Integration Example

```typescript
// Backend API endpoints
POST /api/comments - Submit new comment
POST /api/comments/:id/like - Like a comment
POST /api/comments/:id/replies - Reply to a comment
GET /api/comments?articleId=:id - Get comments for article
DELETE /api/comments/:id - Delete comment (admin)
PATCH /api/comments/:id/approve - Approve comment (admin)
```

## Error Handling

The component handles:
- Form validation errors
- Empty comment lists
- Unapproved comments
- Nested reply depth limits
- Long comment text
- Special characters in comments

## Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy
- Form labels and placeholders
- Error messages
- Keyboard navigation
- Focus management
- Color contrast compliance
- Screen reader support
