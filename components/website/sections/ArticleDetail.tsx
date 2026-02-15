'use client';

import React, { useState } from 'react';
import type { Article, Comment } from '@/types/website';

interface ArticleDetailProps {
  article: Article;
  relatedArticles?: Article[];
  comments?: Comment[];
  onCommentSubmit?: (comment: { author: string; email: string; content: string }) => void;
  onRelatedArticleClick?: (articleId: string) => void;
  className?: string;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  relatedArticles = [],
  comments = [],
  onCommentSubmit,
  onRelatedArticleClick,
  className = '',
}) => {
  const [commentForm, setCommentForm] = useState({
    author: '',
    email: '',
    content: '',
  });
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  const formattedDate = new Date(article.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedUpdateDate = article.updateDate
    ? new Date(article.updateDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

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

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    setCommentSuccess(false);

    // Validate form
    if (!commentForm.author.trim()) {
      setCommentError('Please enter your name');
      return;
    }
    if (!commentForm.email.trim()) {
      setCommentError('Please enter your email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commentForm.email)) {
      setCommentError('Please enter a valid email address');
      return;
    }
    if (!commentForm.content.trim()) {
      setCommentError('Please enter your comment');
      return;
    }

    // Submit comment
    onCommentSubmit?.(commentForm);
    setCommentForm({ author: '', email: '', content: '' });
    setCommentSuccess(true);

    // Clear success message after 3 seconds
    setTimeout(() => setCommentSuccess(false), 3000);
  };

  return (
    <article
      className={`w-full py-12 md:py-16 lg:py-20 bg-white ${className}`}
      data-testid="article-detail"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <header className="mb-12" data-testid="article-header">
          {/* Category Badge */}
          <div className="mb-4">
            <span
              className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full"
              data-testid="article-category-badge"
            >
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            data-testid="article-title"
          >
            {article.title}
          </h1>

          {/* Meta Information */}
          <div
            className="flex flex-col md:flex-row md:items-center gap-4 text-gray-600 border-b pb-6"
            data-testid="article-meta"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold" data-testid="article-author">
                By {article.author}
              </span>
            </div>
            <div className="hidden md:block text-gray-400">•</div>
            <div data-testid="article-publish-date">
              Published on {formattedDate}
            </div>
            {formattedUpdateDate && (
              <>
                <div className="hidden md:block text-gray-400">•</div>
                <div data-testid="article-update-date">
                  Updated on {formattedUpdateDate}
                </div>
              </>
            )}
            <div className="hidden md:block text-gray-400">•</div>
            <div data-testid="article-reading-time">
              {article.readingTime} min read
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.thumbnail && (
          <div className="mb-12" data-testid="article-thumbnail-container">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-auto rounded-lg shadow-lg"
              data-testid="article-thumbnail"
            />
          </div>
        )}

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          data-testid="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-12 pb-12 border-b" data-testid="article-tags">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  data-testid={`tag-${tag}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="mb-12 pb-12 border-b" data-testid="share-section">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Share this article</h3>
          <div className="flex gap-4" data-testid="share-buttons">
            <ShareButton
              platform="facebook"
              label="Facebook"
              testId="share-facebook"
            />
            <ShareButton
              platform="twitter"
              label="Twitter"
              testId="share-twitter"
            />
            <ShareButton
              platform="linkedin"
              label="LinkedIn"
              testId="share-linkedin"
            />
            <ShareButton
              platform="email"
              label="Email"
              testId="share-email"
            />
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-12" data-testid="comments-section">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg" data-testid="comment-form">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a comment</h3>

            {commentError && (
              <div
                className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded"
                data-testid="comment-error"
              >
                {commentError}
              </div>
            )}

            {commentSuccess && (
              <div
                className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="comment-author-input"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={commentForm.email}
                  onChange={handleCommentChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="comment-email-input"
                />
              </div>

              <textarea
                name="content"
                placeholder="Your comment..."
                value={commentForm.content}
                onChange={handleCommentChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                data-testid="comment-content-input"
              />

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                data-testid="comment-submit-button"
              >
                Post Comment
              </button>
            </form>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-6" data-testid="comments-list">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600" data-testid="no-comments">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-12 border-t" data-testid="related-articles-section">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              data-testid="related-articles-grid"
            >
              {relatedArticles.map((relatedArticle) => (
                <RelatedArticleCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                  onClick={() => onRelatedArticleClick?.(relatedArticle.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

// ============================================================================
// Comment Item Component
// ============================================================================

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const formattedDate = new Date(comment.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="p-6 bg-gray-50 rounded-lg"
      data-testid={`comment-item-${comment.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900" data-testid={`comment-author-${comment.id}`}>
            {comment.author}
          </p>
          <p className="text-sm text-gray-600" data-testid={`comment-date-${comment.id}`}>
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-1" data-testid={`comment-likes-${comment.id}`}>
          <span className="text-sm text-gray-600">{comment.likes}</span>
          <span className="text-lg">👍</span>
        </div>
      </div>

      <p className="text-gray-700 mb-3" data-testid={`comment-content-${comment.id}`}>
        {comment.content}
      </p>

      {comment.replies.length > 0 && (
        <div className="mt-4 ml-4 space-y-4 border-l-2 border-gray-300 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Related Article Card Component
// ============================================================================

interface RelatedArticleCardProps {
  article: Article;
  onClick?: () => void;
}

const RelatedArticleCard: React.FC<RelatedArticleCardProps> = ({ article, onClick }) => {
  const formattedDate = new Date(article.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
      data-testid={`related-article-card-${article.id}`}
    >
      {article.thumbnail && (
        <div className="relative h-40 overflow-hidden bg-gray-200">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
            data-testid={`related-article-thumbnail-${article.id}`}
          />
        </div>
      )}

      <div className="p-4">
        <h3
          className="text-lg font-bold text-gray-900 mb-2 line-clamp-2"
          data-testid={`related-article-title-${article.id}`}
        >
          {article.title}
        </h3>

        <p
          className="text-gray-600 text-sm mb-3 line-clamp-2"
          data-testid={`related-article-excerpt-${article.id}`}
        >
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span data-testid={`related-article-date-${article.id}`}>{formattedDate}</span>
          <span data-testid={`related-article-reading-time-${article.id}`}>
            {article.readingTime} min
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Share Button Component
// ============================================================================

interface ShareButtonProps {
  platform: string;
  label: string;
  testId: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ platform, label, testId }) => {
  const handleShare = () => {
    // Share functionality would be implemented here
    console.log(`Sharing to ${platform}`);
  };

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
      data-testid={testId}
    >
      {label}
    </button>
  );
};

export default ArticleDetail;
