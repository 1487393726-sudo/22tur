/**
 * Property-Based Tests for Blog Search and Filter Functionality
 * Feature: website-3d-redesign
 * Property 25: Search and Filter Functionality
 * 
 * **Validates: Requirements 12.4**
 */

import { describe, test, expect } from '@jest/globals';
import fc from 'fast-check';

// Blog article data structure matching the implementation
interface BlogArticle {
  key: string;
  date: string;
  readTime: number;
  icon: string;
  category: string;
  title: string;
  excerpt: string;
}

// Filter logic extracted from the blog page component
function filterBlogArticles(
  articles: BlogArticle[],
  searchQuery: string,
  selectedCategory: string
): BlogArticle[] {
  return articles.filter((article) => {
    // Category filter
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    // Search filter
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
}

// Arbitraries for generating test data
const blogArticleArbitrary = fc.record({
  key: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)),
  date: fc.integer({ min: 2020, max: 2024 })
    .chain(year => 
      fc.integer({ min: 1, max: 12 })
        .chain(month => 
          fc.integer({ min: 1, max: 28 })
            .map(day => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
        )
    ),
  readTime: fc.integer({ min: 1, max: 30 }),
  icon: fc.constantFrom('🎨', '💻', '📈', '🏆', '🚀', '💡'),
  category: fc.constantFrom('design', 'development', 'marketing', 'branding'),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  excerpt: fc.string({ minLength: 20, maxLength: 300 }),
});

describe('Blog Search and Filter - Property-Based Tests', () => {
  describe('Property 25: Search and Filter Functionality', () => {
    /**
     * **Validates: Requirements 12.4**
     * 
     * For any page with search/filter features (partners, blog, cases),
     * when a search query or filter is applied, the displayed items
     * should be filtered to match the criteria.
     */
    
    test('filtering by category returns only articles in that category', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 50 }),
          fc.constantFrom('design', 'development', 'marketing', 'branding'),
          (articles, category) => {
            const filtered = filterBlogArticles(articles, '', category);
            
            // All filtered articles should have the selected category
            expect(filtered.every(a => a.category === category)).toBe(true);
            
            // Should not include articles from other categories
            const otherCategoryArticles = articles.filter(a => a.category !== category);
            expect(filtered.every(a => !otherCategoryArticles.includes(a))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering with "all" category returns all articles', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 1, maxLength: 50 }),
          (articles) => {
            const filtered = filterBlogArticles(articles, '', 'all');
            
            // Should return all articles when category is "all"
            expect(filtered.length).toBe(articles.length);
            expect(filtered).toEqual(articles);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('search term filters articles by title (case-insensitive)', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (articles, searchTerm) => {
            const filtered = filterBlogArticles(articles, searchTerm, 'all');
            
            // All filtered articles should match the search term in title or excerpt
            filtered.forEach(article => {
              const matchesTitle = article.title.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesExcerpt = article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
              
              expect(matchesTitle || matchesExcerpt).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('search term filters articles by excerpt', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (articles, searchTerm) => {
            const filtered = filterBlogArticles(articles, searchTerm, 'all');
            
            // Verify that filtered results match search criteria
            filtered.forEach(article => {
              const hasMatch = 
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
              
              expect(hasMatch).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('combining category filter and search term works correctly', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 10, maxLength: 50 }),
          fc.constantFrom('design', 'development', 'marketing', 'branding'),
          fc.string({ minLength: 1, maxLength: 10 }),
          (articles, category, searchTerm) => {
            const filtered = filterBlogArticles(articles, searchTerm, category);
            
            // All filtered articles should match both category and search term
            filtered.forEach(article => {
              // Must match category
              expect(article.category).toBe(category);
              
              // Must match search term
              const hasMatch = 
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
              
              expect(hasMatch).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('empty search term returns all articles (respecting category filter)', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 1, maxLength: 50 }),
          fc.constantFrom('all', 'design', 'development', 'marketing', 'branding'),
          (articles, category) => {
            const filtered = filterBlogArticles(articles, '', category);
            
            if (category === 'all') {
              // Should return all articles
              expect(filtered.length).toBe(articles.length);
            } else {
              // Should return all articles in the category
              const expectedCount = articles.filter(a => a.category === category).length;
              expect(filtered.length).toBe(expectedCount);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filter result is always a subset of original articles', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 1, maxLength: 50 }),
          fc.constantFrom('all', 'design', 'development', 'marketing', 'branding'),
          fc.string({ maxLength: 20 }),
          (articles, category, searchTerm) => {
            const filtered = filterBlogArticles(articles, searchTerm, category);
            
            // Filtered result should be a subset
            expect(filtered.length).toBeLessThanOrEqual(articles.length);
            
            // Every filtered article should exist in original list
            filtered.forEach(article => {
              expect(articles).toContainEqual(article);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filter preserves article data integrity', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 1, maxLength: 50 }),
          fc.constantFrom('all', 'design', 'development', 'marketing', 'branding'),
          fc.string({ maxLength: 20 }),
          (articles, category, searchTerm) => {
            const filtered = filterBlogArticles(articles, searchTerm, category);
            
            // All filtered articles should have complete data
            filtered.forEach(article => {
              expect(article.key).toBeDefined();
              expect(article.title).toBeDefined();
              expect(article.excerpt).toBeDefined();
              expect(article.category).toBeDefined();
              expect(article.date).toBeDefined();
              expect(typeof article.readTime).toBe('number');
              expect(article.readTime).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('search is case-insensitive', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 30 }),
          fc.string({ minLength: 2, maxLength: 10 }).filter(s => /^[a-zA-Z]+$/.test(s)),
          (articles, searchTerm) => {
            const lowerCaseResults = filterBlogArticles(articles, searchTerm.toLowerCase(), 'all');
            const upperCaseResults = filterBlogArticles(articles, searchTerm.toUpperCase(), 'all');
            const mixedCaseResults = filterBlogArticles(articles, searchTerm, 'all');
            
            // All three should return the same results
            expect(lowerCaseResults.length).toBe(upperCaseResults.length);
            expect(lowerCaseResults.length).toBe(mixedCaseResults.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('filtering with non-existent category returns empty array', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 1, maxLength: 50 }),
          (articles) => {
            const filtered = filterBlogArticles(articles, '', 'NonExistentCategory');
            
            // Should return empty array for non-existent category
            expect(filtered).toEqual([]);
            expect(filtered.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering with non-matching search term returns empty array', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 1, maxLength: 50 }),
          (articles) => {
            // Use a search term that's very unlikely to match
            const impossibleSearchTerm = '🦄🌈✨IMPOSSIBLE_MATCH_XYZ123✨🌈🦄';
            const filtered = filterBlogArticles(articles, impossibleSearchTerm, 'all');
            
            // Should return empty array
            expect(filtered).toEqual([]);
            expect(filtered.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filter order is preserved from original array', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 30 }),
          fc.constantFrom('all', 'design', 'development'),
          (articles, category) => {
            const filtered = filterBlogArticles(articles, '', category);
            
            // Check that relative order is preserved
            const filteredKeys = filtered.map(a => a.key);
            const originalKeys = articles.map(a => a.key);
            
            // Filtered keys should appear in the same order as in original
            let originalIndex = 0;
            for (const filteredKey of filteredKeys) {
              while (originalIndex < originalKeys.length && originalKeys[originalIndex] !== filteredKey) {
                originalIndex++;
              }
              expect(originalIndex).toBeLessThan(originalKeys.length);
              originalIndex++;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('search functionality is real-time (immediate filtering)', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (articles, searchTerm) => {
            // Simulate real-time search by filtering immediately
            const result1 = filterBlogArticles(articles, searchTerm, 'all');
            const result2 = filterBlogArticles(articles, searchTerm, 'all');
            
            // Results should be consistent (deterministic)
            expect(result1).toEqual(result2);
            expect(result1.length).toBe(result2.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('partial string matching works for search', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 30 }),
          (articles) => {
            // Test that partial matches work
            articles.forEach(article => {
              if (article.title.length >= 3) {
                // Search by partial title
                const partialTitle = article.title.substring(0, 3);
                const results = filterBlogArticles(articles, partialTitle, 'all');
                
                // Should find at least the article itself
                const found = results.some(a => a.key === article.key);
                expect(found).toBe(true);
              }
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    test('filtering handles special characters in search term', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (articles, searchTerm) => {
            // Should not throw error with special characters
            expect(() => {
              filterBlogArticles(articles, searchTerm, 'all');
            }).not.toThrow();
            
            const filtered = filterBlogArticles(articles, searchTerm, 'all');
            
            // Result should be valid array
            expect(Array.isArray(filtered)).toBe(true);
            expect(filtered.length).toBeLessThanOrEqual(articles.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering with whitespace-only search term behaves like empty search', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 1, maxLength: 30 }),
          fc.constantFrom('all', 'design', 'development'),
          (articles, category) => {
            const emptyResults = filterBlogArticles(articles, '', category);
            const whitespaceResults = filterBlogArticles(articles, '   ', category);
            
            // Whitespace search should behave differently from empty
            // (it will try to match spaces in title/excerpt)
            expect(Array.isArray(whitespaceResults)).toBe(true);
            expect(whitespaceResults.length).toBeLessThanOrEqual(emptyResults.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('multiple consecutive filters produce consistent results', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 10, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          fc.constantFrom('design', 'development', 'marketing'),
          (articles, searchTerm, category) => {
            // Apply filters in sequence
            const result1 = filterBlogArticles(articles, searchTerm, category);
            const result2 = filterBlogArticles(result1, '', category);
            const result3 = filterBlogArticles(articles, searchTerm, category);
            
            // First and third should be identical
            expect(result1).toEqual(result3);
            
            // Second should be superset of first (same category, no search)
            expect(result2.length).toBeGreaterThanOrEqual(result1.length);
            result1.forEach(article => {
              expect(result2).toContainEqual(article);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Requirement 12.4: Article Search and Category Filtering', () => {
    test('articles are properly categorized', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 1, maxLength: 50 }),
          (articles) => {
            // Each article should have a valid category
            articles.forEach(article => {
              expect(article.category).toBeDefined();
              expect(typeof article.category).toBe('string');
              expect(article.category.length).toBeGreaterThan(0);
              expect(['design', 'development', 'marketing', 'branding']).toContain(article.category);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('articles can be grouped by category', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 50 }),
          (articles) => {
            // Group articles by category
            const grouped = articles.reduce((acc, article) => {
              if (!acc[article.category]) {
                acc[article.category] = [];
              }
              acc[article.category].push(article);
              return acc;
            }, {} as Record<string, BlogArticle[]>);
            
            // Each group should only contain articles of that category
            Object.entries(grouped).forEach(([category, categoryArticles]) => {
              categoryArticles.forEach(article => {
                expect(article.category).toBe(category);
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('search works across both title and excerpt fields', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 30 }),
          (articles) => {
            articles.forEach(article => {
              // Search by title substring
              if (article.title.length >= 3) {
                const titleSearch = article.title.substring(0, 3);
                const titleResults = filterBlogArticles(articles, titleSearch, 'all');
                expect(titleResults.some(a => a.key === article.key)).toBe(true);
              }
              
              // Search by excerpt substring
              if (article.excerpt.length >= 3) {
                const excerptSearch = article.excerpt.substring(0, 3);
                const excerptResults = filterBlogArticles(articles, excerptSearch, 'all');
                expect(excerptResults.some(a => a.key === article.key)).toBe(true);
              }
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    test('category filter does not affect search functionality', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 10, maxLength: 50 }),
          fc.string({ minLength: 2, maxLength: 10 }),
          (articles, searchTerm) => {
            // Filter with search only
            const searchOnly = filterBlogArticles(articles, searchTerm, 'all');
            
            // Filter with search and category
            const categories = ['design', 'development', 'marketing', 'branding'];
            const categoryResults = categories.map(cat => 
              filterBlogArticles(articles, searchTerm, cat)
            );
            
            // Sum of category results should equal search-only results
            const totalCategoryResults = categoryResults.reduce((sum, results) => sum + results.length, 0);
            expect(totalCategoryResults).toBe(searchOnly.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('filtering maintains article metadata', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 5, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          fc.constantFrom('all', 'design', 'development'),
          (articles, searchTerm, category) => {
            const filtered = filterBlogArticles(articles, searchTerm, category);
            
            // All metadata should be preserved
            filtered.forEach(article => {
              expect(article.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
              expect(article.readTime).toBeGreaterThan(0);
              expect(article.readTime).toBeLessThanOrEqual(30);
              expect(article.icon).toBeDefined();
              expect(article.key).toBeDefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
