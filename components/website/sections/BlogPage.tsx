'use client';

import React, { useState, useMemo } from 'react';
import type { Article, BlogCategory, BlogFilter } from '@/types/website';

interface BlogPageProps {
  articles: Article[];
  categories: BlogCategory[];
  onArticleClick?: (articleId: string) => void;
  className?: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  articles,
  categories,
  onArticleClick,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  // Extract unique tags from articles
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    articles.forEach((article) => {
      article.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [articles]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let result = articles;

    // Filter by category
    if (selectedCategory) {
      result = result.filter((article) => article.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter((article) =>
        selectedTags.some((tag) => article.tags.includes(tag))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
      );
    }

    // Sort articles
    const sorted = [...result];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
    } else if (sortBy === 'popular') {
      sorted.sort((a, b) => b.commentCount - a.commentCount);
    }

    return sorted;
  }, [articles, selectedCategory, selectedTags, searchQuery, sortBy]);

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleArticleClick = (articleId: string) => {
    onArticleClick?.(articleId);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedTags.length > 0 || searchQuery.trim();

  return (
    <section
      className={`w-full py-12 md:py-16 lg:py-20 bg-light ${className}`}
      data-testid="blog-page"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Blog & Resources
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Explore our latest articles, insights, and industry news.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8" data-testid="search-bar">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 input rounded-lg focus:outline-none transition-colors"
            data-testid="search-input"
          />
        </div>

        {/* Filters Section */}
        <div className="mb-12 space-y-6" data-testid="filters-section">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div data-testid="category-filter">
              <h3 className="text-sm font-semibold text-primary mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter(null)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'btn-primary'
                      : 'bg-neutral-100 text-primary hover:bg-neutral-200'
                  }`}
                  data-testid="category-all"
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'btn-primary'
                        : 'bg-neutral-100 text-primary hover:bg-neutral-200'
                    }`}
                    data-testid={`category-${category.id}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div data-testid="tags-filter">
              <h3 className="text-sm font-semibold text-primary mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'btn-primary'
                        : 'bg-neutral-100 text-primary hover:bg-neutral-200'
                    }`}
                    data-testid={`tag-${tag}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort and Clear Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div data-testid="sort-controls">
              <label htmlFor="sort" className="text-sm font-semibold text-primary mr-2">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
                className="px-3 py-1 input rounded border focus:outline-none transition-colors"
                data-testid="sort-select"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-primary hover:text-primary-600 font-medium"
                data-testid="clear-filters"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6 text-sm text-secondary" data-testid="results-counter">
          Showing {filteredArticles.length} of {articles.length} articles
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-testid="articles-grid"
          >
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => handleArticleClick(article.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" data-testid="empty-state">
            <p className="text-secondary text-lg">
              No articles found matching your criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 text-primary hover:text-primary-600 font-medium"
                data-testid="empty-clear-filters"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================================================
// Article Card Component
// ============================================================================

interface ArticleCardProps {
  article: Article;
  onClick?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const formattedDate = new Date(article.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="blog-card rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
      data-testid={`article-card-${article.id}`}
    >
      {/* Thumbnail */}
      {article.thumbnail && (
        <div className="relative h-48 overflow-hidden bg-neutral-200">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
            data-testid={`article-thumbnail-${article.id}`}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="mb-3">
          <span
            className="blog-tag text-xs font-semibold rounded-full px-3 py-1"
            data-testid={`article-category-${article.id}`}
          >
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h3
          className="blog-title text-xl font-bold mb-2 line-clamp-2"
          data-testid={`article-title-${article.id}`}
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        <p
          className="blog-excerpt text-sm mb-4 line-clamp-3"
          data-testid={`article-excerpt-${article.id}`}
        >
          {article.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-secondary mb-4">
          <span data-testid={`article-author-${article.id}`}>{article.author}</span>
          <span className="blog-date" data-testid={`article-date-${article.id}`}>{formattedDate}</span>
        </div>

        {/* Reading Time and Comments */}
        <div className="flex items-center justify-between text-xs text-secondary border-t border-border-light pt-4">
          <span data-testid={`article-reading-time-${article.id}`}>
            {article.readingTime} min read
          </span>
          <span data-testid={`article-comments-${article.id}`}>
            {article.commentCount} comments
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
