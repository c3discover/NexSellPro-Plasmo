/**
 * @fileoverview Google authentication service for the NexSellPro extension.
 * @author NexSellPro
 * @created 2024-03-21
 * @modified 2024-03-21
 */

/////////////////////////////////////////////////
// Constants
/////////////////////////////////////////////////

// Google OAuth configuration
export const GOOGLE_CLIENT_ID = '469074340331-ecg0lufoje86bk2ultj35voasto7s3nc.apps.googleusercontent.com';
const REDIRECT_URI = typeof chrome !== "undefined" && chrome.identity
  ? chrome.identity.getRedirectURL("oauth2")
  : "";
console.log('OAuth Redirect URI:', REDIRECT_URI);
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

// Storage keys
export const STORAGE_KEY = 'google_auth_state';

/////////////////////////////////////////////////
// Types
/////////////////////////////////////////////////

export interface GoogleAuthState {
  accessToken: string;
  refreshToken: string;
  expiryTime: number;
}

/////////////////////////////////////////////////
// Functions
/////////////////////////////////////////////////

/**
 * Check if a Chrome API is available
 */
export const isChromeAPIAvailable = (apiName: string): boolean => {
  try {
    // First check if chrome object exists
    if (typeof chrome === 'undefined' || chrome === null) {
      console.error('Chrome object is not available');
      return false;
    }

    // For simple API names (like 'storage' or 'identity')
    if (!apiName.includes('.')) {
      const isAvailable = typeof chrome[apiName] !== 'undefined' && chrome[apiName] !== null;
      if (!isAvailable) {
        console.error(`Chrome API '${apiName}' is not available`);
      }
      return isAvailable;
    }

    // For nested API paths (like 'storage.local' or 'identity.getAuthToken')
    const parts = apiName.split('.');
    let obj = chrome;

    for (const part of parts) {
      if (!obj || typeof obj !== 'object' || !(part in obj)) {
        console.error(`API part not available: ${part} in ${apiName}`);
        return false;
      }
      obj = obj[part];
    }

    return true;
  } catch (error) {
    console.error(`Error checking if ${apiName} is available:`, error);
    return false;
  }
};

/**
 * Check if we're in a Chrome extension context
 */
export const isChromeExtensionContext = (): boolean => {
  return typeof chrome !== 'undefined' &&
    chrome !== null &&
    typeof chrome.runtime !== 'undefined' &&
    chrome.runtime !== null;
};

/**
 * Initialize Google authentication
 */
export const initGoogleAuth = async (): Promise<void> => {
  // No initialization needed for background script
  return Promise.resolve();
};

/**
 * Check if user is connected to Google
 */
export const isConnectedToGoogle = async (): Promise<boolean> => {
  try {
    // Check if we're in a Chrome extension context
    if (!isChromeExtensionContext()) {
      console.error('Not in a Chrome extension context. This should not happen.');
      return false;
    }

    const state = await getGoogleAuthState();
    return !!state && !!state.accessToken;
  } catch (error) {
    console.error('Error checking Google connection:', error);
    return false;
  }
};

/**
 * Get current Google auth state
 */
export const getGoogleAuthState = async (): Promise<GoogleAuthState | null> => {
  try {
    // Check if we're in a Chrome extension context
    if (!isChromeExtensionContext()) {
      console.error('Not in a Chrome extension context. This should not happen.');
      return null;
    }

    // Check if Chrome storage API is available
    if (!isChromeAPIAvailable('storage') || !isChromeAPIAvailable('storage.local')) {
      console.error('Chrome storage API not available');
      throw new Error('Chrome storage API not available. Please check your extension permissions.');
    }

    // Use a Promise to handle the asynchronous chrome.storage.local.get
    return new Promise<GoogleAuthState | null>((resolve, reject) => {
      try {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Error getting Google auth state:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log('Retrieved Google auth state:', result[STORAGE_KEY] ? 'Found' : 'Not found');
            resolve(result[STORAGE_KEY] || null);
          }
        });
      } catch (error) {
        console.error('Error calling chrome.storage.local.get:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error getting Google auth state:', error);
    return null;
  }
};

/**
 * Connect to Google using OAuth
 */
/**
 * Connect to Google using OAuth2 (MV3-compatible using launchWebAuthFlow)
 */
export const connectToGoogle = async (): Promise<boolean> => {
  try {
    if (!isChromeExtensionContext()) {
      console.error("Not in a Chrome extension context.")
      return false
    }

    // Check if Chrome identity API is available
    if (!isChromeAPIAvailable('identity')) {
      console.error('Chrome identity API not available');
      throw new Error('Chrome identity API not available. Please check your extension permissions.');
    }

    console.log('Starting Chrome extension Google auth...');

    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Auth error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        if (!token) {
          console.error('No token received');
          reject(new Error('No token received'));
          return;
        }
        resolve(token);
      });
    });

    const authState: GoogleAuthState = {
      accessToken: token,
      refreshToken: "", // Not needed with chrome.identity
      expiryTime: Date.now() + 3600 * 1000 // 1 hour from now
    };

    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: authState }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          console.log("Stored auth state successfully");
          resolve()
        }
      })
    });

    return true;
  } catch (error) {
    console.error("connectToGoogle failed:", error);
    return false;
  }
}

/**
 * Disconnect from Google
 */
export const disconnectFromGoogle = async (): Promise<void> => {
  try {
    if (!isChromeExtensionContext()) {
      console.error('Not in a Chrome extension context');
      return;
    }

    console.log('Starting Google disconnect process...');

    // Get current token
    const state = await getGoogleAuthState();
    if (state && state.accessToken) {
      console.log('Found existing token, removing...');
      
      // First remove the cached token
      await new Promise<void>((resolve, reject) => {
        chrome.identity.removeCachedAuthToken({ token: state.accessToken }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error removing cached token:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('Successfully removed cached token');
            resolve();
          }
        });
      });

      // Then revoke access
      try {
        console.log('Revoking token access...');
        const response = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${state.accessToken}`, {
          method: 'GET'
        });
        
        if (!response.ok) {
          console.error('Error revoking token:', response.statusText);
        } else {
          console.log('Successfully revoked token access');
        }
      } catch (error) {
        console.error('Error making revoke request:', error);
      }
    }

    // Remove from storage regardless of token state
    console.log('Clearing stored auth state...');
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.remove(STORAGE_KEY, () => {
        if (chrome.runtime.lastError) {
          console.error('Error clearing auth state:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('Successfully cleared auth state');
          resolve();
        }
      });
    });

    console.log('Google disconnect process completed');
  } catch (error) {
    console.error('Error disconnecting from Google:', error);
    throw error;
  }
};

/**
 * Get a valid access token, refreshing if necessary
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    const state = await getGoogleAuthState();
    if (!state) {
      console.log('No Google auth state found');
      return null;
    }

    // Check if token is expired
    if (Date.now() >= state.expiryTime) {
      console.log('Token is expired, need to refresh');
      // Token is expired, need to refresh
      // This will be handled by the background script
      return null;
    }

    console.log('Valid access token found');
    return state.accessToken;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    return null;
  }
};

// Add this to make TypeScript happy with the window.gapi property
declare global {
  interface Window {
    gapi: any;
  }
} 