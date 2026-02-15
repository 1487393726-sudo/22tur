/**
 * Property-Based Test for Cart Page Translation Completeness
 * 
 * Feature: dashboard-pages-translation
 * Property 3: Translation Completeness Across Locales
 * **Validates: Requirements 1.5, 2.1, 7.1**
 * 
 * This test verifies that all translation keys used in the cart page exist 
 * in all 6 locale dashboard.json files (zh, zh-TW, en, ug, ja, ko) with 
 * non-empty string values.
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Define the supported locales
const SUPPORTED_LOCALES = ['zh', 'zh-TW', 'en', 'ug', 'ja', 'ko'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

// Define all translation keys used in the cart page
// Extracted from app/client/cart/page.tsx
const CART_TRANSLATION_KEYS = [
  'cart.title',
  'cart.description',
  'overview.browseServices',
  'cart.empty.title',
  'cart.empty.description',
  'cart.note',
  'common.delete',
  'cart.decrease',
  'cart.increase',
  'cart.clearCart',
  'cart.orderSummary',
  'cart.itemCount',
  'cart.items',
  'cart.subtotal',
  'cart.total',
  'cart.checkout',
  'cart.checkoutNote',
] as const;

/**
 * Helper function to load translations from a locale file
 */
function loadTranslations(locale: Locale): Record<string, any> {
  const filePath = path.join(process.cwd(), 'messages', locale, 'dashboard.json');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`);
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

/**
 * Helper function to get a nested value from an object using dot notation
 * e.g., getNestedValue(obj, 'cart.empty.title') returns obj.cart.empty.title
 */
function getNestedValue(obj: Record<string, any>, key: string): any {
  return key.split('.').reduce((current, part) => {
    return current?.[part];
  }, obj);
}

/**
 * Helper function to check if a value is a non-empty string
 */
function isNonEmptyString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Property 3: Translation Completeness Across Locales
 * **Validates: Requirements 1.5, 2.1, 7.1**
 * 
 * For any translation key used in the cart page component, that key should 
 * exist in all 6 locale dashboard.json files (zh, zh-TW, en, ug, ja, ko) 
 * with non-empty string values.
 */
describe('Feature: dashboard-pages-translation, Property 3: Translation Completeness Across Locales', () => {
  
  it('should have all cart translation keys in all 6 locales with non-empty values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CART_TRANSLATION_KEYS),
        fc.constantFrom(...SUPPORTED_LOCALES),
        (translationKey, locale) => {
          // Load translations for the locale
          const translations = loadTranslations(locale);
          
          // Get the value for the translation key
          const value = getNestedValue(translations, translationKey);
          
          // Verify the value exists and is a non-empty string
          const isValid = isNonEmptyString(value);
          
          // If the test fails, provide helpful error message
          if (!isValid) {
            console.error(
              `Translation key "${translationKey}" is missing or empty in locale "${locale}". ` +
              `Value: ${JSON.stringify(value)}`
            );
          }
          
          return isValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have all cart translation keys present in every locale', () => {
    // Test that every key exists in every locale
    fc.assert(
      fc.property(
        fc.constantFrom(...CART_TRANSLATION_KEYS),
        (translationKey) => {
          // Check all locales for this key
          const results = SUPPORTED_LOCALES.map(locale => {
            const translations = loadTranslations(locale);
            const value = getNestedValue(translations, translationKey);
            return {
              locale,
              exists: value !== undefined && value !== null,
              isNonEmpty: isNonEmptyString(value),
              value,
            };
          });
          
          // All locales should have this key with non-empty values
          const allValid = results.every(r => r.exists && r.isNonEmpty);
          
          if (!allValid) {
            const failures = results.filter(r => !r.exists || !r.isNonEmpty);
            console.error(
              `Translation key "${translationKey}" has issues in the following locales:`,
              failures.map(f => `${f.locale}: ${JSON.stringify(f.value)}`)
            );
          }
          
          return allValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not have undefined or null values for any cart translation key in any locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CART_TRANSLATION_KEYS),
        fc.constantFrom(...SUPPORTED_LOCALES),
        (translationKey, locale) => {
          const translations = loadTranslations(locale);
          const value = getNestedValue(translations, translationKey);
          
          // Value should not be undefined or null
          const isNotNullish = value !== undefined && value !== null;
          
          if (!isNotNullish) {
            console.error(
              `Translation key "${translationKey}" is ${value === undefined ? 'undefined' : 'null'} ` +
              `in locale "${locale}"`
            );
          }
          
          return isNotNullish;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have string values (not objects or arrays) for all cart translation keys', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CART_TRANSLATION_KEYS),
        fc.constantFrom(...SUPPORTED_LOCALES),
        (translationKey, locale) => {
          const translations = loadTranslations(locale);
          const value = getNestedValue(translations, translationKey);
          
          // Value should be a string
          const isString = typeof value === 'string';
          
          if (!isString) {
            console.error(
              `Translation key "${translationKey}" in locale "${locale}" is not a string. ` +
              `Type: ${typeof value}, Value: ${JSON.stringify(value)}`
            );
          }
          
          return isString;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have non-whitespace-only values for all cart translation keys', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CART_TRANSLATION_KEYS),
        fc.constantFrom(...SUPPORTED_LOCALES),
        (translationKey, locale) => {
          const translations = loadTranslations(locale);
          const value = getNestedValue(translations, translationKey);
          
          // Value should not be empty or whitespace-only
          const hasContent = typeof value === 'string' && value.trim().length > 0;
          
          if (!hasContent) {
            console.error(
              `Translation key "${translationKey}" in locale "${locale}" is empty or whitespace-only. ` +
              `Value: "${value}"`
            );
          }
          
          return hasContent;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify translation completeness across all key-locale combinations', () => {
    // This test verifies the complete matrix of keys × locales
    const totalCombinations = CART_TRANSLATION_KEYS.length * SUPPORTED_LOCALES.length;
    let validCombinations = 0;
    const failures: Array<{ key: string; locale: string; issue: string }> = [];
    
    CART_TRANSLATION_KEYS.forEach(key => {
      SUPPORTED_LOCALES.forEach(locale => {
        try {
          const translations = loadTranslations(locale);
          const value = getNestedValue(translations, key);
          
          if (isNonEmptyString(value)) {
            validCombinations++;
          } else {
            failures.push({
              key,
              locale,
              issue: `Value is ${value === undefined ? 'undefined' : value === null ? 'null' : `"${value}"`}`,
            });
          }
        } catch (error) {
          failures.push({
            key,
            locale,
            issue: `Error loading translations: ${error}`,
          });
        }
      });
    });
    
    // Report results
    const successRate = (validCombinations / totalCombinations) * 100;
    console.log(
      `Translation completeness: ${validCombinations}/${totalCombinations} (${successRate.toFixed(1)}%)`
    );
    
    if (failures.length > 0) {
      console.error('Translation failures:', failures);
    }
    
    // All combinations should be valid (100% completeness)
    expect(validCombinations).toBe(totalCombinations);
    expect(failures).toHaveLength(0);
  });

  it('should load all locale files without JSON parse errors', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          try {
            const translations = loadTranslations(locale);
            
            // Should be a valid object
            const isValidObject = typeof translations === 'object' && translations !== null;
            
            if (!isValidObject) {
              console.error(
                `Locale "${locale}" did not load as a valid object. ` +
                `Type: ${typeof translations}`
              );
            }
            
            return isValidObject;
          } catch (error) {
            console.error(`Failed to load locale "${locale}":`, error);
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have consistent key structure across all locales', () => {
    // Verify that if a key exists in one locale, it exists in all locales
    fc.assert(
      fc.property(
        fc.constantFrom(...CART_TRANSLATION_KEYS),
        (translationKey) => {
          const keyParts = translationKey.split('.');
          
          // Check that the key path exists in all locales
          const allLocalesHaveKey = SUPPORTED_LOCALES.every(locale => {
            const translations = loadTranslations(locale);
            
            // Navigate through the key path
            let current = translations;
            for (const part of keyParts) {
              if (current && typeof current === 'object' && part in current) {
                current = current[part];
              } else {
                return false;
              }
            }
            
            return true;
          });
          
          if (!allLocalesHaveKey) {
            const missingLocales = SUPPORTED_LOCALES.filter(locale => {
              const translations = loadTranslations(locale);
              const value = getNestedValue(translations, translationKey);
              return value === undefined;
            });
            
            console.error(
              `Translation key "${translationKey}" is missing in locales: ${missingLocales.join(', ')}`
            );
          }
          
          return allLocalesHaveKey;
        }
      ),
      { numRuns: 100 }
    );
  });
});
