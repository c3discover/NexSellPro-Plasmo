/**
 * @fileoverview Chrome API wrapper implementation
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// Import error handling utilities from our custom error handling module
import { logError, ErrorSeverity } from '../utils/errorHandling';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Default component name used for error logging
const DEFAULT_COMPONENT = 'browserAPI';

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Interface for Chrome-specific error messages
interface ChromeError {
  message: string;
}

// Type definition for message callback functions
// These are used when sending/receiving messages between different parts of the extension
interface MessageCallback {
  (message: any, sender: any, sendResponse: (response?: any) => void): void;
}

// Type definition for tab update callback functions
// Used when monitoring changes to browser tabs
interface TabCallback {
  (tabId: number, changeInfo: any, tab: any): void;
}

// Type definition for web navigation callback functions
// Used when monitoring page navigation events
interface WebNavigationCallback {
  (details: any): void;
}

// Type definition for web request filter
// Used to specify which URLs to monitor for web requests
interface WebRequestFilter {
  urls: string[];
}

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// No configuration needed

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
/**
 * Checks if the Chrome API is available
 * @returns True if the Chrome API is available
 */
export function isBrowserAPIAvailable(): boolean {
  // Check if chrome object exists and has runtime property
  // This is important because the extension might run in different contexts
  return typeof chrome !== 'undefined' && !!chrome.runtime;
}

/**
 * Handles Chrome API errors
 * @param error The error to handle
 * @param operation The operation that failed
 * @param component The component that failed
 * @returns The error
 */
function handleBrowserAPIError(error: any, operation: string, component: string = DEFAULT_COMPONENT): Error {
  // Initialize variable to store the processed error
  let browserError: Error;
  
  // Check for different types of errors and handle them appropriately
  if (chrome?.runtime?.lastError) {
    // Chrome-specific runtime error
    browserError = new Error(chrome.runtime.lastError.message || 'Unknown Chrome error');
  } else if (error instanceof Error) {
    // Standard JavaScript Error object
    browserError = error;
  } else if (typeof error === 'string') {
    // String error message
    browserError = new Error(error);
  } else {
    // Unknown error type
    browserError = new Error('Unknown browser API error');
  }
  
  // Log the error using our error handling utility
  logError({
    message: `Error ${operation}`,
    severity: ErrorSeverity.ERROR,
    component,
    error: browserError
  });
  
  return browserError;
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// Main API object that wraps Chrome extension APIs
export const browserAPI = {
  // Runtime API for messaging and extension lifecycle
  runtime: {
    // Send messages between different parts of the extension
    sendMessage: <T = any>(message: any): Promise<T> => {
      return new Promise((resolve, reject) => {
        try {
          // Check if Chrome API is available
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            // Send message and handle response
            chrome.runtime.sendMessage(message, (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response as T);
              }
            });
          } else {
            reject(new Error('Chrome API not available'));
          }
        } catch (error) {
          handleBrowserAPIError(error, 'sending message');
          reject(error);
        }
      });
    },
    
    // Handle incoming messages
    onMessage: {
      // Add a listener for incoming messages
      addListener: (callback: MessageCallback): void => {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.onMessage.addListener(callback);
          }
        } catch (error) {
          handleBrowserAPIError(error, 'adding message listener');
        }
      },
      
      // Remove a message listener
      removeListener: (callback: MessageCallback): void => {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.onMessage.removeListener(callback);
          }
        } catch (error) {
          handleBrowserAPIError(error, 'removing message listener');
        }
      }
    },
    
    // Reload the extension
    reload: (): void => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.reload();
        }
      } catch (error) {
        handleBrowserAPIError(error, 'reloading extension');
      }
    }
  },
  
  // Storage API for saving and retrieving data
  storage: {
    // Sync storage - data is synced across devices
    sync: {
      // Get items from sync storage
      get: <T = any>(keys: string | string[] | Record<string, any> | null): Promise<T> => {
        return new Promise((resolve, reject) => {
          try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
              chrome.storage.sync.get(keys, (items) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(items as T);
                }
              });
            } else {
              reject(new Error('Chrome API not available'));
            }
          } catch (error) {
            handleBrowserAPIError(error, 'getting items from sync storage');
            reject(error);
          }
        });
      },
      
      // Set items in sync storage
      set: (items: Record<string, any>): Promise<void> => {
        return new Promise((resolve, reject) => {
          try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
              chrome.storage.sync.set(items, () => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve();
                }
              });
            } else {
              reject(new Error('Chrome API not available'));
            }
          } catch (error) {
            handleBrowserAPIError(error, 'setting items in sync storage');
            reject(error);
          }
        });
      }
    },
    
    // Local storage - data is stored only on the current device
    local: {
      // Get items from local storage
      get: <T = any>(keys: string | string[] | Record<string, any> | null): Promise<T> => {
        return new Promise((resolve, reject) => {
          try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
              chrome.storage.local.get(keys, (items) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(items as T);
                }
              });
            } else {
              reject(new Error('Chrome API not available'));
            }
          } catch (error) {
            handleBrowserAPIError(error, 'getting items from local storage');
            reject(error);
          }
        });
      },
      
      // Set items in local storage
      set: (items: Record<string, any>): Promise<void> => {
        return new Promise((resolve, reject) => {
          try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
              chrome.storage.local.set(items, () => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve();
                }
              });
            } else {
              reject(new Error('Chrome API not available'));
            }
          } catch (error) {
            handleBrowserAPIError(error, 'setting items in local storage');
            reject(error);
          }
        });
      }
    }
  },
  
  // Tabs API for working with browser tabs
  tabs: {
    // Send message to a specific tab
    sendMessage: <T = any>(tabId: number, message: any): Promise<T> => {
      return new Promise((resolve, reject) => {
        try {
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.sendMessage(tabId, message, (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response as T);
              }
            });
          } else {
            reject(new Error('Chrome API not available'));
          }
        } catch (error) {
          handleBrowserAPIError(error, 'sending message to tab');
          reject(error);
        }
      });
    },
    
    // Query for tabs matching specific criteria
    query: <T = any>(queryInfo: Record<string, any>): Promise<T> => {
      return new Promise((resolve, reject) => {
        try {
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query(queryInfo, (tabs) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(tabs as T);
              }
            });
          } else {
            reject(new Error('Chrome API not available'));
          }
        } catch (error) {
          handleBrowserAPIError(error, 'querying tabs');
          reject(error);
        }
      });
    },
    
    // Monitor tab updates
    onUpdated: {
      // Add listener for tab updates
      addListener: (callback: TabCallback): void => {
        try {
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.onUpdated.addListener(callback);
          }
        } catch (error) {
          handleBrowserAPIError(error, 'adding tab update listener');
        }
      }
    }
  },
  
  // Web Navigation API for monitoring page navigation
  webNavigation: {
    // Monitor history state changes (like SPA navigation)
    onHistoryStateUpdated: {
      // Add listener for history state updates
      addListener: (callback: WebNavigationCallback): void => {
        try {
          if (typeof chrome !== 'undefined' && chrome.webNavigation) {
            chrome.webNavigation.onHistoryStateUpdated.addListener(callback);
          }
        } catch (error) {
          handleBrowserAPIError(error, 'adding history state update listener');
        }
      }
    }
  },
  
  // Web Request API for monitoring network requests
  webRequest: {
    // Monitor completed web requests
    onCompleted: {
      // Add listener for completed web requests
      addListener: (callback: WebNavigationCallback, filter: WebRequestFilter): void => {
        try {
          if (typeof chrome !== 'undefined' && chrome.webRequest) {
            chrome.webRequest.onCompleted.addListener(callback, filter);
          }
        } catch (error) {
          handleBrowserAPIError(error, 'adding web request completed listener');
        }
      }
    }
  }
}; 