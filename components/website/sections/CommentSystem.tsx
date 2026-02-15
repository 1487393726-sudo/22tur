'use client';

import React, { useState } from 'react';
import type { Comment } from '@/types/website';

interface CommentSystemProps {
  comments: Comment[];
  onCommentSubmit?: (comment: { author: string; email: string; content: string }) => void;
  onCommentLike?: (commentId: string) => void;
  onCommentReply?: (parentCommentId: string, reply: { author: string; email: string; content: string }) => void;
  className?: string;
  showForm?: boolean;
  maxDepth?: number;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  comments,
  onCommentSubmit,
  onCommentLike,
  onCommentReply,
  className = '',
  showForm = true,
  maxDepth = 3,
}) => {
  const [commentForm, setCommentForm] = useState({
    author: '',
    email: '',
    content: '',
  });
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyForm, setReplyForm] = useState({
    author: '',
    email: '',
    content: '',
  });

  const handleCommentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCommentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCommentError('');
  };

  const handleReplyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReplyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (form: typeof commentForm): boolean => {
    if (!form.author.trim()) {
      setCommentError('Please enter your name');
      return false;
    }
    if (!form.email.trim()) {
      setCommentError('Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setCommentError('Please enter a valid email address');
      return false;
    }
    if (!form.content.trim()) {
      setCommentError('Please enter your comment');
      return false;
    }
    return true;
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    setCommentSuccess(false);

    if (!validateForm(commentForm)) {
      return;
    }

    onCommentSubmit?.(commentForm);
    setCommentForm({ author: '', email: '', content: '' });
    setCommentSuccess(true);

    setTimeout(() => setCommentSuccess(false), 3000);
  };

  const handleReplySubmit = (e: React.FormEvent, parentCommentId: string) => {
    e.preventDefault();

    if (!validateForm(replyForm)) {
      return;
    }

    onCommentReply?.(parentCommentId, replyForm);
    setReplyForm({ author: '', email: '', content: '' });
    setReplyingTo(null);
  };

  const handleLike = (commentId: string) => {
    onCommentLike?.(commentId);
  };

  return (
    <section
      className={`w-full py-8 ${className}`}
      data-testid="comment-system"
    >
      <div className="max-w-4xl mx-auto">
        {/* Comments Header */}
        <div className="mb-8" data-testid="comments-header">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Comments ({comments.length})
          </h2>
          <p className="text-secondary">
            {comments.length === 0
              ? 'No comments yet. Be the first to comment!'
              : 'Join the discussion'}
          </p>
        </div>

        {/* Comment Form */}
        {showForm && (
          <div className="mb-12 p-6 bg-neutral-100 rounded-lg" data-testid="comment-form">
            <h3 className="text-lg font-semibold text-primary mb-4">Leave a comment</h3>

            {commentError && (
              <div
                className="mb-4 p-4 bg-error/10 border border-error text-error rounded"
                data-testid="comment-error"
              >
                {commentError}
              </div>
            )}

            {commentSuccess && (
              <div
                className="mb-4 p-4 bg-success/10 border border-success text-success rounded"
                data-testid="comment-success"
              >
                Thank you for your comment! It will be reviewed and published shortly.
              </div>
            )}

            <form onSubmit={handleCommentSubmit} data-testid="comment-form-element">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="author"
                  placeholder="Your Name"
                  value={commentForm.author}
                  onChange={handleCommentChange}
                  className="px-4 py-2 input rounded-lg focus:outline-none transition-colors"
                  data-testid="comment-author-input"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={commentForm.email}
                  onChange={handleCommentChange}
                  className="px-4 py-2 input rounded-lg focus:outline-none transition-colors"
                  data-testid="comment-email-input"
                />
              </div>

              <textarea
                name="content"
                placeholder="Your comment..."
                value={commentForm.content}
                onChange={handleCommentChange}
                rows={5}
                className="w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors mb-4"
                data-testid="comment-content-input"
              />

              <button
                type="submit"
                className="px-6 py-2 btn-primary rounded-lg hover:bg-primary-600 transition-colors"
                data-testid="comment-submit-button"
              >
                Post Comment
              </button>
            </form>
          </div>
        )}

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-6" data-testid="comments-list">
            {comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                depth={0}
                maxDepth={maxDepth}
                onLike={handleLike}
                onReply={(parentId, reply) => {
                  setReplyingTo(parentId);
                  onCommentReply?.(parentId, reply);
                }}
                replyingTo={replyingTo}
                replyForm={replyForm}
                onReplyChange={handleReplyChange}
                onReplySubmit={handleReplySubmit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" data-testid="no-comments">
            <p className="text-secondary">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================================================
// Comment Thread Component
// ============================================================================

interface CommentThreadProps {
  comment: Comment;
  depth: number;
  maxDepth: number;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, reply: { author: string; email: string; content: string }) => void;
  replyingTo: string | null;
  replyForm: { author: string; email: string; content: string };
  onReplyChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onReplySubmit: (e: React.FormEvent, parentId: string) => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  depth,
  maxDepth,
  onLike,
  onReply,
  replyingTo,
  replyForm,
  onReplyChange,
  onReplySubmit,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const formattedDate = new Date(comment.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const canReply = depth < maxDepth;

  return (
    <div
      className={`${depth > 0 ? 'ml-4 md:ml-8 border-l-2 border-border-light pl-4 md:pl-8' : ''}`}
      data-testid={`comment-item-${comment.id}`}
    >
      <div className="p-6 bg-neutral-100 rounded-lg">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-primary" data-testid={`comment-author-${comment.id}`}>
              {comment.author}
            </p>
            <p className="text-sm text-secondary" data-testid={`comment-date-${comment.id}`}>
              {formattedDate}
            </p>
          </div>
          <div className="flex items-center gap-1" data-testid={`comment-likes-${comment.id}`}>
            <button
              onClick={() => onLike(comment.id)}
              className="text-lg hover:scale-110 transition-transform"
              data-testid={`comment-like-button-${comment.id}`}
            >
              👍
            </button>
            <span className="text-sm text-secondary">{comment.likes}</span>
          </div>
        </div>

        {/* Comment Content */}
        <p className="text-primary mb-4" data-testid={`comment-content-${comment.id}`}>
          {comment.content}
        </p>

        {/* Approval Status */}
        {!comment.isApproved && (
          <div
            className="mb-4 p-2 bg-warning/10 border border-warning text-warning text-sm rounded"
            data-testid={`comment-pending-${comment.id}`}
          >
            This comment is awaiting moderation
          </div>
        )}

        {/* Reply Button */}
        {canReply && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-primary hover:text-primary-600 font-medium"
            data-testid={`reply-button-${comment.id}`}
          >
            {showReplyForm ? 'Cancel' : 'Reply'}
          </button>
        )}

        {/* Reply Form */}
        {showReplyForm && canReply && (
          <form
            onSubmit={(e) => {
              onReplySubmit(e, comment.id);
              setShowReplyForm(false);
            }}
            className="mt-4 p-4 bg-light rounded border border-border-light"
            data-testid={`reply-form-${comment.id}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                name="author"
                placeholder="Your Name"
                value={replyForm.author}
                onChange={onReplyChange}
                className="px-3 py-2 input rounded text-sm focus:outline-none transition-colors"
                data-testid={`reply-author-input-${comment.id}`}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={replyForm.email}
                onChange={onReplyChange}
                className="px-3 py-2 input rounded text-sm focus:outline-none transition-colors"
                data-testid={`reply-email-input-${comment.id}`}
              />
            </div>

            <textarea
              name="content"
              placeholder="Your reply..."
              value={replyForm.content}
              onChange={onReplyChange}
              rows={3}
              className="w-full px-3 py-2 input rounded text-sm focus:outline-none transition-colors mb-3"
              data-testid={`reply-content-input-${comment.id}`}
            />

            <button
              type="submit"
              className="px-4 py-2 btn-primary text-sm rounded hover:bg-primary-600 transition-colors"
              data-testid={`reply-submit-button-${comment.id}`}
            >
              Post Reply
            </button>
          </form>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-4" data-testid={`replies-${comment.id}`}>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              maxDepth={maxDepth}
              onLike={onLike}
              onReply={onReply}
              replyingTo={replyingTo}
              replyForm={replyForm}
              onReplyChange={onReplyChange}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSystem;
