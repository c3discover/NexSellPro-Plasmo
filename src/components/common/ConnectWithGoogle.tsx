/**
 * @fileoverview Component for handling Google OAuth2 connection
 * @author NexSellPro
 * @created 2025-04-29
 * @lastModified 2025-04-29
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useCallback, useEffect } from "react";
import { Storage } from "@plasmohq/storage";
import { logGroup, logTable, logGroupEnd, LogModule } from "../../data/utils/logger";

////////////////////////////////////////////////
// Types:
////////////////////////////////////////////////
declare global {
  interface Window {
    __nsp_logged_googleAuth?: boolean;
    __nsp_logged_googleAuthError?: boolean;
  }
}

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const CLIENT_ID = "469074340331-62763q6jvgj6voqg4vu8mi5bgfhs0qkd.apps.googleusercontent.com"

// Hardcoded redirect URI to match Google Console configuration exactly
const REDIRECT_URI = "https://oeoabefdhedmaeoghdmbcechbiepmfpc.chromiumapp.org";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file"
].join(" ");

////////////////////////////////////////////////
// Main Logic:
////////////////////////////////////////////////
const ConnectWithGoogle: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storage = new Storage();

  useEffect(() => {
    const checkToken = async () => {
      const token = await storage.get("googleAccessToken");
      if (token) {
        setIsConnected(true);
      }
    };

    checkToken();
  }, []);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Send message to background script to handle OAuth flow
      const response = await chrome.runtime.sendMessage({ type: "START_GOOGLE_AUTH" });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.token) {
        throw new Error("No access token received");
      }

      // Store the token
      await storage.set("googleAccessToken", response.token);
      setIsConnected(true);
      
      // Log success
      if (!window.__nsp_logged_googleAuth) {
        logGroup(LogModule.LOCAL_DATA, "Google Auth Success");
        logTable(LogModule.LOCAL_DATA, "Token", { token: `${response.token.substring(0, 10)}...` });
        logGroupEnd();
        window.__nsp_logged_googleAuth = true;
      }

    } catch (err) {
      setError(err.message);
      
      // Log error
      if (!window.__nsp_logged_googleAuthError) {
        logGroup(LogModule.LOCAL_DATA, "Google Auth Error");
        logTable(LogModule.LOCAL_DATA, "Error Details", { error: err.message });
        logGroupEnd();
        window.__nsp_logged_googleAuthError = true;
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      logGroup(LogModule.LOCAL_DATA, "Google Auth Disconnect");

      // Get token from storage
      const token = await storage.get("googleAccessToken");
      if (token) {
        // Revoke the token from Google's OAuth2 server
        const revokeRes = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: "POST",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }
        });

        logTable(LogModule.LOCAL_DATA, "Google OAuth2 Revocation", {
          status: revokeRes.status,
          success: revokeRes.ok
        });
        console.log("[GOOGLE AUTH] Token revoked from Google");
      }

      // Remove from local storage
      await storage.remove("googleAccessToken");
      logTable(LogModule.LOCAL_DATA, "Local Storage", {
        action: "Token removed",
        status: "Success"
      });
      console.log("[GOOGLE AUTH] Token removed from local storage");

      // Reset component state
      setIsConnected(false);
      setError(null);

      logTable(LogModule.LOCAL_DATA, "Final Status", {
        googleOAuth: token ? "Revoked" : "No token present",
        localStorage: "Cleared",
        componentState: "Reset"
      });
      logGroupEnd();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logGroup(LogModule.LOCAL_DATA, "Google Auth Disconnect Error");
      logTable(LogModule.LOCAL_DATA, "Error Details", {
        error: errorMessage,
        type: err instanceof Error ? err.constructor.name : typeof err
      });
      logGroupEnd();
      console.error("[GOOGLE AUTH] Disconnect failed:", err);
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {isConnected ? (
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-green-700">Connected to Google</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-4 h-4"
          />
          {isConnecting ? "Connecting..." : "Connect with Google"}
        </button>
      )}
      
      {error && (
        <div className="text-sm text-red-600">
          Error: {error}
        </div>
      )}
    </div>
  );
};

////////////////////////////////////////////////
// Export:
////////////////////////////////////////////////
export default ConnectWithGoogle;
