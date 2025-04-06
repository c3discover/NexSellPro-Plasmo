/**
 * @fileoverview Chrome Extension Background Service Worker for NexSellPro
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-21
 */
console.log("✅ NexSellPro background script loaded and running");

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
/// <reference types="chrome"/>
// This special comment tells TypeScript to include Chrome extension types
import { 
  GOOGLE_CLIENT_ID, 
  GOOGLE_SCOPES, 
  connectToGoogle, 
  disconnectFromGoogle, 
  isConnectedToGoogle,
  getGoogleAuthState,
  GoogleAuthState,
  STORAGE_KEY,
  isChromeAPIAvailable,
  isChromeExtensionContext
} from '~/services/googleAuthService';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Target domain for URL monitoring
const WALMART_DOMAIN = 'https://www.walmart.com/';
const PRODUCT_PAGE_IDENTIFIER = '/ip/';

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Message type for URL change notifications
interface UrlChangeMessage {
  type: 'URL_CHANGED';
  url: string;
  isProductPage: boolean;
}

// Message type for seller offers data
interface SellerOffersMessage {
  type: 'ALL_OFFERS_DATA';
  data: any;
}

// Add these message types to your existing ExtensionMessage type
type GoogleAuthMessage = 
  | { type: 'GOOGLE_CONNECT' }
  | { type: 'GOOGLE_DISCONNECT' }
  | { type: 'GOOGLE_CHECK_CONNECTION' };

// Update your ExtensionMessage type to include the new message types
type ExtensionMessage = 
  | UrlChangeMessage 
  | SellerOffersMessage
  | GoogleAuthMessage
  | { type: 'PING' };

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed for this service worker

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// Web request filter configuration
const webRequestFilter = {
  urls: ["*://*.walmart.com/*"]
};

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
const isProductPage = (url: string): boolean => {
  return url.includes(PRODUCT_PAGE_IDENTIFIER);
};

const sendUrlChangeMessage = async (tabId: number, url: string) => {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'URL_CHANGED',
      url,
      isProductPage: isProductPage(url)
    });
    console.log('URL change message sent:', url);
  } catch (error) {
    // Ignore errors from closed tabs or unloaded content scripts
    console.debug('Could not send URL change message:', error);
  }
};

// Helper function to check if we're in a service worker context
const isServiceWorkerContext = (): boolean => {
  return typeof self !== 'undefined' && 
         'ServiceWorkerGlobalScope' in self;
};

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
// Installation handler
const handleInstallation = async (details: chrome.runtime.InstalledDetails) => {
  console.log("NexSellPro extension installed.");
};

// Handle Google connection
async function handleGoogleConnect(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Starting Google connection process in background...');
    console.log('Client ID:', GOOGLE_CLIENT_ID);
    console.log('Requested scopes:', GOOGLE_SCOPES);
    
    // Check if we're in a Chrome extension context
    if (!isChromeExtensionContext()) {
      const error = 'Not in a Chrome extension context. This should not happen.';
      console.error(error);
      return { success: false, error };
    }
    
    console.log('Chrome extension context verified');
    console.log('Checking Chrome APIs...');
    
    // Check if Chrome identity API is available
    if (!isChromeAPIAvailable('identity')) {
      const error = 'Chrome identity API not available. Please check your extension permissions.';
      console.error(error);
      return { success: false, error };
    }

    console.log('Chrome identity API available');
    console.log('Attempting to get auth token...');
    
    // Request auth token from Chrome identity API
    const token = await new Promise<string>((resolve, reject) => {
      try {
        const authParams = { 
          interactive: true,
          scopes: GOOGLE_SCOPES
        };
        console.log('Requesting token with params:', authParams);
        
        chrome.identity.getAuthToken(authParams, (token) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome identity error details:', {
              message: chrome.runtime.lastError.message,
              stack: new Error().stack
            });
            reject(new Error(chrome.runtime.lastError.message));
          } else if (!token) {
            console.error('No token received from OAuth flow');
            reject(new Error('No token received from Google OAuth'));
          } else {
            console.log('Successfully received auth token');
            resolve(token);
          }
        });
      } catch (error) {
        console.error('Error calling chrome.identity.getAuthToken:', error);
        reject(error);
      }
    });

    // Store the auth state
    const authState: GoogleAuthState = {
      accessToken: token,
      refreshToken: '', // Chrome handles token refresh automatically
      expiryTime: Date.now() + (3600 * 1000) // Token typically expires in 1 hour
    };

    console.log('Storing auth state...');

    // Save auth state to storage
    await new Promise<void>((resolve, reject) => {
      try {
        chrome.storage.local.set({ [STORAGE_KEY]: authState }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error saving auth state:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log('Successfully saved auth state');
            resolve();
          }
        });
      } catch (error) {
        console.error('Error calling chrome.storage.local.set:', error);
        reject(error);
      }
    });

    console.log('Google connection process completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Detailed error in handleGoogleConnect:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred while connecting to Google' 
    };
  }
}

// Handle Google disconnection
async function handleGoogleDisconnect(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Starting Google disconnection process...');
    
    // Check if we're in a Chrome extension context
    if (!isChromeExtensionContext()) {
      const error = 'Not in a Chrome extension context. This should not happen.';
      console.error(error);
      return { success: false, error };
    }
    
    // Check if Chrome storage API is available
    if (!isChromeAPIAvailable('storage')) {
      console.error('Chrome storage API not available');
      return { 
        success: false, 
        error: 'Chrome storage API not available. Please check your extension permissions.' 
      };
    }
    
    const state = await getGoogleAuthState();
    if (state?.accessToken) {
      // Check if Chrome identity API is available
      if (!isChromeAPIAvailable('identity')) {
        console.error('Chrome identity API not available');
        return { 
          success: false, 
          error: 'Chrome identity API not available. Please check your extension permissions.' 
        };
      }
      
      // Remove the cached token
      await new Promise<void>((resolve, reject) => {
        try {
          chrome.identity.removeCachedAuthToken({ token: state.accessToken }, () => {
            if (chrome.runtime.lastError) {
              console.error('Error removing cached auth token:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              console.log('Successfully removed cached auth token');
              resolve();
            }
          });
        } catch (error) {
          console.error('Error calling chrome.identity.removeCachedAuthToken:', error);
          reject(error);
        }
      });
    }
    
    // Clear the stored state
    await new Promise<void>((resolve, reject) => {
      try {
        chrome.storage.local.remove(STORAGE_KEY, () => {
          if (chrome.runtime.lastError) {
            console.error('Error removing auth state:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log('Successfully removed auth state');
            resolve();
          }
        });
      } catch (error) {
        console.error('Error calling chrome.storage.local.remove:', error);
        reject(error);
      }
    });
    
    console.log('Successfully disconnected from Google');
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting from Google:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Handle Google connection check
async function handleGoogleCheckConnection(): Promise<{ success: boolean; isConnected: boolean; error?: string }> {
  try {
    console.log('Checking Google connection status...');
    
    // Check if we're in a Chrome extension context
    if (!isChromeExtensionContext()) {
      const error = 'Not in a Chrome extension context. This should not happen.';
      console.error(error);
      return { success: false, isConnected: false, error };
    }
    
    // Check if Chrome storage API is available
    if (!isChromeAPIAvailable('storage')) {
      console.error('Chrome storage API not available');
      return { 
        success: false, 
        isConnected: false, 
        error: 'Chrome storage API not available. Please check your extension permissions.' 
      };
    }
    
    const connected = await isConnectedToGoogle();
    console.log('Google connection status:', connected);
    return { success: true, isConnected: connected };
  } catch (error) {
    console.error('Error checking Google connection:', error);
    return { 
      success: false, 
      isConnected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

////////////////////////////////////////////////
// Rate Limiting:
////////////////////////////////////////////////
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
let lastRequestTime = 0;

// Rate limiting function
const shouldThrottleRequest = (): boolean => {
  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_DELAY) {
    return true;
  }
  lastRequestTime = now;
  return false;
};

////////////////////////////////////////////////
// Event Listeners:
////////////////////////////////////////////////
// Remove duplicate listeners and consolidate message handling
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  console.log("Background received message:", message.type);
  
  if (message.type === "PING") {
    console.log("✅ Got PING from Settings page");
    sendResponse({ pong: true });
    return false;
  }

  // Handle Google authentication messages
  if (message.type === 'GOOGLE_CONNECT') {
    handleGoogleConnect()
      .then(result => {
        console.log('Google connect result:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('Error in handleGoogleConnect:', error);
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      });
    return true;
  }

  if (message.type === 'GOOGLE_DISCONNECT') {
    handleGoogleDisconnect()
      .then(result => {
        console.log('Google disconnect result:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('Error in handleGoogleDisconnect:', error);
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      });
    return true;
  }

  if (message.type === 'GOOGLE_CHECK_CONNECTION') {
    handleGoogleCheckConnection()
      .then(result => {
        console.log('Google check connection result:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('Error in handleGoogleCheckConnection:', error);
        sendResponse({ 
          success: false, 
          isConnected: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      });
    return true;
  }

  if (message.type === 'ALL_OFFERS_DATA') {
    handleWebRequest(message.data)
      .then(() => sendResponse({ status: "received" }))
      .catch(error => {
        console.error('Error handling web request:', error);
        sendResponse({ status: "error", error: error.message });
      });
    return true;
  }

  return false;
});

// Network request handler with rate limiting and better error handling
const handleWebRequest = async (requestData: any) => {
  if (!requestData.url.includes("GetAllSellerOffers")) {
    return;
  }

  // Apply rate limiting
  if (shouldThrottleRequest()) {
    console.log('Request throttled due to rate limiting');
    return;
  }

  try {
    console.log('Fetching seller offers data...');
    const response = await fetch(requestData.url);
    
    // Check if response is HTML (indicating a potential CAPTCHA or error page)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.warn('Received HTML response instead of JSON. Possible rate limiting or CAPTCHA.');
      return;
    }

    // Only proceed if we got a valid JSON response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Only send message if we have a valid tab ID
    if (requestData.tabId) {
      await chrome.tabs.sendMessage(requestData.tabId, { 
        type: "ALL_OFFERS_DATA", 
        data: responseData 
      });
    }
  } catch (error) {
    console.error('Error handling web request:', error);
    // Don't throw the error - just log it and continue
  }
};

// Tab update handler
const handleTabUpdate = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.url && tab.url?.startsWith(WALMART_DOMAIN)) {
    await sendUrlChangeMessage(tabId, changeInfo.url);
  }
};

// Navigation handler with rate limiting
const handleNavigation = async (details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => {
  if (details.url.startsWith(WALMART_DOMAIN)) {
    if (!shouldThrottleRequest()) {
      await sendUrlChangeMessage(details.tabId, details.url);
    }
  }
};

// Listen for tab URL changes
chrome.tabs.onUpdated.addListener(handleTabUpdate);

// Listen for navigation state changes (e.g., single-page app navigation)
if (chrome.webNavigation) {
  chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation);
  chrome.webNavigation.onCompleted.addListener(handleNavigation);
}

// Listen for network requests to capture seller data
if (chrome.webRequest) {
  chrome.webRequest.onCompleted.addListener(
    (details) => {
      if (!shouldThrottleRequest()) {
        handleWebRequest(details);
      }
    },
    webRequestFilter
  );
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// No exports needed for background service worker 