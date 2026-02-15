/**
 * Persistence layer for storing and retrieving user theme preferences
 */

import { PersistenceLayer, PreferenceData } from './types';

const PREFERENCE_KEY = 'website-theme-preference';
const PREFERENCE_VERSION = 1;

/**
 * In-memory storage fallback
 */
class InMemoryStorage implements PersistenceLayer {
  private storage: Map<string, string> = new Map();

  save(key: string, value: string): void {
    this.storage.set(key, value);
  }

  load(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  clear(key: string): void {
    this.storage.delete(key);
  }

  isAvailable(): boolean {
    return true;
  }
}

/**
 * LocalStorage-based persistence
 */
class LocalStoragePersistence implements PersistenceLayer {
  save(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  load(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }

  clear(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Get the appropriate persistence layer
 */
function getPersistenceLayer(): PersistenceLayer {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storage = new LocalStoragePersistence();
    if (storage.isAvailable()) {
      return storage;
    }
  }
  return new InMemoryStorage();
}

/**
 * Singleton instance of persistence layer
 */
let persistenceInstance: PersistenceLayer | null = null;

export function getPersistence(): PersistenceLayer {
  if (!persistenceInstance) {
    persistenceInstance = getPersistenceLayer();
  }
  return persistenceInstance;
}

/**
 * Save user preference
 */
export function savePreference(styleId: string): void {
  const data: PreferenceData = {
    styleId,
    timestamp: Date.now(),
    version: PREFERENCE_VERSION,
  };
  getPersistence().save(PREFERENCE_KEY, JSON.stringify(data));
}

/**
 * Load user preference
 */
export function loadPreference(): string | null {
  try {
    const data = getPersistence().load(PREFERENCE_KEY);
    if (!data) {
      return null;
    }
    const parsed: PreferenceData = JSON.parse(data);
    if (parsed.version !== PREFERENCE_VERSION) {
      return null;
    }
    return parsed.styleId;
  } catch (error) {
    console.warn('Failed to parse preference data:', error);
    return null;
  }
}

/**
 * Clear user preference
 */
export function clearPreference(): void {
  getPersistence().clear(PREFERENCE_KEY);
}

/**
 * Check if preference exists
 */
export function hasPreference(): boolean {
  return loadPreference() !== null;
}
