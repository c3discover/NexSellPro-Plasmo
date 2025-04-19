/**
 * @fileoverview Authentication service for Google OAuth integration
 * @author NexSellPro
 * @created 2024-06-18
 * @lastModified 2024-06-18
 */

import { Storage } from '@plasmohq/storage';
import { logDebug, logError, LogModule } from '~/data/utils/logger';

// Initialize storage
const storage = new Storage();

// Storage keys
const USER_KEY = 'nexSellPro_user';
const AUTH_STATE_KEY = 'nexSellPro_authState';
const SESSION_DATA_KEY = 'nexSellPro_sessionData';

// Auth states
export enum AuthState {
  UNKNOWN = 'unknown',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error'
}

// Interface for current user
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
}

// Interface for session data
export interface SessionData {
  lastLogin: number;           // Timestamp of last login
  searchCount: number;         // Number of searches performed
  productViewCount: number;    // Number of products viewed
  sessionCount: number;        // Total number of sessions
  currentSessionStart: number; // Timestamp when current session started
}

/**
 * Generate a random state string for OAuth
 * @returns Random state string
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Initialize OAuth flow by redirecting to Google's authentication page
 * @param clientId Google OAuth client ID
 * @param redirectUri Redirect URI after authentication
 */
export async function initiateLogin(
  clientId: string, 
  redirectUri: string
): Promise<void> {
  try {
    // Generate and store state parameter to prevent CSRF
    const state = generateState();
    await storage.set(AUTH_STATE_KEY, state);
    
    // Construct the OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');
    
    // Redirect to the OAuth URL
    chrome.tabs.create({ url: authUrl.toString() });
    
    logDebug(LogModule.AUTH, "Initiated Google login flow");
  } catch (error) {
    logError(LogModule.AUTH, "Error initiating login", error);
    throw error;
  }
}

/**
 * Complete the OAuth flow by exchanging authorization code for tokens
 * @param clientId Google OAuth client ID
 * @param clientSecret Google OAuth client secret
 * @param redirectUri Redirect URI after authentication
 * @param code Authorization code from Google
 * @param state State parameter to verify
 */
export async function completeLogin(
  clientId: string,
  clientSecret: string, 
  redirectUri: string, 
  code: string, 
  state: string
): Promise<User> {
  try {
    // Verify state parameter
    const storedState = await storage.get(AUTH_STATE_KEY);
    if (state !== storedState) {
      throw new Error('State parameter mismatch. Possible CSRF attack.');
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }
    
    const tokens = await tokenResponse.json();
    
    // Get user info using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    const userInfo = await userInfoResponse.json();
    
    // Calculate token expiration
    const expiresAt = Date.now() + (tokens.expires_in * 1000);
    
    // Create user object
    const user: User = {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      accessToken: tokens.access_token,
      expiresAt,
      refreshToken: tokens.refresh_token
    };
    
    // Store user in storage
    await storage.set(USER_KEY, user);
    await storage.set(AUTH_STATE_KEY, AuthState.AUTHENTICATED);
    
    // Update session data
    await updateSessionData();
    
    logDebug(LogModule.AUTH, "Successfully completed login flow", { userId: user.id, email: user.email });
    
    return user;
  } catch (error) {
    await storage.set(AUTH_STATE_KEY, AuthState.ERROR);
    logError(LogModule.AUTH, "Error completing login", error);
    throw error;
  }
}

/**
 * Refresh the access token when it expires
 * @param clientId Google OAuth client ID
 * @param clientSecret Google OAuth client secret
 */
export async function refreshAccessToken(
  clientId: string, 
  clientSecret: string
): Promise<User> {
  try {
    // Get current user data
    const user = await storage.get<User>(USER_KEY);
    if (!user || !user.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Exchange refresh token for new access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: user.refreshToken,
        grant_type: 'refresh_token'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
    }
    
    const tokens = await response.json();
    
    // Calculate new expiration
    const expiresAt = Date.now() + (tokens.expires_in * 1000);
    
    // Update user with new token info
    const updatedUser: User = {
      ...user,
      accessToken: tokens.access_token,
      expiresAt,
      // Update refresh token if a new one was provided
      refreshToken: tokens.refresh_token || user.refreshToken
    };
    
    // Store updated user
    await storage.set(USER_KEY, updatedUser);
    
    logDebug(LogModule.AUTH, "Successfully refreshed access token");
    
    return updatedUser;
  } catch (error) {
    logError(LogModule.AUTH, "Error refreshing token", error);
    throw error;
  }
}

/**
 * Log the user out
 */
export async function logout(): Promise<void> {
  try {
    // Get user data
    const user = await storage.get<User>(USER_KEY);
    
    if (user && user.accessToken) {
      // Revoke the access token
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${user.accessToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      } catch (revokeError) {
        // Continue logout even if revoke fails
        logError(LogModule.AUTH, "Error revoking token", revokeError);
      }
    }
    
    // Clear auth-related storage
    await storage.remove(USER_KEY);
    await storage.set(AUTH_STATE_KEY, AuthState.UNAUTHENTICATED);
    
    logDebug(LogModule.AUTH, "User logged out successfully");
  } catch (error) {
    logError(LogModule.AUTH, "Error during logout", error);
    throw error;
  }
}

/**
 * Get the current user if authenticated
 * @returns Current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const authState = await storage.get<AuthState>(AUTH_STATE_KEY);
    
    // If not authenticated, return null
    if (authState !== AuthState.AUTHENTICATED) {
      return null;
    }
    
    // Get user from storage
    const user = await storage.get<User>(USER_KEY);
    if (!user) {
      return null;
    }
    
    // Check if token is expired
    if (user.expiresAt < Date.now()) {
      // Token is expired, return null
      // The token refresh should be handled separately
      return null;
    }
    
    return user;
  } catch (error) {
    logError(LogModule.AUTH, "Error getting current user", error);
    return null;
  }
}

/**
 * Get current authentication state
 * @returns Current auth state
 */
export async function getAuthState(): Promise<AuthState> {
  try {
    const authState = await storage.get<AuthState>(AUTH_STATE_KEY);
    return authState || AuthState.UNKNOWN;
  } catch (error) {
    logError(LogModule.AUTH, "Error getting auth state", error);
    return AuthState.UNKNOWN;
  }
}

/**
 * Update session data when the user performs actions
 * @param action Optional action to update (search or productView)
 */
export async function updateSessionData(
  action?: 'search' | 'productView'
): Promise<SessionData> {
  try {
    // Get current session data
    let sessionData = await storage.get<SessionData>(SESSION_DATA_KEY);
    const now = Date.now();
    
    // Initialize if not exists
    if (!sessionData) {
      sessionData = {
        lastLogin: now,
        searchCount: 0,
        productViewCount: 0,
        sessionCount: 1,
        currentSessionStart: now
      };
    }
    
    // Update session-specific metrics
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    const isNewSession = (now - sessionData.currentSessionStart) > SESSION_TIMEOUT;
    
    if (isNewSession) {
      sessionData.sessionCount += 1;
      sessionData.currentSessionStart = now;
    }
    
    // Update based on action
    if (action === 'search') {
      sessionData.searchCount += 1;
    } else if (action === 'productView') {
      sessionData.productViewCount += 1;
    }
    
    // Update last login time
    sessionData.lastLogin = now;
    
    // Save updated session data
    await storage.set(SESSION_DATA_KEY, sessionData);
    
    return sessionData;
  } catch (error) {
    logError(LogModule.AUTH, "Error updating session data", error);
    throw error;
  }
}

/**
 * Get current session data
 * @returns Current session data
 */
export async function getSessionData(): Promise<SessionData | null> {
  try {
    const sessionData = await storage.get<SessionData>(SESSION_DATA_KEY);
    return sessionData || null;
  } catch (error) {
    logError(LogModule.AUTH, "Error getting session data", error);
    return null;
  }
}

export default {
  initiateLogin,
  completeLogin,
  refreshAccessToken,
  logout,
  getCurrentUser,
  getAuthState,
  updateSessionData,
  getSessionData,
  AuthState
}; 