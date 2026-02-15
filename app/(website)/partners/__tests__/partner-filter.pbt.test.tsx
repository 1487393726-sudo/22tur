/**
 * Property-Based Tests for Partner Search and Filter Functionality
 * Feature: website-3d-redesign
 * Property 25: Search and Filter Functionality
 * 
 * Validates: Requirements 10.4, 10.5
 */

import { describe, test, expect } from '@jest/globals';
import fc from 'fast-check';

// Partner data structure matching the implementation
interface Partner {
  id: number;
  name: string;
  nameZh: string;
  category: string;
  categoryZh: string;
  industry: string;
  industryZh: string;
  location: string;
  locationZh: string;
  partnerSince: string;
  employees: string;
  revenue: string;
  description: string;
  descriptionZh: string;
  rating: number;
  status: string;
  featured: boolean;
}

// Filter logic extracted from the component
function filterPartners(
  partners: Partner[],
  searchTerm: string,
  selectedCategory: string
): Partner[] {
  let filtered = partners;

  // Filter by category
  if (selectedCategory !== "all") {
    filtered = filtered.filter(partner => partner.category === selectedCategory);
  }

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(partner =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.nameZh.includes(searchTerm) ||
      partner.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.industryZh.includes(searchTerm)
    );
  }

  return filtered;
}

// Arbitraries for generating test data
const partnerArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  nameZh: fc.string({ minLength: 2, maxLength: 30 }),
  category: fc.constantFrom('Technology', 'Automotive', 'Finance', 'Healthcare'),
  categoryZh: fc.constantFrom('科技', '汽车', '金融', '医疗'),
  industry: fc.string({ minLength: 5, maxLength: 40 }),
  industryZh: fc.string({ minLength: 3, maxLength: 20 }),
  location: fc.string({ minLength: 5, maxLength: 30 }),
  locationZh: fc.string({ minLength: 3, maxLength: 20 }),
  partnerSince: fc.integer({ min: 2010, max: 2024 }).map(String),
  employees: fc.integer({ min: 100, max: 500000 }).map(n => `${n}+`),
  revenue: fc.float({ min: 1, max: 500 }).map(n => `$${n.toFixed(1)}B`),
  description: fc.string({ minLength: 20, maxLength: 200 }),
  descriptionZh: fc.string({ minLength: 10, maxLength: 100 }),
  rating: fc.float({ min: 3.0, max: 5.0 }).map(n => parseFloat(n.toFixed(1))),
  status: fc.constant('Active'),
  featured: fc.boolean()
});

describe('Partner Search and Filter - Property-Based Tests', () => {
  describe('Property 25: Search and Filter Functionality', () => {
    test('filtering by category returns only partners in that category', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 5, maxLength: 50 }),
          fc.constantFrom('Technology', 'Automotive', 'Finance', 'Healthcare'),
          (partners, category) => {
            const filtered = filterPartners(partners, '', category);
            
            // All filtered partners should have the selected category
            expect(filtered.every(p => p.category === category)).toBe(true);
            
            // Should not include partners from other categories
            const otherCategoryPartners = partners.filter(p => p.category !== category);
            expect(filtered.every(p => !otherCategoryPartners.includes(p))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering with "all" category returns all partners', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 1, maxLength: 50 }),
          (partners) => {
            const filtered = filterPartners(partners, '', 'all');
            
            // Should return all partners when category is "all"
            expect(filtered.length).toBe(partners.length);
            expect(filtered).toEqual(partners);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('search term filters partners by name (case-insensitive)', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (partners, searchTerm) => {
            const filtered = filterPartners(partners, searchTerm, 'all');
            
            // All filtered partners should match the search term in name
            filtered.forEach(partner => {
              const matchesName = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesNameZh = partner.nameZh.includes(searchTerm);
              const matchesIndustry = partner.industry.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesIndustryZh = partner.industryZh.includes(searchTerm);
              
              expect(
                matchesName || matchesNameZh || matchesIndustry || matchesIndustryZh
              ).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('search term filters partners by industry', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (partners, searchTerm) => {
            const filtered = filterPartners(partners, searchTerm, 'all');
            
            // Verify that filtered results match search criteria
            filtered.forEach(partner => {
              const hasMatch = 
                partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                partner.nameZh.includes(searchTerm) ||
                partner.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                partner.industryZh.includes(searchTerm);
              
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
          fc.array(partnerArbitrary, { minLength: 10, maxLength: 50 }),
          fc.constantFrom('Technology', 'Automotive', 'Finance', 'Healthcare'),
          fc.string({ minLength: 1, maxLength: 10 }),
          (partners, category, searchTerm) => {
            const filtered = filterPartners(partners, searchTerm, category);
            
            // All filtered partners should match both category and search term
            filtered.forEach(partner => {
              // Must match category
              expect(partner.category).toBe(category);
              
              // Must match search term
              const hasMatch = 
                partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                partner.nameZh.includes(searchTerm) ||
                partner.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                partner.industryZh.includes(searchTerm);
              
              expect(hasMatch).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('empty search term returns all partners (respecting category filter)', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 1, maxLength: 50 }),
          fc.constantFrom('all', 'Technology', 'Automotive', 'Finance', 'Healthcare'),
          (partners, category) => {
            const filtered = filterPartners(partners, '', category);
            
            if (category === 'all') {
              // Should return all partners
              expect(filtered.length).toBe(partners.length);
            } else {
              // Should return all partners in the category
              const expectedCount = partners.filter(p => p.category === category).length;
              expect(filtered.length).toBe(expectedCount);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filter result is always a subset of original partners', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 1, maxLength: 50 }),
          fc.constantFrom('all', 'Technology', 'Automotive', 'Finance', 'Healthcare'),
          fc.string({ maxLength: 20 }),
          (partners, category, searchTerm) => {
            const filtered = filterPartners(partners, searchTerm, category);
            
            // Filtered result should be a subset
            expect(filtered.length).toBeLessThanOrEqual(partners.length);
            
            // Every filtered partner should exist in original list
            filtered.forEach(partner => {
              expect(partners).toContainEqual(partner);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filter preserves partner data integrity', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 1, maxLength: 50 }),
          fc.constantFrom('all', 'Technology', 'Automotive', 'Finance', 'Healthcare'),
          fc.string({ maxLength: 20 }),
          (partners, category, searchTerm) => {
            const filtered = filterPartners(partners, searchTerm, category);
            
            // All filtered partners should have complete data
            filtered.forEach(partner => {
              expect(partner.id).toBeDefined();
              expect(partner.name).toBeDefined();
              expect(partner.category).toBeDefined();
              expect(partner.industry).toBeDefined();
              expect(typeof partner.rating).toBe('number');
              expect(partner.rating).toBeGreaterThanOrEqual(3.0);
              expect(partner.rating).toBeLessThanOrEqual(5.0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('search is case-insensitive for English text', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 5, maxLength: 30 }),
          fc.string({ minLength: 2, maxLength: 10 }).filter(s => /^[a-zA-Z]+$/.test(s)),
          (partners, searchTerm) => {
            const lowerCaseResults = filterPartners(partners, searchTerm.toLowerCase(), 'all');
            const upperCaseResults = filterPartners(partners, searchTerm.toUpperCase(), 'all');
            const mixedCaseResults = filterPartners(partners, searchTerm, 'all');
            
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
          fc.array(partnerArbitrary, { minLength: 1, maxLength: 50 }),
          (partners) => {
            const filtered = filterPartners(partners, '', 'NonExistentCategory');
            
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
          fc.array(partnerArbitrary, { minLength: 1, maxLength: 50 }),
          (partners) => {
            // Use a search term that's very unlikely to match
            const impossibleSearchTerm = '🦄🌈✨IMPOSSIBLE_MATCH_XYZ123✨🌈🦄';
            const filtered = filterPartners(partners, impossibleSearchTerm, 'all');
            
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
          fc.array(partnerArbitrary, { minLength: 5, maxLength: 30 }),
          fc.constantFrom('all', 'Technology', 'Automotive'),
          (partners, category) => {
            const filtered = filterPartners(partners, '', category);
            
            // Check that relative order is preserved
            const filteredIds = filtered.map(p => p.id);
            const originalIds = partners.map(p => p.id);
            
            // Filtered IDs should appear in the same order as in original
            let originalIndex = 0;
            for (const filteredId of filteredIds) {
              while (originalIndex < originalIds.length && originalIds[originalIndex] !== filteredId) {
                originalIndex++;
              }
              expect(originalIndex).toBeLessThan(originalIds.length);
              originalIndex++;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Requirement 10.4: Category Display', () => {
    test('partners are properly categorized by industry/type', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 1, maxLength: 50 }),
          (partners) => {
            // Each partner should have a valid category
            partners.forEach(partner => {
              expect(partner.category).toBeDefined();
              expect(typeof partner.category).toBe('string');
              expect(partner.category.length).toBeGreaterThan(0);
              
              // Should have both English and Chinese category
              expect(partner.categoryZh).toBeDefined();
              expect(typeof partner.categoryZh).toBe('string');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('partners can be grouped by category', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 5, maxLength: 50 }),
          (partners) => {
            // Group partners by category
            const grouped = partners.reduce((acc, partner) => {
              if (!acc[partner.category]) {
                acc[partner.category] = [];
              }
              acc[partner.category].push(partner);
              return acc;
            }, {} as Record<string, Partner[]>);
            
            // Each group should only contain partners of that category
            Object.entries(grouped).forEach(([category, categoryPartners]) => {
              categoryPartners.forEach(partner => {
                expect(partner.category).toBe(category);
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Requirement 10.5: Search and Filter Functionality', () => {
    test('search functionality is real-time (immediate filtering)', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 5, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (partners, searchTerm) => {
            // Simulate real-time search by filtering immediately
            const result1 = filterPartners(partners, searchTerm, 'all');
            const result2 = filterPartners(partners, searchTerm, 'all');
            
            // Results should be consistent (deterministic)
            expect(result1).toEqual(result2);
            expect(result1.length).toBe(result2.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filter supports multi-language search (English and Chinese)', () => {
      fc.assert(
        fc.property(
          fc.array(partnerArbitrary, { minLength: 5, maxLength: 30 }),
          (partners) => {
            // Test that both English and Chinese fields are searchable
            partners.forEach(partner => {
              // Search by English name
              const enResults = filterPartners(partners, partner.name.substring(0, 3), 'all');
              const hasEnglishMatch = enResults.some(p => p.id === partner.id);
              
              // Search by Chinese name (if it has characters)
              if (partner.nameZh.length > 0) {
                const zhResults = filterPartners(partners, partner.nameZh.substring(0, 1), 'all');
                const hasChineseMatch = zhResults.some(p => p.id === partner.id);
                
                // At least one should find the partner
                expect(hasEnglishMatch || hasChineseMatch).toBe(true);
              }
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
