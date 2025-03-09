import { logError, ErrorSeverity } from '../utils/errorHandling';

/**
 * Checks if the Chrome API is available
 * @returns True if the Chrome API is available
 */
export function isBrowserAPIAvailable(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.runtime;
}

/**
 * Handles Chrome API errors
 * @param error The error to handle
 * @param operation The operation that failed
 * @param component The component that failed
 * @returns The error
 */
function handleBrowserAPIError(error: any, operation: string, component: string = 'browserAPI'): Error {
  // Check for specific Chrome error types
  let browserError: Error;
  
  if (chrome?.runtime?.lastError) {
    browserError = new Error(chrome.runtime.lastError.message || 'Unknown Chrome error');
  } else if (error instanceof Error) {
    browserError = error;
  } else if (typeof error === 'string') {
    browserError = new Error(error);
  } else {
    browserError = new Error('Unknown browser API error');
  }
  
  // Log the error
  logError({
    message: `Error ${operation}`,
    severity: ErrorSeverity.ERROR,
    component,
    error: browserError
  });
  
  return browserError;
}

/**
 * A Chrome-specific API for browser extensions
 */
export const browserAPI = {
  /**
   * Gets the runtime API
   */
  runtime: {
    /**
     * Sends a message to the background script
     * @param message The message to send
     * @returns A promise that resolves with the response
     */
    sendMessage: <T = any>(message: any): Promise<T> => {
      return new Promise((resolve, reject) => {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
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
    
    /**
     * Adds a listener for messages from the content script or popup
     * @param callback The callback to call when a message is received
     */
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void): void => {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.onMessage.addListener(callback);
          }
        } catch (error) {
          handleBrowserAPIError(error, 'adding message listener');
        }
      },
      
      /**
       * Removes a listener for messages
       * @param callback The callback to remove
       */
      removeListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void): void => {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.onMessage.removeListener(callback);
          }
        } catch (error) {
          handleBrowserAPIError(error, 'removing message listener');
        }
      }
    },
    
    /**
     * Reloads the extension
     */
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
  
  /**
   * Gets the storage API
   */
  storage: {
    /**
     * Gets the sync storage API
     */
    sync: {
      /**
       * Gets items from sync storage
       * @param keys The keys to get
       * @returns A promise that resolves with the items
       */
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
      
      /**
       * Sets items in sync storage
       * @param items The items to set
       * @returns A promise that resolves when the items are set
       */
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
    
    /**
     * Gets the local storage API
     */
    local: {
      /**
       * Gets items from local storage
       * @param keys The keys to get
       * @returns A promise that resolves with the items
       */
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
      
      /**
       * Sets items in local storage
       * @param items The items to set
       * @returns A promise that resolves when the items are set
       */
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
  
  /**
   * Gets the tabs API
   */
  tabs: {
    /**
     * Sends a message to a specific tab
     * @param tabId The ID of the tab to send the message to
     * @param message The message to send
     * @returns A promise that resolves with the response
     */
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
    
    /**
     * Queries for tabs that match the given criteria
     * @param queryInfo The criteria to match
     * @returns A promise that resolves with the matching tabs
     */
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
    
    /**
     * Adds a listener for tab updates
     * @param callback The callback to call when a tab is updated
     */
    onUpdated: {
      addListener: (callback: (tabId: number, changeInfo: any, tab: any) => void): void => {
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
  
  /**
   * Gets the web navigation API
   */
  webNavigation: {
    /**
     * Adds a listener for history state updates
     * @param callback The callback to call when the history state is updated
     */
    onHistoryStateUpdated: {
      addListener: (callback: (details: any) => void): void => {
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
  
  /**
   * Gets the web request API
   */
  webRequest: {
    /**
     * Adds a listener for completed web requests
     * @param callback The callback to call when a web request is completed
     * @param filter The filter to apply to the web requests
     */
    onCompleted: {
      addListener: (callback: (details: any) => void, filter: { urls: string[] }): void => {
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