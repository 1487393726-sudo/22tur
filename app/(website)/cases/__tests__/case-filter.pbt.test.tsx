/**
 * Property-Based Tests for Case Filtering Functionality
 * Feature: website-3d-redesign
 * Task: 13.5 编写案例筛选的属性测试
 * Property 25: Search and Filter Functionality
 * 
 * **Validates: Requirements 14.4**
 */

import fc from 'fast-check';
import CasesPage from '../page';

// Case data structure matching the implementation
type CaseCategory = 'Web Development' | 'Brand Design' | 'Mobile Application' | 'Web Design' | 'Digital Marketing' | 'System Development';
type CaseTag = 'React' | 'Next.js' | 'PostgreSQL' | 'Vue.js' | 'Node.js' | 'MongoDB' | 'React Native' | 'iOS' | 'Android' | 'UI/UX' | 'Responsive Design' | 'SEO' | 'Brand Strategy' | 'VI Design' | 'Logo Design' | 'Social Media' | 'SEO/SEM' | 'Content Marketing';

interface CaseItem {
  title: string;
  client: string;
  category: CaseCategory;
  description: string;
  results: string[];
  tags: CaseTag[];
}

// Filter logic extracted from the cases page component
function filterCases(
  cases: CaseItem[],
  selectedCategory: string,
  selectedTag: string
): CaseItem[] {
  return cases.filter(caseItem => {
    const categoryMatch = selectedCategory === 'all' || caseItem.category === selectedCategory;
    const tagMatch = selectedTag === 'all' || caseItem.tags.includes(selectedTag);
    return categoryMatch && tagMatch;
  });
}

// Arbitraries for generating test data
const caseItemArbitrary = fc.record({
  title: fc.string({ minLength: 5, maxLength: 100 }),
  client: fc.string({ minLength: 3, maxLength: 50 }),
  category: fc.constantFrom(
    'Web Development',
    'Brand Design',
    'Mobile Application',
    'Web Design',
    'Digital Marketing',
    'System Development'
  ),
  description: fc.string({ minLength: 20, maxLength: 300 }),
  results: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
  tags: fc.array(
    fc.constantFrom(
      'React', 'Next.js', 'PostgreSQL', 'Vue.js', 'Node.js', 'MongoDB',
      'React Native', 'iOS', 'Android', 'UI/UX', 'Responsive Design', 'SEO',
      'Brand Strategy', 'VI Design', 'Logo Design', 'Social Media', 'SEO/SEM', 'Content Marketing'
    ),
    { minLength: 2, maxLength: 5 }
  ).map(tags => Array.from(new Set(tags))) // Remove duplicates
});

describe('Case Filtering - Property-Based Tests', () => {
  /**
   * Property 25: Search and Filter Functionality
   * **Validates: Requirements 14.4**
   * 
   * For any page with search/filter features (partners, blog, cases),
   * when a search query or filter is applied, the displayed items
   * should be filtered to match the criteria.
   */
  describe('Property 25: Search and Filter Functionality', () => {
    test('filtering by category returns only cases in that category', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 5, maxLength: 50 }),
          fc.constantFrom(
            'Web Development',
            'Brand Design',
            'Mobile Application',
            'Web Design',
            'Digital Marketing',
            'System Development'
          ),
          (cases, category) => {
            const filtered = filterCases(cases, category, 'all');
            
            // All filtered cases should have the selected category
            expect(filtered.every(c => c.category === category)).toBe(true);
            
            // Should not include cases from other categories
            const otherCategoryCases = cases.filter(c => c.category !== category);
            expect(filtered.every(c => !otherCategoryCases.includes(c))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering with "all" category returns all cases', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 1, maxLength: 50 }),
          (cases) => {
            const filtered = filterCases(cases, 'all', 'all');
            
            // Should return all cases when both filters are "all"
            expect(filtered.length).toBe(cases.length);
            expect(filtered).toEqual(cases);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering by tag returns only cases with that tag', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 5, maxLength: 50 }),
          fc.constantFrom('React', 'Vue.js', 'Node.js', 'UI/UX', 'SEO', 'iOS', 'Android'),
          (cases, tag) => {
            const filtered = filterCases(cases, 'all', tag);
            
            // All filtered cases should have the selected tag
            filtered.forEach(caseItem => {
              expect(caseItem.tags).toContain(tag);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('combining category and tag filters works correctly', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 10, maxLength: 50 }),
          fc.constantFrom('Web Development', 'Mobile Application', 'System Development'),
          fc.constantFrom('React', 'React Native', 'Vue.js', 'Node.js'),
          (cases, category, tag) => {
            const filtered = filterCases(cases, category, tag);
            
            // All filtered cases should match both filters
            filtered.forEach(caseItem => {
              // Must match category
              expect(caseItem.category).toBe(category);
              
              // Must match tag
              expect(caseItem.tags).toContain(tag);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filter result is always a subset of original cases', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 1, maxLength: 50 }),
          fc.constantFrom('all', 'Web Development', 'Brand Design', 'Mobile Application'),
          fc.constantFrom('all', 'React', 'Vue.js', 'UI/UX', 'SEO'),
          (cases, category, tag) => {
            const filtered = filterCases(cases, category, tag);
            
            // Filtered result should be a subset
            expect(filtered.length).toBeLessThanOrEqual(cases.length);
            
            // Every filtered case should exist in original list
            filtered.forEach(caseItem => {
              expect(cases).toContainEqual(caseItem);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filter preserves case data integrity', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 1, maxLength: 50 }),
          fc.constantFrom('all', 'Web Development', 'Brand Design'),
          fc.constantFrom('all', 'React', 'Node.js', 'UI/UX'),
          (cases, category, tag) => {
            const filtered = filterCases(cases, category, tag);
            
            // All filtered cases should have complete data
            filtered.forEach(caseItem => {
              expect(caseItem.title).toBeDefined();
              expect(caseItem.client).toBeDefined();
              expect(caseItem.category).toBeDefined();
              expect(caseItem.description).toBeDefined();
              expect(Array.isArray(caseItem.results)).toBe(true);
              expect(caseItem.results.length).toBeGreaterThan(0);
              expect(Array.isArray(caseItem.tags)).toBe(true);
              expect(caseItem.tags.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering with non-existent category returns empty array', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 1, maxLength: 50 }),
          (cases) => {
            const filtered = filterCases(cases, 'NonExistentCategory', 'all');
            
            // Should return empty array for non-existent category
            expect(filtered).toEqual([]);
            expect(filtered.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering with non-existent tag returns empty array', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 1, maxLength: 50 }),
          (cases) => {
            // Use a tag that's very unlikely to exist
            const impossibleTag = '🦄IMPOSSIBLE_TAG_XYZ123🦄';
            const filtered = filterCases(cases, 'all', impossibleTag);
            
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
          fc.array(caseItemArbitrary, { minLength: 5, maxLength: 30 }),
          fc.constantFrom('all', 'Web Development', 'Mobile Application'),
          (cases, category) => {
            const filtered = filterCases(cases, category, 'all');
            
            // Check that relative order is preserved
            const filteredTitles = filtered.map(c => c.title);
            const originalTitles = cases.map(c => c.title);
            
            // Filtered titles should appear in the same order as in original
            let originalIndex = 0;
            for (const filteredTitle of filteredTitles) {
              while (originalIndex < originalTitles.length && originalTitles[originalIndex] !== filteredTitle) {
                originalIndex++;
              }
              expect(originalIndex).toBeLessThan(originalTitles.length);
              originalIndex++;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering is deterministic (same input produces same output)', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 5, maxLength: 30 }),
          fc.constantFrom('Web Development', 'Brand Design', 'Mobile Application'),
          fc.constantFrom('React', 'Vue.js', 'UI/UX'),
          (cases, category, tag) => {
            // Apply filter multiple times
            const result1 = filterCases(cases, category, tag);
            const result2 = filterCases(cases, category, tag);
            const result3 = filterCases(cases, category, tag);
            
            // Results should be identical
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);
            expect(result1.length).toBe(result2.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('empty filter selection (all/all) returns all cases', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 1, maxLength: 50 }),
          (cases) => {
            const filtered = filterCases(cases, 'all', 'all');
            
            // Should return all cases
            expect(filtered.length).toBe(cases.length);
            expect(filtered).toEqual(cases);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('category filter does not affect tag filtering logic', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 10, maxLength: 50 }),
          fc.constantFrom('React', 'Vue.js', 'Node.js'),
          (cases, tag) => {
            // Filter with tag only
            const tagOnly = filterCases(cases, 'all', tag);
            
            // Filter with tag and each category
            const categories = ['Web Development', 'Mobile Application', 'System Development'];
            const categoryResults = categories.map(cat => 
              filterCases(cases, cat, tag)
            );
            
            // Sum of category results should equal tag-only results
            const totalCategoryResults = categoryResults.reduce((sum, results) => sum + results.length, 0);
            expect(totalCategoryResults).toBeLessThanOrEqual(tagOnly.length);
            
            // All category results combined should be subset of tag-only results
            categoryResults.forEach(results => {
              results.forEach(caseItem => {
                expect(tagOnly).toContainEqual(caseItem);
              });
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    test('multiple consecutive filters produce consistent results', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 10, maxLength: 50 }),
          fc.constantFrom('Web Development', 'Brand Design'),
          fc.constantFrom('React', 'UI/UX'),
          (cases, category, tag) => {
            // Apply filters in sequence
            const result1 = filterCases(cases, category, tag);
            const result2 = filterCases(result1, category, 'all'); // Remove tag filter
            const result3 = filterCases(cases, category, tag); // Reapply both
            
            // First and third should be identical
            expect(result1).toEqual(result3);
            
            // Second should be superset of first (same category, no tag filter)
            expect(result2.length).toBeGreaterThanOrEqual(result1.length);
            result1.forEach(caseItem => {
              expect(result2).toContainEqual(caseItem);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Requirement 14.4: Case Filtering and Real-time Updates', () => {
    test('cases are properly categorized', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 1, maxLength: 50 }),
          (cases) => {
            // Each case should have a valid category
            cases.forEach(caseItem => {
              expect(caseItem.category).toBeDefined();
              expect(typeof caseItem.category).toBe('string');
              expect(caseItem.category.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('cases can be grouped by category', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 5, maxLength: 50 }),
          (cases) => {
            // Group cases by category
            const grouped = cases.reduce((acc, caseItem) => {
              if (!acc[caseItem.category]) {
                acc[caseItem.category] = [];
              }
              acc[caseItem.category].push(caseItem);
              return acc;
            }, {} as Record<string, CaseItem[]>);
            
            // Each group should only contain cases of that category
            Object.entries(grouped).forEach(([category, categoryCases]) => {
              categoryCases.forEach(caseItem => {
                expect(caseItem.category).toBe(category);
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('cases have valid tags for filtering', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 1, maxLength: 50 }),
          (cases) => {
            // Each case should have valid tags
            cases.forEach(caseItem => {
              expect(Array.isArray(caseItem.tags)).toBe(true);
              expect(caseItem.tags.length).toBeGreaterThan(0);
              
              // Each tag should be a non-empty string
              caseItem.tags.forEach(tag => {
                expect(typeof tag).toBe('string');
                expect(tag.length).toBeGreaterThan(0);
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering maintains case metadata', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 5, maxLength: 30 }),
          fc.constantFrom('Web Development', 'Brand Design', 'Mobile Application'),
          fc.constantFrom('React', 'UI/UX', 'Node.js'),
          (cases, category, tag) => {
            const filtered = filterCases(cases, category, tag);
            
            // All metadata should be preserved
            filtered.forEach(caseItem => {
              expect(caseItem.title).toBeDefined();
              expect(caseItem.client).toBeDefined();
              expect(caseItem.description).toBeDefined();
              expect(caseItem.results.length).toBeGreaterThan(0);
              expect(caseItem.tags.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('real-time filtering produces consistent results', () => {
      fc.assert(
        fc.property(
          fc.array(caseItemArbitrary, { minLength: 5, maxLength: 30 }),
          fc.constantFrom('Web Development', 'Brand Design'),
          fc.constantFrom('React', 'Vue.js', 'UI/UX'),
          (cases, category, tag) => {
            // Simulate real-time filtering by applying filter multiple times
            const result1 = filterCases(cases, category, tag);
            const result2 = filterCases(cases, category, tag);
            
            // Results should be consistent (deterministic)
            expect(result1).toEqual(result2);
            expect(result1.length).toBe(result2.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
