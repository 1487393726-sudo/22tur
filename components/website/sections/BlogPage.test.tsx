import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BlogPage } from './BlogPage';
import type { Article, BlogCategory } from '@/types/website';

// Mock data
const mockCategories: BlogCategory[] = [
  { id: 'tech', name: 'Technology', description: 'Tech articles' },
  { id: 'business', name: 'Business', description: 'Business articles' },
  { id: 'design', name: 'Design', description: 'Design articles' },
];

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Getting Started with React',
    excerpt: 'Learn the basics of React development',
    content: 'Full content about React',
    author: 'John Doe',
    publishDate: new Date('2024-01-15'),
    category: 'tech',
    tags: ['react', 'javascript'],
    thumbnail: 'https://example.com/react.jpg',
    readingTime: 5,
    commentCount: 3,
  },
  {
    id: '2',
    title: 'Business Growth Strategies',
    excerpt: 'Effective strategies for business growth',
    content: 'Full content about business',
    author: 'Jane Smith',
    publishDate: new Date('2024-01-10'),
    category: 'business',
    tags: ['business', 'strategy'],
    thumbnail: 'https://example.com/business.jpg',
    readingTime: 8,
    commentCount: 5,
  },
  {
    id: '3',
    title: 'Modern Design Trends',
    excerpt: 'Latest trends in web design',
    content: 'Full content about design',
    author: 'Mike Johnson',
    publishDate: new Date('2024-01-05'),
    category: 'design',
    tags: ['design', 'ui', 'ux'],
    thumbnail: 'https://example.com/design.jpg',
    readingTime: 6,
    commentCount: 2,
  },
  {
    id: '4',
    title: 'Advanced React Patterns',
    excerpt: 'Deep dive into React patterns',
    content: 'Full content about advanced React',
    author: 'John Doe',
    publishDate: new Date('2024-01-01'),
    category: 'tech',
    tags: ['react', 'patterns'],
    thumbnail: 'https://example.com/react-advanced.jpg',
    readingTime: 10,
    commentCount: 7,
  },
];

describe('BlogPage Component', () => {
  describe('Rendering', () => {
    it('should render the blog page section', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      expect(screen.getByTestId('blog-page')).toBeInTheDocument();
    });

    it('should render the page header with title and description', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      expect(screen.getByText('Blog & Resources')).toBeInTheDocument();
      expect(screen.getByText(/Explore our latest articles/)).toBeInTheDocument();
    });

    it('should render the search bar', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search articles...')).toBeInTheDocument();
    });

    it('should render all articles in grid', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      mockArticles.forEach((article) => {
        expect(screen.getByTestId(`article-card-${article.id}`)).toBeInTheDocument();
      });
    });

    it('should render article cards with all required information', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const firstArticle = mockArticles[0];
      expect(screen.getByTestId(`article-title-${firstArticle.id}`)).toHaveTextContent(
        firstArticle.title
      );
      expect(screen.getByTestId(`article-excerpt-${firstArticle.id}`)).toHaveTextContent(
        firstArticle.excerpt
      );
      expect(screen.getByTestId(`article-author-${firstArticle.id}`)).toHaveTextContent(
        firstArticle.author
      );
    });

    it('should render results counter', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      expect(screen.getByTestId('results-counter')).toHaveTextContent(
        `Showing ${mockArticles.length} of ${mockArticles.length} articles`
      );
    });
  });

  describe('Category Filtering', () => {
    it('should render all category filter buttons', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      expect(screen.getByTestId('category-all')).toBeInTheDocument();
      mockCategories.forEach((category) => {
        expect(screen.getByTestId(`category-${category.id}`)).toBeInTheDocument();
      });
    });

    it('should filter articles by category when category button is clicked', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const techButton = screen.getByTestId('category-tech');
      fireEvent.click(techButton);

      // Should show only tech articles
      expect(screen.getByTestId('article-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-card-4')).toBeInTheDocument();
      expect(screen.queryByTestId('article-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('article-card-3')).not.toBeInTheDocument();
    });

    it('should show all articles when "All" category is selected', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const techButton = screen.getByTestId('category-tech');
      fireEvent.click(techButton);
      const allButton = screen.getByTestId('category-all');
      fireEvent.click(allButton);

      mockArticles.forEach((article) => {
        expect(screen.getByTestId(`article-card-${article.id}`)).toBeInTheDocument();
      });
    });

    it('should highlight selected category button', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const techButton = screen.getByTestId('category-tech');
      fireEvent.click(techButton);

      expect(techButton).toHaveClass('bg-blue-600', 'text-white');
      expect(screen.getByTestId('category-business')).not.toHaveClass('bg-blue-600');
    });
  });

  describe('Tag Filtering', () => {
    it('should render all unique tags', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const uniqueTags = new Set(mockArticles.flatMap((a) => a.tags));
      uniqueTags.forEach((tag) => {
        expect(screen.getByTestId(`tag-${tag}`)).toBeInTheDocument();
      });
    });

    it('should filter articles by tag when tag button is clicked', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const reactTag = screen.getByTestId('tag-react');
      fireEvent.click(reactTag);

      // Should show articles with react tag
      expect(screen.getByTestId('article-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-card-4')).toBeInTheDocument();
      expect(screen.queryByTestId('article-card-2')).not.toBeInTheDocument();
    });

    it('should support multiple tag selection', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const reactTag = screen.getByTestId('tag-react');
      const designTag = screen.getByTestId('tag-design');

      fireEvent.click(reactTag);
      fireEvent.click(designTag);

      // Should show articles with either react or design tag
      expect(screen.getByTestId('article-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('article-card-4')).toBeInTheDocument();
    });

    it('should toggle tag selection on click', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const reactTag = screen.getByTestId('tag-react');

      fireEvent.click(reactTag);
      expect(reactTag).toHaveClass('bg-blue-600');

      fireEvent.click(reactTag);
      expect(reactTag).not.toHaveClass('bg-blue-600');
    });
  });

  describe('Search Functionality', () => {
    it('should filter articles by search query in title', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const searchInput = screen.getByTestId('search-input');

      fireEvent.change(searchInput, { target: { value: 'React' } });

      expect(screen.getByTestId('article-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-card-4')).toBeInTheDocument();
      expect(screen.queryByTestId('article-card-2')).not.toBeInTheDocument();
    });

    it('should filter articles by search query in excerpt', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const searchInput = screen.getByTestId('search-input');

      fireEvent.change(searchInput, { target: { value: 'strategies' } });

      expect(screen.getByTestId('article-card-2')).toBeInTheDocument();
      expect(screen.queryByTestId('article-card-1')).not.toBeInTheDocument();
    });

    it('should be case-insensitive', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const searchInput = screen.getByTestId('search-input');

      fireEvent.change(searchInput, { target: { value: 'REACT' } });

      expect(screen.getByTestId('article-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-card-4')).toBeInTheDocument();
    });

    it('should show no results when search matches nothing', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const searchInput = screen.getByTestId('search-input');

      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText(/No articles found/)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should render sort select dropdown', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      expect(screen.getByTestId('sort-select')).toBeInTheDocument();
    });

    it('should sort articles by newest by default', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const cards = screen.getAllByTestId(/article-card-/);
      // Article 1 (Jan 15) should be first
      expect(cards[0]).toHaveAttribute('data-testid', 'article-card-1');
    });

    it('should sort articles by oldest when selected', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const sortSelect = screen.getByTestId('sort-select');

      fireEvent.change(sortSelect, { target: { value: 'oldest' } });

      const cards = screen.getAllByTestId(/article-card-/);
      // Article 4 (Jan 1) should be first
      expect(cards[0]).toHaveAttribute('data-testid', 'article-card-4');
    });

    it('should sort articles by popularity when selected', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const sortSelect = screen.getByTestId('sort-select');

      fireEvent.change(sortSelect, { target: { value: 'popular' } });

      const cards = screen.getAllByTestId(/article-card-/);
      // Article 4 has 7 comments (most popular)
      expect(cards[0]).toHaveAttribute('data-testid', 'article-card-4');
    });
  });

  describe('Clear Filters', () => {
    it('should show clear filters button when filters are active', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const searchInput = screen.getByTestId('search-input');

      fireEvent.change(searchInput, { target: { value: 'React' } });

      expect(screen.getByTestId('clear-filters')).toBeInTheDocument();
    });

    it('should not show clear filters button when no filters are active', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      expect(screen.queryByTestId('clear-filters')).not.toBeInTheDocument();
    });

    it('should clear all filters when clear button is clicked', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const searchInput = screen.getByTestId('search-input');
      const categoryButton = screen.getByTestId('category-tech');

      fireEvent.change(searchInput, { target: { value: 'React' } });
      fireEvent.click(categoryButton);

      const clearButton = screen.getByTestId('clear-filters');
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(screen.getByTestId('results-counter')).toHaveTextContent(
        `Showing ${mockArticles.length} of ${mockArticles.length}`
      );
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no articles are provided', () => {
      render(<BlogPage articles={[]} categories={mockCategories} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText(/No articles found/)).toBeInTheDocument();
    });

    it('should show empty state when filters result in no articles', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const searchInput = screen.getByTestId('search-input');

      fireEvent.change(searchInput, { target: { value: 'xyz123' } });

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should show clear filters button in empty state', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const searchInput = screen.getByTestId('search-input');

      fireEvent.change(searchInput, { target: { value: 'xyz123' } });

      expect(screen.getByTestId('empty-clear-filters')).toBeInTheDocument();
    });
  });

  describe('Article Card Interactions', () => {
    it('should call onArticleClick when article card is clicked', () => {
      const onArticleClick = jest.fn();
      render(
        <BlogPage
          articles={mockArticles}
          categories={mockCategories}
          onArticleClick={onArticleClick}
        />
      );

      const articleCard = screen.getByTestId('article-card-1');
      fireEvent.click(articleCard);

      expect(onArticleClick).toHaveBeenCalledWith('1');
    });

    it('should display article thumbnail', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const thumbnail = screen.getByTestId('article-thumbnail-1');
      expect(thumbnail).toHaveAttribute('src', mockArticles[0].thumbnail);
      expect(thumbnail).toHaveAttribute('alt', mockArticles[0].title);
    });

    it('should display reading time', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      expect(screen.getByTestId('article-reading-time-1')).toHaveTextContent('5 min read');
    });

    it('should display comment count', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      expect(screen.getByTestId('article-comments-1')).toHaveTextContent('3 comments');
    });
  });

  describe('Responsive Design', () => {
    it('should render articles grid with responsive classes', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const grid = screen.getByTestId('articles-grid');
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should render category filter with flex wrap', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const filter = screen.getByTestId('category-filter');
      expect(filter.querySelector('.flex')).toHaveClass('flex-wrap');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Blog & Resources');
    });

    it('should have proper form labels', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const sortLabel = screen.getByText('Sort by:');
      expect(sortLabel).toBeInTheDocument();
    });

    it('should have proper alt text for images', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const thumbnail = screen.getByTestId('article-thumbnail-1');
      expect(thumbnail).toHaveAttribute('alt', mockArticles[0].title);
    });

    it('should have proper button roles', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Combined Filters', () => {
    it('should apply category and tag filters together', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);

      const techCategory = screen.getByTestId('category-tech');
      const reactTag = screen.getByTestId('tag-react');

      fireEvent.click(techCategory);
      fireEvent.click(reactTag);

      // Should show tech articles with react tag
      expect(screen.getByTestId('article-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-card-4')).toBeInTheDocument();
      expect(screen.queryByTestId('article-card-2')).not.toBeInTheDocument();
    });

    it('should apply search and category filters together', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);

      const searchInput = screen.getByTestId('search-input');
      const techCategory = screen.getByTestId('category-tech');

      fireEvent.change(searchInput, { target: { value: 'Advanced' } });
      fireEvent.click(techCategory);

      // Should show only article 4 (Advanced React Patterns in tech category)
      expect(screen.getByTestId('article-card-4')).toBeInTheDocument();
      expect(screen.queryByTestId('article-card-1')).not.toBeInTheDocument();
    });

    it('should update results counter with combined filters', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);

      const techCategory = screen.getByTestId('category-tech');
      fireEvent.click(techCategory);

      expect(screen.getByTestId('results-counter')).toHaveTextContent('Showing 2 of 4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle articles with no thumbnail', () => {
      const articlesNoThumbnail = [
        {
          ...mockArticles[0],
          thumbnail: '',
        },
      ];

      render(
        <BlogPage articles={articlesNoThumbnail} categories={mockCategories} />
      );

      const card = screen.getByTestId('article-card-1');
      expect(card).toBeInTheDocument();
    });

    it('should handle articles with no tags', () => {
      const articlesNoTags = [
        {
          ...mockArticles[0],
          tags: [],
        },
      ];

      render(
        <BlogPage articles={articlesNoTags} categories={mockCategories} />
      );

      expect(screen.getByTestId('article-card-1')).toBeInTheDocument();
    });

    it('should handle empty categories list', () => {
      render(<BlogPage articles={mockArticles} categories={[]} />);
      expect(screen.getByTestId('blog-page')).toBeInTheDocument();
      expect(screen.queryByTestId('category-filter')).not.toBeInTheDocument();
    });

    it('should handle very long article titles', () => {
      const longTitleArticle = [
        {
          ...mockArticles[0],
          title: 'This is a very long article title that should be truncated properly in the card display to avoid layout issues',
        },
      ];

      render(
        <BlogPage articles={longTitleArticle} categories={mockCategories} />
      );

      const title = screen.getByTestId('article-title-1');
      expect(title).toHaveClass('line-clamp-2');
    });
  });

  describe('Data Formatting', () => {
    it('should format dates correctly', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const dateElement = screen.getByTestId('article-date-1');
      expect(dateElement).toHaveTextContent('January 15, 2024');
    });

    it('should display category badge', () => {
      render(<BlogPage articles={mockArticles} categories={mockCategories} />);
      const categoryBadge = screen.getByTestId('article-category-1');
      expect(categoryBadge).toHaveTextContent('tech');
    });
  });
});
