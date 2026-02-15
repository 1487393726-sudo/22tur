import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentSystem } from './CommentSystem';
import type { Comment } from '@/types/website';

// Mock data
const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Alice',
    email: 'alice@example.com',
    content: 'Great article! Very helpful.',
    publishDate: new Date('2024-01-16'),
    likes: 5,
    replies: [
      {
        id: '2',
        author: 'Bob',
        email: 'bob@example.com',
        content: 'I agree with Alice!',
        publishDate: new Date('2024-01-17'),
        likes: 2,
        replies: [],
        isApproved: true,
      },
    ],
    isApproved: true,
  },
  {
    id: '3',
    author: 'Charlie',
    email: 'charlie@example.com',
    content: 'Thanks for sharing this knowledge.',
    publishDate: new Date('2024-01-18'),
    likes: 3,
    replies: [],
    isApproved: true,
  },
  {
    id: '4',
    author: 'Diana',
    email: 'diana@example.com',
    content: 'Waiting for moderation',
    publishDate: new Date('2024-01-19'),
    likes: 0,
    replies: [],
    isApproved: false,
  },
];

describe('CommentSystem Component', () => {
  describe('Rendering', () => {
    it('should render the comment system section', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comment-system')).toBeInTheDocument();
    });

    it('should render comments header with count', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comments-header')).toBeInTheDocument();
      expect(screen.getByText(`Comments (${mockComments.length})`)).toBeInTheDocument();
    });

    it('should render comment form by default', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      expect(screen.getByTestId('comment-author-input')).toBeInTheDocument();
      expect(screen.getByTestId('comment-email-input')).toBeInTheDocument();
      expect(screen.getByTestId('comment-content-input')).toBeInTheDocument();
    });

    it('should not render comment form when showForm is false', () => {
      render(<CommentSystem comments={mockComments} showForm={false} />);
      expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
    });

    it('should render all comments', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comments-list')).toBeInTheDocument();
      mockComments.forEach((comment) => {
        expect(screen.getByTestId(`comment-item-${comment.id}`)).toBeInTheDocument();
      });
    });

    it('should display comment author and content', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comment-author-1')).toHaveTextContent('Alice');
      expect(screen.getByTestId('comment-content-1')).toHaveTextContent('Great article!');
    });

    it('should display comment date', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comment-date-1')).toHaveTextContent('January 16, 2024');
    });

    it('should display comment likes', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comment-likes-1')).toHaveTextContent('5');
    });

    it('should show no comments message when empty', () => {
      render(<CommentSystem comments={[]} />);
      expect(screen.getByTestId('no-comments')).toBeInTheDocument();
      expect(screen.getAllByText(/No comments yet/)).toHaveLength(2); // Header and empty state
    });
  });

  describe('Comment Approval Status', () => {
    it('should show pending status for unapproved comments', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comment-pending-4')).toBeInTheDocument();
      expect(screen.getByTestId('comment-pending-4')).toHaveTextContent('awaiting moderation');
    });

    it('should not show pending status for approved comments', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.queryByTestId('comment-pending-1')).not.toBeInTheDocument();
    });
  });

  describe('Comment Form Validation', () => {
    it('should show error when author name is empty', () => {
      render(<CommentSystem comments={mockComments} />);
      const submitButton = screen.getByTestId('comment-submit-button');
      const emailInput = screen.getByTestId('comment-email-input');
      const contentInput = screen.getByTestId('comment-content-input');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(contentInput, { target: { value: 'Test comment' } });
      fireEvent.click(submitButton);

      expect(screen.getByTestId('comment-error')).toHaveTextContent('Please enter your name');
    });

    it('should show error when email is empty', () => {
      render(<CommentSystem comments={mockComments} />);
      const submitButton = screen.getByTestId('comment-submit-button');
      const authorInput = screen.getByTestId('comment-author-input');
      const contentInput = screen.getByTestId('comment-content-input');

      fireEvent.change(authorInput, { target: { value: 'John' } });
      fireEvent.change(contentInput, { target: { value: 'Test comment' } });
      fireEvent.click(submitButton);

      expect(screen.getByTestId('comment-error')).toHaveTextContent('Please enter your email');
    });

    it('should show error when email is invalid', () => {
      render(<CommentSystem comments={mockComments} />);
      const submitButton = screen.getByTestId('comment-submit-button');
      const authorInput = screen.getByTestId('comment-author-input');
      const emailInput = screen.getByTestId('comment-email-input');
      const contentInput = screen.getByTestId('comment-content-input');

      fireEvent.change(authorInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(contentInput, { target: { value: 'Test comment' } });
      fireEvent.click(submitButton);

      const errorElement = screen.queryByTestId('comment-error');
      if (errorElement) {
        expect(errorElement.textContent).toMatch(/valid email/i);
      }
    });

    it('should show error when content is empty', () => {
      render(<CommentSystem comments={mockComments} />);
      const submitButton = screen.getByTestId('comment-submit-button');
      const authorInput = screen.getByTestId('comment-author-input');
      const emailInput = screen.getByTestId('comment-email-input');

      fireEvent.change(authorInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(screen.getByTestId('comment-error')).toHaveTextContent('Please enter your comment');
    });

    it('should not show error when all fields are valid', () => {
      const onCommentSubmit = jest.fn();
      render(<CommentSystem comments={mockComments} onCommentSubmit={onCommentSubmit} />);
      const submitButton = screen.getByTestId('comment-submit-button');
      const authorInput = screen.getByTestId('comment-author-input');
      const emailInput = screen.getByTestId('comment-email-input');
      const contentInput = screen.getByTestId('comment-content-input');

      fireEvent.change(authorInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(contentInput, { target: { value: 'Test comment' } });
      fireEvent.click(submitButton);

      expect(screen.queryByTestId('comment-error')).not.toBeInTheDocument();
      expect(onCommentSubmit).toHaveBeenCalledWith({
        author: 'John',
        email: 'test@example.com',
        content: 'Test comment',
      });
    });
  });

  describe('Comment Form Submission', () => {
    it('should call onCommentSubmit with form data', () => {
      const onCommentSubmit = jest.fn();
      render(<CommentSystem comments={mockComments} onCommentSubmit={onCommentSubmit} />);

      const authorInput = screen.getByTestId('comment-author-input');
      const emailInput = screen.getByTestId('comment-email-input');
      const contentInput = screen.getByTestId('comment-content-input');
      const submitButton = screen.getByTestId('comment-submit-button');

      fireEvent.change(authorInput, { target: { value: 'Jane' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(contentInput, { target: { value: 'Great article!' } });
      fireEvent.click(submitButton);

      expect(onCommentSubmit).toHaveBeenCalledWith({
        author: 'Jane',
        email: 'jane@example.com',
        content: 'Great article!',
      });
    });

    it('should clear form after successful submission', () => {
      const onCommentSubmit = jest.fn();
      render(<CommentSystem comments={mockComments} onCommentSubmit={onCommentSubmit} />);

      const authorInput = screen.getByTestId('comment-author-input') as HTMLInputElement;
      const emailInput = screen.getByTestId('comment-email-input') as HTMLInputElement;
      const contentInput = screen.getByTestId('comment-content-input') as HTMLTextAreaElement;
      const submitButton = screen.getByTestId('comment-submit-button');

      fireEvent.change(authorInput, { target: { value: 'Jane' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(contentInput, { target: { value: 'Great article!' } });
      fireEvent.click(submitButton);

      expect(authorInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(contentInput.value).toBe('');
    });

    it('should show success message after submission', () => {
      const onCommentSubmit = jest.fn();
      render(<CommentSystem comments={mockComments} onCommentSubmit={onCommentSubmit} />);

      const authorInput = screen.getByTestId('comment-author-input');
      const emailInput = screen.getByTestId('comment-email-input');
      const contentInput = screen.getByTestId('comment-content-input');
      const submitButton = screen.getByTestId('comment-submit-button');

      fireEvent.change(authorInput, { target: { value: 'Jane' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(contentInput, { target: { value: 'Great article!' } });
      fireEvent.click(submitButton);

      expect(screen.getByTestId('comment-success')).toBeInTheDocument();
      expect(screen.getByTestId('comment-success')).toHaveTextContent('Thank you for your comment');
    });
  });

  describe('Comment Likes', () => {
    it('should render like button for each comment', () => {
      render(<CommentSystem comments={mockComments} />);
      mockComments.forEach((comment) => {
        expect(screen.getByTestId(`comment-like-button-${comment.id}`)).toBeInTheDocument();
      });
    });

    it('should call onCommentLike when like button is clicked', () => {
      const onCommentLike = jest.fn();
      render(<CommentSystem comments={mockComments} onCommentLike={onCommentLike} />);

      const likeButton = screen.getByTestId('comment-like-button-1');
      fireEvent.click(likeButton);

      expect(onCommentLike).toHaveBeenCalledWith('1');
    });

    it('should display like count', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comment-likes-1')).toHaveTextContent('5');
      expect(screen.getByTestId('comment-likes-3')).toHaveTextContent('3');
    });
  });

  describe('Nested Replies', () => {
    it('should render nested replies', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('replies-1')).toBeInTheDocument();
      expect(screen.getByTestId('comment-item-2')).toBeInTheDocument();
    });

    it('should render reply button for comments', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('reply-button-1')).toBeInTheDocument();
    });

    it('should show reply form when reply button is clicked', () => {
      render(<CommentSystem comments={mockComments} />);
      const replyButton = screen.getByTestId('reply-button-1');
      fireEvent.click(replyButton);

      expect(screen.getByTestId('reply-form-1')).toBeInTheDocument();
      expect(screen.getByTestId('reply-author-input-1')).toBeInTheDocument();
      expect(screen.getByTestId('reply-email-input-1')).toBeInTheDocument();
      expect(screen.getByTestId('reply-content-input-1')).toBeInTheDocument();
    });

    it('should hide reply form when cancel is clicked', () => {
      render(<CommentSystem comments={mockComments} />);
      const replyButton = screen.getByTestId('reply-button-1');
      fireEvent.click(replyButton);

      expect(screen.getByTestId('reply-form-1')).toBeInTheDocument();

      fireEvent.click(replyButton);
      expect(screen.queryByTestId('reply-form-1')).not.toBeInTheDocument();
    });

    it('should respect maxDepth for nested replies', () => {
      render(<CommentSystem comments={mockComments} maxDepth={1} />);
      // At depth 1, reply button should not be available
      expect(screen.queryByTestId('reply-button-2')).not.toBeInTheDocument();
    });
  });

  describe('Reply Submission', () => {
    it('should call onCommentReply when reply is submitted', () => {
      const onCommentReply = jest.fn();
      render(<CommentSystem comments={mockComments} onCommentReply={onCommentReply} />);

      const replyButton = screen.getByTestId('reply-button-1');
      fireEvent.click(replyButton);

      const authorInput = screen.getByTestId('reply-author-input-1');
      const emailInput = screen.getByTestId('reply-email-input-1');
      const contentInput = screen.getByTestId('reply-content-input-1');
      const submitButton = screen.getByTestId('reply-submit-button-1');

      fireEvent.change(authorInput, { target: { value: 'Eve' } });
      fireEvent.change(emailInput, { target: { value: 'eve@example.com' } });
      fireEvent.change(contentInput, { target: { value: 'Great reply!' } });
      fireEvent.click(submitButton);

      expect(onCommentReply).toHaveBeenCalledWith('1', {
        author: 'Eve',
        email: 'eve@example.com',
        content: 'Great reply!',
      });
    });

    it('should close reply form after submission', () => {
      const onCommentReply = jest.fn();
      render(<CommentSystem comments={mockComments} onCommentReply={onCommentReply} />);

      const replyButton = screen.getByTestId('reply-button-1');
      fireEvent.click(replyButton);

      const authorInput = screen.getByTestId('reply-author-input-1');
      const emailInput = screen.getByTestId('reply-email-input-1');
      const contentInput = screen.getByTestId('reply-content-input-1');
      const submitButton = screen.getByTestId('reply-submit-button-1');

      fireEvent.change(authorInput, { target: { value: 'Eve' } });
      fireEvent.change(emailInput, { target: { value: 'eve@example.com' } });
      fireEvent.change(contentInput, { target: { value: 'Great reply!' } });
      fireEvent.click(submitButton);

      expect(screen.queryByTestId('reply-form-1')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive layout classes', () => {
      render(<CommentSystem comments={mockComments} />);
      const form = screen.getByTestId('comment-form');
      expect(form).toHaveClass('p-6', 'bg-gray-50', 'rounded-lg');
    });

    it('should have responsive grid for form inputs', () => {
      render(<CommentSystem comments={mockComments} />);
      const formElement = screen.getByTestId('comment-form-element');
      const gridContainer = formElement.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<CommentSystem comments={mockComments} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Comments');
    });

    it('should have proper form labels', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByPlaceholderText('Your Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your comment...')).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<CommentSystem comments={mockComments} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty comments list', () => {
      render(<CommentSystem comments={[]} />);
      expect(screen.getByTestId('no-comments')).toBeInTheDocument();
    });

    it('should handle comments with no replies', () => {
      const commentsNoReplies = mockComments.map((c) => ({ ...c, replies: [] }));
      render(<CommentSystem comments={commentsNoReplies} />);
      expect(screen.getByTestId('comment-item-1')).toBeInTheDocument();
    });

    it('should handle deeply nested replies', () => {
      const deeplyNested: Comment = {
        id: '1',
        author: 'Alice',
        email: 'alice@example.com',
        content: 'Level 1',
        publishDate: new Date(),
        likes: 0,
        replies: [
          {
            id: '2',
            author: 'Bob',
            email: 'bob@example.com',
            content: 'Level 2',
            publishDate: new Date(),
            likes: 0,
            replies: [
              {
                id: '3',
                author: 'Charlie',
                email: 'charlie@example.com',
                content: 'Level 3',
                publishDate: new Date(),
                likes: 0,
                replies: [],
                isApproved: true,
              },
            ],
            isApproved: true,
          },
        ],
        isApproved: true,
      };

      render(<CommentSystem comments={[deeplyNested]} maxDepth={5} />);
      expect(screen.getByTestId('comment-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('comment-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('comment-item-3')).toBeInTheDocument();
    });

    it('should handle very long comment text', () => {
      const longComment: Comment = {
        id: '1',
        author: 'Alice',
        email: 'alice@example.com',
        content: 'This is a very long comment that contains a lot of text. '.repeat(10),
        publishDate: new Date(),
        likes: 0,
        replies: [],
        isApproved: true,
      };

      render(<CommentSystem comments={[longComment]} />);
      expect(screen.getByTestId('comment-content-1')).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('should format dates correctly', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByTestId('comment-date-1')).toHaveTextContent('January 16, 2024');
    });

    it('should display correct comment count', () => {
      render(<CommentSystem comments={mockComments} />);
      expect(screen.getByText(`Comments (${mockComments.length})`)).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state while typing', () => {
      render(<CommentSystem comments={mockComments} />);
      const authorInput = screen.getByTestId('comment-author-input') as HTMLInputElement;

      fireEvent.change(authorInput, { target: { value: 'John' } });
      expect(authorInput.value).toBe('John');

      fireEvent.change(authorInput, { target: { value: 'John Doe' } });
      expect(authorInput.value).toBe('John Doe');
    });

    it('should clear error message when user starts typing', () => {
      render(<CommentSystem comments={mockComments} />);
      const submitButton = screen.getByTestId('comment-submit-button');
      const authorInput = screen.getByTestId('comment-author-input');

      fireEvent.click(submitButton);
      expect(screen.getByTestId('comment-error')).toBeInTheDocument();

      fireEvent.change(authorInput, { target: { value: 'John' } });
      expect(screen.queryByTestId('comment-error')).not.toBeInTheDocument();
    });
  });
});
