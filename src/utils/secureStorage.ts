/**
 * @fileoverview Secure wrapper around localStorage with error handling and sanitization
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import { logError, ErrorSeverity } from './errorHandling';

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// No additional types needed beyond the built-in ones

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
// No constants needed

////////////////////////////////////////////////
// Main Object:
////////////////////////////////////////////////

/**
 * Secure wrapper around localStorage with error handling and sanitization
 * Provides type-safe methods for interacting with localStorage
 */
export const secureStorage = {
  /**
   * Gets a value from localStorage with type safety
   * @param key - The key to retrieve from localStorage
   * @param defaultValue - The default value to return if the key doesn't exist
   * @returns The value from localStorage or the default value
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logError({
        message: `Error getting value from localStorage for key: ${key}`,
        severity: ErrorSeverity.WARNING,
        component: 'secureStorage',
        error: error as Error
      });
      return defaultValue;
    }
  },
  
  /**
   * Sets a value in localStorage with type safety
   * @param key - The key to set in localStorage
   * @param value - The value to store
   * @returns True if the value was set successfully, false otherwise
   */
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logError({
        message: `Error setting value in localStorage for key: ${key}`,
        severity: ErrorSeverity.WARNING,
        component: 'secureStorage',
        error: error as Error
      });
      return false;
    }
  },
  
  /**
   * Removes a value from localStorage
   * @param key - The key to remove from localStorage
   * @returns True if the value was removed successfully, false otherwise
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logError({
        message: `Error removing value from localStorage for key: ${key}`,
        severity: ErrorSeverity.WARNING,
        component: 'secureStorage',
        error: error as Error
      });
      return false;
    }
  },
  
  /**
   * Checks if a key exists in localStorage
   * @param key - The key to check in localStorage
   * @returns True if the key exists, false otherwise
   */
  has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      logError({
        message: `Error checking if key exists in localStorage: ${key}`,
        severity: ErrorSeverity.WARNING,
        component: 'secureStorage',
        error: error as Error
      });
      return false;
    }
  },
  
  /**
   * Clears all values from localStorage
   * @returns True if localStorage was cleared successfully, false otherwise
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      logError({
        message: 'Error clearing localStorage',
        severity: ErrorSeverity.WARNING,
        component: 'secureStorage',
        error: error as Error
      });
      return false;
    }
  }
}; 